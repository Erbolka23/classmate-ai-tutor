import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StreakPanelProps {
  currentStreak: number;
  maxStreak: number;
}

export const StreakPanel = ({ currentStreak, maxStreak }: StreakPanelProps) => {
  const streakPercentage = maxStreak > 0 ? (currentStreak / maxStreak) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
              rotate: currentStreak > 0 ? [0, 10, -10, 0] : 0,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Flame className="h-5 w-5 text-orange-500" />
          </motion.div>
          Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <motion.div
              key={currentStreak}
              initial={{ scale: 1.5, color: "#f97316" }}
              animate={{ scale: 1, color: "inherit" }}
              className="text-3xl font-bold text-foreground"
            >
              {currentStreak}
            </motion.div>
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
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(streakPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 relative"
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

        {currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-2 px-3 bg-orange-500/10 border border-orange-500/20 rounded-lg"
          >
            <span className="text-orange-500 font-medium">🔥 {currentStreak} days strong!</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
