export interface VapiObservation {
  date: string;
  value: number | null;
}

export interface VapiResponse {
  dataset: string;
  source: string;
  observations: VapiObservation[];
  latitude?: number;
  longitude?: number;
  from: string;
  to: string;
}

export class VapiService {
  private apiKey: string;
  private demoFallback: boolean;

  constructor() {
    this.apiKey = process.env.VEDAS_API_KEY || '0tyYHsawf07_NeIY44lChg';
    this.demoFallback = process.env.VEDAS_DEMO_FALLBACK !== 'false';
  }

  async getPointData(lat: number, lon: number, dataset: string, from: string, to: string): Promise<VapiResponse> {
    try {
       const datasetId = dataset === 'NDVI' ? 'T3S1P1' : 'T3S6P1';
       
       const payload = {
         layer: "T5S1I1",
         args: {
           dataset_id: datasetId,
           from_time: from || "20260101",
           to_time: to || "20260930",
           param: dataset,
           lon: lon,
           lat: lat,
           filter_nodata: "no",
           composite: false
         }
       };

       const url = `https://vedas.sac.gov.in/vapi/ridam_server3/info/?X-API-KEY=${encodeURIComponent(this.apiKey)}`;
       const response = await fetch(url, {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload),
         signal: AbortSignal.timeout(8000)
       });

       if (!response.ok) throw new Error(`Status ${response.status}`);
       const json = await response.json();
       
       const rawData = json.result || [];
       const observations = rawData.map((x: any) => {
         let dateStr = x[0];
         // Handle if it's YYYYMMDD
         if (dateStr && dateStr.length === 8 && !dateStr.includes('-')) {
             dateStr = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
         } else if (dateStr && dateStr.length > 10) {
             dateStr = dateStr.split('T')[0];
         }
         let val = Array.isArray(x[1]) ? x[1][0] : x[1];
         
         return {
           date: dateStr,
           value: val !== null ? parseFloat(val.toFixed(3)) : null
         };
       });

       return {
         dataset,
         source: 'VEDAS / SAC, ISRO',
         observations,
         latitude: lat,
         longitude: lon,
         from,
         to
       };
    } catch (e) {
       console.warn(`[VapiService] Point Data Failed: ${(e as Error).message}. Falling back to Demo.`);
       if (this.demoFallback) {
         return this.generateSyntheticData(lat, lon, dataset, from, to);
       }
       throw e;
    }
  }

  async getPolygonData(polygon: number[][], dataset: string, from: string, to: string): Promise<VapiResponse> {
    try {
       const datasetId = dataset === 'NDVI' ? 'T3S1P1' : 'T3S6P1';
       
       const payload = {
         layer: "T5S1I2",
         args: {
           dataset_id: datasetId,
           filter_nodata: "no",
           polygon: polygon,
           indexes: [1],
           from_time: from || "20260101",
           to_time: to || "20260930",
           interval: 10,
           merge_method: "max"
         }
       };

       const url = `https://vedas.sac.gov.in/vapi/ridam_server3/info/?X-API-KEY=${encodeURIComponent(this.apiKey)}`;
       const response = await fetch(url, {
         method: 'POST',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(payload),
         signal: AbortSignal.timeout(8000)
       });

       if (!response.ok) throw new Error(`Status ${response.status}`);
       const json = await response.json();
       
       const rawData = json.result || [];
       const observations = rawData.map((x: any) => {
         let dateStr = x[0];
         if (dateStr && dateStr.length === 8 && !dateStr.includes('-')) {
             dateStr = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
         } else if (dateStr && dateStr.length > 10) {
             dateStr = dateStr.split('T')[0];
         }
         let val = x[1];
         return {
           date: dateStr,
           value: val !== null ? parseFloat(val.toFixed(3)) : null
         };
       });

       return {
         dataset,
         source: 'VEDAS / SAC, ISRO',
         observations,
         latitude: polygon[0][1],
         longitude: polygon[0][0],
         from,
         to
       };
    } catch (e) {
       console.warn(`[VapiService] Polygon Data Failed: ${(e as Error).message}. Falling back to Demo.`);
       if (this.demoFallback) {
         return this.generateSyntheticData(polygon[0][1], polygon[0][0], dataset, from, to, true);
       }
       throw e;
    }
  }

  private generateSyntheticData(lat: number, lon: number, dataset: string, from: string, to: string, isPolygon = false): VapiResponse {
     const fromStr = from || '20260101';
     const toStr = to || '20260930';

     const fromYear = parseInt(fromStr.substring(0, 4));
     const fromMonth = parseInt(fromStr.substring(4, 6)) - 1;
     const fromDay = parseInt(fromStr.substring(6, 8));
     
     const toYear = parseInt(toStr.substring(0, 4));
     const toMonth = parseInt(toStr.substring(4, 6)) - 1;
     const toDay = parseInt(toStr.substring(6, 8));

     const startDate = new Date(fromYear, fromMonth || 0, fromDay || 1);
     const endDate = new Date(toYear, toMonth || 8, toDay || 30);

     const observations: VapiObservation[] = [];
     let curr = new Date(startDate);

     let baseValue = dataset === 'NDVI' ? 0.65 : 0.45;
     const trend = -0.002; // slight declining trend

     while (curr <= endDate) {
       // Generate points every 15 days roughly mimicking satellite pass schedules
       if (curr.getDate() === 1 || curr.getDate() === 15) {
          const variance = (Math.random() * 0.08) - 0.04;
          baseValue += trend;
          let val = baseValue + variance;
          val = Math.max(0, Math.min(1, val));
          
          if (isPolygon) val += 0.05; // Slightly higher for area average mock

          observations.push({
             date: curr.toISOString().split('T')[0],
             value: parseFloat(val.toFixed(3))
          });
       }
       curr.setDate(curr.getDate() + 1);
     }

     return {
       dataset,
       source: 'DEMO DATA — NOT LIVE VEDAS DATA',
       observations,
       latitude: lat,
       longitude: lon,
       from: fromStr,
       to: toStr
     };
  }
}

export const vapiService = new VapiService();
