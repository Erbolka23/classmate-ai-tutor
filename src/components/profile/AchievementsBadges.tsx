import { Trophy, Flame, Zap, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AchievementsBadgesProps {
  solvedCount: number;
  streakDays: number;
  totalRating: number;
  hasHardSolved: boolean;
}

export const AchievementsBadges = ({
  solvedCount,
  streakDays,
  totalRating,
  hasHardSolved,
}: AchievementsBadgesProps) => {
  const achievements = [
    {
      id: "first_solve",
      name: "First Solve",
      description: "Solved your first problem",
      icon: Trophy,
      unlocked: solvedCount >= 1,
      color: "text-yellow-500",
    },
    {
      id: "streak_5",
      name: "5-Day Streak",
      description: "Maintained a 5-day solving streak",
      icon: Flame,
      unlocked: streakDays >= 5,
      color: "text-orange-500",
    },
    {
      id: "rated_1300",
      name: "Rated 1300+",
      description: "Achieved a rating of 1300 or higher",
      icon: Zap,
      unlocked: totalRating >= 1300,
      color: "text-blue-500",
    },
    {
      id: "hard_solver",
      name: "Hard Problem Solver",
      description: "Successfully solved a hard problem",
      icon: Target,
      unlocked: hasHardSolved,
      color: "text-red-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-card border-border shadow-sm hover:shadow-md'
                    : 'bg-muted/30 border-muted opacity-50'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <div
                    className={`p-3 rounded-full ${
                      achievement.unlocked ? 'bg-primary/10' : 'bg-muted'
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        achievement.unlocked ? achievement.color : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {achievement.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
