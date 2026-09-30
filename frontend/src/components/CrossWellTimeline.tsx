import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

interface TimelineEvent {
  wellId: string;
  type: string;
  depth: number;
}

interface CrossWellTimelineProps {
  currentDepth: number;
  events: TimelineEvent[];
  activeWellId: string;
}

export const CrossWellTimeline: React.FC<CrossWellTimelineProps> = ({ currentDepth, events, activeWellId }) => {
  // Sort events by depth to build the timeline
  const sortedEvents = [...events].sort((a, b) => a.depth - b.depth);
  
  // Calculate depth bounds
  const minDepth = Math.floor(Math.min(currentDepth, ...events.map(e => e.depth)) / 100) * 100 - 100;
  const maxDepth = Math.ceil(Math.max(currentDepth, ...events.map(e => e.depth)) / 100) * 100 + 100;
  const depthRange = maxDepth - minDepth;

  return (
    <div className="bg-white rounded-lg p-4 h-full flex flex-col">
      
      <div className="flex-1 relative mt-4">
        {/* Active Well Track */}
        <div className="absolute top-0 bottom-0 left-32 w-1.5 bg-[#000080]/10 rounded-full"></div>
        <div className="absolute top-0 bottom-0 left-32 w-1.5 bg-[#000080] rounded-t-full transition-all duration-1000" style={{ height: `${((currentDepth - minDepth) / depthRange) * 100}%` }}></div>
        
        {/* Active Well Marker */}
        <div 
          className="absolute left-[122px] flex items-center transition-all duration-1000 z-20"
          style={{ top: `${((currentDepth - minDepth) / depthRange) * 100}%` }}
        >
           <div className="w-4 h-4 bg-white border-[3px] border-[#000080] rounded-full shadow-md"></div>
           <div className="ml-3 bg-[#000080] text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm flex flex-col">
             <span>ACTIVE DEPTH</span>
             <span className="text-blue-200">{currentDepth.toFixed(1)} m</span>
           </div>
        </div>

        {/* Historical Events */}
        {sortedEvents.map((evt, idx) => {
          const topPercent = ((evt.depth - minDepth) / depthRange) * 100;
          return (
            <div key={idx} className="absolute left-32 right-0 flex items-center group" style={{ top: `${topPercent}%` }}>
               <div className="w-16 border-t-2 border-dashed border-red-300 group-hover:border-red-500 transition-colors"></div>
               <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-r-md shadow-sm opacity-90 hover:opacity-100 group-hover:bg-red-100 transition-all cursor-default">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-red-700 leading-tight">{evt.type} @ {evt.depth}m</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase">{evt.wellId}</span>
                  </div>
               </div>
            </div>
          );
        })}

        {/* Depth Labels (Y-axis) */}
        {[minDepth, minDepth + depthRange * 0.25, minDepth + depthRange * 0.5, minDepth + depthRange * 0.75, maxDepth].map((depth, i) => (
          <div key={i} className="absolute left-0 text-right w-24 text-[10px] font-bold text-gray-400 font-mono" style={{ top: `${(i * 25)}%`, transform: 'translateY(-50%)' }}>
            {depth.toFixed(0)} m
          </div>
        ))}

        {/* Active Well Label */}
        <div className="absolute top-[-24px] left-24 text-center">
          <span className="text-[10px] font-bold text-[#000080] uppercase tracking-wider">{activeWellId}</span>
        </div>
      </div>
    </div>
  );
};
