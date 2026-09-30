import React from 'react';
import { FileText, MapPin, AlertTriangle, Info, Printer, Download, X } from 'lucide-react';

interface OperationBriefingProps {
  activeOp: any;
  riskZones: any[];
  historicalEvents: any[];
  onClose: () => void;
}

export const OperationBriefing: React.FC<OperationBriefingProps> = ({ activeOp, riskZones, historicalEvents, onClose }) => {
  const currentDepth = activeOp?.currentDepth || 0;
  
  // Filter risks ahead
  const upcomingRisks = riskZones.filter(
    (risk) => risk.startDepth > currentDepth
  ).sort((a, b) => a.startDepth - b.startDepth);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col my-auto max-h-[90vh] print:max-h-none print:shadow-none print:w-full">
        
        {/* Header - Screen Only */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg print:hidden">
          <h2 className="text-lg font-bold text-[#000080] flex items-center gap-2">
            <FileText className="w-5 h-5" /> Operation Briefing
          </h2>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-[#138808] hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-bold transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 flex-1 overflow-y-auto print:overflow-visible bg-white print:p-4 text-gray-800 font-serif">
          
          <div className="text-center mb-8 border-b-2 border-[#000080] pb-6">
            <h1 className="text-3xl font-bold text-[#000080] uppercase tracking-wider mb-2">NWIS Operation Briefing</h1>
            <p className="text-sm font-bold text-gray-500">GENERATED {new Date().toLocaleDateString()} • CONFIDENTIAL</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-3">Active Context</h3>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex justify-between"><span>Well ID:</span> <span className="font-bold text-black">{activeOp?.wellId}</span></li>
                <li className="flex justify-between"><span>Field:</span> <span className="font-bold text-black">{activeOp?.field}</span></li>
                <li className="flex justify-between"><span>Basin:</span> <span className="font-bold text-black">{activeOp?.basin}</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-3">Drilling Status</h3>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex justify-between"><span>Current Depth:</span> <span className="font-bold text-black">{currentDepth} m</span></li>
                <li className="flex justify-between"><span>Formation:</span> <span className="font-bold text-black">{activeOp?.formation}</span></li>
                <li className="flex justify-between"><span>Status:</span> <span className="font-bold text-black">{activeOp?.status}</span></li>
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Upcoming Historical Risk
            </h3>
            
            {upcomingRisks.length === 0 ? (
              <p className="text-sm italic text-gray-500">No imminent historical risks identified in the mapped interval.</p>
            ) : (
              <div className="space-y-4">
                {upcomingRisks.map((risk, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 p-4 rounded print:border-black print:bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-red-800 text-lg uppercase print:text-black">{risk.type || risk.riskType}</h4>
                      <span className="font-bold text-red-600 font-mono print:text-black">{risk.startDepth}m - {risk.endDepth}m</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-3">{risk.description}</p>
                    
                    <div className="bg-white p-3 rounded border border-red-100 print:border-gray-300">
                      <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Offset Evidence</h5>
                      <p className="text-sm italic">"Similar wells in the {activeOp?.formation} formation recorded {risk.type || risk.riskType} events within the upcoming interval. Records indicate increased monitoring may be warranted."</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-4">Historical Observations (Nearest Offsets)</h3>
            <div className="grid grid-cols-1 gap-3">
              {historicalEvents.slice(0, 3).map((ev, idx) => (
                <div key={idx} className="border-l-4 border-[#000080] pl-4 py-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-sm text-gray-900">{ev.event_type}</span>
                    <span className="font-bold text-sm font-mono text-gray-600">{ev.depth_start}m</span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Well: {ev.well_id} • Source: {ev.source_doc}</p>
                  <p className="text-sm text-gray-700 italic">"{ev.mitigation}"</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-300 pt-4 text-center">
            <p className="text-xs font-bold text-[#138808] uppercase">Engineer Review Recommended</p>
            <p className="text-[10px] text-gray-400 mt-1">This report is synthetically generated by NWIS AI Decision Support for prototype demonstration.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
