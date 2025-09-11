
import type { Village } from '@/types';
import { getVillages } from '../actions';
import { VillagesList } from '@/components/villages-list';

export default async function VillagesPage() {
    const villagesData = await getVillages();

    return (
        <VillagesList initialVillages={villagesData} />
    );
}
