export type Claim = {
  id: string;
  claimantName: string;
  village: string;
  claimType: string;
  area: string;
  date: string;
  documentUrl: string;
  documentType: string;
  linkedVillage: string | null;
  confidenceScore: number | null;
  status: 'unlinked' | 'linked' | 'reviewed';
  location: { lat: number; lng: number };
};

export type Village = {
  id: string;
  name: string;
  ndwi: number;
  center: { lat: number; lng: number };
  bounds: google.maps.LatLngLiteral[];
};

export type DssRecommendation = {
  recommendation: string;
  justification: string;
};
