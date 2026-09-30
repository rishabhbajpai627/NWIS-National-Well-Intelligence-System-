import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Operation {
  id: string;
  wellId: string;
  wellName: string;
  operationType: string;
  status: string;
  field: string;
  basin: string;
  latitude: number;
  longitude: number;
  currentDepth: number;
  plannedDepth: number;
  formation: string;
  lastUpdated: string;
}

export interface OperationContextData {
  operation: Operation;
  nearbyWells: any;
  similarWells: any[];
  historicalEvents: any[];
  riskZones: any[];
  drillingParameters: any;
}

interface ActiveOperationContextType {
  activeOperationId: string;
  setActiveOperationId: (id: string) => void;
  operationsList: Operation[];
  contextData: OperationContextData | null;
  isLoading: boolean;
  error: string | null;
}

const ActiveOperationContext = createContext<ActiveOperationContextType | undefined>(undefined);

export const ActiveOperationProvider = ({ children }: { children: ReactNode }) => {
  const [operationsList, setOperationsList] = useState<Operation[]>([]);
  const [activeOperationId, setActiveOperationIdState] = useState<string>('');
  const [contextData, setContextData] = useState<OperationContextData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch initial operations list
  useEffect(() => {
    fetch('http://localhost:5001/api/operations')
      .then(res => res.json())
      .then((data: Operation[]) => {
        setOperationsList(data);
        const storedId = localStorage.getItem('nwis.activeOperationId');
        if (storedId && data.find(o => o.id === storedId)) {
          setActiveOperationIdState(storedId);
        } else if (data.length > 0) {
          // Default to first active drilling op or just the first
          const defaultOp = data.find(o => o.status === 'ACTIVE' && o.operationType === 'DRILLING') || data[0];
          setActiveOperationIdState(defaultOp.id);
        }
      })
      .catch(err => {
        console.error('Failed to fetch operations', err);
        setError('Failed to load operations');
        setIsLoading(false);
      });
  }, []);

  // 2. Fetch specific context when activeOperationId changes
  useEffect(() => {
    if (!activeOperationId) return;

    setIsLoading(true);
    setError(null);
    localStorage.setItem('nwis.activeOperationId', activeOperationId);

    fetch(`http://localhost:5001/api/operations/${activeOperationId}/context`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch operation context');
        return res.json();
      })
      .then(data => {
        setContextData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [activeOperationId]);

  const setActiveOperationId = (id: string) => {
    setActiveOperationIdState(id);
  };

  return (
    <ActiveOperationContext.Provider value={{ activeOperationId, setActiveOperationId, operationsList, contextData, isLoading, error }}>
      {children}
    </ActiveOperationContext.Provider>
  );
};

export const useActiveOperation = () => {
  const context = useContext(ActiveOperationContext);
  if (context === undefined) {
    throw new Error('useActiveOperation must be used within an ActiveOperationProvider');
  }
  return context;
};
