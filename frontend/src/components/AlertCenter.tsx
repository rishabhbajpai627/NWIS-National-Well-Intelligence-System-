import React, { useState } from 'react';
import { AlertTriangle, Info, ShieldAlert, ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface RiskZone {
  type: string;
  startDepth: number;
  endDepth: number;
  formation: string;
  evidenceWells: string[];
}

interface AlertCenterProps {
  currentDepth: number;
  riskZones: RiskZone[];
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ currentDepth, riskZones }) => {
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

  // Imminent risks: within 30 meters
  const imminentRisks = riskZones.filter(
    (risk) => risk.startDepth > currentDepth && risk.startDepth <= currentDepth + 30
  ).sort((a, b) => a.startDepth - b.startDepth);

  if (imminentRisks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
         <div className="bg-[#000080] text-white px-4 py-3 border-b border-blue-900">
           <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
             <ShieldAlert className="w-4 h-4" /> Alert Center
           </h2>
         </div>
         <div className="p-5 flex-1 flex flex-col items-center justify-center text-gray-400">
            <ShieldAlert className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-medium">No active alerts</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-red-300 rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      <div className="bg-red-600 text-white px-4 py-3 border-b border-red-700">
        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 animate-pulse" /> Proactive Alerts
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-red-50/30 p-4 space-y-3 custom-scrollbar">
        {imminentRisks.map((risk, idx) => {
          const isExpanded = expandedAlert === idx;
          const distance = (risk.startDepth - currentDepth).toFixed(1);
          
          return (
            <div key={idx} className="bg-white border border-red-200 rounded-md shadow-sm overflow-hidden transition-all">
              <div 
                className="p-3 cursor-pointer hover:bg-red-50 flex items-start justify-between"
                onClick={() => setExpandedAlert(isExpanded ? null : idx)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-1.5 rounded-full mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase">Historical {risk.type} Zone</h3>
                    <p className="text-[11px] font-bold text-red-600 mt-0.5">{risk.startDepth} - {risk.endDepth} m <span className="text-gray-400 font-normal">({distance} m ahead)</span></p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Why am I seeing this?
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span> 
                        <span><strong className="text-gray-900">{risk.evidenceWells.length} offset wells</strong> experienced {risk.type.toLowerCase()} in this interval.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span> 
                        <span>Same geological formation (<strong className="text-gray-900">{risk.formation}</strong>).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">✓</span> 
                        <span>High depth overlap and parameter similarity.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2">Historical Evidence</h4>
                    <div className="space-y-2">
                      {risk.evidenceWells.map((well, wIdx) => (
                        <div key={wIdx} className="bg-white border border-gray-200 rounded p-2 text-[10px]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-[#000080]">{well}</span>
                            <span className="text-gray-500 flex items-center gap-1"><FileText className="w-3 h-3"/> DDR (Synthetic)</span>
                          </div>
                          <p className="text-gray-600 italic">"Observed {risk.type.toLowerCase()} tendencies while entering {risk.formation}. Engineer attention recommended."</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-100 text-yellow-800 text-[10px] p-2 rounded flex items-start gap-2 border border-yellow-200">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p><strong>Engineer Review Recommended.</strong> Historical records indicate increased monitoring may be warranted while entering this interval.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
