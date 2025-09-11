

export type LngLat = [number, number]; // [longitude, latitude]

type FieldWithConfidence<T> = {
    raw: string;
    value: T;
    confidence: number;
}

// --- Raw Data Types from Files ---

export type RawClaim = {
  id: string;
  claimantName: string;
  villageName: string;
  claimType: 'IFR' | 'CFR' | 'CR' | string;
  status: 'unlinked' | 'linked' | 'reviewed' | 'needs-review' | 'rejected';
  location: LngLat;
  documentUrl: string;
  date?: string;
  pattaNumber?: string;
  landExtent?: string;
  gramPanchayat?: string;
  tehsilTaluka?: string;
  district?: string;
  state?: string;
  address?: string;
  boundaries?: string;
};

export type RawCommunityAsset = {
  id: string;
  villageId: string;
  assetType: string;
  description: string;
  documentUrl: string;
  geometry?: LngLat[];
};

export type RawPatta = {
    id: string;
    holderName: string;
    villageName: string;
    geometry: LngLat[];
}


// --- Main Application Data Types ---

export type Claim = {
  id: string;
  created_at: string;
  claimantName: FieldWithConfidence<string>;
  pattaNumber: FieldWithConfidence<string>;
  extentOfForestLandOccupied: FieldWithConfidence<string>;
  village: FieldWithConfidence<string>;
  gramPanchayat: FieldWithConfidence<string>;
  tehsilTaluka: FieldWithConfidence<string>;
  district: FieldWithConfidence<string>;
  state: FieldWithConfidence<string>;
  date: FieldWithConfidence<string>;
  address: FieldWithConfidence<string>;
  boundaries: FieldWithConfidence<string>;
  claimType: FieldWithConfidence<'IFR' | 'CFR' | 'CR' | string>;
  documentUrl: string;
  documentType: string;
  status: 'unlinked' | 'linked' | 'reviewed' | 'needs-review' | 'rejected';
  location: { value: { lng: number; lat: number }, confidence: number };
  villageId?: string | null;
  is_location_valid: boolean;
};

export type TimeSeriesDataPoint = {
  date: string; // YYYY-MM-DD
  rainfall: number; // in mm
  ndwi: number; // index value
  ndvi: number; // index value
  deforestationRisk: number; // index value 0-1
}

export type Village = {
  id: string;
  name: string;
  assetCoverage: {
    water: number;
    forest: number;
    agriculture: number;
  };
  center: LngLat;
  bounds: LngLat[];
  assetGeometries?: {
    water: LngLat[][];
    forest: LngLat[][];
    agriculture: LngLat[][];
  }
  timeSeriesData?: TimeSeriesDataPoint[];
};

export type DssRecommendation = {
  recommendation: string;
  justification: string;
  priority: number;
};

export type CommunityAsset = {
  id: string;
  villageId: string;
  assetType: 'ndwi' | 'forest' | 'agriculture' | 'school' | string;
  description: string;
  documentUrl: string;
  documentType: string;
  geometry?: LngLat[];
}

export type Patta = {
    id: string;
    holderName: string;
    villageName: string;
    geometry: LngLat[];
}
