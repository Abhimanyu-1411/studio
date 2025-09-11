
import type { RawCommunityAsset } from '@/types';

// This data has been validated and corrected to ensure geographic consistency.
// All coordinates are in [longitude, latitude] format.
export const assets: RawCommunityAsset[] = [
  {
    id: "asset_001",
    villageId: "village_01",
    assetType: "water",
    description: "Community Pond near Ambassa Bazar",
    documentUrl: "https://picsum.photos/seed/asset1/300/200",
    geometry: [
      [91.852, 23.919],
      [91.854, 23.919],
      [91.854, 23.917],
      [91.852, 23.917],
      [91.852, 23.919],
    ],
  },
  {
    id: "asset_002",
    villageId: "village_02",
    assetType: "school",
    description: "Government Primary School at Kanchanpur",
    documentUrl: "https://picsum.photos/seed/asset2/300/200",
    geometry: [
      [92.010, 24.173],
      [92.012, 24.173],
      [92.012, 24.171],
      [92.010, 24.171],
      [92.010, 24.173],
    ],
  },
  {
    id: "asset_003",
    villageId: "village_03",
    assetType: "water",
    description: "Local Pond used for irrigation in Udaipur",
    documentUrl: "https://picsum.photos/seed/asset3/300/200",
    geometry: [
      [91.481, 23.536],
      [91.483, 23.536],
      [91.483, 23.534],
      [91.481, 23.534],
      [91.481, 23.536],
    ],
  },
  {
    id: "asset_004",
    villageId: "village_04",
    assetType: "school",
    description: "Melaghar Community High School",
    documentUrl: "https://picsum.photos/seed/asset4/300/200",
    geometry: [
      [91.271, 23.488],
      [91.273, 23.488],
      [91.273, 23.486],
      [91.271, 23.486],
      [91.271, 23.488],
    ],
  },
  {
    id: "asset_005",
    villageId: "village_05",
    assetType: "water",
    description: "Pond adjacent to the main road in Jampui",
    documentUrl: "https://picsum.photos/seed/asset5/300/200",
    geometry: [
      [92.281, 24.141],
      [92.283, 24.141],
      [92.283, 24.139],
      [92.281, 24.139],
      [92.281, 24.141],
    ],
  },
];
