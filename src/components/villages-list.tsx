
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import type { Village } from '@/types';
import { deleteVillage, getVillages } from '@/app/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

export function VillagesList() {
    const [villages, setVillages] = useState<Village[]>([]);
    const [villageSearchQuery, setVillageSearchQuery] = useState('');
    const [deletingVillage, setDeletingVillage] = useState<Village | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                const villagesData = await getVillages();
                setVillages(villagesData);
            } catch (error) {
                console.error("Failed to fetch villages", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load village data.',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const filteredVillages = useMemo(() => {
        return villages.filter(v => v.name.toLowerCase().includes(villageSearchQuery.toLowerCase()));
    }, [villageSearchQuery, villages]);
    
    const confirmDelete = async () => {
        if (!deletingVillage) return;
        try {
            await deleteVillage(deletingVillage.id);
            setVillages(prev => prev.filter(v => v.id !== deletingVillage!.id));
            toast({
                title: 'Village Deleted',
                description: `Village "${deletingVillage.name}" has been permanently deleted.`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete the village.'
            });
        } finally {
            setDeletingVillage(null);
        }
    }

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <>
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
                  {filteredVillages.map(v => (
                    <li key={v.id} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{v.name}</span>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingVillage(v)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Village</span>
                        </Button>
                    </li>
                   ))}
                </ul>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No villages match your search.</p>
                </div>
              )}
            </CardContent>
        </Card>
        <AlertDialog open={!!deletingVillage} onOpenChange={(open) => !open && setDeletingVillage(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the village <span className="font-bold">{deletingVillage?.name}</span> and all associated data.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingVillage(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
                    <Trash2 className="mr-2" />
                    Yes, delete village
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
