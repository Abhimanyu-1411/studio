
import type { Claim, Village, TimeSeriesDataPoint } from '@/types';

// Generate mock time-series data
const generateTimeSeries = (startValue: number, length: number, seasonality: number[], trend: number) => {
  const series = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - (length / 12));
  
  for (let i = 0; i < length; i++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const month = date.getMonth();
    
    // Apply seasonality, trend, and some randomness
    const rainfallValue = Math.max(0, startValue + (seasonality[month % 12] * startValue) + (i * trend) + (Math.random() - 0.5) * 0.1 * startValue);
    const ndwiValue = Math.max(0, Math.min(1, startValue / 200 + (seasonality[month % 12]) + (i * trend / 1000) + (Math.random() - 0.5) * 0.1));
    const ndviValue = Math.max(0, Math.min(1, startValue / 150 + (seasonality[month % 12]) + (i * trend / 1000) + (Math.random() - 0.5) * 0.1));
    
    // Calculate deforestation risk (example logic)
    // Lower NDVI (less vegetation) and extreme rainfall (stress) could increase risk
    const ndviRisk = 1 - ndviValue; // Lower NDVI = higher risk
    const rainfallRisk = Math.abs(rainfallValue - 100) / 200; // Deviating from a norm of 100mm increases risk, normalized
    const deforestationRisk = Math.max(0, Math.min(1, (ndviRisk * 0.7) + (rainfallRisk * 0.3) + (Math.random() - 0.5) * 0.1));


    series.push({
      date: date.toISOString().split('T')[0],
      rainfall: rainfallValue,
      ndwi: ndwiValue,
      ndvi: ndviValue,
      deforestationRisk,
    });
  }
  return series;
}


const rainfallSeasonality = [-0.8, -0.7, -0.5, -0.2, 0.5, 1.0, 1.2, 1.1, 0.6, -0.1, -0.4, -0.6];
const vegetationSeasonality = [-0.3, -0.2, -0.1, 0.1, 0.3, 0.5, 0.6, 0.4, 0.2, -0.1, -0.2, -0.3];


