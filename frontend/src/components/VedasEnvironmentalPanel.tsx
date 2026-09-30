import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, Loader2, AlertCircle, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface VedasPanelProps {
  lat: number;
  lon: number;
  wellId: string;
  radiusKm: number;
}

const timeRanges = [
  { label: '30 Days', value: '30D' },
  { label: '3 Months', value: '3M' },
  { label: '6 Months', value: '6M' },
  { label: '12 Months', value: '12M' }
];

export const VedasEnvironmentalPanel: React.FC<VedasPanelProps> = ({ lat, lon, wellId, radiusKm }) => {
  const [dataset, setDataset] = useState<'NDVI' | 'NDMI'>('NDVI');
  const [timeRange, setTimeRange] = useState('12M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pointData, setPointData] = useState<any>(null);
  const [polygonData, setPolygonData] = useState<any>(null);

  useEffect(() => {
    fetchVedasData();
  }, [lat, lon, dataset, timeRange, radiusKm]);

  const fetchVedasData = async () => {
    setLoading(true);
    setError(null);
    try {
      const to = new Date();
      const from = new Date();
      if (timeRange === '30D') from.setDate(to.getDate() - 30);
      if (timeRange === '3M') from.setMonth(to.getMonth() - 3);
      if (timeRange === '6M') from.setMonth(to.getMonth() - 6);
      if (timeRange === '12M') from.setFullYear(to.getFullYear() - 1);
      
      const fmt = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
      const fromStr = fmt(from);
      const toStr = fmt(to);

      // Fetch Point Data
      const ptRes = await fetch(`http://localhost:5001/api/vedas/point?lat=${lat}&lon=${lon}&dataset=${dataset}&from=${fromStr}&to=${toStr}`);
      if (!ptRes.ok) throw new Error('Failed to fetch point data');
      const ptJson = await ptRes.json();
      setPointData(ptJson);

      // Fetch Polygon Data
      const rDeg = radiusKm / 111;
      const polygon = [
        [lon - rDeg, lat - rDeg],
        [lon + rDeg, lat - rDeg],
        [lon + rDeg, lat + rDeg],
        [lon - rDeg, lat + rDeg],
        [lon - rDeg, lat - rDeg]
      ];

      const polyRes = await fetch(`http://localhost:5001/api/vedas/polygon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ polygon, dataset, from: fromStr, to: toStr })
      });
      if (!polyRes.ok) throw new Error('Failed to fetch polygon data');
      const polyJson = await polyRes.json();
      setPolygonData(polyJson);

    } catch (err) {
      console.error(err);
      setError('VEDAS data temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getTrend = (observations: any[]) => {
    if (!observations || observations.length < 2) return { direction: 'flat', diff: 0 };
    const first = observations[0].value;
    const last = observations[observations.length - 1].value;
    const diff = last - first;
    return {
      direction: diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'flat',
      diff
    };
  };

  const pointTrend = getTrend(pointData?.observations);
  const isDemo = pointData?.source?.includes('DEMO');

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden mb-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#138808] text-white px-4 py-3 border-b border-[#0d6105] flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider">VEDAS Environmental Intelligence</h2>
          <p className="text-[10px] opacity-90">Satellite-derived environmental context for the selected well</p>
        </div>
        {isDemo && (
          <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded">
            DEMO DATA — NOT LIVE VEDAS DATA
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Dataset</p>
          <div className="flex bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
            <button 
              onClick={() => setDataset('NDVI')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${dataset === 'NDVI' ? 'bg-[#000080] text-white' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              NDVI (Vegetation Index)
            </button>
            <div className="w-px bg-gray-200"></div>
            <button 
              onClick={() => setDataset('NDMI')}
              className={`px-3 py-1.5 text-xs font-bold transition-colors ${dataset === 'NDMI' ? 'bg-[#000080] text-white' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              NDMI (Moisture Index)
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Observation Period</p>
          <div className="flex gap-1.5">
            {timeRanges.map(tr => (
              <button 
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                className={`px-2 py-1 text-xs font-bold rounded border transition-colors ${timeRange === tr.value ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/80 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#138808] animate-spin mb-2" />
            <span className="text-sm font-bold text-gray-600">Loading VEDAS observations...</span>
          </div>
        )}

        {error && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-red-600 gap-3">
            <AlertCircle className="w-8 h-8" />
            <p className="font-bold">{error}</p>
            <button onClick={fetchVedasData} className="px-4 py-2 bg-gray-100 text-gray-800 rounded font-bold text-xs hover:bg-gray-200">Retry</button>
          </div>
        )}

        {!error && !loading && pointData && polygonData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Charts Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Point Chart */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase mb-2 border-b border-gray-100 pb-1">
                  Active Well: {dataset} Observation
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pointData.observations}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{fontSize: 10}} tickMargin={8} stroke="#9ca3af" />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #e5e7eb'}}
                        formatter={(value: any) => [value, `${dataset} Observation`]}
                      />
                      <Line type="monotone" dataKey="value" stroke="#138808" strokeWidth={2} dot={{r: 3, fill: '#138808'}} activeDot={{r: 5}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Polygon Area Chart */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase mb-2 border-b border-gray-100 pb-1 flex justify-between">
                  <span>Area Environmental Trend</span>
                  <span className="text-gray-500">Radius: {radiusKm} km</span>
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={polygonData.observations}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{fontSize: 10}} tickMargin={8} stroke="#9ca3af" />
                      <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #e5e7eb'}}
                        formatter={(value: any) => [value, `Area ${dataset} Observation`]}
                      />
                      <Line type="monotone" dataKey="value" stroke="#000080" strokeWidth={2} dot={{r: 2, fill: '#000080'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Column */}
            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <h3 className="text-[11px] font-bold text-[#000080] uppercase mb-3 border-b border-gray-200 pb-2">Environmental Summary</h3>
                <ul className="text-[11px] space-y-2 text-gray-700 font-medium mb-4">
                  <li><span className="font-bold">Dataset:</span> {dataset}</li>
                  <li><span className="font-bold">Analysis radius:</span> {radiusKm} km</li>
                  <li><span className="font-bold">Observation period:</span> {timeRange}</li>
                  <li><span className="font-bold">Latest available observation:</span> {pointData.observations[pointData.observations.length - 1]?.value}</li>
                </ul>

                <div className="bg-white border border-gray-200 rounded p-3 shadow-sm">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-1">Interpretation</h4>
                  <div className="flex items-start gap-2">
                    {pointTrend.direction === 'down' && <TrendingDown className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />}
                    {pointTrend.direction === 'up' && <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />}
                    {pointTrend.direction === 'flat' && <Minus className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />}
                    <p className="text-xs font-bold text-gray-800">
                      {dataset} observations show a {pointTrend.direction === 'down' ? 'declining' : pointTrend.direction === 'up' ? 'rising' : 'stable'} trend during the selected period.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#000080]/5 border border-[#000080]/20 rounded p-4 flex-1">
                <h3 className="text-[11px] font-bold text-[#000080] uppercase mb-3 border-b border-[#000080]/10 pb-2">Cross-Domain Context</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-gray-500">OBSERVED DATA (VEDAS)</span>
                    <p className="text-[11px] font-bold text-gray-800 mt-0.5">{dataset} {pointTrend.direction === 'down' ? 'decline' : pointTrend.direction === 'up' ? 'increase' : 'stability'} observed in selected area.</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-gray-500">OBSERVED DATA (NWIS)</span>
                    <p className="text-[11px] font-bold text-gray-800 mt-0.5">Historical events from nearby wells logged.</p>
                  </div>
                  
                  <div className="pt-2 border-t border-[#000080]/10">
                    <span className="text-[9px] font-bold uppercase text-[#000080]">CONTEXTUAL CORRELATION</span>
                    <p className="text-[10px] text-gray-600 mt-1 italic">
                      Correlation engine active. Note: Satellite environmental indices provide surface context but do not infer subsurface causal relationships without direct geological evidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Footer Attribution */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-500">Source: VEDAS / SAC, ISRO</span>
        <div className="flex items-center gap-1 group relative cursor-help">
          <Info className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] text-gray-500">Reference Information</span>
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            VEDAS data is used as an external geospatial/environmental reference layer. NWIS operational well data remains the authoritative source for drilling information.
          </div>
        </div>
      </div>
    </div>
  );
};
