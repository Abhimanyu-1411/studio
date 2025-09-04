export type Claim = {
  id: string;
  claimantName: string;
  village: string;
  claimType: 'IFR' | 'CFR' | 'CR' | string;
  area: string;
  date: string;
  documentUrl: string;
  documentType: string;
  linkedVillage: string | null;
  confidenceScore: number | null;
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
