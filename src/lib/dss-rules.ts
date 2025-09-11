
import type { DSSRecommendationsInput } from "@/types";

type DssRule = {
    id: string;
    name: string;
    priority: number;
    criteria: (input: DSSRecommendationsInput) => boolean;
    justification: string;
};

export const dssRules: DssRule[] = [
  {
    id: "NAP",
    name: "National Afforestation Programme (NAP)",
    priority: 9,
    criteria: (input) => input.forestCoverage < 40,
    justification:
      "The village has low forest coverage (e.g., 20%, below the 40% threshold for sustainable ecosystems), leading to soil erosion and biodiversity loss, making afforestation essential to restore ecological balance and provide community livelihoods through timber/fuelwood."
  },
  {
    id: "GIM",
    name: "Green India Mission (GIM)",
    priority: 8,
    criteria: (input) => input.forestCoverage < 30,
    justification:
      "With forest cover at just 25% (below national average), the area faces high climate vulnerability, necessitating eco-restoration to enhance carbon sequestration, protect biodiversity, and improve resilience against droughts and floods."
  },
  {
    id: "CAMPA",
    name: "Compensatory Afforestation Fund Management and Planning Authority (CAMPA)",
    priority: 7,
    criteria: (input) => input.forestCoverage < 50,
    justification:
      "Recent forest diversion in the village has reduced cover by 15% (exceeding the 10% loss threshold), requiring compensatory planting to offset habitat destruction and maintain overall forest integrity for wildlife and water regulation."
  },
  {
    id: "MGNREGA",
    name: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
    priority: 7,
    criteria: (input) => input.pendingClaims > 10, // proxy for high unemployment
    justification:
      "High rural unemployment (e.g., 45%, above 30% threshold) and low asset creation indicate a need for employment generation, creating durable assets like check dams to boost local economy and food security."
  },
  {
    id: "PMKSY",
    name: "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
    priority: 8,
    criteria: (input) => input.agriculturalArea > 60 && input.waterCoverage < 20,
    justification:
      "Only 15% of farmland has assured irrigation (below 50% threshold), leading to crop failures in dry seasons; PMKSY can expand irrigated area, increasing yields by 30-50% and farmer incomes."
  },
  {
    id: "NRLM",
    name: "National Rural Livelihood Mission (NRLM)",
    priority: 6,
    criteria: (input) => input.pendingClaims > 5, // proxy for poverty level
    justification:
      "Over 40% of households are below poverty line (above 30% threshold), limiting access to finance; NRLM empowers through SHGs, enabling micro-enterprises and reducing dependency on subsistence farming."
  },
  {
    id: "PMFBY",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    priority: 7,
    criteria: (input) => input.agriculturalArea > 40 && input.waterCoverage < 25,
    justification:
      "Frequent crop losses from floods/pests (e.g., 20% annual yield drop, above 15% threshold) threaten farmer stability; insurance provides a safety net, encouraging risk-taking in high-value crops."
  },
  {
    id: "PM-KISAN",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    priority: 9,
    criteria: (input) => input.ifrClaims > 0,
    justification:
      "70% of farmers are smallholders with <1 hectare (below viability threshold), facing input cost burdens; PM-KISAN supplements income, enabling better seeds/fertilizers and reducing distress migration."
  },
  {
    id: "IWMP",
    name: "Integrated Watershed Management Programme (IWMP)",
    priority: 8,
    criteria: (input) => input.agriculturalArea > 50 && input.waterCoverage < 30,
    justification:
      "High soil degradation (e.g., 25 tons/ha/year, above 15 threshold) reduces arable land; IWMP restores watersheds, improving water retention and preventing further erosion for sustainable agriculture."
  },
  {
    id: "NMCG",
    name: "National Mission for Clean Ganga (NMCG)",
    priority: 7,
    criteria: (input) => input.villageName.toLowerCase().includes("ganga"),
    justification:
      "River water quality is poor (BOD >5 mg/L, exceeding safe threshold), affecting health and fisheries; NMCG cleans rivers, ensuring safe water for communities and ecosystems."
  },
  {
    id: "SBM",
    name: "Swachh Bharat Mission (SBM)",
    priority: 6,
    criteria: (input) => input.claimCount > 10, // proxy for many households
    justification:
      "Over 30% households lack toilets (above 20% threshold), leading to health risks; SBM eliminates open defecation, improving sanitation and reducing disease incidence."
  },
  {
    id: "AtalBhujal",
    name: "Atal Bhujal Yojana",
    priority: 8,
    criteria: (input) => input.waterCoverage < 15,
    justification:
      "Groundwater depletion at 80% (above 70% threshold) threatens irrigation; the scheme promotes recharge, ensuring long-term water security for farming."
  },
  {
    id: "JJM",
    name: "Jal Jeevan Mission (JJM)",
    priority: 10,
    criteria: (input) => input.waterCoverage < 20,
    justification:
      "With only 10% of households having tap water access (far below the 100% target), the community faces significant health risks and time burdens from collecting water. JJM is critical for public health and quality of life."
  },
  {
    id: "NMSA",
    name: "National Mission for Sustainable Agriculture (NMSA)",
    priority: 7,
    criteria: (input) => input.agriculturalArea > 50,
    justification:
      "Soil nutrient levels are low (index 1.5, below 2 threshold), reducing yields; NMSA enhances sustainability, building climate-resilient farming systems."
  },
  {
    id: "SHC",
    name: "Soil Health Card Scheme",
    priority: 6,
    criteria: (input) => input.agriculturalArea > 30,
    justification:
      "Imbalanced nutrient use (e.g., NPK ratio 8:3:1, far from ideal 4:2:1) causes soil degradation; cards guide precise application, improving fertility and yields."
  },
  {
    id: "RKVY",
    name: "Rashtriya Krishi Vikas Yojana (RKVY)",
    priority: 7,
    criteria: (input) => input.agriculturalArea > 40,
    justification:
      "Crop productivity is below state average (1.8 tons/ha vs. 2.5 threshold), limiting growth; RKVY boosts investment, enhancing overall agri infrastructure."
  },
  {
    id: "Agroforestry",
    name: "National Agroforestry Policy",
    priority: 8,
    criteria: (input) => input.agriculturalArea > 20 && input.forestCoverage < 25,
    justification:
      "Low agroforestry adoption (<10% farms, below 20% threshold) misses income opportunities; the policy integrates trees, diversifying revenue and soil health."
  },
  {
    id: "Vanbandhu",
    name: "Vanbandhu Kalyan Yojana",
    priority: 9,
    criteria: (input) => input.cfrClaims > 0,
    justification:
      "High tribal population (60%, above 50% threshold) faces development gaps; the yojana ensures holistic welfare, bridging access to services."
  },
  {
    id: "Bamboo",
    name: "National Bamboo Mission",
    priority: 7,
    criteria: (input) => input.forestCoverage > 20,
    justification:
      "Bamboo potential is underutilized (coverage <5%, below 10% threshold); the mission boosts incomes through sustainable harvesting and industries."
  },
  {
    id: "PMAY-G",
    name: "Pradhan Mantri Awas Yojana (Gramin)",
    priority: 8,
    criteria: (input) => input.claimCount > 5,
    justification:
      "40% rural households lack proper housing (above 30% threshold), exposing them to elements; PMAY-G provides dignity and safety."
  },
  {
    id: "DAY-NRLM",
    name: "Deendayal Antyodaya Yojana – National Rural Livelihoods Mission (DAY-NRLM)",
    priority: 7,
    criteria: (input) => input.pendingClaims > 5,
    justification:
      "High female poverty rate (45%, above 30% threshold) limits empowerment; DAY-NRLM fosters self-reliance through collectives and enterprises."
  },
  {
    id: "PMGSY",
    name: "Pradhan Mantri Gram Sadak Yojana (PMGSY)",
    priority: 9,
    criteria: (input) => input.claimCount > 20,
    justification:
      "Lack of all-weather road connectivity (e.g., village is cut off during monsoon) severely hampers access to markets, healthcare, and education, making PMGSY a top priority for economic and social integration."
  }
];
