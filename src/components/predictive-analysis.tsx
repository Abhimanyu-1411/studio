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
import { Loader2, BrainCircuit } from 'lucide-react';
import { format } from 'date-fns';

type PredictiveAnalysisProps = {
  villages: Village[];
};

type Metric = keyof Omit<TimeSeriesDataPoint, 'date'>;

const metricOptions: { value: Metric; label: string }[] = [
  { value: 'rainfall', label: 'Rainfall (mm)' },
  { value: 'ndwi', label: 'NDWI (Water Availability)' },
  { value: 'ndvi', label: 'NDVI (Vegetation Health)' },
];

export function PredictiveAnalysis({ villages }: PredictiveAnalysisProps) {
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<Metric>('rainfall');
  const [forecastPeriods, setForecastPeriods] = useState(12);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      const data = await getPrediction(selectedVillageId, selectedMetric, forecastPeriods);
      setChartData(data);
      toast({
        title: 'Forecast Generated',
        description: `Successfully forecasted ${metricOptions.find(m => m.value === selectedMetric)?.label} for the next ${forecastPeriods} months.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error generating forecast',
        description: 'Could not generate the forecast. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDateTick = (tickItem: string) => {
    try {
        return format(new Date(tickItem), 'MMM yyyy');
    } catch (e) {
        return tickItem;
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
              <Label htmlFor="periods">Forecast Months: {forecastPeriods}</Label>
              <Slider
                id="periods"
                min={3}
                max={24}
                step={1}
                value={[forecastPeriods]}
                onValueChange={(val) => setForecastPeriods(val[0])}
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
          <CardContent className="h-[85%]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">The AI is analyzing the data...</p>
              </div>
            )}
            {!isLoading && chartData.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <BrainCircuit className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a village and metric, then click "Generate Forecast" to see the prediction.</p>
                 </div>
            )}
            {!isLoading && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDateTick} angle={-30} textAnchor="end" height={60} />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip
                            labelFormatter={formatDateTick}
                            formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name === 'historical' ? 'Historical' : 'Predicted']}
                        />
                        <Legend wrapperStyle={{ bottom: -5 }} />
                        <Line type="monotone" dataKey="historical" stroke="#16a34a" strokeWidth={2} dot={false} name="Historical" />
                        <Line type="monotone" dataKey="predicted" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                    </LineChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
