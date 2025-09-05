
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { VILLAGES } from '@/lib/mock-data';

export default function VillagesPage() {
    const [villageSearchQuery, setVillageSearchQuery] = useState('');

    const filteredVillages = useMemo(() => {
        return VILLAGES.filter(v => v.name.toLowerCase().includes(villageSearchQuery.toLowerCase()));
    }, [villageSearchQuery]);

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
