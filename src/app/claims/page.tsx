
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Claim } from '@/types';
import { ClaimsTable } from '@/components/claims-table';
import { useToast } from '@/hooks/use-toast';
import { ClaimEdit } from '@/components/claim-edit';
import { getClaims, getVillages, updateClaim, deleteClaim } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button, buttonVariants } from '@/components/ui/button';
import { FileDown, Upload, FileText, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClaimUpload } from '@/components/claim-upload';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const StatsCard = ({ title, value, icon: Icon, color, bgColor }: { title: string, value: string | number, icon: React.ElementType, color: string, bgColor: string }) => (
    <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={cn("p-3 rounded-lg", bgColor)}>
                <Icon className={cn("h-6 w-6", color)} />
            </div>
        </CardContent>
    </Card>
);


export default function ClaimsPage() {
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [deletingClaim, setDeletingClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const { toast } = useToast();

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [claimsData, villagesData] = await Promise.all([getClaims(), getVillages()]);
        setAllClaims(claimsData);
        setVillages(villagesData.map(v => v.name));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load claims data.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const filteredClaims = useMemo(() => {
    return allClaims.filter(claim => {
      const claimantName = (claim.claimantName as any)?.value || '';
      const claimType = (claim.claimType as any)?.value || '';
      const searchMatch = claimantName.toLowerCase().includes(searchQuery.toLowerCase());
      const typeMatch = typeFilter === 'all' || claimType === typeFilter;
      const statusMatch = statusFilter === 'all' || claim.status === statusFilter;
      return searchMatch && typeMatch && statusMatch;
    });
  }, [allClaims, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const approved = allClaims.filter(c => c.status === 'linked' || c.status === 'reviewed').length;
    const pending = allClaims.filter(c => c.status === 'needs-review').length;
    const rejected = allClaims.filter(c => c.status === 'rejected').length;
    return {
        total: allClaims.length,
        approved,
        pending,
        rejected
    }
  }, [allClaims]);

  const handleClaimUpdate = async (updatedClaim: Claim) => {
    await updateClaim(updatedClaim.id, updatedClaim);
    setAllClaims(prev => prev.map(c => c.id === updatedClaim.id ? updatedClaim : c));
    setEditingClaim(null);
    toast({
        title: 'Claim Updated',
        description: `Successfully updated claim for ${(updatedClaim.claimantName as any).value}.`
    });
  };

  const handleClaimLink = async (claimToLink: Claim) => {
    const updatedClaim = { ...claimToLink, status: 'linked' as const };
    await updateClaim(claimToLink.id, { status: 'linked' });
    setAllClaims(prev => prev.map(c => c.id === claimToLink.id ? updatedClaim : c));
    toast({
        title: 'Claim Linked',
        description: `Claim for ${(claimToLink.claimantName as any).value} is now visible on the map.`
    });
  };
  
  const handleClaimReject = async (claimToReject: Claim) => {
    const updatedClaim = { ...claimToReject, status: 'rejected' as const };
    await updateClaim(claimToReject.id, { status: 'rejected' });
    setAllClaims(prev => prev.map(c => c.id === claimToReject.id ? updatedClaim : c));
    toast({
        variant: 'destructive',
        title: 'Claim Rejected',
        description: `Claim for ${(claimToReject.claimantName as any).value} has been rejected.`
    });
  };

  const handleClaimDelete = (claim: Claim) => {
    setDeletingClaim(claim);
  }

  const confirmDelete = async () => {
    if (!deletingClaim) return;
    try {
        await deleteClaim(deletingClaim.id);
        setAllClaims(prev => prev.filter(c => c.id !== deletingClaim!.id));
        toast({
            title: 'Claim Deleted',
            description: `Claim for ${(deletingClaim.claimantName as any).value} has been permanently deleted.`
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not delete the claim.'
        });
    } finally {
        setDeletingClaim(null);
    }
  }

  const handleClaimEdit = (claim: Claim) => {
    setEditingClaim(claim);
  };
  
  const handleCloseEdit = () => {
    setEditingClaim(null);
  }

  const handleClaimAdded = (newClaim: Claim) => {
    setAllClaims((prevClaims) => [newClaim, ...prevClaims]);
  };

  if (loading) {
    return (
       <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                  <h1 className="text-3xl font-bold">Claims Management</h1>
                  <p className="text-muted-foreground">Manage and track Forest Rights Act claims</p>
              </div>
              <div className="flex items-center gap-2">
                  <Button variant="outline">
                      <FileDown className="mr-2" />
                      Export CSV
                  </Button>
                  <Button onClick={() => setUploadOpen(true)}>
                      <Upload className="mr-2" />
                      Upload Claim
                  </Button>
              </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard title="Total Claims" value={stats.total} icon={FileText} color="text-blue-600" bgColor="bg-blue-100" />
              <StatsCard title="Approved" value={stats.approved} icon={CheckCircle2} color="text-green-600" bgColor="bg-green-100" />
              <StatsCard title="Pending" value={stats.pending} icon={Clock} color="text-yellow-600" bgColor="bg-yellow-100" />
              <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600" bgColor="bg-red-100" />
          </div>

          {/* Filtering Section */}
          <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input 
                        placeholder="Search claimant name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="IFR">IFR</SelectItem>
                            <SelectItem value="CFR">CFR</SelectItem>
                            <SelectItem value="CR">CR</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="linked">Linked</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="needs-review">Needs Review</SelectItem>
                            <SelectItem value="unlinked">Unlinked</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button>Search & Filter</Button>
                </div>
              </CardContent>
          </Card>
          
          {editingClaim ? (
             <ClaimEdit
                claim={editingClaim}
                onClose={handleCloseEdit}
                onClaimUpdate={handleClaimUpdate}
                availableVillages={villages}
            />
          ) : (
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Claims List</CardTitle>
                    {/* Add sorting control if needed */}
                </CardHeader>
                <CardContent>
                    <ClaimsTable
                        claims={filteredClaims}
                        onClaimEdit={handleClaimEdit}
                        onClaimLink={handleClaimLink}
                        onClaimReject={handleClaimReject}
                        onClaimDelete={handleClaimDelete}
                    />
                </CardContent>
            </Card>
          )}
      </div>
       <ClaimUpload 
          open={isUploadOpen} 
          onOpenChange={setUploadOpen} 
          onClaimAdded={handleClaimAdded} 
      />
      <AlertDialog open={!!deletingClaim} onOpenChange={(open) => !open && setDeletingClaim(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the claim for <span className="font-bold">{(deletingClaim?.claimantName as any)?.value}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingClaim(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: "destructive" })}>
                <Trash2 className="mr-2" />
                Yes, delete claim
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    