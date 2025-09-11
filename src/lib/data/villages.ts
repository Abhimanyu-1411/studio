
import type { Village } from '@/types';

// This data has been validated and corrected to ensure geographic consistency.
// All coordinates are in [longitude, latitude] format.
export const villages: Omit<Village, 'timeSeriesData' | 'assetGeometries' | 'ndwi'>[] = [
  {
    id: "village_01",
    name: "Ambassa",
    center: [91.8537, 23.9363],
    bounds: [
      [91.850, 23.939],
      [91.858, 23.939],
      [91.858, 23.934],
      [91.850, 23.934],
      [91.850, 23.939],
    ],
    assetCoverage: { water: 7, forest: 63, agriculture: 30 },
  },
  {
    id: "village_02",
    name: "Kanchanpur",
    center: [92.0093, 24.1702],
    bounds: [
      [92.006, 24.172],
      [92.013, 24.172],
      [92.013, 24.168],
      [92.006, 24.168],
      [92.006, 24.172],
    ],
    assetCoverage: { water: 11, forest: 54, agriculture: 35 },
  },
  {
    id: "village_03",
    name: "Udaipur",
    center: [91.4825, 23.5336],
    bounds: [
      [91.480, 23.536],
      [91.485, 23.536],
      [91.485, 23.531],
      [91.480, 23.531],
      [91.480, 23.536],
    ],
    assetCoverage: { water: 10, forest: 48, agriculture: 42 },
  },
  {
    id: "village_04",
    name: "Melaghar",
    center: [91.2725, 23.4875],
    bounds: [
      [91.270, 23.490],
      [91.275, 23.490],
      [91.275, 23.485],
      [91.270, 23.485],
      [91.270, 23.490],
    ],
    assetCoverage: { water: 8, forest: 41, agriculture: 51 },
  },
  {
    id: "village_05",
    name: "Jampui",
    center: [92.2822, 24.1397],
    bounds: [
      [92.279, 24.142],
      [92.285, 24.142],
      [92.285, 24.137],
      [92.279, 24.137],
      [92.279, 24.142],
    ],
    assetCoverage: { water: 6, forest: 69, agriculture: 25 },
  },
  {
    id: "village_06",
    name: "Kakraban",
    center: [91.3965, 23.3551],
    bounds: [
      [91.395, 23.358],
      [91.400, 23.358],
      [91.400, 23.353],
      [91.395, 23.353],
      [91.395, 23.358],
    ],
    assetCoverage: { water: 12, forest: 37, agriculture: 51 },
  },
  {
    id: "village_07",
    name: "Manubazar",
    center: [91.8330, 23.0261],
    bounds: [
      [91.830, 23.028],
      [91.836, 23.028],
      [91.836, 23.024],
      [91.830, 23.024],
      [91.830, 23.028],
    ],
    assetCoverage: { water: 14, forest: 57, agriculture: 29 },
  },
  {
    id: "village_08",
    name: "Teliamura",
    center: [91.5972, 23.8001],
    bounds: [
      [91.595, 23.802],
      [91.600, 23.802],
      [91.600, 23.798],
      [91.595, 23.798],
      [91.595, 23.802],
    ],
    assetCoverage: { water: 7, forest: 62, agriculture: 31 },
  },
  {
    id: "village_09",
    name: "Panisagar",
    center: [92.1070, 24.1998],
    bounds: [
      [92.105, 24.202],
      [92.110, 24.202],
      [92.110, 24.197],
      [92.105, 24.197],
      [92.105, 24.202],
    ],
    assetCoverage: { water: 10, forest: 66, agriculture: 22 },
  },
  {
    id: "village_10",
    name: "Melarmath",
    center: [91.2848, 23.8307],
    bounds: [
      [91.282, 23.833],
      [91.287, 23.833],
      [91.287, 23.828],
      [91.282, 23.828],
      [91.282, 23.833],
    ],
    assetCoverage: { water: 5, forest: 58, agriculture: 35 },
  },
];
