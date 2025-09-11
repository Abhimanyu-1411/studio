
import type { Village } from '@/types';

// This data has been validated and corrected to ensure geographic consistency.
// All coordinates are in [longitude, latitude] format.
export const villages: Omit<Village, 'timeSeriesData' | 'assetGeometries' | 'assetCoverage'>[] = [
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
  },
];
