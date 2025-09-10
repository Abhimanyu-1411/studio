
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getPrediction } from '@/app/actions';
import type { Village, TimeSeriesDataPoint } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type PredictiveAnalysisProps = {
  villages: Village[];
};

type Metric = keyof Omit<TimeSeriesDataPoint, 'date'>;

const metricOptions: { value: Metric; label: string }[] = [
  { value: 'rainfall', label: 'Rainfall (mm)' },
  { value: 'ndwi', label: 'NDWI (Water Availability)' },
  { value: 'ndvi', label: 'NDVI (Vegetation Health)' },
  { value: 'deforestationRisk', label: 'Deforestation Risk Score' },
];

export function PredictiveAnalysis({ villages }: PredictiveAnalysisProps) {
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<Metric>('rainfall');
  const [totalMonths, setTotalMonths] = useState(12);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<{title: string, description: string} | null>(null);
  const { toast } = useToast();

  const handleGenerateForecast = async () => {
    if (!selectedVillageId || !selectedMetric) {
      toast({
        variant: 'destructive',
        title: 'Selection required',
        description: 'Please select a village and a metric to forecast.',
      });
      return;
    }
    
    setIsLoading(true);
    setChartData([]);
    setErrorState(null);

    // Calculate forecast periods based on a 2:1 ratio of historical to predicted data
    const forecastPeriods = Math.round(totalMonths / 3);
    const historicalPeriods = totalMonths - forecastPeriods;

    try {
      const data = await getPrediction(selectedVillageId, selectedMetric, forecastPeriods);
      
      const historicalData = data.filter(d => d.historical !== null).slice(-historicalPeriods);
      const predictedData = data.filter(d => d.predicted !== null);

      if (historicalData.length > 0 && predictedData.length > 0) {
        // Find the last historical point
        const lastHistoricalPoint = historicalData[historicalData.length - 1];
        // Ensure the prediction line starts from the last historical point to avoid a gap
        predictedData.unshift({ ...lastHistoricalPoint, predicted: lastHistoricalPoint.historical });
      }
      
      setChartData([...historicalData, ...predictedData]);
      toast({
        title: 'Forecast Generated',
        description: `Successfully forecasted ${metricOptions.find(m => m.value === selectedMetric)?.label} for the next ${forecastPeriods} months.`,
      });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        setErrorState({
            title: 'Service Unavailable',
            description: 'The AI forecasting service is currently overloaded. Please try again in a few moments.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error generating forecast',
          description: 'Could not generate the forecast. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDateTick = (tickItem: string) => {
    try {
        const date = new Date(tickItem);
        // Show year only on January tick to avoid clutter
        if (date.getMonth() === 0) {
            return format(date, 'MMM yyyy');
        }
        return format(date, 'MMM');
    } catch (e) {
        return tickItem;
    }
  }

  const formatTooltipLabel = (label: string) => {
    try {
        return format(new Date(label), 'MMMM yyyy');
    } catch (e) {
        return label;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Configuration</CardTitle>
            <CardDescription>
              Select parameters to generate a forecast.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Select onValueChange={setSelectedVillageId} value={selectedVillageId}>
                <SelectTrigger id="village">
                  <SelectValue placeholder="Select a village" />
                </SelectTrigger>
                <SelectContent>
                  {villages.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric">Metric</Label>
              <Select onValueChange={(v: Metric) => setSelectedMetric(v)} value={selectedMetric}>
                <SelectTrigger id="metric">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periods">Total Months to Display: {totalMonths}</Label>
              <Slider
                id="periods"
                min={3}
                max={24}
                step={1}
                value={[totalMonths]}
                onValueChange={(val) => setTotalMonths(val[0])}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateForecast} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Forecast'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="h-full min-h-[500px]">
          <CardHeader>
            <CardTitle>Forecast Chart</CardTitle>
            <CardDescription>
              Historical data and AI-powered predictions for the selected metric.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[85%] flex items-center justify-center">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">The AI is analyzing the data...</p>
              </div>
            )}
            {!isLoading && !errorState && chartData.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <BrainCircuit className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a village and metric, then click "Generate Forecast" to see the prediction.</p>
                 </div>
            )}
            {errorState && (
                <Alert variant="destructive" className="w-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{errorState.title}</AlertTitle>
                    <AlertDescription>
                    {errorState.description}
                    </AlertDescription>
                </Alert>
            )}
            {!isLoading && !errorState && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDateTick} angle={-45} textAnchor="end" height={60} interval="preserveStartEnd" />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip
                            labelFormatter={formatTooltipLabel}
                            formatter={(value, name) => {
                                const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
                                const seriesName = name === 'historical' ? 'Historical' : 'Predicted';
                                return [formattedValue, seriesName];
                            }}
                        />
                        <Legend wrapperStyle={{ bottom: 0 }} />
                        <Line type="monotone" dataKey="historical" stroke="#16a34a" strokeWidth={2} dot={false} name="Historical" connectNulls={false}/>
                        <Line type="monotone" dataKey="predicted" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" name="Predicted" connectNulls={false}/>
                    </LineChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    