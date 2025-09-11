
import type { RawPatta } from '@/types';
import * as turf from '@turf/turf';

// Helper to create an irregular polygon
const createIrregularPolygon = (center: [number, number], avgRadius: number, minSides: number, maxSides: number): [number, number][] => {
    const [cx, cy] = center;
    const sides = Math.floor(Math.random() * (maxSides - minSides + 1)) + minSides;
    const angleStep = (Math.PI * 2) / sides;
    const points: [number, number][] = [];

    for (let i = 0; i < sides; i++) {
        const angle = angleStep * i;
        const radius = avgRadius * (0.8 + Math.random() * 0.4); // Creates irregularity
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle) * 1.5;
        points.push([x, y]);
    }
    points.push(points[0]); // Close the polygon
    return points;
};

// Original raw data
const originalPattas: Omit<RawPatta, 'geometry'> & { geometry: [number, number][] }[] = [
  {
    id: "patta_001",
    holderName: "Ranjit Debbarma",
    villageName: "Ambassa",
    geometry: [
      [91.851, 23.918],
      [91.855, 23.918],
      [91.855, 23.914],
      [91.851, 23.914],
      [91.851, 23.918],
    ],
  },
  {
    id: "patta_002",
    holderName: "Bimal Reang",
    villageName: "Kanchanpur",
    geometry: [
      [92.007, 24.173],
      [92.012, 24.173],
      [92.012, 24.169],
      [92.007, 24.169],
      [92.007, 24.173],
    ],
  },
  {
    id: "patta_003",
    holderName: "Manab Jamatia",
    villageName: "Melaghar",
    geometry: [
      [91.271, 23.489],
      [91.276, 23.489],
      [91.276, 23.485],
      [91.271, 23.485],
      [91.271, 23.489],
    ],
  },
  {
    id: "patta_004",
    holderName: "Sunil Debbarma",
    villageName: "Udaipur",
    geometry: [
      [91.479, 23.536],
      [91.483, 23.536],
      [91.483, 23.532],
      [91.479, 23.532],
      [91.479, 23.536],
    ],
  },
  {
    id: "patta_005",
    holderName: "Rina Tripura",
    villageName: "Teliamura",
    geometry: [
      [91.594, 23.802],
      [91.599, 23.802],
      [91.599, 23.798],
      [91.594, 23.798],
      [91.594, 23.802],
    ],
  },
];

// Generate more realistic polygons
export const pattas: RawPatta[] = originalPattas.map(p => {
    const center = turf.centerOfMass(turf.polygon([p.geometry])).geometry.coordinates as [number, number];
    const newGeometry = createIrregularPolygon(center, 0.002, 8, 10); // 8-10 sides, radius of ~200m
    return {
        ...p,
        geometry: newGeometry,
    };
});
