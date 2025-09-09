

type FieldWithConfidence<T> = {
    value: T;
    confidence: number;
}

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
  location: FieldWithConfidence<{ lat: number; lng: number }>;
};

type LatLng = { lat: number; lng: number };

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
  ndwi: number;
  assetCoverage: {
    water: number;
    forest: number;
    agriculture: number;
  };
  center: LatLng;
  bounds: LatLng[];
  assetGeometries?: {
    ndwi: LatLng[][];
    forest: LatLng[][];
    agriculture: LatLng[][];
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
  assetType: 'ndwi' | 'forest' | 'agriculture' | string;
  description: string;
  documentUrl: string;
  documentType: string;
  geometry?: LatLng[];
}

export type Patta = {
    id: string;
    holderName: string;
    villageName: string;
    geometry: LatLng[];
}
