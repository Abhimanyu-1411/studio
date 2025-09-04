import type { Village } from '@/types';

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
  },
];

export const AVAILABLE_VILLAGE_NAMES = VILLAGES.map(v => v.name);
