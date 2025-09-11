
import type { Village } from '@/types';
import { ClaimsDashboard } from '@/components/claims-dashboard';
import { getClaims, getVillages } from '../actions';

export default async function ClaimsPage() {
  const [claimsData, villagesData] = await Promise.all([getClaims(), getVillages()]);

  return <ClaimsDashboard initialClaims={claimsData} initialVillages={villagesData} />;
}
