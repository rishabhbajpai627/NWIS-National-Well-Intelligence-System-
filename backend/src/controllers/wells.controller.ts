import { Request, Response } from 'express';
import { query } from '../config/db';

export const getActiveWell = async (req: Request, res: Response) => {
  try {
    res.json({
      well_id: 'WELL-OIL-101',
      well_name: 'Exploration Alpha 101',
      latitude: 23.02,
      longitude: 72.57,
      current_depth: 2765,
      status: 'DRILLING',
      target_depth: 3500,
      formation: 'Upper Barail',
      source: 'DEMO DATA'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
import { wellGeoProvider } from '../providers/WellGeoProvider';

export const getNearbyWells = async (req: Request, res: Response) => {
  const { lat, lng, radius = 25 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const geojson = await wellGeoProvider.getNearbyWells(parseFloat(lat as string), parseFloat(lng as string), parseFloat(radius as string));
    res.json(geojson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHistoricalEvents = async (req: Request, res: Response) => {
  const { well_id } = req.params;
  
  try {
    const sql = `
      SELECT event_type, severity, depth_start, depth_end, description, mitigation
      FROM drilling_events
      WHERE well_id = (SELECT id FROM wells WHERE well_id = $1)
      ORDER BY depth_start ASC;
    `;
    
    try {
      const result = await query(sql, [well_id]);
      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch(dbError) {
      console.warn("DB Connection failed, falling back to mock data");
    }

    // Comprehensive Mock Data Fallback for Demo
    const allEvents = [
      {
        well_id: 'WELL-OIL-023',
        event_type: 'Mud Loss',
        severity: 'HIGH',
        depth_start: 2790,
        depth_end: 2805,
        description: 'Severe mud loss of 50 bbl/hr encountered in fractured limestone.',
        mitigation: 'Pumped LCM pill (30 ppb). Regained circulation after 4 hours.',
        formation: 'Upper Barail',
        source_doc: 'DDR_OIL_023.pdf',
        page: 12
      },
      {
        well_id: 'WELL-OIL-017',
        event_type: 'Torque Spike',
        severity: 'HIGH',
        depth_start: 2795,
        depth_end: 2810,
        description: 'Erratic torque up to 25k ft-lbs.',
        mitigation: 'Worked pipe, circulated bottoms up, increased mud weight by 0.2 ppg.',
        formation: 'Upper Barail',
        source_doc: 'DDR_OIL_017.pdf',
        page: 8
      },
      {
        well_id: 'WELL-OIL-031',
        event_type: 'Stuck Pipe',
        severity: 'MEDIUM',
        depth_start: 2805,
        depth_end: 2818,
        description: 'Differential sticking tendencies observed while taking survey.',
        mitigation: 'Pumped lubricating pill, spotted pipe lax. Freed after 2 hours jarring.',
        formation: 'Upper Barail',
        source_doc: 'DDR_OIL_031.pdf',
        page: 15
      },
      {
        well_id: 'WELL-OIL-041',
        event_type: 'Pressure Anomaly',
        severity: 'HIGH',
        depth_start: 2820,
        depth_end: 2830,
        description: 'Sudden SPP increase and background gas spike.',
        mitigation: 'Flow check positive. Closed BOP, circulated kick out using Driller\'s Method.',
        formation: 'Upper Barail',
        source_doc: 'DDR_OIL_041.pdf',
        page: 22
      }
    ];

    if (well_id === 'ALL') {
      return res.json(allEvents);
    }
    
    const filteredEvents = allEvents.filter(e => e.well_id === well_id);
    res.json(filteredEvents);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
