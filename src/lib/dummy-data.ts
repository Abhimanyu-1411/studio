
import type { Claim, Village, CommunityAsset, Patta, TimeSeriesDataPoint } from '@/types';

/**
 * =================================================================================
 * DUMMY DATA FOR OFFLINE DEVELOPMENT
 * =================================================================================
 * This file contains hardcoded data to simulate a database connection.
 * All data is themed around Tripura, India.
 * =================================================================================
 */

// --- USER-PROVIDED DATA ---
const villagesCSV = `
id,name,center_lat,center_lng,bounds_polygon,asset_coverage_water,asset_coverage_forest,asset_coverage_agriculture
village_01,Ambassa,23.9363,91.8537,"23.939,91.850;23.939,91.858;23.934,91.858;23.934,91.850;23.939,91.850",7,63,30
village_02,Kanchanpur,24.1702,92.0093,"24.172,92.006;24.172,92.013;24.168,92.013;24.168,92.006;24.172,92.006",11,54,35
village_03,Udaipur,23.5336,91.4825,"23.536,91.480;23.536,91.485;23.531,91.485;23.531,91.480;23.536,91.480",10,48,42
village_04,Melaghar,23.4875,91.2725,"23.490,91.270;23.490,91.275;23.485,91.275;23.485,91.270;23.490,91.270",8,41,51
village_05,Jampui,24.1397,92.2822,"24.142,92.279;24.142,92.285;24.137,92.285;24.137,92.279;24.142,92.279",6,69,25
village_06,Kakraban,23.3551,91.3965,"23.358,91.395;23.358,91.400;23.353,91.400;23.353,91.395;23.358,91.395",12,37,51
village_07,Manubazar,23.0261,91.8330,"23.028,91.830;23.028,91.836;23.024,91.836;23.024,91.830;23.028,91.830",14,57,29
village_08,Teliamura,23.8001,91.5972,"23.802,91.595;23.802,91.600;23.798,91.600;23.798,91.595;23.802,91.595",7,62,31
village_09,Panisagar,24.1998,92.1070,"24.202,92.105;24.202,92.110;24.197,92.110;24.197,92.105;24.202,92.105",10,66,22
village_10,Melarmath,23.8307,91.2848,"23.833,91.282;23.833,91.287;23.828,91.287;23.828,91.282;23.833,91.282",5,58,35
`;

const claimsCSV = `
id,claimant_name,village_name,claim_type,status,location_lat,location_lng,document_image_url,date,patta_number,land_extent,gram_panchayat,tehsil_taluka,district,state,address,boundaries
claim_001,Rani Debbarma,Ambassa,IFR,linked,23.9145,91.8573,https://picsum.photos/seed/doc1/400/560,2023-01-15,PN001,2.5 Hectares,Ambassa GP,Ambassa,Dhalai,Tripura,Near Ambassa Bazar,"N: River, S: Road"
claim_002,Biswajit Tripura,Kanchanpur,IFR,reviewed,24.1729,92.0112,https://picsum.photos/seed/doc2/400/560,2023-03-20,PN002,1.8 Hectares,Kanchanpur GP,Kanchanpur,North Tripura,Tripura,West of Bus Stand,"N: Forest, S: Paddy"
claim_003,Manoranjan Reang,Melaghar,CFR,needs-review,23.4881,91.2742,https://picsum.photos/seed/doc3/400/560,2022-11-30,PN003,5.0 Hectares,Melaghar GP,Udaipur,Gomati,Tripura,Melaghar Ward 2,"N: Road, S: Field"
claim_004,Santosh Debbarma,Melarmath,CR,linked,23.8319,91.2854,https://picsum.photos/seed/doc4/400/560,2022-06-15,PN004,1.2 Hectares,Melarmath GP,Agartala,West Tripura,Tripura,Opposite Melarmath Kali Bari,"N: Lake, S: Market"
claim_005,Rabindra Jamatia,Udaipur,IFR,needs-review,23.5350,91.4809,https://picsum.photos/seed/doc5/400/560,2021-12-10,PN005,3.7 Hectares,Udaipur GP,Udaipur,Gomati,Tripura,Old Post Road,"N: Highway, S: Canal"
`;

const assetsCSV = `
id,village_id,asset_type,description,document_image_url,geometry_polygon
asset_001,village_01,water,"Community Pond near Ambassa Bazar",https://picsum.photos/seed/asset1/300/200,"23.919,91.852;23.919,91.854;23.917,91.854;23.917,91.852;23.919,91.852"
asset_002,village_02,school,"Government Primary School at Kanchanpur",https://picsum.photos/seed/asset2/300/200,"24.173,92.010;24.173,92.012;24.171,92.012;24.171,92.010;24.173,92.010"
asset_003,village_03,water,"Local Pond used for irrigation in Udaipur",https://picsum.photos/seed/asset3/300/200,"23.536,91.481;23.536,91.483;23.534,91.483;23.534,91.481;23.536,91.481"
asset_004,village_04,school,"Melaghar Community High School",https://picsum.photos/seed/asset4/300/200,"23.488,91.271;23.488,91.273;23.486,91.273;23.486,91.271;23.488,91.271"
asset_005,village_05,water,"Pond adjacent to the main road in Jampui",https://picsum.photos/seed/asset5/300/200,"24.141,92.281;24.141,92.283;24.139,92.283;24.139,92.281;24.141,92.281"
`;

