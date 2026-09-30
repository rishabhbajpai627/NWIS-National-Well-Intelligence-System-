import React, { useState, useEffect } from 'react';
import { DepthChart } from '../components/DepthChart';
import { CrossWellTimeline } from '../components/CrossWellTimeline';
import { Activity, Target, Layers, Info } from 'lucide-react';

import { useActiveOperation } from '../context/ActiveOperationContext';

export const Analytics = () => {
  const { contextData, isLoading } = useActiveOperation();
  const activeOp = contextData?.operation;
  const similarWells = contextData?.similarWells || [];
  const historicalEvents = contextData?.historicalEvents || [];
  const currentDepth = activeOp?.currentDepth || 0;

  if (isLoading || !activeOp) return <div className="p-8 text-center animate-pulse text-gray-500 font-bold">Loading Context...</div>;

  return (
    <div className="h-full flex flex-col z-10 relative animate-in fade-in duration-500 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#000080] flex items-center gap-3">
          <Activity className="text-[#FF9933] w-7 h-7" />
          Well Analytics & Correlation
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-medium border-l-2 border-[#138808] pl-2">Comparing active well trajectory with nearest highly-correlated historical wells.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {/* Analytics Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                 <Target className="w-4 h-4 text-[#138808]" /> Similarity Engine
               </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {similarWells.length === 0 && <div className="text-xs text-gray-500 font-bold">No similar wells found for this operation.</div>}
              {similarWells.map((well, idx) => (
                <div key={idx} className="bg-blue-50/50 p-4 rounded border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-900">{well.wellId}</span>
                    <span className="text-xs font-bold bg-[#138808] text-white px-2 py-1 rounded">Overall: {well.overallRelevance}% Match</span>
                  </div>
                  
                  {/* Similarity Breakdown Bars */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                        <span>Formation Geology</span>
                        <span>{well.breakdown.formation}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#000080] h-full" style={{ width: `${well.breakdown.formation}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                        <span>Geographic Distance</span>
                        <span>{well.breakdown.geographic}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#000080] h-full" style={{ width: `${well.breakdown.geographic}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                        <span>Depth Overlap</span>
                        <span>{well.breakdown.depth}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#138808] h-full" style={{ width: `${well.breakdown.depth}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                        <span>Trajectory (Inclination)</span>
                        <span>{well.breakdown.trajectory}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#FF9933] h-full" style={{ width: `${well.breakdown.trajectory}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                        <span>Historical Events Profile</span>
                        <span>{well.breakdown.events}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full" style={{ width: `${well.breakdown.events}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Why this well is relevant
                    </h4>
                    <ul className="text-xs text-gray-700 font-medium space-y-1.5 pl-4 list-disc marker:text-[#FF9933]">
                      <li>Geology match ({well.breakdown.formation}%)</li>
                      <li>Depth interval overlap ({well.breakdown.depth}%)</li>
                      <li>Highly correlated historical risk events</li>
                    </ul>
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                 <Layers className="w-4 h-4 text-[#000080]" /> Formation Tops
               </h3>
            </div>
            
            <div className="p-5">
               <ul className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                 <li className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-[#138808] z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded border border-gray-200 shadow-sm">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">Tipam Sandstone</span>
                          <span className="text-xs font-semibold text-gray-500">1200m</span>
                       </div>
                    </div>
                 </li>
                 <li className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-[#000080] z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded border border-gray-200 shadow-sm">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">Girujan Clay</span>
                          <span className="text-xs font-semibold text-gray-500">1850m</span>
                       </div>
                    </div>
                 </li>
                 <li className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-[#FF9933] z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-orange-50/50 p-3 rounded border border-orange-200 shadow-sm">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-orange-800">Upper Barail</span>
                          <span className="text-xs font-bold text-orange-600">2750m</span>
                       </div>
                    </div>
                 </li>
               </ul>
            </div>
          </div>
        </div>

        {/* Depth Chart Column */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col relative">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center z-10 relative">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Cross-Well Event Timeline
            </h3>
            <span className="text-xs text-gray-600 font-bold bg-white px-2 py-1 rounded border border-gray-200">Depth Correlation</span>
          </div>
          
          <div className="flex-1 w-full p-4 relative z-0 min-h-[400px]">
             <CrossWellTimeline 
               currentDepth={currentDepth} 
               events={historicalEvents.map((e: any) => ({
                 wellId: e.well_id || e.id || "WELL-HIST",
                 type: e.event_type || e.type || "Event",
                 depth: e.depth_start || e.depth || 0
               }))} 
               activeWellId={activeOp.wellId} 
             />
          </div>
        </div>
      </div>
    </div>
  );
};
