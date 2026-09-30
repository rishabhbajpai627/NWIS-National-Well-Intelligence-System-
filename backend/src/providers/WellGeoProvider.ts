import { query } from '../config/db';

export interface WellFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    id: string;
    name: string;
    depth?: number;
    formation?: string;
    field?: string;
    status?: string;
    source: string;
    distance_km?: number;
  };
}

export interface WellFeatureCollection {
  type: "FeatureCollection";
  features: WellFeature[];
}

export interface WellGeoProvider {
  getNearbyWells(lat: number, lng: number, radiusKm: number): Promise<WellFeatureCollection>;
}

export class DemoWellProvider implements WellGeoProvider {
  async getNearbyWells(lat: number, lng: number, radiusKm: number): Promise<WellFeatureCollection> {
    // Generate offset wells dynamically around the requested lat/lng so there's always data
    const mockWells = [
      {
        id: 'WELL-HIST-023',
        name: 'Historical Alpha 23',
        latitude: lat + (Math.random() * 0.1 - 0.05),
        longitude: lng + (Math.random() * 0.1 - 0.05),
        depth: 3200,
        status: 'COMPLETED',
        distance_km: 1.2,
        formation: 'Upper Barail',
        source: 'DEMO DATA'
      },
      {
        id: 'WELL-HIST-017',
        name: 'Historical Beta 17',
        latitude: lat + (Math.random() * 0.15 - 0.075),
        longitude: lng + (Math.random() * 0.15 - 0.075),
        depth: 3150,
        status: 'COMPLETED',
        distance_km: 3.5,
        formation: 'Upper Barail',
        source: 'DEMO DATA'
      },
      {
        id: 'WELL-HIST-031',
        name: 'Historical Gamma 31',
        latitude: lat + (Math.random() * 0.2 - 0.1),
        longitude: lng + (Math.random() * 0.2 - 0.1),
        depth: 2950,
        status: 'COMPLETED',
        distance_km: 4.8,
        formation: 'Upper Barail',
        source: 'DEMO DATA'
      },
      {
        id: 'WELL-HIST-041',
        name: 'Historical Delta 41',
        latitude: lat + (Math.random() * 0.18 - 0.09),
        longitude: lng + (Math.random() * 0.18 - 0.09),
        depth: 3400,
        status: 'COMPLETED',
        distance_km: 6.1,
        formation: 'Upper Barail',
        source: 'DEMO DATA'
      }
    ];

    return {
      type: "FeatureCollection",
      features: mockWells.map(w => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [w.longitude, w.latitude]
        },
        properties: {
          id: w.id,
          name: w.name,
          depth: w.depth,
          status: w.status,
          distance_km: w.distance_km,
          formation: w.formation,
          source: w.source
        }
      }))
    };
  }
}

export class NwisWellProvider implements WellGeoProvider {
  private fallbackProvider = new DemoWellProvider();

  async getNearbyWells(lat: number, lng: number, radiusKm: number): Promise<WellFeatureCollection> {
    const sql = `
      SELECT well_id, well_name, latitude, longitude, current_depth, status,
      ST_Distance(
        geom::geography, 
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000 AS distance_km
      FROM wells
      WHERE ST_DWithin(
        geom::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3 * 1000
      )
      ORDER BY distance_km ASC;
    `;
    
    try {
      const result = await query(sql, [lng, lat, radiusKm]);
      if (result.rows.length > 0) {
        return {
          type: "FeatureCollection",
          features: result.rows.map(row => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
            },
            properties: {
              id: row.well_id,
              name: row.well_name,
              depth: row.current_depth,
              status: row.status,
              distance_km: parseFloat(parseFloat(row.distance_km).toFixed(1)),
              source: 'NWIS Well Database'
            }
          }))
        };
      }
    } catch (dbError) {
      console.warn("DB Connection failed in NwisWellProvider, falling back to Demo provider");
    }

    // Fallback if DB is empty or fails
    return this.fallbackProvider.getNearbyWells(lat, lng, radiusKm);
  }
}

// Global provider instance logic
// You can switch this to NwisWellProvider for production.
export const wellGeoProvider: WellGeoProvider = new NwisWellProvider();
