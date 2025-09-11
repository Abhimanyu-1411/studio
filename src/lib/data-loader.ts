
import { villages as rawVillages } from '@/lib/data/villages';
import { claims as rawClaims } from '@/lib/data/claims';
import { assets as rawAssets } from '@/lib/data/assets';
import { pattas as rawPattas } from '@/lib/data/pattas';
import { assetGeometries as rawAssetGeometries } from '@/lib/data/asset-geometries';
import type { Village, Claim, CommunityAsset, Patta, RawClaim, RawCommunityAsset, RawPatta, TimeSeriesDataPoint, LngLat } from '@/types';
import * as turf from '@turf/turf';

// =================================================================================
// DATA LOADER AND VALIDATOR
// =================================================================================
// This file processes the raw data, validates its geographic integrity,
// calculates asset coverage, and caches the result.
// =================================================================================

const createField = <T extends string | number>(value: T) => ({
    raw: String(value),
    value: value,
    confidence: 1.0, // Data from files is considered 100% confident
});

const generateTimeSeriesData = (startDate: Date, numMonths: number): TimeSeriesDataPoint[] => {
    const data: TimeSeriesDataPoint[] = [];
    let currentDate = new Date(startDate);
    for (let i = 0; i < numMonths; i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        data.push({
            date: currentDate.toISOString().split('T')[0],
            rainfall: 100 + Math.random() * 200,
            ndwi: 0.2 + Math.random() * 0.4,
            ndvi: 0.5 + Math.random() * 0.3,
            deforestationRisk: Math.random() * 0.5,
        });
    }
    return data;
};

// --- Data Validation and Processing ---

// 1. Process Villages with Asset Clipping and Coverage Calculation
const villages: Village[] = rawVillages.map(v => {
    if (!v.bounds || v.bounds.length < 4) {
        console.error(`Village ${v.name} has invalid bounds. Skipping asset processing.`);
        return {
            ...v,
            assetCoverage: { water: 0, forest: 0, agriculture: 0 },
            assetGeometries: { water: [], forest: [], agriculture: [] },
            timeSeriesData: generateTimeSeriesData(new Date('2022-01-01'), 24),
        };
    }
    
    const villagePolygon = turf.polygon([v.bounds]);
    const villageAssetGeometries = rawAssetGeometries[v.id];

    const clippedGeometries: Required<Village['assetGeometries']> = { water: [], forest: [], agriculture: [] };
    const coverage = { water: 0, forest: 0, agriculture: 0 };
    
    if (villageAssetGeometries) {
        Object.keys(villageAssetGeometries).forEach(key => {
            const assetType = key as keyof typeof villageAssetGeometries;
            const assetGeom = villageAssetGeometries[assetType];

            if (assetGeom && assetGeom.coordinates) {
                const assetPolygon = turf.polygon(assetGeom.coordinates);
                 try {
                    const intersection = turf.intersect(villagePolygon, assetPolygon);
                    if (intersection) {
                        const clippedCoords = turf.getCoords(intersection) as LngLat[][];
                        clippedGeometries[assetType] = clippedCoords;
                    }
                } catch (e) {
                    console.error(`Error intersecting ${assetType} for village ${v.name}:`, e);
                }
            }
        });
    }

    // Assign pre-calculated coverage if available, otherwise default to 0
    coverage.water = (v as any).assetCoverage?.water || 0;
    coverage.forest = (v as any).assetCoverage?.forest || 0;
    coverage.agriculture = (v as any).assetCoverage?.agriculture || 0;

    return {
        ...v,
        assetCoverage: coverage,
        assetGeometries: clippedGeometries,
        timeSeriesData: generateTimeSeriesData(new Date('2022-01-01'), 24),
    };
});

const villageMap = new Map(villages.map(v => [v.name, v]));

