
import type { Claim, Village, CommunityAsset, Patta, DssRecommendation, TimeSeriesDataPoint } from '@/types';

/**
 * =================================================================================
 * DUMMY DATA FOR OFFLINE DEVELOPMENT
 * =================================================================================
 * This file contains hardcoded data to simulate a database connection.
 * All data is themed around Tripura, India.
 * =================================================================================
 */

// Dummy data for a new claim upload simulation
export const dummyClaimData = {
  claimantName: { raw: "New Claimant", value: "New Claimant", confidence: 0.99 },
  pattaNumber: { raw: "NP-9876", value: "NP-9876", confidence: 0.91 },
  extentOfForestLandOccupied: { raw: "1.2 Hectares", value: "1.2 Hectares", confidence: 0.93 },
  village: { raw: "Ambassa", value: "Ambassa", confidence: 0.98 },
  gramPanchayat: { raw: "Ambassa GP", value: "Ambassa GP", confidence: 0.96 },
  tehsilTaluka: { raw: "Ambassa", value: "Ambassa", confidence: 0.97 },
  district: { raw: "Dhalai", value: "Dhalai", confidence: 0.99 },
  state: { raw: "Tripura", value: "Tripura", confidence: 1.0 },
  date: { raw: "15-05-2024", value: "2024-05-15", confidence: 0.99 },
  claimType: { raw: "IFR", value: "IFR", confidence: 1.0 },
  address: { raw: "Near Ambassa Bazar, Ambassa, Dhalai, Tripura", value: "Near Ambassa Bazar, Ambassa, Dhalai, Tripura, India", confidence: 0.92 },
  boundaries: { raw: "N: River, S: Road, E: Forest, W: School", value: "N: River, S: Road, E: Forest, W: School", confidence: 0.89 },
};

