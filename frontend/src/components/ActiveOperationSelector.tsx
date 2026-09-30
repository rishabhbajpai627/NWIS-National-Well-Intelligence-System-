import React, { useState, useRef, useEffect } from 'react';
import { useActiveOperation, Operation } from '../context/ActiveOperationContext';
import { ChevronDown, Search, MapPin, Activity, Target } from 'lucide-react';

export const ActiveOperationSelector = () => {
  const { operationsList, activeOperationId, setActiveOperationId, contextData, isLoading } = useActiveOperation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOp = contextData?.operation || operationsList.find(o => o.id === activeOperationId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOps = operationsList.filter(op => 
    op.wellName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    op.field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && !activeOp) {
    return (
      <div className="text-right flex flex-col justify-center">
        <p className="text-xs text-gray-500">Active Operation</p>
        <p className="text-sm font-bold text-gray-400 animate-pulse">Loading context...</p>
      </div>
    );
  }

  if (!activeOp) return null;

  return (
    <div className="relative text-right flex flex-col justify-center z-50" ref={dropdownRef}>
      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Active Operation</p>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-end gap-2 bg-[#F4F4F4] hover:bg-gray-200 border border-gray-300 rounded px-3 py-1.5 transition-colors group"
      >
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-[#000080] flex items-center gap-1.5">
            {activeOp.status === 'ACTIVE' ? <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> : <span className="w-2 h-2 rounded-full bg-yellow-500"></span>}
            {activeOp.wellName}
          </span>
          <span className="text-[10px] text-gray-600 font-semibold">{activeOp.operationType} &bull; {activeOp.currentDepth} m ▼</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded shadow-xl border border-gray-200 overflow-hidden text-left flex flex-col">
          <div className="bg-[#1A202C] p-3 border-b border-gray-700">
             <div className="relative">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search operations..." 
                  className="w-full bg-gray-800 text-white placeholder-gray-400 text-sm rounded pl-9 pr-3 py-1.5 border border-gray-600 focus:outline-none focus:border-[#FF9933]"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredOps.map(op => (
              <button 
                key={op.id}
                onClick={() => {
                  setActiveOperationId(op.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-blue-50 transition-colors flex gap-3 ${op.id === activeOperationId ? 'bg-blue-50/50' : ''}`}
              >
                <div className="mt-1">
                  {op.status === 'ACTIVE' ? <span className="w-2 h-2 rounded-full bg-green-500 block"></span> : <span className="w-2 h-2 rounded-full bg-yellow-500 block"></span>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-[#000080]">{op.wellName}</span>
                    {op.id === activeOperationId && <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">SELECTED</span>}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 mt-0.5">{op.operationType} &bull; {op.currentDepth} m</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {op.basin}</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Target className="w-3 h-3"/> {op.formation}</span>
                  </div>
                </div>
              </button>
            ))}
            {filteredOps.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">No operations found.</div>
            )}
          </div>
          <div className="bg-gray-50 p-2 text-center border-t border-gray-200">
            <span className="text-[10px] font-bold text-gray-400">DEMO DATA ENVIRONMENT</span>
          </div>
        </div>
      )}
    </div>
  );
};
