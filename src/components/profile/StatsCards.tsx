import { Trophy, CheckCircle, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalSolved: number;
  correctPercentage: number;
  hardestRating: number;
  lastActivity: string | null;
  averageRating: number;
}

export const StatsCards = ({
  totalSolved,
  correctPercentage,
  hardestRating,
  lastActivity,
  averageRating,
}: StatsCardsProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityDate.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalSolved}</div>
              <div className="text-sm text-muted-foreground">Total Solved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{correctPercentage}%</div>
              <div className="text-sm text-muted-foreground">Correct Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{hardestRating}</div>
              <div className="text-sm text-muted-foreground">Hardest Solved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{formatDate(lastActivity)}</div>
              <div className="text-sm text-muted-foreground">Last Activity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{averageRating}</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
