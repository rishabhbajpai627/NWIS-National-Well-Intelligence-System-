import React, { useState } from 'react';
import { Search, FileText, Loader2, Database, Zap, ArrowRight, Lightbulb, Activity } from 'lucide-react';
import { useActiveOperation } from '../context/ActiveOperationContext';

export const KnowledgeBase = () => {
  const { contextData } = useActiveOperation();
  const activeOp = contextData?.operation;
  const historicalEvents = contextData?.historicalEvents || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (queryOverride?: string | React.FormEvent) => {
    const query = typeof queryOverride === 'string' ? queryOverride : searchQuery;
    if (!query || typeof query !== 'string' || !query.trim()) return;

    setSearchQuery(query); // Update input field if clicked from suggestions
    setIsSearching(true);
    setAiResponse(null); // Clear previous response

    try {
      const res = await fetch('http://localhost:8000/api/ai/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, active_depth: activeOp?.currentDepth || 0, well_id: activeOp?.wellId })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data);
      } else {
        setAiResponse({ answer: "No sufficient historical evidence found.", evidence: [] });
      }
    } catch (err) {
      console.error("RAG Query Failed", err);
      setAiResponse({ answer: "No sufficient historical evidence found.", evidence: [] });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto z-10 relative pb-8">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-bold text-[#000080] flex items-center justify-center gap-3">
          <Database className="text-[#138808] w-8 h-8" />
          Institutional Memory & Intelligence Portal
        </h1>
        <p className="text-gray-600 font-medium mt-3 max-w-2xl mx-auto">
          Query over 50,000 historical Daily Drilling Reports, Wireline Logs, and Mud Logging documents across Indian basins using Semantic Search.
        </p>
        
        {activeOp && (
          <div className="inline-flex items-center justify-center gap-4 bg-white border border-gray-200 px-4 py-2 mt-4 rounded-full shadow-sm">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Context:</span>
            <span className="text-sm font-bold text-[#000080]">{activeOp.wellId}</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-bold text-gray-700">{activeOp.formation}</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-bold text-gray-700">{activeOp.currentDepth}m</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative mb-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isSearching ? <Loader2 className="h-6 w-6 text-[#000080] animate-spin" /> : <Search className="h-6 w-6 text-gray-400" />}
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-lg text-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#000080]/50 focus:border-[#000080] transition-all shadow-inner"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-[#000080] hover:bg-blue-900 disabled:bg-gray-400 text-white font-bold rounded-md transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Analyze
          </button>
        </form>
      </div>

      {!aiResponse && !isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          {/* Suggested Queries */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#FF9933]" /> Suggested Intelligence Queries
            </h3>
            <ul className="space-y-3">
              {[
                `What happened around ${activeOp?.currentDepth || 2800}m in nearby wells?`,
                `Which wells experienced mud loss in ${activeOp?.formation || 'this formation'}?`,
                "What mitigation was used for stuck pipe?",
                `Show pressure-related events in ${activeOp?.formation || 'this formation'}.`,
                `Which well is most similar to ${activeOp?.wellId || 'this well'}?`
              ].map((q, i) => (
                <li key={i}>
                  <button 
                    onClick={() => handleSearch(q)}
                    className="w-full text-left p-3 rounded bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-sm font-medium text-[#000080] transition-colors flex items-center justify-between group"
                  >
                    <span>"{q}"</span>
                    <ArrowRight className="w-4 h-4 text-blue-300 group-hover:text-[#000080] transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Historical Insights */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#138808]" /> Recent Historical Insights
            </h3>
            <div className="space-y-4">
              {historicalEvents.map((ev: any, idx: number) => {
                const color = ev.severity === 'HIGH' || ev.severity === 'CRITICAL' ? 'red' : ev.severity === 'MEDIUM' ? 'orange' : 'yellow';
                return (
                  <div key={idx} className={`border-l-4 border-${color}-500 pl-4 py-1`}>
                    <p className="text-sm font-bold text-gray-900">{ev.event_type}</p>
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span className="font-bold text-[#000080]">{ev.well_id}</span>
                      <span className="font-bold text-gray-500">{ev.depth_start}m</span>
                    </div>
                  </div>
                )
              })}
              {historicalEvents.length === 0 && (
                 <p className="text-sm text-gray-500 font-medium">No recent insights for this operation context.</p>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#000080]" /> Document Intelligence Pipeline Demo
            </h3>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded text-center relative w-full">
                <FileText className="w-6 h-6 text-[#FF9933] mx-auto mb-2" />
                <h4 className="text-[11px] font-bold uppercase text-gray-700">1. Unstructured Docs</h4>
                <p className="text-[10px] text-gray-500 mt-1">DDR_XYZ_07.pdf (Synthetic)</p>
              </div>
              
              <div className="hidden lg:block text-gray-300">
                <ArrowRight className="w-5 h-5" />
              </div>
              
              <div className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded text-center relative w-full">
                <Zap className="w-6 h-6 text-[#138808] mx-auto mb-2" />
                <h4 className="text-[11px] font-bold uppercase text-gray-700">2. NLP Extraction</h4>
                <p className="text-[10px] text-gray-500 mt-1">Depth: 2804m | Event: Mud Loss</p>
              </div>

              <div className="hidden lg:block text-gray-300">
                <ArrowRight className="w-5 h-5" />
              </div>
              
              <div className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded text-center relative w-full">
                <Database className="w-6 h-6 text-[#000080] mx-auto mb-2" />
                <h4 className="text-[11px] font-bold uppercase text-gray-700">3. Vector Search</h4>
                <p className="text-[10px] text-gray-500 mt-1">NWIS Knowledge Graph</p>
              </div>
            </div>
            <div className="mt-4 bg-blue-50/50 p-3 border border-blue-100 rounded text-[10px] text-gray-600">
              <strong className="text-[#000080]">Note:</strong> This pipeline dynamically structures synthetic historical reports, converting raw PDF text into searchable events mapped to the active operation's context.
            </div>
          </div>
        </div>
      )}

      {aiResponse && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-sm font-bold text-[#000080] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
               <Zap className="w-4 h-4" /> AI Synthesized Analysis
            </h3>
            <p className="text-lg text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {aiResponse.answer}
            </p>
          </div>

          {aiResponse.evidence?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                 <FileText className="w-4 h-4" /> Extracted Evidence Sources
              </h3>
              <div className="space-y-4">
                {aiResponse.evidence.map((ev: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#138808]/10 text-[#138808] p-2 rounded shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#000080]">{ev.document}</h4>
                          <p className="text-xs font-semibold text-gray-500">Page {ev.page} • Well: {ev.well_id} • Depth: {ev.depth}m</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 border border-green-200 text-xs px-2 py-1 rounded font-bold whitespace-nowrap">
                        Relevance: {ev.relevance_score}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 font-medium italic border-l-4 border-[#000080]">
                      "{ev.chunk}"
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">Formation: {ev.formation}</span>
                      <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">Event: {ev.event_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
