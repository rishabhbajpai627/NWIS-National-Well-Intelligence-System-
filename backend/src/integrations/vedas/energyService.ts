import { EnergyAsset, EnergyGeoProvider, AssetType } from './vedasTypes';
import { VedasClient } from './vedasClient';
import { SyntheticDemoProvider } from './syntheticDemoProvider';

export class EnergyService {
  private primaryProvider: EnergyGeoProvider;
  private fallbackProvider: EnergyGeoProvider;

  constructor() {
    // Using the provided VEDAS API key
    this.primaryProvider = new VedasClient('0tyYHsawf07_NeIY44lChg');
    this.fallbackProvider = new SyntheticDemoProvider();
  }

  async getNearbyEnergyInfrastructure(lat: number, lng: number, radiusKm: number, layers: AssetType[]): Promise<{ assets: EnergyAsset[], provider: string }> {
    try {
      // Attempt to fetch from official VEDAS
      const assets = await this.primaryProvider.getNearbyAssets(lat, lng, radiusKm, layers);
      return { assets, provider: this.primaryProvider.getProviderName() };
    } catch (error) {
      console.warn(`[EnergyService] Primary provider failed: ${(error as Error).message}. Falling back to Synthetic Demo.`);
      // Fallback to Synthetic Data if VEDAS is unavailable
      const assets = await this.fallbackProvider.getNearbyAssets(lat, lng, radiusKm, layers);
      return { assets, provider: this.fallbackProvider.getProviderName() };
    }
  }
}

export const energyService = new EnergyService();
