import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StreakPanelProps {
  currentStreak: number;
  maxStreak: number;
}

export const StreakPanel = ({ currentStreak, maxStreak }: StreakPanelProps) => {
  const streakPercentage = maxStreak > 0 ? (currentStreak / maxStreak) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">days in a row</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-muted-foreground">{maxStreak}</div>
            <div className="text-xs text-muted-foreground">max streak</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{currentStreak} / {maxStreak}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${Math.min(streakPercentage, 100)}%` }}
            />
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="text-center py-2 px-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <span className="text-orange-500 font-medium">🔥 {currentStreak} days strong!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
