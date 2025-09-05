
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Village } from '@/types';
import { getVillages } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function VillagesPage() {
    const [villages, setVillages] = useState<Village[]>([]);
    const [loading, setLoading] = useState(true);
    const [villageSearchQuery, setVillageSearchQuery] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const villagesData = await getVillages();
                setVillages(villagesData);
            } catch (error) {
                console.error("Failed to fetch villages", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredVillages = useMemo(() => {
        return villages.filter(v => v.name.toLowerCase().includes(villageSearchQuery.toLowerCase()));
    }, [villageSearchQuery, villages]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader className="flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6">
              <div>
                <CardTitle>Villages</CardTitle>
                <CardDescription>List of all villages.</CardDescription>
              </div>
              <div className="relative w-full md:w-auto mt-4 md:mt-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search villages..."
                  className="pl-8 sm:w-[300px]"
                  value={villageSearchQuery}
                  onChange={(e) => setVillageSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {filteredVillages.length > 0 ? (
                <ul className="space-y-2">
                  {filteredVillages.map(v => <li key={v.id} className="p-2 border rounded-md">{v.name}</li>)}
                </ul>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No villages match your search.</p>
                </div>
              )}
            </CardContent>
        </Card>
    );
}
