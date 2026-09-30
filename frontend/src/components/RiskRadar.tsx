import React from 'react';
import { AlertTriangle, ChevronDown, Activity, Map, ArrowDown } from 'lucide-react';

interface RiskZone {
  type: string;
  startDepth: number;
  endDepth: number;
  formation: string;
  evidenceWells: string[];
}

interface RiskRadarProps {
  currentDepth: number;
  riskZones: RiskZone[];
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ currentDepth, riskZones }) => {
  // Only show risks that are ahead within the next 100m
  const upcomingRisks = riskZones.filter(
    (risk) => risk.startDepth > currentDepth && risk.startDepth <= currentDepth + 100
  ).sort((a, b) => a.startDepth - b.startDepth);

  return (
    <div className="bg-[#1A202C] rounded-lg shadow-sm overflow-hidden flex flex-col text-white font-sans h-full">
      <div className="px-4 py-3 border-b border-gray-700 bg-black/30 flex justify-between items-center">
        <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FF9933]" />
          Next 100m Risk Radar
        </h2>
        <span className="text-[10px] font-mono text-gray-400">Current: {currentDepth.toFixed(1)} m</span>
      </div>

      <div className="p-4 flex-1 flex flex-col relative overflow-hidden">
        {upcomingRisks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center mb-2">
               <ArrowDown className="w-6 h-6 text-green-500 opacity-50" />
             </div>
             <p className="text-xs font-bold">No imminent historical risks identified</p>
             <p className="text-[10px] mt-1">in the next 100 meters.</p>
          </div>
        ) : (
          <div className="relative flex-1">
             {/* Depth Track Line */}
             <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>
             
             {/* Current Position Marker */}
             <div className="absolute left-[20px] top-0 flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10"></div>
                <div className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">ACTIVE DRILLING</div>
             </div>

             {/* Risks */}
             <div className="mt-8 space-y-6">
               {upcomingRisks.map((risk, idx) => {
                 const distance = (risk.startDepth - currentDepth).toFixed(1);
                 
                 return (
                   <div key={idx} className="relative pl-12">
                     <div className="absolute left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-[#FF9933] shadow-[0_0_8px_rgba(255,153,51,0.6)] z-10"></div>
                     <div className="absolute left-6 top-2 bottom-0 w-0.5 bg-[#FF9933] opacity-30"></div>
                     
                     <div className="bg-gray-800/80 border border-gray-700 rounded p-3">
                       <div className="flex justify-between items-start mb-2">
                         <h4 className="text-xs font-bold text-[#FF9933] flex items-center gap-1.5 uppercase">
                           <AlertTriangle className="w-3.5 h-3.5" /> {risk.type}
                         </h4>
                         <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-yellow-400">
                           {risk.startDepth} - {risk.endDepth} m
                         </span>
                       </div>
                       
                       <p className="text-[11px] font-bold text-white mb-2">
                         Approaching interval in <span className="text-yellow-400">{distance} m</span>
                       </p>
                       
                       <div className="text-[10px] text-gray-300 space-y-1">
                         <p className="flex justify-between">
                           <span>Formation:</span> <span className="font-semibold text-white">{risk.formation}</span>
                         </p>
                         <p className="flex justify-between">
                           <span>Offset Evidence:</span> <span className="font-semibold text-white">Observed in {risk.evidenceWells.length} wells</span>
                         </p>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
