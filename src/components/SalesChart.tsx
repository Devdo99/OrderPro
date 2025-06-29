// src/components/SalesChart.tsx

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SalesChartProps {
    data: { name: string; total: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        {/* PERBAIKAN: Judul diubah */}
        <CardTitle>Ikhtisar Kuantitas Terjual</CardTitle>
        <CardDescription>Total item terjual selama 7 hari terakhir.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              // PERBAIKAN: Formatter diubah menjadi angka biasa
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
              labelStyle={{ fontWeight: 'bold' }}
              // PERBAIKAN: Formatter diubah menjadi kuantitas
              formatter={(value: number, name) => [`${value} item`, 'Total Terjual']}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ r: 5, fill: '#16a34a' }}
              activeDot={{ r: 8, fill: 'white', stroke: '#16a34a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}