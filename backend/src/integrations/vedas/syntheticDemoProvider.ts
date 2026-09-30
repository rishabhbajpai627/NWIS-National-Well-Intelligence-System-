import { EnergyAsset, EnergyGeoProvider, AssetType } from './vedasTypes';

export class SyntheticDemoProvider implements EnergyGeoProvider {
  getProviderName(): string {
    return 'Synthetic Demo Data';
  }

  // Generates random nearby points based on the center
  private generateMockAssets(lat: number, lng: number, radiusKm: number, assetType: AssetType, count: number): EnergyAsset[] {
    const assets: EnergyAsset[] = [];
    for (let i = 0; i < count; i++) {
      // 1 degree is approx 111 km
      const radiusDeg = radiusKm / 111;
      const r = radiusDeg * Math.sqrt(Math.random());
      
      const theta = Math.random() * 2 * Math.PI;
      
      const pLat = lat + r * Math.cos(theta);
      const pLng = lng + r * Math.sin(theta);
      
      const dist = Math.sqrt(Math.pow((pLat - lat)*111, 2) + Math.pow((pLng - lng)*111, 2));

      assets.push({
        id: `synth-${assetType}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        source: this.getProviderName(),
        assetType,
        name: `Demo ${assetType.replace('_', ' ')} ${i+1}`,
        latitude: pLat,
        longitude: pLng,
        distanceKm: parseFloat(dist.toFixed(2)),
        properties: {
          status: 'Operational',
          capacity: Math.floor(Math.random() * 1000) + ' MW/BPD'
        },
        lastUpdated: new Date().toISOString()
      });
    }
    return assets;
  }

  async getNearbyAssets(lat: number, lng: number, radiusKm: number, layers: AssetType[]): Promise<EnergyAsset[]> {
    let allAssets: EnergyAsset[] = [];
    
    // Generate different counts based on radius size to simulate density
    const multiplier = Math.max(1, radiusKm / 10);

    if (layers.includes(AssetType.OIL_GAS_WELL)) {
      allAssets = allAssets.concat(this.generateMockAssets(lat, lng, radiusKm, AssetType.OIL_GAS_WELL, Math.floor(12 * multiplier)));
    }

    return allAssets.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }
}
