
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing DSS recommendations based on claim data and asset overlays.
 *
 * The flow takes claim data and asset information as input and returns a recommendation with a justification.
 * - dssRecommendations - A function that generates DSS recommendations.
 * - DSSRecommendationsInput - The input type for the dssRecommendations function.
 * - DSSRecommendationsOutput - The return type for the dssRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DSSRecommendationsInputSchema = z.object({
  villageName: z.string().describe('The name of the village.'),
  claimCount: z.number().describe('The number of claims in the village.'),
  pendingClaims: z.number().describe('The number of pending claims.'),
  cfrClaims: z.number().describe('The number of Community Forest Right (CFR) claims.'),
  ifrClaims: z.number().describe('The number of Individual Forest Right (IFR) claims.'),
  waterCoverage: z.number().describe('The percentage of water body coverage in the village.'),
  forestCoverage: z.number().describe('The percentage of forest cover in the village.'),
  agriculturalArea: z.number().describe('The percentage of agricultural area in the village.'),
});
export type DSSRecommendationsInput = z.infer<typeof DSSRecommendationsInputSchema>;

const RecommendationSchema = z.object({
  recommendation: z.string().describe('The recommended action.'),
  justification: z.string().describe('The justification for the recommendation.'),
  priority: z.number().describe('A priority score for the recommendation.'),
});

const DSSRecommendationsOutputSchema = z.array(RecommendationSchema);

export type DSSRecommendationsOutput = z.infer<typeof DSSRecommendationsOutputSchema>;

