import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

interface XPProgressProps {
  solvedCount: number;
  totalRating: number;
}

const getNextLevelRating = (currentRating: number) => {
  if (currentRating < 1200) return 1200;
  if (currentRating < 1400) return 1400;
  if (currentRating < 1600) return 1600;
  if (currentRating < 1900) return 1900;
  return 2400;
};

const getCurrentLevelStart = (currentRating: number) => {
  if (currentRating < 1200) return 0;
  if (currentRating < 1400) return 1200;
  if (currentRating < 1600) return 1400;
  if (currentRating < 1900) return 1600;
  return 1900;
};

export const XPProgress = ({ solvedCount, totalRating }: XPProgressProps) => {
  const xp = solvedCount * 20;
  const nextLevel = getNextLevelRating(totalRating);
  const currentLevelStart = getCurrentLevelStart(totalRating);
  const progress = ((totalRating - currentLevelStart) / (nextLevel - currentLevelStart)) * 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Experience & Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-3xl font-bold text-foreground">{xp} XP</div>
            <div className="text-sm text-muted-foreground">
              {solvedCount} problems solved
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground">to next level</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentLevelStart}</span>
            <span>{nextLevel}</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-primary relative"
            >
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 bg-primary/10 rounded">+20 XP per solve</span>
          <span className="px-2 py-1 bg-primary/10 rounded">
            {nextLevel - totalRating} rating to level up
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
