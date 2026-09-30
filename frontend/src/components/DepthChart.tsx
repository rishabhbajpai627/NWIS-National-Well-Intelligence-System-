import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DepthChartProps {
  currentDepth: number;
  events: any[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 p-3 rounded shadow-md">
        <p className="font-bold text-[#FF9933] mb-1">{data.event_type}</p>
        <p className="text-xs font-semibold text-gray-700">Depth: {data.depth_start}m - {data.depth_end}m</p>
        <p className="text-xs text-gray-600 mt-2 max-w-[200px] font-medium">{data.description}</p>
        {data.mitigation && (
          <div className="mt-2 text-xs">
            <span className="text-gray-500 font-bold">Mitigation:</span>
            <p className="text-gray-800 font-medium">{data.mitigation}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const DepthChart: React.FC<DepthChartProps> = ({ currentDepth, events }) => {
  // Format events for scatter plot
  const data = events.map((e, idx) => ({
    ...e,
    x: 1, // Fixed X to align them vertically
    fill: e.severity === 'HIGH' ? '#e11d48' : '#ea580c'
  }));

  // Create a data point for current depth
  const currentData = [{
    depth: currentDepth,
    x: 1,
    event_type: 'CURRENT_DEPTH'
  }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
        
        {/* Reversed Y Axis for Depth (going down) */}
        <YAxis 
          type="number" 
          dataKey="depth_start" 
          name="Depth" 
          unit="m" 
          domain={[2500, 3000]} 
          reversed={true} 
          stroke="#475569"
          tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
        />
        
        <XAxis type="number" dataKey="x" hide domain={[0, 2]} />
        <ZAxis type="number" range={[100, 400]} />
        
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
        
        {/* Current Depth Line */}
        <ReferenceLine 
          y={currentDepth} 
          stroke="#000080" 
          strokeDasharray="3 3" 
          label={{ position: 'top', value: 'Active Depth', fill: '#000080', fontSize: 12, fontWeight: 600 }} 
        />

        {/* Historical Events */}
        <Scatter name="Historical Events" data={data} shape="circle">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Scatter>
        
        {/* Current Depth Marker */}
        <Scatter name="Current" data={currentData} dataKey="depth" fill="#000080" shape="star" />

      </ScatterChart>
    </ResponsiveContainer>
  );
};