// --- Time Series Data for Villages ---
const generateTimeSeries = (startValue: number, metric: string): TimeSeriesDataPoint[] => {
    const data: TimeSeriesDataPoint[] = [];
    let currentDate = new Date('2022-01-01');
    for (let i = 0; i < 24; i++) {
        const valueFluctuation = (Math.random() - 0.5) * (startValue * 0.1);
        const point: TimeSeriesDataPoint = {
            date: currentDate.toISOString().split('T')[0],
            rainfall: 0,
            ndwi: 0,
            ndvi: 0,
            deforestationRisk: 0,
        };
        (point as any)[metric] = Math.max(0, startValue + valueFluctuation);
        data.push(point);
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return data;
}

// --- VILLAGES ---
export const dummyVillages: Village[] = [
    {
        id: 'village_1',
        name: 'Ambassa',
        ndwi: 0.45,
        assetCoverage: { water: 35, forest: 55, agriculture: 10 },
        center: { lat: 23.91, lng: 91.85 },
        bounds: [
            { lat: 23.93, lng: 91.83 },
            { lat: 23.93, lng: 91.87 },
            { lat: 23.89, lng: 91.87 },
            { lat: 23.89, lng: 91.83 },
        ],
        assetGeometries: {
            ndwi: [[
                { lat: 23.92, lng: 91.840 },
                { lat: 23.92, lng: 91.845 },
                { lat: 23.91, lng: 91.845 },
                { lat: 23.91, lng: 91.840 },
            ]],
            forest: [[
                { lat: 23.925, lng: 91.85 },
                { lat: 23.925, lng: 91.86 },
                { lat: 23.90, lng: 91.86 },
                { lat: 23.90, lng: 91.85 },
            ]],
            agriculture: [[
                { lat: 23.90, lng: 91.832 },
                { lat: 23.90, lng: 91.838 },
                { lat: 23.895, lng: 91.838 },
                { lat: 23.895, lng: 91.832 },
            ]],
        },
        timeSeriesData: generateTimeSeries(150, 'rainfall')
    },
    {
        id: 'village_2',
        name: 'Udaipur',
        ndwi: 0.65,
        assetCoverage: { water: 40, forest: 30, agriculture: 30 },
        center: { lat: 23.53, lng: 91.48 },
        bounds: [
            { lat: 23.55, lng: 91.46 },
            { lat: 23.55, lng: 91.50 },
            { lat: 23.51, lng: 91.50 },
            { lat: 23.51, lng: 91.46 },
        ],
        assetGeometries: {
            ndwi: [[
                { lat: 23.54, lng: 91.47 },
                { lat: 23.54, lng: 91.48 },
                { lat: 23.53, lng: 91.48 },
                { lat: 23.53, lng: 91.47 },
            ]],
            forest: [],
            agriculture: [[
                { lat: 23.52, lng: 91.49 },
                { lat: 23.52, lng: 91.495 },
                { lat: 23.515, lng: 91.495 },
                { lat: 23.515, lng: 91.49 },
            ]],
        },
        timeSeriesData: generateTimeSeries(0.6, 'ndwi')
    },
    {
        id: 'village_3',
        name: 'Kailashahar',
        ndwi: 0.30,
        assetCoverage: { water: 15, forest: 70, agriculture: 15 },
        center: { lat: 24.32, lng: 92.01 },
        bounds: [
            { lat: 24.34, lng: 91.99 },
            { lat: 24.34, lng: 92.03 },
            { lat: 24.30, lng: 92.03 },
            { lat: 24.30, lng: 91.99 },
        ],
        assetGeometries: {
            ndwi: [],
            forest: [[
                { lat: 24.33, lng: 92.00 },
                { lat: 24.33, lng: 92.02 },
                { lat: 24.31, lng: 92.02 },
                { lat: 24.31, lng: 92.00 },
            ]],
            agriculture: [],
        },
        timeSeriesData: generateTimeSeries(0.8, 'ndvi')
    }
];

// --- CLAIMS ---
export const dummyClaims: Claim[] = [
    {
        id: 'claim_1',
        created_at: '2023-10-26T10:00:00Z',
        claimantName: { raw: 'Smt. Rani Debbarma', value: 'Rani Debbarma', confidence: 0.98 },
        village: { raw: 'Ambassa', value: 'Ambassa', confidence: 1.0 },
        district: { raw: 'Dhalai', value: 'Dhalai', confidence: 0.99 },
        state: { raw: 'Tripura', value: 'Tripura', confidence: 1.0 },
        claimType: { raw: 'IFR', value: 'IFR', confidence: 1.0 },
        status: 'linked',
        location: { value: { lat: 23.915, lng: 91.855 }, confidence: 0.9 },
        is_location_valid: true,
        // Other fields omitted for brevity
        pattaNumber: { raw: "PN123", value: "PN123", confidence: 0.9 },
        extentOfForestLandOccupied: { raw: "2.5 ha", value: "2.5 ha", confidence: 0.9 },
        gramPanchayat: { raw: "Ambassa", value: "Ambassa", confidence: 0.9 },
        tehsilTaluka: { raw: "Ambassa", value: "Ambassa", confidence: 0.9 },
        date: { raw: "2023-01-15", value: "2023-01-15", confidence: 0.9 },
        address: { raw: "Vill Ambassa", value: "Ambassa, Dhalai, Tripura", confidence: 0.9 },
        boundaries: { raw: "N: River", value: "N: River", confidence: 0.9 },
        documentUrl: 'https://picsum.photos/seed/doc1/400/560',
        documentType: 'image/jpeg',
    },
    {
        id: 'claim_2',
        created_at: '2023-11-15T14:30:00Z',
        claimantName: { raw: 'Sri. Bikash Tripura', value: 'Bikash Tripura', confidence: 0.92 },
        village: { raw: 'Udaipur', value: 'Udaipur', confidence: 1.0 },
        district: { raw: 'Gomati', value: 'Gomati', confidence: 0.99 },
        state: { raw: 'Tripura', value: 'Tripura', confidence: 1.0 },
        claimType: { raw: 'CFR', value: 'CFR', confidence: 1.0 },
        status: 'needs-review',
        location: { value: { lat: 23.535, lng: 91.485 }, confidence: 0.7 },
        is_location_valid: false,
        pattaNumber: { raw: "PN456", value: "PN456", confidence: 0.9 },
        extentOfForestLandOccupied: { raw: "10 ha", value: "10 ha", confidence: 0.9 },
        gramPanchayat: { raw: "Udaipur", value: "Udaipur", confidence: 0.9 },
        tehsilTaluka: { raw: "Udaipur", value: "Udaipur", confidence: 0.9 },
        date: { raw: "2023-02-20", value: "2023-02-20", confidence: 0.9 },
        address: { raw: "Vill Udaipur", value: "Udaipur, Gomati, Tripura", confidence: 0.9 },
        boundaries: { raw: "N: Hill", value: "N: Hill", confidence: 0.9 },
        documentUrl: 'https://picsum.photos/seed/doc2/400/560',
        documentType: 'image/jpeg',
    },
    {
        id: 'claim_3',
        created_at: '2024-01-20T09:00:00Z',
        claimantName: { raw: 'Kailashahar Community Forest', value: 'Kailashahar Community Forest', confidence: 0.95 },
        village: { raw: 'Kailashahar', value: 'Kailashahar', confidence: 1.0 },
        district: { raw: 'Unakoti', value: 'Unakoti', confidence: 0.99 },
        state: { raw: 'Tripura', value: 'Tripura', confidence: 1.0 },
        claimType: { raw: 'CFR', value: 'CFR', confidence: 1.0 },
        status: 'reviewed',
        location: { value: { lat: 24.325, lng: 92.015 }, confidence: 0.95 },
        is_location_valid: true,
        pattaNumber: { raw: "PN789", value: "PN789", confidence: 0.9 },
        extentOfForestLandOccupied: { raw: "50 ha", value: "50 ha", confidence: 0.9 },
        gramPanchayat: { raw: "Kailashahar", value: "Kailashahar", confidence: 0.9 },
        tehsilTaluka: { raw: "Kailashahar", value: "Kailashahar", confidence: 0.9 },
        date: { raw: "2023-03-10", value: "2023-03-10", confidence: 0.9 },
        address: { raw: "Vill Kailashahar", value: "Kailashahar, Unakoti, Tripura", confidence: 0.9 },
        boundaries: { raw: "N: Tea Garden", value: "N: Tea Garden", confidence: 0.9 },
        documentUrl: 'https://picsum.photos/seed/doc3/400/560',
        documentType: 'image/jpeg',
    },
];

// --- COMMUNITY ASSETS ---
export const dummyAssets: CommunityAsset[] = [
    {
        id: 'asset_1',
        villageId: 'village_1',
        assetType: 'water',
        description: 'Community pond used for fishing and irrigation.',
        documentUrl: 'https://picsum.photos/seed/asset1/300/200',
        documentType: 'image/jpeg',
        geometry: [
            { lat: 23.912, lng: 91.852 },
            { lat: 23.913, lng: 91.853 },
            { lat: 23.912, lng: 91.854 },
            { lat: 23.911, lng: 91.853 },
        ]
    },
    {
        id: 'asset_2',
        villageId: 'village_2',
        assetType: 'forest',
        description: 'Sacred grove maintained by the local community.',
        documentUrl: 'https://picsum.photos/seed/asset2/300/200',
        documentType: 'image/jpeg',
        geometry: [
            { lat: 23.532, lng: 91.482 },
            { lat: 23.533, lng: 91.483 },
            { lat: 23.532, lng: 91.484 },
            { lat: 23.531, lng: 91.483 },
        ]
    }
];

// --- PATTAS ---
export const dummyPattas: Patta[] = [
    {
        id: 'patta_1',
        holderName: 'Ranjit Jamatia',
        villageName: 'Udaipur',
        geometry: [
            { lat: 23.52, lng: 91.47 },
            { lat: 23.52, lng: 91.48 },
            { lat: 23.51, lng: 91.48 },
            { lat: 23.51, lng: 91.47 },
        ]
    },
     {
        id: 'patta_2',
        holderName: 'Sumitra Reang',
        villageName: 'Ambassa',
        geometry: [
            { lat: 23.90, lng: 91.84 },
            { lat: 23.90, lng: 91.85 },
            { lat: 23.89, lng: 91.85 },
            { lat: 23.89, lng: 91.84 },
        ]
    }
];
