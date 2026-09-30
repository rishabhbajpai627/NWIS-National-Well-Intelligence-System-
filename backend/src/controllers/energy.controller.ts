import { Request, Response } from 'express';
import { energyService } from '../integrations/vedas/energyService';
import { AssetType } from '../integrations/vedas/vedasTypes';

export const getNearbyEnergyAssets = async (req: Request, res: Response) => {
  try {
    const wellId = req.query.wellId as string;
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat(req.query.radius as string);
    const layersParam = req.query.layers as string;
    
    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return res.status(400).json({ error: 'Missing or invalid lat, lng, or radius' });
    }

    let layers: AssetType[] = [];
    if (layersParam) {
      layers = layersParam.split(',').map(l => l as AssetType);
    }

    const { assets, provider } = await energyService.getNearbyEnergyInfrastructure(lat, lng, radius, layers);

    res.json({
      center: {
        wellId,
        latitude: lat,
        longitude: lng
      },
      radiusKm: radius,
      provider,
      assets
    });
  } catch (error) {
    console.error('Error fetching nearby energy assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
