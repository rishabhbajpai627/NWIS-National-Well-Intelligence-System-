export enum AssetType {
  OIL_GAS_WELL = 'OIL_GAS_WELL',
  POWER_PLANT = 'POWER_PLANT',
  REFINERY = 'REFINERY',
  LNG_TERMINAL = 'LNG_TERMINAL',
  LPG_TERMINAL = 'LPG_TERMINAL',
  TRANSMISSION_LINE = 'TRANSMISSION_LINE'
}

export interface EnergyAsset {
  id: string;
  source: string; // 'VEDAS' or 'Synthetic Demo'
  assetType: AssetType;
  name: string;
  latitude: number;
  longitude: number;
  distanceKm?: number; // Calculated relative to active well
  properties: Record<string, any>;
  sourceUrl?: string;
  lastUpdated: string;
}

export interface EnergyGeoProvider {
  getNearbyAssets(lat: number, lng: number, radiusKm: number, layers: AssetType[]): Promise<EnergyAsset[]>;
  getProviderName(): string;
}
