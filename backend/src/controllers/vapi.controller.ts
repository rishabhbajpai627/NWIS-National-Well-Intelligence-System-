import { Request, Response } from 'express';
import { vapiService } from '../integrations/vedas/vapiService';

export const getVedasPointData = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const dataset = (req.query.dataset as string) || 'NDVI';
    const from = (req.query.from as string) || '20260101';
    const to = (req.query.to as string) || '20260930';

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Missing or invalid lat, lon' });
    }

    const data = await vapiService.getPointData(lat, lon, dataset, from, to);
    res.json(data);
  } catch (error) {
    console.error('Error fetching VEDAS point data:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const getVedasPolygonData = async (req: Request, res: Response) => {
  try {
    const { polygon, dataset = 'NDVI', from = '20260101', to = '20260930' } = req.body;

    if (!polygon || !Array.isArray(polygon)) {
      return res.status(400).json({ error: 'Missing or invalid polygon array' });
    }

    const data = await vapiService.getPolygonData(polygon, dataset, from, to);
    res.json(data);
  } catch (error) {
    console.error('Error fetching VEDAS polygon data:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};
