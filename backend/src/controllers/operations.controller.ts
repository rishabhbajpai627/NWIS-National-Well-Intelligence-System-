import { Request, Response } from 'express';
import { wellGeoProvider } from '../providers/WellGeoProvider';

export interface Operation {
  id: string;
  wellId: string;
  wellName: string;
  operationType: "DRILLING" | "WORKOVER" | "COMPLETION" | "MONITORING";
  status: "ACTIVE" | "MONITORING" | "PAUSED" | "COMPLETED";
  field: string;
  basin: string;
  latitude: number;
  longitude: number;
  currentDepth: number;
  plannedDepth: number;
  formation: string;
  rigName?: string;
  startDate?: string;
  lastUpdated: string;
}

// 5 required robust demo operations
const OPERATIONS: Operation[] = [
  {
    id: 'op-1',
    wellId: 'WELL-ABC-17',
    wellName: 'WELL-ABC-17',
    operationType: 'DRILLING',
    status: 'ACTIVE',
    field: 'Alpha Field',
    basin: 'Upper Assam',
    latitude: 27.47,
    longitude: 94.91,
    currentDepth: 2765,
    plannedDepth: 3500,
    formation: 'Lakwa',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'op-2',
    wellId: 'WELL-ABC-12',
    wellName: 'WELL-ABC-12',
    operationType: 'DRILLING',
    status: 'ACTIVE',
    field: 'Beta Field',
    basin: 'Barail',
    latitude: 27.20,
    longitude: 94.85,
    currentDepth: 2140,
    plannedDepth: 3000,
    formation: 'Barail',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'op-3',
    wellId: 'WELL-XYZ-04',
    wellName: 'WELL-XYZ-04',
    operationType: 'WORKOVER',
    status: 'ACTIVE',
    field: 'Gamma Field',
    basin: 'Assam',
    latitude: 26.75,
    longitude: 93.90,
    currentDepth: 1890,
    plannedDepth: 1890,
    formation: 'Tipam',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'op-4',
    wellId: 'WELL-XYZ-09',
    wellName: 'WELL-XYZ-09',
    operationType: 'COMPLETION',
    status: 'MONITORING',
    field: 'Delta Field',
    basin: 'Assam',
    latitude: 26.90,
    longitude: 94.10,
    currentDepth: 3120,
    plannedDepth: 3120,
    formation: 'Kopili',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'op-5',
    wellId: 'WELL-DEF-21',
    wellName: 'WELL-DEF-21',
    operationType: 'DRILLING',
    status: 'ACTIVE',
    field: 'Epsilon Field',
    basin: 'Assam',
    latitude: 26.50,
    longitude: 93.70,
    currentDepth: 980,
    plannedDepth: 2500,
    formation: 'Girujan',
    lastUpdated: new Date().toISOString()
  }
];

// Context Mock Generators based on the operation
const getRiskZones = (op: Operation) => {
  if (op.wellId === 'WELL-ABC-17') {
    return [
      { id: 'r1', startDepth: 2790, endDepth: 2810, riskType: 'Mud Loss', description: 'Historical severe mud loss', severity: 'HIGH' },
      { id: 'r2', startDepth: 2840, endDepth: 2860, riskType: 'Stuck Pipe', description: 'Differential sticking tendencies', severity: 'MEDIUM' }
    ];
  }
  if (op.wellId === 'WELL-ABC-12') {
    return [
      { id: 'r3', startDepth: 2160, endDepth: 2190, riskType: 'Torque Spike', description: 'Erratic torque in Barail', severity: 'HIGH' },
      { id: 'r4', startDepth: 2210, endDepth: 2220, riskType: 'Partial Mud Loss', description: 'Loss rate 10 bbl/hr', severity: 'LOW' }
    ];
  }
  if (op.wellId === 'WELL-XYZ-04') {
    return [
      { id: 'r5', startDepth: 1920, endDepth: 1940, riskType: 'Kick', description: 'High pressure pocket', severity: 'CRITICAL' },
      { id: 'r6', startDepth: 2050, endDepth: 2060, riskType: 'Cementing Issue', description: 'Poor bond log historically', severity: 'MEDIUM' }
    ];
  }
  return []; // Fallback for others
};

const getSimilarWells = (op: Operation) => {
  return [
    {
      wellId: `${op.wellId}-SIM-1`,
      overallRelevance: 91,
      breakdown: { formation: 95, depth: 88, geographic: 92, trajectory: 87, events: 94 }
    },
    {
      wellId: `${op.wellId}-SIM-2`,
      overallRelevance: 85,
      breakdown: { formation: 80, depth: 90, geographic: 85, trajectory: 80, events: 90 }
    }
  ];
};

const getHistoricalEvents = (op: Operation) => {
  const risks = getRiskZones(op);
  return risks.map(r => ({
    well_id: r.id + '-HIST',
    event_type: r.riskType,
    severity: r.severity,
    depth_start: r.startDepth,
    depth_end: r.endDepth,
    description: r.description,
    mitigation: 'Observed mitigation in offset wells: Increased monitoring of returns and mud-property checks. Engineer review recommended.',
    formation: op.formation,
    source_doc: `DDR_${op.wellId.replace('-','_')}.pdf`,
    page: Math.floor(Math.random() * 20) + 1
  }));
};

export const getOperationsList = async (req: Request, res: Response) => {
  try {
    res.json(OPERATIONS);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOperationDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const op = OPERATIONS.find(o => o.id === id);
    if (!op) return res.status(404).json({ error: 'Operation not found' });
    res.json(op);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOperationContext = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const op = OPERATIONS.find(o => o.id === id);
    if (!op) return res.status(404).json({ error: 'Operation not found' });

    // Use WellGeoProvider to fetch nearby wells around this specific operation!
    const nearbyWells = await wellGeoProvider.getNearbyWells(op.latitude, op.longitude, 25);

    res.json({
      operation: op,
      nearbyWells: nearbyWells,
      similarWells: getSimilarWells(op),
      historicalEvents: getHistoricalEvents(op),
      riskZones: getRiskZones(op),
      drillingParameters: {
        rop: 15 + Math.random()*2,
        wob: 12 + Math.random(),
        rpm: 120,
        torque: 18 + Math.random()*2,
        spp: 2800,
        flow: 450,
        mw: 10.2
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
