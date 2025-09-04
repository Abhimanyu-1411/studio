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

export type Village = {
  id: string;
  name: string;
  ndwi: number;
  assetCoverage: {
    water: number;
    forest: number;
    agriculture: number;
  };
  center: { lat: number; lng: number };
  bounds: google.maps.LatLngLiteral[];
};

export type DssRecommendation = {
  recommendation: string;
  justification: string;
};
