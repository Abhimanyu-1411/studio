'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig
} from '@/components/ui/chart';

const chartData = [
  { month: 'January', risk: 186 },
  { month: 'February', risk: 305 },
  { month: 'March', risk: 237 },
  { month: 'April', risk: 273 },
  { month: 'May', risk: 209 },
  { month: 'June', risk: 214 },
];

const chartConfig = {
  risk: {
    label: 'Water Risk',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function WaterRiskChart() {
  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="font-headline text-base">Future Water Risk</CardTitle>
        <CardDescription className="text-xs">
          Predictive model for the next 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: -10 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="risk" fill="var(--color-risk)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
