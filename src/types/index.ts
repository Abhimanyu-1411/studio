
type FieldWithConfidence<T> = {
  value: T;
  confidence: number;
}

export type Claim = {
  id: string;
  claimantName: FieldWithConfidence<string>;
  village: FieldWithConfidence<string>;
  claimType: FieldWithConfidence<'IFR' | 'CFR' | 'CR' | string>;
  area: FieldWithConfidence<string>;
  date: FieldWithConfidence<string>;
  documentUrl: string;
  documentType: string;
  linkedVillage: string | null;
  geoLinkConfidence: number | null;
  status: 'unlinked' | 'linked' | 'reviewed' | 'needs-review';
  location: { lat: number; lng: number };
};

type LatLng = { lat: number; lng: number };

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
    water: LatLng[][];
    forest: LatLng[][];
    agriculture: LatLng[][];
  }
};

export type DssRecommendation = {
  recommendation: string;
  justification: string;
  priority: number;
};
