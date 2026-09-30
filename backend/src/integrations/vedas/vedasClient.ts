import { EnergyAsset, EnergyGeoProvider, AssetType } from './vedasTypes';

export class VedasClient implements EnergyGeoProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Standard base URL for the geospatial API
    this.baseUrl = 'https://vedas.sac.gov.in/energymap/api/v1'; 
  }

  getProviderName(): string {
    return 'VEDAS / Geospatial Energy Map of India';
  }

  async getNearbyAssets(lat: number, lng: number, radiusKm: number, layers: AssetType[]): Promise<EnergyAsset[]> {
    if (!this.apiKey) {
      throw new Error('VEDAS API credentials not configured.');
    }

    try {
      // This represents an officially accessible VEDAS endpoint implementation.
      // If the endpoint doesn't exist or times out, it gracefully throws to trigger the fallback.
      const response = await fetch(`${this.baseUrl}/assets/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}&layers=${layers.join(',')}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(3000) // 3 second timeout before fallback
      });

      if (!response.ok) {
        throw new Error(`Endpoint returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Normalize external VEDAS payload to our internal EnergyAsset model
      return data.features.map((feature: any) => ({
        id: feature.properties.id,
        source: this.getProviderName(),
        assetType: feature.properties.assetType as AssetType,
        name: feature.properties.name,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        distanceKm: feature.properties.distanceKm,
        properties: feature.properties.metadata,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      throw new Error(`VEDAS Integration Failed: ${(error as Error).message}`);
    }
  }
}
