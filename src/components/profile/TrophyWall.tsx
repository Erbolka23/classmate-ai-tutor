import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Target, Award, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface TrophyWallProps {
  solvedCount: number;
  streakDays: number;
  totalRating: number;
}

interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: any;
  unlocked: boolean;
  color: string;
  glowColor: string;
}

export const TrophyWall = ({ solvedCount, streakDays, totalRating }: TrophyWallProps) => {
  const trophies: Trophy[] = [
    {
      id: "beginner",
      name: "Beginner",
      description: "Solve 10 problems",
      icon: Target,
      unlocked: solvedCount >= 10,
      color: "from-green-400 to-emerald-600",
      glowColor: "shadow-green-500/50",
    },
    {
      id: "learner",
      name: "Learner",
      description: "Solve 50 problems",
      icon: Award,
      unlocked: solvedCount >= 50,
      color: "from-blue-400 to-blue-600",
      glowColor: "shadow-blue-500/50",
    },
    {
      id: "master",
      name: "Master",
      description: "Solve 100 problems",
      icon: Trophy,
      unlocked: solvedCount >= 100,
      color: "from-purple-400 to-purple-600",
      glowColor: "shadow-purple-500/50",
    },
    {
      id: "fire",
      name: "On Fire",
      description: "7-day streak",
      icon: Flame,
      unlocked: streakDays >= 7,
      color: "from-orange-400 to-red-600",
      glowColor: "shadow-orange-500/50",
    },
    {
      id: "dragon",
      name: "Dragon",
      description: "30-day streak",
      icon: Flame,
      unlocked: streakDays >= 30,
      color: "from-red-600 to-rose-800",
      glowColor: "shadow-red-500/50",
    },
    {
      id: "rated",
      name: "Rated Star",
      description: "Reach 1500 rating",
      icon: Star,
      unlocked: totalRating >= 1500,
      color: "from-yellow-400 to-amber-600",
      glowColor: "shadow-yellow-500/50",
    },
    {
      id: "lightning",
      name: "Lightning",
      description: "Reach 1800 rating",
      icon: Zap,
      unlocked: totalRating >= 1800,
      color: "from-cyan-400 to-blue-600",
      glowColor: "shadow-cyan-500/50",
    },
  ];

  const unlockedCount = trophies.filter(t => t.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Trophy Wall
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {unlockedCount} / {trophies.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {trophies.map((trophy, index) => {
            const Icon = trophy.icon;
            return (
              <motion.div
                key={trophy.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: trophy.unlocked ? 1.1 : 1 }}
                className={`
                  relative p-4 rounded-xl border-2 text-center transition-all
                  ${trophy.unlocked 
                    ? `border-transparent bg-gradient-to-br ${trophy.color} ${trophy.glowColor} shadow-lg` 
                    : 'border-muted bg-muted/30 opacity-40 grayscale'
                  }
                `}
              >
                {trophy.unlocked && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${trophy.color} blur-xl -z-10`}
                  />
                )}
                
                <div className="flex justify-center mb-2">
                  <div className={`p-3 rounded-full ${trophy.unlocked ? 'bg-white/20' : 'bg-muted'}`}>
                    <Icon 
                      className={`h-8 w-8 ${trophy.unlocked ? 'text-white' : 'text-muted-foreground'}`}
                    />
                  </div>
                </div>
                
                <h4 className={`font-bold text-sm mb-1 ${trophy.unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                  {trophy.name}
                </h4>
                <p className={`text-xs ${trophy.unlocked ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {trophy.description}
                </p>

                {trophy.unlocked && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                  >
                    <span className="text-xs">✓</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