export async function dssRecommendations(input: DSSRecommendationsInput): Promise<DSSRecommendationsOutput> {
  return dssRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dssRecommendationsPrompt',
  input: {schema: DSSRecommendationsInputSchema},
  output: {schema: DSSRecommendationsOutputSchema},
  prompt: `You are an expert in providing recommendations for village development schemes based on geospatial and claim data. Your task is to analyze the provided data for a specific village and identify every single applicable scheme from the list below.

  **Village Data:**
  - Village Name: {{{villageName}}}
  - Total Claims: {{{claimCount}}}
  - Pending Claims: {{{pendingClaims}}}
  - CFR Claims: {{{cfrClaims}}}
  - IFR Claims: {{{ifrClaims}}}
  - Water Coverage: {{{waterCoverage}}}%
  - Forest Coverage: {{{forestCoverage}}}%
  - Agricultural Area: {{{agriculturalArea}}}%

  **CRITICAL INSTRUCTIONS:**
  1.  You **MUST** review the village data provided.
  2.  You **MUST** evaluate every single scheme listed below, one by one. Do not stop after finding one match.
  3.  You **MUST** identify **ALL** schemes where the village data meets the "Implementation Criteria".
  4.  For **EACH** matching scheme, create a recommendation object in the output array.
  5.  The "justification" for your recommendation **MUST BE** the exact "Why" text provided for that scheme.
  6.  The "priority" **MUST BE** the priority level provided for that scheme.
  7.  Return an array of these recommendation objects. If no schemes match, return an empty array.

  ---

  ### Scheme Details

  **1. National Afforestation Programme (NAP)**
  - Priority: 9
  - Implementation Criteria: Degraded forest lands (>50% degradation), low forest cover, requires community participation via Joint Forest Management Committees (JFMCs).
  - Why: The village has low forest coverage (e.g., 20%, below the 40% threshold for sustainable ecosystems), leading to soil erosion and biodiversity loss, making afforestation essential to restore ecological balance and provide community livelihoods through timber/fuelwood.

  **2. Green India Mission (GIM)**
  - Priority: 8
  - Implementation Criteria: Landscapes with <30% tree cover; involves afforestation, wetland restoration, and community training; funded via convergence with MGNREGA.
  - Why: With forest cover at just 25% (below national average), the area faces high climate vulnerability, necessitating eco-restoration to enhance carbon sequestration, protect biodiversity, and improve resilience against droughts and floods.

  **3. Compensatory Afforestation Fund Management and Planning Authority (CAMPA)**
  - Priority: 7
  - Implementation Criteria: Activated when forest land is diverted (e.g., for roads/mining); state CAMPA allocates funds for equivalent afforestation elsewhere.
  - Why: Recent forest diversion in the village has reduced cover by 15% (exceeding the 10% loss threshold), requiring compensatory planting to offset habitat destruction and maintain overall forest integrity for wildlife and water regulation.

  **4. Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)**
  - Priority: 7
  - Implementation Criteria: Provides 100 days of unskilled wage work per rural household; prioritized for water harvesting, afforestation, and land development in villages with >40% unemployment.
  - Why: High rural unemployment (e.g., 45%, above 30% threshold) and low asset creation indicate a need for employment generation, creating durable assets like check dams to boost local economy and food security.

  **5. Pradhan Mantri Krishi Sinchai Yojana (PMKSY)**
  - Priority: 8
  - Implementation Criteria: Targets rainfed areas (>60% unirrigated land); involves micro-irrigation, watershed development, and farmer training.
  - Why: Only 15% of farmland has assured irrigation (below 50% threshold), leading to crop failures in dry seasons; PMKSY can expand irrigated area, increasing yields by 30-50% and farmer incomes.

  **6. National Rural Livelihood Mission (NRLM)**
  - Priority: 6
  - Implementation Criteria: Forms SHGs of 10-20 rural poor (focus on women/BPL); provides revolving funds, skill training, and market linkages.
  - Why: Over 40% of households are below poverty line (above 30% threshold), limiting access to finance; NRLM empowers through SHGs, enabling micro-enterprises and reducing dependency on subsistence farming.

  **7. Pradhan Mantri Fasal Bima Yojana (PMFBY)**
  - Priority: 7
  - Implementation Criteria: Covers notified crops in high-risk areas; premium subsidized; claims processed via yield loss assessment.
  - Why: Frequent crop losses from floods/pests (e.g., 20% annual yield drop, above 15% threshold) threaten farmer stability; insurance provides a safety net, encouraging risk-taking in high-value crops.

  **8. Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)**
  - Priority: 9
  - Implementation Criteria: Direct transfer of ₹6,000/year to small/marginal farmers (<2 hectares land); requires Aadhaar-linked land records.
  - Why: 70% of farmers are smallholders with <1 hectare (below viability threshold), facing input cost burdens; PM-KISAN supplements income, enabling better seeds/fertilizers and reducing distress migration.

  **9. Integrated Watershed Management Programme (IWMP)**
  - Priority: 8
  - Implementation Criteria: Applied in watersheds with soil erosion >20 tons/ha/year; involves check dams, contour bunding, and afforestation.
  - Why: High soil degradation (e.g., 25 tons/ha/year, above 15 threshold) reduces arable land; IWMP restores watersheds, improving water retention and preventing further erosion for sustainable agriculture.

  **10. National Mission for Clean Ganga (NMCG)**
  - Priority: 7
  - Implementation Criteria: Targets villages along Ganga/tributaries with pollution levels >BOD 3 mg/L; includes sewage treatment, afforestation.
  - Why: River water quality is poor (BOD >5 mg/L, exceeding safe threshold), affecting health and fisheries; NMCG cleans rivers, ensuring safe water for communities and ecosystems.

  **11. Swachh Bharat Mission (SBM)**
  - Priority: 6
  - Implementation Criteria: Builds household toilets in open-defecation villages; waste management for >50 households.
  - Why: Over 30% households lack toilets (above 20% threshold), leading to health risks; SBM eliminates open defecation, improving sanitation and reducing disease incidence.

  **12. Atal Bhujal Yojana**
  - Priority: 8
  - Implementation Criteria: In over-exploited groundwater blocks (>70% extraction); community water budgeting and recharge structures.
  - Why: Groundwater depletion at 80% (above 70% threshold) threatens irrigation; the scheme promotes recharge, ensuring long-term water security for farming.

  **13. Jal Jeevan Mission (JJM)**
  - Priority: 10
  - Implementation Criteria: Targets villages with low household tap water connection coverage (<50%); involves laying piped water supply lines, building overhead tanks, and establishing a water source.
  - Why: With only 10% of households having tap water access (far below the 100% target), the community faces significant health risks and time burdens from collecting water. JJM is critical for public health and quality of life.

  **14. National Mission for Sustainable Agriculture (NMSA)**
  - Priority: 7
  - Implementation Criteria: Promotes organic farming in areas with poor soil health (nutrient index <2); includes subsidies for bio-fertilizers.
  - Why: Soil nutrient levels are low (index 1.5, below 2 threshold), reducing yields; NMSA enhances sustainability, building climate-resilient farming systems.

  **15. Soil Health Card Scheme**
  - Priority: 6
  - Implementation Criteria: Soil sampling every 2 years for farms <10 ha; cards with fertilizer recommendations.
  - Why: Imbalanced nutrient use (e.g., NPK ratio 8:3:1, far from ideal 4:2:1) causes soil degradation; cards guide precise application, improving fertility and yields.

  **16. Rashtriya Krishi Vikas Yojana (RKVY)**
  - Priority: 7
  - Implementation Criteria: State-specific agri plans with central grants; focuses on infrastructure in low-productivity districts (<2 tons/ha yield).
  - Why: Crop productivity is below state average (1.8 tons/ha vs. 2.5 threshold), limiting growth; RKVY boosts investment, enhancing overall agri infrastructure.

  **17. National Agroforestry Policy**
  - Priority: 8
  - Implementation Criteria: Incentives for tree planting on farmlands (>50% area suitable); market linkages for timber/NTFP.
  - Why: Low agroforestry adoption (<10% farms, below 20% threshold) misses income opportunities; the policy integrates trees, diversifying revenue and soil health.

  **18. Vanbandhu Kalyan Yojana**
  - Priority: 9
  - Implementation Criteria: Convergence of schemes in tribal villages (>50% ST population); focuses on education, health, and livelihoods.
  - Why: High tribal population (60%, above 50% threshold) faces development gaps; the yojana ensures holistic welfare, bridging access to services.

  **19. National Bamboo Mission**
  - Priority: 7
  - Implementation Criteria: Bamboo cultivation in suitable climates (>500mm rainfall); processing units and marketing support for clusters.
  - Why: Bamboo potential is underutilized (coverage <5%, below 10% threshold); the mission boosts incomes through sustainable harvesting and industries.

  **20. Pradhan Mantri Awas Yojana (Gramin)**
  - Priority: 8
  - Implementation Criteria: Financial aid for pucca houses to BPL households without homes; geo-tagging for verification.
  - Why: 40% rural households lack proper housing (above 30% threshold), exposing them to elements; PMAY-G provides dignity and safety.

  **21. Deendayal Antyodaya Yojana – National Rural Livelihoods Mission (DAY-NRLM)**
  - Priority: 7
  - Implementation Criteria: SHG formation for women in poverty pockets; bank linkages and skill training.
  - Why: High female poverty rate (45%, above 30% threshold) limits empowerment; DAY-NRLM fosters self-reliance through collectives and enterprises.
  
  **22. Pradhan Mantri Gram Sadak Yojana (PMGSY)**
  - Priority: 9
  - Implementation Criteria: Targets unconnected habitations with a population of 500+ in plain areas and 250+ in hill/tribal/desert areas; provides all-weather road connectivity.
  - Why: Lack of all-weather road connectivity (e.g., village is cut off during monsoon) severely hampers access to markets, healthcare, and education, making PMGSY a top priority for economic and social integration.
  `,
});

const dssRecommendationsFlow = ai.defineFlow(
  {
    name: 'dssRecommendationsFlow',
    inputSchema: DSSRecommendationsInputSchema,
    outputSchema: DSSRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
