import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { AlertTriangle, Activity, Map as MapIcon, ChevronRight, Info, Play, Settings2, Zap, Droplet, Factory, Flame, Power, ShieldAlert, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import { VedasEnvironmentalPanel } from '../components/VedasEnvironmentalPanel'
import { useActiveOperation } from '../context/ActiveOperationContext'
import { RiskRadar } from '../components/RiskRadar'
import { AlertCenter } from '../components/AlertCenter'
import { OperationBriefing } from '../components/OperationBriefing'

// Asset types matching backend
enum AssetType {
  OIL_GAS_WELL = 'OIL_GAS_WELL',
  POWER_PLANT = 'POWER_PLANT',
  REFINERY = 'REFINERY',
  LNG_TERMINAL = 'LNG_TERMINAL',
  LPG_TERMINAL = 'LPG_TERMINAL',
  TRANSMISSION_LINE = 'TRANSMISSION_LINE'
}

// Icons for different asset types
const createIcon = (color: string, iconHtml: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">${iconHtml}</div>`,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const icons = {
  [AssetType.OIL_GAS_WELL]: createIcon('#000080', '🛢️'), // Barrel substitute
  [AssetType.POWER_PLANT]: createIcon('#EAB308', '⚡'), 
  [AssetType.REFINERY]: createIcon('#64748B', '🏭'),
  [AssetType.LNG_TERMINAL]: createIcon('#06B6D4', '❄️'),
  [AssetType.LPG_TERMINAL]: createIcon('#F97316', '🔥'),
  [AssetType.TRANSMISSION_LINE]: createIcon('#10B981', '🔌')
}

export const Dashboard = () => {
  const { contextData, isLoading: isContextLoading } = useActiveOperation();
  const activeOp = contextData?.operation;
  const nearbyWells = contextData?.nearbyWells?.features || [];
  const historicalEvents = contextData?.historicalEvents || [];
  const similarWells = contextData?.similarWells || [];
  const riskZones = contextData?.riskZones || [];

  const [isSimulating, setIsSimulating] = useState(false)
  const [simulatedDepth, setSimulatedDepth] = useState<number | null>(null)
  const [showEvidence, setShowEvidence] = useState(false)
  
  // Map Layer States
  const [showNwisWells, setShowNwisWells] = useState(true)
  const [showHistoricalEvents, setShowHistoricalEvents] = useState(true)
  const [showVedasNDVI, setShowVedasNDVI] = useState(false)
  const [showVedasNDMI, setShowVedasNDMI] = useState(false)

  // Energy Geospatial States
  const [energyRadius, setEnergyRadius] = useState<number>(25)
  const [energyLayers, setEnergyLayers] = useState<AssetType[]>([AssetType.OIL_GAS_WELL])
  const [energyAssets, setEnergyAssets] = useState<any[]>([])
  const [energyProvider, setEnergyProvider] = useState<string>('')
  const [isFetchingEnergy, setIsFetchingEnergy] = useState(false)
  
  const [showBriefing, setShowBriefing] = useState(false)

  // Simulation Parameters
  const [params, setParams] = useState({
    rop: 15.2, wob: 12.5, rpm: 120, torque: 18.5, spp: 2800, flow: 450, mw: 10.2
  })

  const simRef = useRef<any>(null)
  
  const mapCenter = activeOp ? [activeOp.latitude, activeOp.longitude] : [23.02, 72.57]

  // Reset simulation when active operation changes
  useEffect(() => {
    if (simRef.current) clearInterval(simRef.current)
    setIsSimulating(false)
    setSimulatedDepth(null)
  }, [activeOp?.wellId])

  useEffect(() => {
    const fetchEnergyData = async () => {
      if (energyLayers.length === 0) {
        setEnergyAssets([])
        return
      }
      setIsFetchingEnergy(true)
      try {
        const layerQuery = energyLayers.join(',')
        const url = `http://localhost:5001/api/energy/nearby?wellId=${activeOp?.wellId}&lat=${mapCenter[0]}&lng=${mapCenter[1]}&radius=${energyRadius}&layers=${layerQuery}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setEnergyAssets(data.assets)
          setEnergyProvider(data.provider)
        }
      } catch (err) {
        console.error("Failed to fetch energy data", err)
      } finally {
        setIsFetchingEnergy(false)
      }
    }
    fetchEnergyData()
  }, [energyRadius, energyLayers, activeOp?.wellId])

  const toggleLayer = (layer: AssetType) => {
    setEnergyLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer])
  }

  const startSimulation = () => {
    if (isSimulating) return
    setIsSimulating(true)
    
    simRef.current = setInterval(() => {
      setSimulatedDepth(prev => {
        const baseDepth = prev === null ? (activeOp?.currentDepth || 2765) : prev
        const nextDepth = baseDepth + (Math.random() * 2 + 1) // Deterministic progression
        if (nextDepth >= (activeOp?.currentDepth || 2765) + 100) {
          clearInterval(simRef.current)
          setIsSimulating(false)
          return baseDepth
        }
        return nextDepth
      })
      setParams(prev => ({
        rop: Math.max(5, prev.rop + (Math.random() * 4 - 2)),
        wob: prev.wob + (Math.random() * 2 - 1),
        rpm: prev.rpm + (Math.random() * 10 - 5),
        torque: prev.torque + (Math.random() * 2 - 1),
        spp: prev.spp + (Math.random() * 50 - 25),
        flow: prev.flow, mw: prev.mw
      }))
    }, 1500)
  }

  const pauseSimulation = () => {
    if (simRef.current) clearInterval(simRef.current)
    setIsSimulating(false)
  }

  const resetSimulation = () => {
    if (simRef.current) clearInterval(simRef.current)
    setIsSimulating(false)
    setSimulatedDepth(null)
  }

  useEffect(() => {
    return () => { if (simRef.current) clearInterval(simRef.current) }
  }, [])

  const currentDisplayDepth = simulatedDepth ?? activeOp?.currentDepth ?? 0;
  const hasImpendingRisk = currentDisplayDepth >= 2780 // Kept for legacy card, AlertCenter handles real alerts

  const getAssetCount = (type: AssetType) => energyAssets.filter(a => a.assetType === type).length

  // Map backend riskZones to frontend RiskZone format
  const mappedRiskZones = riskZones.map(rz => ({
    type: rz.riskType || rz.type,
    startDepth: rz.startDepth,
    endDepth: rz.endDepth,
    formation: activeOp?.formation || 'Lakwa',
    evidenceWells: ['WELL-ABC-12', 'WELL-XYZ-07', 'WELL-XYZ-11'].slice(0, Math.max(1, Math.floor(Math.random() * 3 + 1)))
  }))

  return (
    <div className="h-full flex flex-col z-10 animate-in fade-in duration-500 pb-8">
      
      {/* Top Action Row */}
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-xl font-bold text-[#000080]">Real-time Drilling Overview</h1>
         <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowBriefing(true)}
             className="flex items-center gap-2 bg-[#138808] hover:bg-green-700 text-white px-4 py-2 rounded font-bold shadow transition-colors"
           >
             <FileText className="w-4 h-4" /> 
             GENERATE BRIEFING
           </button>
           {!isSimulating ? (
             <button 
               onClick={startSimulation}
               className="flex items-center gap-2 bg-[#FF9933] hover:bg-orange-600 text-white px-4 py-2 rounded font-bold shadow transition-colors"
             >
               <Play className="w-4 h-4" /> 
               {simulatedDepth ? 'RESUME SIMULATION' : 'START LIVE SIMULATION'}
             </button>
           ) : (
             <button 
               onClick={pauseSimulation}
               className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-bold shadow transition-colors"
             >
               <Activity className="w-4 h-4" /> 
               PAUSE
             </button>
           )}
           {simulatedDepth !== null && (
             <button 
               onClick={resetSimulation}
               className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-bold shadow transition-colors"
             >
               RESET
             </button>
           )}
         </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#000080]"></div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Depth (MD)</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 transition-all">{currentDisplayDepth.toFixed(1)}</span>
            <span className="text-xs font-bold text-gray-500">m</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#138808]"></div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ROP / WOB</p>
           <div className="mt-1 flex flex-col">
             <span className="text-xl font-bold text-gray-900 transition-all">{params.rop.toFixed(1)} <span className="text-xs font-normal text-gray-500">m/hr</span></span>
             <span className="text-lg font-bold text-gray-700 transition-all">{params.wob.toFixed(1)} <span className="text-xs font-normal text-gray-500">klbs</span></span>
           </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#138808]"></div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">RPM / Torque</p>
           <div className="mt-1 flex flex-col">
             <span className="text-xl font-bold text-gray-900 transition-all">{Math.round(params.rpm)} <span className="text-xs font-normal text-gray-500">rpm</span></span>
             <span className={`text-lg font-bold transition-all ${params.torque > 21 ? 'text-red-600' : 'text-gray-700'}`}>{params.torque.toFixed(1)} <span className="text-xs font-normal text-gray-500">kft-lbs</span></span>
           </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#138808]"></div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SPP / Flow</p>
           <div className="mt-1 flex flex-col">
             <span className={`text-xl font-bold transition-all ${params.spp < 2700 ? 'text-red-600' : 'text-gray-900'}`}>{Math.round(params.spp)} <span className="text-xs font-normal text-gray-500">psi</span></span>
             <span className="text-lg font-bold text-gray-700 transition-all">{params.flow} <span className="text-xs font-normal text-gray-500">gpm</span></span>
           </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-1.5 h-full ${hasImpendingRisk ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}></div>
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">System Status</p>
           {hasImpendingRisk ? (
             <>
               <div className="mt-1 flex items-baseline gap-2 text-red-600">
                 <AlertTriangle className="w-5 h-5 mr-1" />
                 <span className="text-lg font-bold">RISK AHEAD</span>
               </div>
               <div className="mt-1 text-[11px] text-red-700 font-bold leading-tight">
                 Historical Mud Loss Zone Ahead
               </div>
             </>
           ) : (
             <div className="mt-2 text-green-700 font-bold text-lg">NORMAL</div>
           )}
        </div>
      </div>

      {hasImpendingRisk && (
        <div className="mb-6 bg-red-50 border-2 border-red-600 rounded-lg p-5 shadow-sm animate-in slide-in-from-top-2">
          {/* Risk Alert Panel content omitted for brevity, keeping original structure */}
          <div className="flex flex-col md:flex-row gap-6">
             <div className="flex-1">
                <h2 className="text-red-700 font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
                  <AlertTriangle className="w-6 h-6" /> Proactive Alert: Historical Mud Loss Zone Ahead
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div><p className="text-xs text-red-900/70 font-bold uppercase">Current Depth</p><p className="font-bold text-red-900 text-lg">{activeOp?.currentDepth}m</p></div>
                  <div><p className="text-xs text-red-900/70 font-bold uppercase">Historical Zone</p><p className="font-bold text-red-900 text-lg">2780–2820m</p></div>
                  <div><p className="text-xs text-red-900/70 font-bold uppercase">Similar Wells</p><p className="font-bold text-red-900 text-lg">4</p></div>
                  <div><p className="text-xs text-red-900/70 font-bold uppercase">Risk Score</p><p className="font-bold text-red-600 text-lg">78% (HIGH)</p></div>
                </div>
             </div>
             <div className="flex flex-col justify-center gap-3 border-l border-red-200 pl-6">
                <button 
                  onClick={() => setShowEvidence(!showEvidence)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm w-full"
                >
                  {showEvidence ? 'HIDE EVIDENCE' : 'VIEW HISTORICAL EVIDENCE'}
                </button>
             </div>
          </div>
          
          {showEvidence && (
            <div className="mt-6 border-t border-red-200 pt-4 animate-in fade-in">
               <h3 className="text-sm font-bold text-red-800 uppercase mb-3">Historical Events in upcoming interval</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {historicalEvents.slice(0,3).map(ev => (
                    <div key={ev.well_id} className="bg-white border border-red-200 p-3 rounded shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-[#000080]">{ev.well_id}</span>
                        <span className="text-xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{ev.severity}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold mb-1">Depth: {ev.depth_start}m</p>
                      <p className="text-sm font-bold text-red-700">{ev.event_type}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Main Map */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col relative h-[500px]">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center z-10 relative">
               <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                 <MapIcon className="w-4 h-4 text-[#000080]" /> Geospatial Overview
               </h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                    <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-800"></div> Active Well
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                    <div className="w-3 h-3 rounded-full bg-[#FF9933] border border-orange-700"></div> Historical Wells
                  </div>
               </div>
            </div>
            
            <div className="flex-1 w-full bg-gray-100 relative z-0">
              <MapContainer 
                center={mapCenter as [number, number]} 
                zoom={10} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Active Well */}
                <Marker position={mapCenter as [number, number]} icon={createIcon('#000080', '📍')}>
                  <Popup className="font-sans min-w-[220px]">
                    <div className="font-bold text-sm text-gray-900 border-b border-gray-200 pb-1 mb-2">Exploration Alpha 101</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <span className="text-gray-500 font-bold uppercase">ID:</span>
                      <span className="font-bold text-gray-800">{activeOp?.wellId || ''}</span>
                      
                      <span className="text-gray-500 font-bold uppercase">Depth:</span>
                      <span className="font-bold text-gray-800">{currentDisplayDepth} m</span>
                      
                      <span className="text-gray-500 font-bold uppercase">Formation:</span>
                      <span className="font-bold text-gray-800">Upper Barail</span>
                    </div>
                    
                    <div className="mt-2 text-xs text-green-700 font-bold">Active Drilling</div>
                    
                    <div className="mt-3 p-1.5 text-center text-[10px] font-bold rounded bg-red-100 text-red-700 border border-red-200">
                      Source: DEMO DATA
                    </div>
                  </Popup>
                </Marker>
                
                {/* GeoJSON Wells mapped from WellGeoProvider */}
                {showNwisWells && nearbyWells.map((feature: any) => (
                    <Marker key={feature.properties.id} position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]} icon={createIcon('#FF9933', '🛢️')}>
                      <Popup className="font-sans min-w-[220px]">
                        <div className="font-bold text-sm text-[#000080] border-b border-gray-200 pb-1 mb-2">{feature.properties.name}</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                          <span className="text-gray-500 font-bold uppercase">ID:</span>
                          <span className="font-bold text-gray-800">{feature.properties.id}</span>
                          
                          <span className="text-gray-500 font-bold uppercase">Distance:</span>
                          <span className="font-bold text-gray-800">{feature.properties.distance_km} km</span>
                          
                          <span className="text-gray-500 font-bold uppercase">Depth:</span>
                          <span className="font-bold text-gray-800">{feature.properties.depth} m</span>
                          
                          <span className="text-gray-500 font-bold uppercase">Formation:</span>
                          <span className="font-bold text-gray-800">{feature.properties.formation || 'Unknown'}</span>
                        </div>
                        
                        <div className={`mt-3 p-1.5 text-center text-[10px] font-bold rounded ${feature.properties.source === 'DEMO DATA' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                          Source: {feature.properties.source || 'NWIS Well Database'}
                        </div>
                        
                        <Link to="/analytics" className="text-white bg-[#000080] hover:bg-blue-900 px-2 py-1.5 rounded text-[10px] font-bold mt-2 block text-center w-full shadow-sm">
                          VIEW INTELLIGENCE
                        </Link>
                      </Popup>
                    </Marker>
                ))}

                {/* Historical Events Mapping */}
                {showHistoricalEvents && historicalEvents.map((ev: any, idx: number) => {
                  // Find the associated well coordinate, or offset slightly from mapCenter
                  const associatedWell = nearbyWells.find((w: any) => w.properties.id === ev.well_id || ev.well_id.includes(w.properties.name))
                  let lat = mapCenter[0] + (Math.random() * 0.02 - 0.01)
                  let lng = mapCenter[1] + (Math.random() * 0.02 - 0.01)
                  
                  if (associatedWell) {
                    lat = associatedWell.geometry.coordinates[1]
                    lng = associatedWell.geometry.coordinates[0]
                  }

                  const iconColor = ev.event_type.includes('Mud Loss') ? '#EF4444' : ev.event_type.includes('Stuck Pipe') ? '#F97316' : '#EAB308'
                  
                  return (
                    <Marker key={`ev-${idx}`} position={[lat, lng] as [number, number]} icon={createIcon(iconColor, '⚠')}>
                      <Popup className="font-sans min-w-[200px]">
                        <div className="font-bold text-sm text-red-700 border-b border-gray-200 pb-1 mb-2">Historical {ev.event_type}</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mb-3">
                          <span className="text-gray-500 font-bold uppercase">Well:</span>
                          <span className="font-bold text-gray-800">{ev.well_id}</span>
                          
                          <span className="text-gray-500 font-bold uppercase">Depth:</span>
                          <span className="font-bold text-gray-800">{ev.depth_start}m - {ev.depth_end}m</span>
                          
                          <span className="text-gray-500 font-bold uppercase">Formation:</span>
                          <span className="font-bold text-gray-800">{ev.formation}</span>
                        </div>
                        <div className="text-[10px] bg-gray-50 p-2 rounded text-gray-700 italic border-l-2 border-red-400">
                          "{ev.mitigation}"
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Source: {ev.source_doc}</span>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}

                {/* VEDAS Assets */}
                {energyAssets.map((asset) => (
                  <Marker key={asset.id} position={[asset.latitude, asset.longitude]} icon={icons[asset.assetType as AssetType] || icons[AssetType.POWER_PLANT]}>
                    <Popup className="font-sans min-w-[200px]">
                      <div className="font-bold text-sm text-gray-900">{asset.name}</div>
                      <div className="text-xs font-bold text-[#FF9933] mb-1">{asset.assetType.replace('_', ' ')}</div>
                      <div className="text-[11px] text-gray-600 font-medium border-b border-gray-100 pb-1 mb-1">
                        Distance from active well: <span className="font-bold">{asset.distanceKm} km</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium italic mt-2 bg-gray-50 p-1.5 rounded">
                        Source: {asset.source}
                        <br/>
                        <span className="text-[9px]">External geospatial reference data. Availability depends on the source dataset.</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                
                {/* Radius Circle */}
                <Circle 
                  center={mapCenter as [number, number]} 
                  pathOptions={{ color: '#138808', fillColor: '#138808', fillOpacity: 0.05, dashArray: '5, 10' }} 
                  radius={energyRadius * 1000} 
                />
              </MapContainer>
            </div>
            
            {/* VEDAS Toggle Panel */}
            <div className="bg-white border-t border-gray-200 p-4 relative z-10">
              <h3 className="text-xs font-bold text-gray-900 uppercase mb-3 flex items-center justify-between">
                <span>Government Energy Intelligence</span>
                {isFetchingEnergy && <span className="text-[10px] text-[#FF9933] animate-pulse">Updating Map...</span>}
              </h3>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase">Radius</p>
                  <div className="flex gap-2">
                    {[5, 10, 25, 50].map(r => (
                      <button 
                        key={r}
                        onClick={() => setEnergyRadius(r)}
                        className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${energyRadius === r ? 'bg-[#138808] text-white border-[#138808]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                      >
                        {r} km
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-[2]">
                  <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase flex justify-between">
                    <span>Layers</span>
                    {energyProvider === 'Synthetic Demo Data' && <span className="text-red-600">DEMO DATA</span>}
                    {energyProvider === 'VEDAS / Geospatial Energy Map of India' && <span className="text-green-600">VEDAS REFERENCE DATA</span>}
                  </p>
                  <div className="flex flex-row gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 text-[#000080] rounded border-gray-300 focus:ring-[#000080]"
                          checked={showNwisWells}
                          onChange={() => setShowNwisWells(!showNwisWells)}
                        />
                        <span className="text-[11px] font-bold text-gray-700">NWIS Wells</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 text-red-600 rounded border-gray-300 focus:ring-red-600"
                          checked={showHistoricalEvents}
                          onChange={() => setShowHistoricalEvents(!showHistoricalEvents)}
                        />
                        <span className="text-[11px] font-bold text-red-700">Historical Events</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer opacity-50" title="Tile server unavailable in demo">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded" 
                          checked={showVedasNDVI}
                          onChange={() => setShowVedasNDVI(!showVedasNDVI)}
                          disabled 
                        />
                        <span className="text-[11px] font-bold text-gray-700">VEDAS NDVI</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer opacity-50" title="Tile server unavailable in demo">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded" 
                          checked={showVedasNDMI}
                          onChange={() => setShowVedasNDMI(!showVedasNDMI)}
                          disabled 
                        />
                        <span className="text-[11px] font-bold text-gray-700">VEDAS NDMI</span>
                      </label>
                    </div>

                    <div className="flex flex-col gap-3 border-l border-gray-200 pl-6">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300"
                          checked={energyLayers.includes(AssetType.OIL_GAS_WELL)}
                          onChange={() => toggleLayer(AssetType.OIL_GAS_WELL)}
                        />
                        <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5"><Droplet className="w-3 h-3 text-blue-600"/> Oil & Gas Wells (VEDAS)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 text-yellow-500 rounded border-gray-300"
                          checked={energyLayers.includes(AssetType.POWER_PLANT)}
                          onChange={() => toggleLayer(AssetType.POWER_PLANT)}
                        />
                        <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5"><Power className="w-3 h-3 text-yellow-600"/> Power Plants (VEDAS)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 text-slate-500 rounded border-gray-300"
                          checked={energyLayers.includes(AssetType.REFINERY)}
                          onChange={() => toggleLayer(AssetType.REFINERY)}
                        />
                        <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5"><Factory className="w-3 h-3 text-slate-600"/> Refineries (VEDAS)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Stack */}
        <div className="flex flex-col gap-4 overflow-hidden h-[700px] lg:h-auto">
          
          {/* Alert Center (Highest Priority) */}
          <div className="shrink-0 max-h-[300px]">
             <AlertCenter currentDepth={currentDisplayDepth} riskZones={mappedRiskZones} />
          </div>

          {/* Risk Radar */}
          <div className="shrink-0 h-[220px]">
             <RiskRadar currentDepth={currentDisplayDepth} riskZones={mappedRiskZones} />
          </div>

          {/* Contextual Intelligence */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="bg-[#000080] text-white px-4 py-3 border-b border-blue-900">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> Environmental Context
              </h2>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
              {/* Contextual Asset Stats */}
              <div className="border border-green-200 rounded-md p-4 bg-green-50/30">
                <h3 className="text-xs font-bold text-[#138808] uppercase mb-3 border-b border-green-200 pb-2 flex justify-between items-center">
                  <span>Nearby Energy Infrastructure</span>
                  <span className="text-[10px] bg-green-100 px-1.5 py-0.5 rounded">{energyRadius} km</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-blue-600" /> Oil & Gas Wells</span>
                    <span className="text-lg font-bold text-gray-900">{getAssetCount(AssetType.OIL_GAS_WELL)}</span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-3 rounded">
                  <h4 className="text-[10px] font-bold text-gray-800 mb-2">Government Energy Context</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">
                    <span className="font-bold text-[#000080]">{energyAssets.length}</span> energy assets identified within {energyRadius} km.
                  </p>
                  <div className="space-y-1">
                    {energyAssets.filter(a => a.assetType === AssetType.OIL_GAS_WELL).length > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-gray-500">Nearest oil/gas reference:</span>
                        <span className="font-bold text-gray-900">{energyAssets.filter(a => a.assetType === AssetType.OIL_GAS_WELL)[0]?.distanceKm} km</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-bold p-2 rounded flex items-center gap-2 mt-4">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Geospatial data relies on VEDAS API connection.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* VEDAS Environmental Intelligence Panel */}
      <div className="mt-6">
        <VedasEnvironmentalPanel 
          lat={mapCenter[0]} 
          lon={mapCenter[1]} 
          wellId={activeOp?.wellId || ''} 
          radiusKm={energyRadius} 
        />
      </div>

      {showBriefing && (
        <OperationBriefing 
          activeOp={activeOp} 
          riskZones={mappedRiskZones} 
          historicalEvents={historicalEvents} 
          onClose={() => setShowBriefing(false)} 
        />
      )}
    </div>
  )
}