export const VILLAGES: Village[] = [
  {
    id: 'v1',
    name: 'Ambedkar Nagar',
    ndwi: 0.2,
    assetCoverage: { water: 15, forest: 45, agriculture: 30 },
    center: { lat: 26.4, lng: 82.55 },
    bounds: [
      { lat: 26.42, lng: 82.53 },
      { lat: 26.423, lng: 82.535 },
      { lat: 26.425, lng: 82.545 },
      { lat: 26.424, lng: 82.555 },
      { lat: 26.42, lng: 82.57 },
      { lat: 26.415, lng: 82.575 },
      { lat: 26.4, lng: 82.58 },
      { lat: 26.385, lng: 82.578 },
      { lat: 26.38, lng: 82.57 },
      { lat: 26.377, lng: 82.56 },
      { lat: 26.375, lng: 82.55 },
      { lat: 26.376, lng: 82.54 },
      { lat: 26.38, lng: 82.53 },
      { lat: 26.39, lng: 82.525 },
      { lat: 26.4, lng: 82.52 },
    ],
    assetGeometries: {
      water: [
        [
          { lat: 26.415, lng: 82.535 }, { lat: 26.416, lng: 82.536 }, { lat: 26.417, lng: 82.537 }, { lat: 26.418, lng: 82.538 },
          { lat: 26.419, lng: 82.539 }, { lat: 26.420, lng: 82.540 }, { lat: 26.419, lng: 82.541 }, { lat: 26.418, lng: 82.542 },
          { lat: 26.417, lng: 82.543 }, { lat: 26.416, lng: 82.544 }, { lat: 26.415, lng: 82.545 }, { lat: 26.414, lng: 82.546 },
          { lat: 26.413, lng: 82.547 }, { lat: 26.412, lng: 82.548 }, { lat: 26.411, lng: 82.547 }, { lat: 26.410, lng: 82.546 },
          { lat: 26.411, lng: 82.545 }, { lat: 26.412, lng: 82.544 }, { lat: 26.413, lng: 82.543 }, { lat: 26.412, lng: 82.540 },
          { lat: 26.413, lng: 82.537 }, { lat: 26.414, lng: 82.536 },
        ]
      ],
      forest: [
        [
          { lat: 26.39, lng: 82.54 }, { lat: 26.391, lng: 82.541 }, { lat: 26.392, lng: 82.542 }, { lat: 26.393, lng: 82.543 },
          { lat: 26.395, lng: 82.545 }, { lat: 26.396, lng: 82.547 }, { lat: 26.398, lng: 82.55 }, { lat: 26.4, lng: 82.56 },
          { lat: 26.398, lng: 82.562 }, { lat: 26.395, lng: 82.565 }, { lat: 26.393, lng: 82.564 }, { lat: 26.391, lng: 82.562 },
          { lat: 26.388, lng: 82.560 }, { lat: 26.385, lng: 82.555 }, { lat: 26.385, lng: 82.55 }, { lat: 26.386, lng: 82.548 },
          { lat: 26.387, lng: 82.545 }, { lat: 26.388, lng: 82.543 }, { lat: 26.389, lng: 82.541 },
        ]
      ],
      agriculture: [
        [
          { lat: 26.41, lng: 82.56 }, { lat: 26.411, lng: 82.561 }, { lat: 26.412, lng: 82.563 }, { lat: 26.413, lng: 82.565 },
          { lat: 26.415, lng: 82.568 }, { lat: 26.414, lng: 82.570 }, { lat: 26.412, lng: 82.572 }, { lat: 26.410, lng: 82.573 },
          { lat: 26.408, lng: 82.571 }, { lat: 26.407, lng: 82.570 }, { lat: 26.406, lng: 82.568 }, { lat: 26.405, lng: 82.565 },
          { lat: 26.406, lng: 82.563 }, { lat: 26.407, lng: 82.562 }, { lat: 26.408, lng: 82.561 }, { lat: 26.409, lng: 82.560 },
        ]
      ]
    },
    timeSeriesData: generateTimeSeries(100, 36, rainfallSeasonality, -0.5),
  },
  {
    id: 'v2',
    name: 'Sultanpur',
    ndwi: 0.8,
    assetCoverage: { water: 35, forest: 20, agriculture: 65 },
    center: { lat: 26.25, lng: 82.07 },
    bounds: [
      { lat: 26.27, lng: 82.05 },
      { lat: 26.273, lng: 82.055 },
      { lat: 26.275, lng: 82.06 },
      { lat: 26.274, lng: 82.07 },
      { lat: 26.27, lng: 82.09 },
      { lat: 26.265, lng: 82.093 },
      { lat: 26.26, lng: 82.095 },
      { lat: 26.24, lng: 82.093 },
      { lat: 26.23, lng: 82.09 },
      { lat: 26.227, lng: 82.085 },
      { lat: 26.225, lng: 82.08 },
      { lat: 26.228, lng: 82.07 },
      { lat: 26.23, lng: 82.05 },
      { lat: 26.24, lng: 82.045 },
      { lat: 26.26, lng: 82.045 },
    ],
    assetGeometries: {
      water: [
        [
          { lat: 26.26, lng: 82.055 }, { lat: 26.261, lng: 82.056 }, { lat: 26.262, lng: 82.057 }, { lat: 26.263, lng: 82.058 },
          { lat: 26.265, lng: 82.06 }, { lat: 26.266, lng: 82.062 }, { lat: 26.268, lng: 82.065 }, { lat: 26.267, lng: 82.067 },
          { lat: 26.265, lng: 82.068 }, { lat: 26.263, lng: 82.068 }, { lat: 26.261, lng: 82.067 }, { lat: 26.258, lng: 82.065 },
          { lat: 26.255, lng: 82.062 }, { lat: 26.256, lng: 82.060 }, { lat: 26.257, lng: 82.057 }, { lat: 26.258, lng: 82.056 },
        ]
      ],
      forest: [],
      agriculture: [
        [
          { lat: 26.24, lng: 82.06 }, { lat: 26.242, lng: 82.063 }, { lat: 26.245, lng: 82.068 }, { lat: 26.248, lng: 82.075 },
          { lat: 26.25, lng: 82.08 }, { lat: 26.248, lng: 82.083 }, { lat: 26.245, lng: 82.085 }, { lat: 26.242, lng: 82.084 },
          { lat: 26.238, lng: 82.082 }, { lat: 26.236, lng: 82.078 }, { lat: 26.235, lng: 82.07 }, { lat: 26.236, lng: 82.068 },
          { lat: 26.237, lng: 82.065 }, { lat: 26.238, lng: 82.062 },
        ]
      ]
    },
    timeSeriesData: generateTimeSeries(120, 36, rainfallSeasonality, 0.2),
  },
  {
    id: 'v3',
    name: 'Basti',
    ndwi: 0.5,
    assetCoverage: { water: 25, forest: 70, agriculture: 15 },
    center: { lat: 26.79, lng: 82.71 },
    bounds: [
      { lat: 26.81, lng: 82.69 },
      { lat: 26.813, lng: 82.695 },
      { lat: 26.815, lng: 82.70 },
      { lat: 26.814, lng: 82.715 },
      { lat: 26.81, lng: 82.73 },
      { lat: 26.805, lng: 82.733 },
      { lat: 26.80, lng: 82.735 },
      { lat: 26.78, lng: 82.733 },
      { lat: 26.77, lng: 82.73 },
      { lat: 26.767, lng: 82.725 },
      { lat: 26.765, lng: 82.72 },
      { lat: 26.768, lng: 82.705 },
      { lat: 26.77, lng: 82.69 },
      { lat: 26.78, lng: 82.685 },
      { lat: 26.80, lng: 82.685 },
    ],
    assetGeometries: {
      water: [],
      forest: [
        [
          { lat: 26.78, lng: 82.7 }, { lat: 26.782, lng: 82.702 }, { lat: 26.785, lng: 82.705 }, { lat: 26.79, lng: 82.71 },
          { lat: 26.795, lng: 82.715 }, { lat: 26.8, lng: 82.72 }, { lat: 26.798, lng: 82.723 }, { lat: 26.795, lng: 82.725 },
          { lat: 26.792, lng: 82.727 }, { lat: 26.788, lng: 82.729 }, { lat: 26.785, lng: 82.728 }, { lat: 26.782, lng: 82.726 },
          { lat: 26.778, lng: 82.722 }, { lat: 26.775, lng: 82.71 }, { lat: 26.776, lng: 82.708 }, { lat: 26.778, lng: 82.705 },
          { lat: 26.779, lng: 82.702 },
        ]
      ],
      agriculture: [],
    },
    timeSeriesData: generateTimeSeries(80, 36, vegetationSeasonality, 0.1),
  },
];

