import type { Claim, Village } from '@/types';

export const VILLAGES: Village[] = [
  {
    id: 'v1',
    name: 'Ambedkar Nagar',
    ndwi: 0.2,
    assetCoverage: { water: 15, forest: 45, agriculture: 30 },
    center: { lat: 26.4, lng: 82.55 },
    bounds: [
      { lat: 26.42, lng: 82.53 },
      { lat: 26.42, lng: 82.57 },
      { lat: 26.38, lng: 82.57 },
      { lat: 26.38, lng: 82.53 },
    ],
    assetGeometries: {
      water: [
        [
          { lat: 26.415, lng: 82.535 },
          { lat: 26.418, lng: 82.54 },
          { lat: 26.412, lng: 82.542 },
        ]
      ],
      forest: [
        [
          { lat: 26.39, lng: 82.54 },
          { lat: 26.4, lng: 82.56 },
          { lat: 26.385, lng: 82.55 },
        ]
      ],
      agriculture: [
        [
          { lat: 26.41, lng: 82.56 },
          { lat: 26.415, lng: 82.568 },
          { lat: 26.405, lng: 82.565 },
        ]
      ]
    }
  },
  {
    id: 'v2',
    name: 'Sultanpur',
    ndwi: 0.8,
    assetCoverage: { water: 35, forest: 20, agriculture: 65 },
    center: { lat: 26.25, lng: 82.07 },
    bounds: [
      { lat: 26.27, lng: 82.05 },
      { lat: 26.27, lng: 82.09 },
      { lat: 26.23, lng: 82.09 },
      { lat: 26.23, lng: 82.05 },
    ],
    assetGeometries: {
      water: [
         [
          { lat: 26.26, lng: 82.055 },
          { lat: 26.265, lng: 82.06 },
          { lat: 26.255, lng: 82.062 },
        ]
      ],
      forest: [],
      agriculture: [
        [
          { lat: 26.24, lng: 82.06 },
          { lat: 26.25, lng: 82.08 },
          { lat: 26.235, lng: 82.07 },
        ]
      ]
    }
  },
  {
    id: 'v3',
    name: 'Basti',
    ndwi: 0.5,
    assetCoverage: { water: 25, forest: 70, agriculture: 15 },
    center: { lat: 26.79, lng: 82.71 },
    bounds: [
      { lat: 26.81, lng: 82.69 },
      { lat: 26.81, lng: 82.73 },
      { lat: 26.77, lng: 82.73 },
      { lat: 26.77, lng: 82.69 },
    ],
    assetGeometries: {
      water: [],
      forest: [
        [
          { lat: 26.78, lng: 82.7 },
          { lat: 26.8, lng: 82.72 },
          { lat: 26.775, lng: 82.71 },
        ]
      ],
      agriculture: [],
    }
  },
];

export const MOCK_CLAIMS: Claim[] = [
  {
    id: 'claim-1',
    claimantName: 'Aarav Sharma',
    village: 'Ambedkar Nagar',
    claimType: 'IFR',
    area: '2.5 Hectares',
    date: '2023-05-12',
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Ambedkar Nagar',
    confidenceScore: 0.95,
    status: 'linked',
    location: { lat: 26.41, lng: 82.55 },
  },
  {
    id: 'claim-2',
    claimantName: 'Priya Singh',
    village: 'Sultanpur',
    claimType: 'CFR',
    area: '15 Hectares',
    date: '2023-06-01',
    documentUrl: '',
    documentType: 'jpg',
    linkedVillage: 'Sultanpur',
    confidenceScore: 0.99,
    status: 'reviewed',
    location: { lat: 26.26, lng: 82.06 },
  },
  {
    id: 'claim-3',
    claimantName: 'Rohan Verma',
    village: 'Basti',
    claimType: 'IFR',
    area: '1.8 Hectares',
    date: '2023-07-20',
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Basti',
    confidenceScore: 0.85,
    status: 'linked',
    location: { lat: 26.78, lng: 82.72 },
  },
    {
    id: 'claim-4',
    claimantName: 'Sunita Devi',
    village: 'Sultanpur',
    claimType: 'IFR',
    area: '3.1 Hectares',
    date: '2023-08-15',
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Sultanpur',
    confidenceScore: 0.92,
    status: 'linked',
    location: { lat: 26.24, lng: 82.08 },
  },
  {
    id: 'claim-5',
    claimantName: 'Amit Kumar',
    village: 'Ambedkarnagar',
    claimType: 'CR',
    area: '0.5 Hectares',
    date: '2023-09-02',
    documentUrl: '',
    documentType: 'jpg',
    linkedVillage: 'Ambedkar Nagar',
    confidenceScore: 0.75,
    status: 'needs-review',
    location: { lat: 26.4, lng: 82.56 },
  },
   {
    id: 'claim-6',
    claimantName: 'Geeta Patel',
    village: 'Basti',
    claimType: 'CFR',
    area: '25 Hectares',
    date: '2023-10-11',
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Basti',
    confidenceScore: 1.0,
    status: 'reviewed',
    location: { lat: 26.80, lng: 82.70 },
  }
];

export const AVAILABLE_VILLAGE_NAMES = VILLAGES.map(v => v.name);
