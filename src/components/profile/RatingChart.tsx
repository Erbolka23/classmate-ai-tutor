import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface Attempt {
  rating_after: number;
  created_at: string;
}

interface RatingChartProps {
  attempts: Attempt[];
}

export const RatingChart = ({ attempts }: RatingChartProps) => {
  const chartData = attempts
    .slice()
    .reverse()
    .map((attempt, index) => ({
      index: index + 1,
      rating: attempt.rating_after,
      date: new Date(attempt.created_at).toLocaleDateString(),
    }));

  const minRating = Math.min(...chartData.map(d => d.rating)) - 50;
  const maxRating = Math.max(...chartData.map(d => d.rating)) + 50;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Rating History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Solve problems to see your rating progress
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="index" 
                  className="text-xs"
                  label={{ value: 'Attempt', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  domain={[minRating, maxRating]}
                  className="text-xs"
                  label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) => `Attempt ${value}`}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