const pattasCSV = `
id,holder_name,village_name,geometry_polygon
patta_001,Ranjit Debbarma,Ambassa,"23.918,91.851;23.918,91.855;23.914,91.855;23.914,91.851;23.918,91.851"
patta_002,Bimal Reang,Kanchanpur,"24.173,92.007;24.173,92.012;24.169,92.012;24.169,92.007;24.173,92.007"
patta_003,Manab Jamatia,Melaghar,"23.489,91.271;23.489,91.276;23.485,91.276;23.485,91.271;23.489,91.271"
patta_004,Sunil Debbarma,Udaipur,"23.536,91.479;23.536,91.483;23.532,91.483;23.532,91.479;23.536,91.479"
patta_005,Rina Tripura,Teliamura,"23.802,91.594;23.802,91.599;23.798,91.599;23.798,91.594;23.802,91.594"
`;

// Helper to parse polygon strings
const parsePolygon = (polyString: string) => {
    if (!polyString) return [];
    return polyString.split(';').map(pair => {
        const [lat, lng] = pair.split(',');
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
    });
};

// Helper to create FieldWithConfidence object
const createField = <T extends string>(value: T) => ({
    raw: value,
    value: value,
    confidence: 1.0 // User-provided data is considered 100% confident
});

// --- Process CSV data into application types ---

export const dummyVillages: Village[] = villagesCSV.trim().split('\n').slice(1).map(line => {
    const [id, name, center_lat, center_lng, bounds_polygon, asset_coverage_water, asset_coverage_forest, asset_coverage_agriculture] = line.split(',');
    return {
        id,
        name,
        center: { lat: parseFloat(center_lat), lng: parseFloat(center_lng) },
        bounds: parsePolygon(bounds_polygon.replace(/"/g, '')),
        assetCoverage: {
            water: parseInt(asset_coverage_water),
            forest: parseInt(asset_coverage_forest),
            agriculture: parseInt(asset_coverage_agriculture),
        },
        ndwi: 0, // Placeholder
        assetGeometries: { ndwi: [], forest: [], agriculture: [] }, // Placeholder
        timeSeriesData: [], // Placeholder
    };
});

export const dummyClaims: Claim[] = claimsCSV.trim().split('\n').slice(1).map(line => {
    const parts = line.match(/(?:"[^"]*"|[^,])+/g) || [];
    const [id, claimant_name, village_name, claim_type, status, location_lat, location_lng, document_image_url, date, patta_number, land_extent, gram_panchayat, tehsil_taluka, district, state, address, boundaries] = parts.map(p => p.replace(/"/g, ''));
    return {
        id,
        created_at: new Date().toISOString(),
        claimantName: createField(claimant_name),
        village: createField(village_name),
        claimType: createField(claim_type as 'IFR' | 'CFR' | 'CR'),
        status: status as 'linked' | 'reviewed' | 'needs-review',
        location: {
            value: { lat: parseFloat(location_lat), lng: parseFloat(location_lng) },
            confidence: 1.0,
        },
        documentUrl: document_image_url,
        documentType: 'image/jpeg',
        date: createField(date),
        pattaNumber: createField(patta_number),
        extentOfForestLandOccupied: createField(land_extent),
        gramPanchayat: createField(gram_panchayat),
        tehsilTaluka: createField(tehsil_taluka),
        district: createField(district),
        state: createField(state),
        address: createField(address),
        boundaries: createField(boundaries),
        is_location_valid: true,
    };
});

export const dummyAssets: CommunityAsset[] = assetsCSV.trim().split('\n').slice(1).map(line => {
    const parts = line.match(/(?:"[^"]*"|[^,])+/g) || [];
    const [id, village_id, asset_type, description, document_image_url, geometry_polygon] = parts.map(p => p.replace(/"/g, ''));
    return {
        id,
        villageId: village_id,
        assetType: asset_type,
        description,
        documentUrl: document_image_url,
        documentType: 'image/jpeg',
        geometry: parsePolygon(geometry_polygon),
    };
});

export const dummyPattas: Patta[] = pattasCSV.trim().split('\n').slice(1).map(line => {
    const parts = line.match(/(?:"[^"]*"|[^,])+/g) || [];
    const [id, holder_name, village_name, geometry_polygon] = parts.map(p => p.replace(/"/g, ''));
    return {
        id,
        holderName: holder_name,
        villageName: village_name,
        geometry: parsePolygon(geometry_polygon),
    };
});

// Dummy data for a new claim upload simulation, can be kept for testing the upload flow
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