// 2. Process Claims
const claims: Claim[] = rawClaims.map((c: RawClaim) => {
    const village = villageMap.get(c.villageName);
    let location = c.location;
    let isLocationValid = true;

    if (village) {
        const claimPoint = turf.point(c.location);
        const villagePolygon = turf.polygon([village.bounds]);
        if (!turf.booleanPointInPolygon(claimPoint, villagePolygon)) {
            console.warn(`Claim "${c.id}" is outside its village "${c.villageName}". Moving to village center.`);
            location = village.center; // Correct location to village center
            isLocationValid = false;
        }
    } else {
        console.warn(`Claim "${c.id}" has an unknown village: "${c.villageName}".`);
        isLocationValid = false;
    }

    return {
        id: c.id,
        created_at: c.date ? new Date(c.date).toISOString() : new Date().toISOString(),
        claimantName: createField(c.claimantName),
        village: createField(c.villageName),
        claimType: createField(c.claimType),
        status: c.status,
        location: {
            value: { lng: location[0], lat: location[1] },
            confidence: isLocationValid ? 1.0 : 0.5,
        },
        documentUrl: c.documentUrl,
        documentType: 'image/jpeg',
        date: createField(c.date || ''),
        pattaNumber: createField(c.pattaNumber || ''),
        extentOfForestLandOccupied: createField(c.landExtent || ''),
        gramPanchayat: createField(c.gramPanchayat || ''),
        tehsilTaluka: createField(c.tehsilTaluka || ''),
        district: createField(c.district || ''),
        state: createField(c.state || ''),
        address: createField(c.address || ''),
        boundaries: createField(c.boundaries || ''),
        is_location_valid: isLocationValid,
        villageId: village?.id,
    };
});

// 3. Process Assets
const communityAssets: CommunityAsset[] = rawAssets.map((a: RawCommunityAsset) => {
    return {
        ...a,
        documentType: 'image/jpeg',
    };
});

// 4. Process Pattas
const pattas: Patta[] = rawPattas.map((p: RawPatta) => {
    return { ...p };
});


// =================================================================================
// In-Memory Data Store
// =================================================================================
// This simulates a database by holding the processed data in memory.
// The data-loader logic ensures it's clean and consistent on startup.
// =================================================================================
class InMemoryStore {
    private villages: Village[];
    private claims: Claim[];
    private assets: CommunityAsset[];
    private pattas: Patta[];

    constructor() {
        this.villages = JSON.parse(JSON.stringify(villages));
        this.claims = JSON.parse(JSON.stringify(claims));
        this.assets = JSON.parse(JSON.stringify(communityAssets));
        this.pattas = JSON.parse(JSON.stringify(pattas));
        console.log(`Data store initialized with ${this.villages.length} villages, ${this.claims.length} claims.`);
    }

    getVillages = async (): Promise<Village[]> => Promise.resolve(this.villages);
    getClaims = async (): Promise<Claim[]> => Promise.resolve(this.claims);
    getCommunityAssets = async (): Promise<CommunityAsset[]> => Promise.resolve(this.assets);
    getPattas = async (): Promise<Patta[]> => Promise.resolve(this.pattas);

    addClaim = async (claim: Claim): Promise<Claim> => {
        this.claims.unshift(claim);
        return Promise.resolve(claim);
    };
    
    addAsset = async (asset: Omit<CommunityAsset, 'id'>): Promise<CommunityAsset> => {
        const newAsset: CommunityAsset = { ...asset, id: `asset_${Date.now()}` };
        this.assets.unshift(newAsset);
        return Promise.resolve(newAsset);
    };
    
    addPattas = async (newPattas: Patta[]): Promise<Patta[]> => {
        const pattasWithIds = newPattas.map(p => ({...p, id: `patta_${Date.now()}_${Math.random()}`}));
        this.pattas.push(...pattasWithIds);
        return Promise.resolve(pattasWithIds);
    }
    
    updateClaim = async (claimId: string, updatedData: Partial<Claim>): Promise<Claim | undefined> => {
        const index = this.claims.findIndex(c => c.id === claimId);
        if (index !== -1) {
            this.claims[index] = { ...this.claims[index], ...updatedData };
            return Promise.resolve(this.claims[index]);
        }
        return Promise.resolve(undefined);
    };
    
    deleteClaim = async (claimId: string): Promise<void> => {
        this.claims = this.claims.filter(c => c.id !== claimId);
        return Promise.resolve();
    };

    deleteVillage = async (villageId: string): Promise<void> => {
        this.villages = this.villages.filter(v => v.id !== villageId);
        // Also remove associated claims, assets, etc. if needed
        this.claims = this.claims.filter(c => c.villageId !== villageId);
        this.assets = this.assets.filter(a => a.villageId !== villageId);
        return Promise.resolve();
    };
}

// Singleton instance of the data store
export const dataStore = new InMemoryStore();
