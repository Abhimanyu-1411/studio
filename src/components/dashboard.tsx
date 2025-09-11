
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Claim, Village, DssRecommendation } from '@/types';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lightbulb, ThumbsUp, Loader2, AlertCircle, CheckCircle, BrainCircuit } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getDssRecommendation } from '@/app/actions';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const RecommendationCard = ({ recommendation, onActed, isActedOn }: { recommendation: DssRecommendation, onActed: () => void, isActedOn: boolean }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{recommendation.recommendation}</CardTitle>
          </div>
          <Badge variant="secondary">Priority: {recommendation.priority}</Badge>
        </div>
         <CardDescription>{recommendation.justification}</CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
         <Button onClick={onActed} disabled={isActedOn}>
            <ThumbsUp className="mr-2 h-4 w-4" />
            {isActedOn ? 'Reviewed' : 'Mark as Reviewed'}
          </Button>
      </CardFooter>
    </Card>
  )
}

const getClaimValue = (field: any): string => {
    if (typeof field === 'object' && field !== null && 'value' in field) {
        return field.value;
    }
    return field as string;
}

const loadingSteps = [
  "Analyzing village data...",
  "Cross-referencing ecological metrics...",
  "Evaluating applicable government schemes...",
  "Prioritizing recommendations based on impact...",
  "Finalizing suggestions...",
];

export const VillageAnalysis = ({ villages, claims }: { villages: Village[], claims: Claim[] }) => {
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<DssRecommendation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [actedOn, setActedOn] = useState<string[]>([]);
  const [errorState, setErrorState] = useState<{title: string, description: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prevStep => {
          if (prevStep >= loadingSteps.length - 1) {
            clearInterval(interval);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleVillageChange = async (villageId: string) => {
    setSelectedVillageId(villageId);
    if (!villageId) {
      setRecommendations(null);
      setErrorState(null);
      return;
    }
    
    setIsLoading(true);
    setRecommendations(null);
    setErrorState(null);
    setActedOn([]);

    try {
      const result = await getDssRecommendation(villageId);
      // Sort recommendations by priority, highest first
      const sortedResult = result.sort((a, b) => b.priority - a.priority);
      setRecommendations(sortedResult);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        setErrorState({
            title: 'Service Unavailable',
            description: 'The AI recommendation service is currently overloaded. Please try again in a few moments.'
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Error getting recommendation',
            description: 'Could not fetch DSS recommendation for this village.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVillage = useMemo(() => {
    return villages.find(v => v.id === selectedVillageId) || null;
  }, [selectedVillageId, villages]);

  const villageClaims = useMemo(() => {
    if (!selectedVillage) return [];
    return claims.filter(c => getClaimValue(c.village) === selectedVillage.name);
  }, [selectedVillage, claims]);

  const handleMarkAsActed = (recommendation: string) => {
    setActedOn(prev => [...prev, recommendation]);
    toast({
      title: "Recommendation Actioned",
      description: `The recommendation for "${recommendation}" has been marked as reviewed.`,
    })
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Village Selection</CardTitle>
            <CardDescription>Select a village to see DSS recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleVillageChange} value={selectedVillageId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select a village" />
              </SelectTrigger>
              <SelectContent>
                {villages.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        {selectedVillage && (
          <Card>
            <CardHeader>
              <CardTitle>Village Data</CardTitle>
              <CardDescription>Data used for the recommendation.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <p><strong>Total Claims:</strong> {villageClaims.length}</p>
                <p><strong>Pending Claims:</strong> {villageClaims.filter(c => c.status !== 'reviewed' && c.status !== 'linked').length}</p>
                <p><strong>CFR Claims:</strong> {villageClaims.filter(c => getClaimValue(c.claimType) === 'CFR').length}</p>
                <p><strong>IFR Claims:</strong> {villageClaims.filter(c => getClaimValue(c.claimType) === 'IFR').length}</p>
                <p><strong>Water Coverage:</strong> {selectedVillage.assetCoverage.water.toFixed(2)}%</p>
                <p><strong>Forest Coverage:</strong> {selectedVillage.assetCoverage.forest.toFixed(2)}%</p>
                <p><strong>Agricultural Area:</strong> {selectedVillage.assetCoverage.agriculture.toFixed(2)}%</p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>DSS Recommendations</CardTitle>
             <CardDescription>AI-powered recommendations based on village data.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-start min-h-[300px] p-6 space-y-4">
            {isLoading && (
              <div className="text-center flex-1 flex flex-col justify-center items-center">
                  <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium animate-pulse">{loadingSteps[loadingStep]}</p>
              </div>
            )}
            
            {!isLoading && !recommendations && !errorState && (
                <div className="text-center flex-1 flex flex-col justify-center items-center"><Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Select a village to see recommendations.</p></div>
            )}
            
            {errorState && (
                 <div className="text-center flex-1 flex flex-col justify-center items-center w-full">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{errorState.title}</AlertTitle>
                      <AlertDescription>
                        {errorState.description}
                      </AlertDescription>
                    </Alert>
                </div>
            )}

            {!isLoading && !errorState && recommendations && recommendations.length === 0 && <div className="text-center flex-1 flex flex-col justify-center items-center"><CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" /><p className="text-muted-foreground">No specific recommendations triggered for this village based on current data.</p></div>}
            
            {recommendations && recommendations.length > 0 && (
                <div className="w-full space-y-4">
                  {recommendations.map(rec => (
                    <RecommendationCard 
                      key={rec.recommendation}
                      recommendation={rec}
                      onActed={() => handleMarkAsActed(rec.recommendation)}
                      isActedOn={actedOn.includes(rec.recommendation)}
                    />
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
