
import type { Village } from '@/types';

// This data has been validated and corrected to ensure geographic consistency.
// All coordinates are in [longitude, latitude] format.

const createIrregularPolygon = (center: [number, number], avgRadius: number, minSides: number, maxSides: number): [number, number][] => {
    const [cx, cy] = center;
    const sides = Math.floor(Math.random() * (maxSides - minSides + 1)) + minSides;
    const angleStep = (Math.PI * 2) / sides;
    const points: [number, number][] = [];

    for (let i = 0; i < sides; i++) {
        const angle = angleStep * i;
        const radius = avgRadius * (0.8 + Math.random() * 0.4); // Creates irregularity
        // longitude is x, latitude is y
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle) * 1.5; // Stretch vertically for more interesting shapes
        points.push([x, y]);
    }
    points.push(points[0]); // Close the polygon
    return points;
};


export const villages: Omit<Village, 'timeSeriesData' | 'assetGeometries' | 'assetCoverage'>[] = [
  {
    id: "village_01",
    name: "Ambassa",
    center: [91.8537, 23.9363],
    bounds: createIrregularPolygon([91.8537, 23.9363], 0.005, 10, 15),
  },
  {
    id: "village_02",
    name: "Kanchanpur",
    center: [92.0093, 24.1702],
    bounds: createIrregularPolygon([92.0093, 24.1702], 0.004, 10, 15),
  },
  {
    id: "village_03",
    name: "Udaipur",
    center: [91.4825, 23.5336],
    bounds: createIrregularPolygon([91.4825, 23.5336], 0.003, 10, 15),
  },
  {
    id: "village_04",
    name: "Melaghar",
    center: [91.2725, 23.4875],
    bounds: createIrregularPolygon([91.2725, 23.4875], 0.0035, 10, 15),
  },
  {
    id: "village_05",
    name: "Jampui",
    center: [92.2822, 24.1397],
    bounds: createIrregularPolygon([92.2822, 24.1397], 0.004, 10, 15),
  },
  {
    id: "village_06",
    name: "Kakraban",
    center: [91.3965, 23.3551],
    bounds: createIrregularPolygon([91.3965, 23.3551], 0.003, 10, 15),
  },
  {
    id: "village_07",
    name: "Manubazar",
    center: [91.8330, 23.0261],
    bounds: createIrregularPolygon([91.8330, 23.0261], 0.004, 10, 15),
  },
  {
    id: "village_08",
    name: "Teliamura",
    center: [91.5972, 23.8001],
    bounds: createIrregularPolygon([91.5972, 23.8001], 0.003, 10, 15),
  },
  {
    id: "village_09",
    name: "Panisagar",
    center: [92.1070, 24.1998],
    bounds: createIrregularPolygon([92.1070, 24.1998], 0.003, 10, 15),
  },
  {
    id: "village_10",
    name: "Melarmath",
    center: [91.2848, 23.8307],
    bounds: createIrregularPolygon([91.2848, 23.8307], 0.0035, 10, 15),
  },
];
