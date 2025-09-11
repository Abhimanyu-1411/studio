
import type { Claim, Village, CommunityAsset, Patta, DssRecommendation, TimeSeriesDataPoint } from '@/types';

/**
 * =================================================================================
 * DUMMY DATA FOR OFFLINE DEVELOPMENT
 * =================================================================================
 * This file contains hardcoded data to simulate a database connection.
 * All data is themed around Tripura, India.
 * =================================================================================
 */

// Helper to generate a regular polygon
const createPolygon = (center: { lat: number; lng: number }, sides: number, radius: number) => {
    const coords = [];
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * 2 * Math.PI;
        const lat = center.lat + radius * Math.cos(angle);
        const lng = center.lng + radius * Math.sin(angle);
        coords.push({ lat, lng });
    }
    coords.push(coords[0]); // Close the polygon
    return coords;
};


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
        bounds: createPolygon({ lat: 23.91, lng: 91.85 }, 15, 0.02),
        assetGeometries: {
            ndwi: [createPolygon({ lat: 23.915, lng: 91.855 }, 20, 0.003)],
            forest: [createPolygon({ lat: 23.905, lng: 91.845 }, 20, 0.005)],
            agriculture: [createPolygon({ lat: 23.91, lng: 91.86 }, 20, 0.002)],
        },
        timeSeriesData: generateTimeSeries(150, 'rainfall')
    },
    {
        id: 'village_2',
        name: 'Udaipur',
        ndwi: 0.65,
        assetCoverage: { water: 40, forest: 30, agriculture: 30 },
        center: { lat: 23.53, lng: 91.48 },
        bounds: createPolygon({ lat: 23.53, lng: 91.48 }, 15, 0.02),
        assetGeometries: {
             ndwi: [createPolygon({ lat: 23.535, lng: 91.485 }, 20, 0.004)],
            forest: [createPolygon({ lat: 23.525, lng: 91.475 }, 20, 0.003)],
            agriculture: [createPolygon({ lat: 23.53, lng: 91.49 }, 20, 0.006)],
        },
        timeSeriesData: generateTimeSeries(0.6, 'ndwi')
    },
    {
        id: 'village_3',
        name: 'Kailashahar',
        ndwi: 0.30,
        assetCoverage: { water: 15, forest: 70, agriculture: 15 },
        center: { lat: 24.32, lng: 92.01 },
        bounds: createPolygon({ lat: 24.32, lng: 92.01 }, 15, 0.02),
        assetGeometries: {
            ndwi: [createPolygon({ lat: 24.325, lng: 92.015 }, 20, 0.002)],
            forest: [createPolygon({ lat: 24.315, lng: 92.005 }, 20, 0.007)],
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
        geometry: createPolygon({ lat: 23.912, lng: 91.852 }, 20, 0.001)
    },
    {
        id: 'asset_2',
        villageId: 'village_2',
        assetType: 'forest',
        description: 'Sacred grove maintained by the local community.',
        documentUrl: 'https://picsum.photos/seed/asset2/300/200',
        documentType: 'image/jpeg',
        geometry: createPolygon({ lat: 23.532, lng: 91.482 }, 20, 0.002)
    }
];

// --- PATTAS ---
export const dummyPattas: Patta[] = [
    {
        id: 'patta_1',
        holderName: 'Ranjit Jamatia',
        villageName: 'Udaipur',
        geometry: createPolygon({ lat: 23.525, lng: 91.475 }, 20, 0.005)
    },
     {
        id: 'patta_2',
        holderName: 'Sumitra Reang',
        villageName: 'Ambassa',
        geometry: createPolygon({ lat: 23.895, lng: 91.845 }, 20, 0.005)
    }
];