export const MOCK_CLAIMS: Claim[] = [
  {
    id: 'claim-1',
    claimantName: { value: 'Aarav Sharma', confidence: 0.98 },
    village: { value: 'Ambedkar Nagar', confidence: 0.95 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '2.5 Hectares', confidence: 1.0 },
    date: { value: '2023-05-12', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Ambedkar Nagar',
    geoLinkConfidence: 0.95,
    status: 'linked',
    location: { lat: 26.41, lng: 82.55 },
  },
  {
    id: 'claim-2',
    claimantName: { value: 'Priya Singh', confidence: 0.99 },
    village: { value: 'Sultanpur', confidence: 0.99 },
    claimType: { value: 'CFR', confidence: 1.0 },
    area: { value: '15 Hectares', confidence: 1.0 },
    date: { value: '2023-06-01', confidence: 0.9 },
    documentUrl: '',
    documentType: 'jpg',
    linkedVillage: 'Sultanpur',
    geoLinkConfidence: 0.99,
    status: 'reviewed',
    location: { lat: 26.26, lng: 82.06 },
  },
  {
    id: 'claim-3',
    claimantName: { value: 'Rohan Verma', confidence: 0.9 },
    village: { value: 'Basti', confidence: 0.92 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '1.8 Hectares', confidence: 1.0 },
    date: { value: '2023-07-20', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Basti',
    geoLinkConfidence: 0.85,
    status: 'linked',
    location: { lat: 26.78, lng: 82.72 },
  },
    {
    id: 'claim-4',
    claimantName: { value: 'Sunita Devi', confidence: 0.96 },
    village: { value: 'Sultanpur', confidence: 0.98 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '3.1 Hectares', confidence: 1.0 },
    date: { value: '2023-08-15', confidence: 0.95 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Sultanpur',
    geoLinkConfidence: 0.92,
    status: 'linked',
    location: { lat: 26.24, lng: 82.08 },
  },
  {
    id: 'claim-5',
    claimantName: { value: 'Amit Kumar', confidence: 0.85 },
    village: { value: 'Ambedkarnagar', confidence: 0.78 },
    claimType: { value: 'CR', confidence: 0.9 },
    area: { value: '0.5 Hectares', confidence: 1.0 },
    date: { value: '2023-09-02', confidence: 1.0 },
    documentUrl: '',
    documentType: 'jpg',
    linkedVillage: 'Ambedkar Nagar',
    geoLinkConfidence: 0.75,
    status: 'needs-review',
    location: { lat: 26.4, lng: 82.56 },
  },
   {
    id: 'claim-6',
    claimantName: { value: 'Geeta Patel', confidence: 0.99 },
    village: { value: 'Basti', confidence: 1.0 },
    claimType: { value: 'CFR', confidence: 1.0 },
    area: { value: '25 Hectares', confidence: 1.0 },
    date: { value: '2023-10-11', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Basti',
    geoLinkConfidence: 1.0,
    status: 'reviewed',
    location: { lat: 26.80, lng: 82.70 },
  },
   {
    id: 'claim-7',
    claimantName: { value: 'Rajesh Gupta', confidence: 1.0 },
    village: { value: 'Ambedkar Nagar', confidence: 1.0 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '1.2 Hectares', confidence: 1.0 },
    date: { value: '2023-11-05', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Ambedkar Nagar',
    geoLinkConfidence: 1.0,
    status: 'reviewed',
    location: { lat: 26.39, lng: 82.54 },
  },
  {
    id: 'claim-8',
    claimantName: { value: 'Pooja Mishra', confidence: 1.0 },
    village: { value: 'Ambedkar Nagar', confidence: 1.0 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '2.1 Hectares', confidence: 1.0 },
    date: { value: '2023-11-10', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Ambedkar Nagar',
    geoLinkConfidence: 1.0,
    status: 'reviewed',
    location: { lat: 26.41, lng: 82.56 },
  },
  {
    id: 'claim-9',
    claimantName: { value: 'Sanjay Yadav', confidence: 1.0 },
    village: { value: 'Ambedkar Nagar', confidence: 1.0 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '3.0 Hectares', confidence: 1.0 },
    date: { value: '2023-11-15', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Ambedkar Nagar',
    geoLinkConfidence: 1.0,
    status: 'reviewed',
    location: { lat: 26.38, lng: 82.57 },
  },
    {
    id: 'claim-10',
    claimantName: { value: 'Deepak Singh', confidence: 1.0 },
    village: { value: 'Sultanpur', confidence: 1.0 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '1.5 Hectares', confidence: 1.0 },
    date: { value: '2024-01-10', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Sultanpur',
    geoLinkConfidence: 1.0,
    status: 'reviewed',
    location: { lat: 26.255, lng: 82.07 },
  },
  {
    id: 'claim-11',
    claimantName: { value: 'Anjali Tiwari', confidence: 0.95 },
    village: { value: 'Sultanpur', confidence: 0.9 },
    claimType: { value: 'IFR', confidence: 1.0 },
    area: { value: '2.2 Hectares', confidence: 1.0 },
    date: { value: '2024-02-20', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Sultanpur',
    geoLinkConfidence: 0.88,
    status: 'linked',
    location: { lat: 26.245, lng: 82.065 },
  },
   {
    id: 'claim-12',
    claimantName: { value: 'Tribal Community', confidence: 1.0 },
    village: { value: 'Ambedkar Nagar', confidence: 1.0 },
    claimType: { value: 'CFR', confidence: 1.0 },
    area: { value: '50 Hectares', confidence: 1.0 },
    date: { value: '2024-03-01', confidence: 1.0 },
    documentUrl: '',
    documentType: 'pdf',
    linkedVillage: 'Ambedkar Nagar',
    geoLinkConfidence: 0.9,
    status: 'linked',
    location: { lat: 26.395, lng: 82.55 },
  },
];

export const AVAILABLE_VILLAGE_NAMES = VILLAGES.map(v => v.name);

