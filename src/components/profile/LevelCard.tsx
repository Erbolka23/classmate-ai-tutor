import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Award, Crown, Gem } from "lucide-react";
import { motion } from "framer-motion";

interface LevelCardProps {
  totalRating: number;
}

const getLevelInfo = (rating: number) => {
  if (rating < 1200) {
    return {
      level: "Bronze",
      color: "from-orange-700 to-orange-900",
      textColor: "text-orange-300",
      icon: Trophy,
      borderColor: "border-orange-700/50",
    };
  }
  if (rating < 1400) {
    return {
      level: "Silver",
      color: "from-gray-400 to-gray-600",
      textColor: "text-gray-200",
      icon: Star,
      borderColor: "border-gray-400/50",
    };
  }
  if (rating < 1600) {
    return {
      level: "Gold",
      color: "from-yellow-400 to-yellow-600",
      textColor: "text-yellow-200",
      icon: Award,
      borderColor: "border-yellow-400/50",
    };
  }
  if (rating < 1900) {
    return {
      level: "Platinum",
      color: "from-cyan-400 to-cyan-600",
      textColor: "text-cyan-200",
      icon: Crown,
      borderColor: "border-cyan-400/50",
    };
  }
  return {
    level: "Diamond",
    color: "from-blue-500 to-purple-600",
    textColor: "text-blue-200",
    icon: Gem,
    borderColor: "border-blue-500/50",
  };
};

export const LevelCard = ({ totalRating }: LevelCardProps) => {
  const levelInfo = getLevelInfo(totalRating);
  const Icon = levelInfo.icon;

  return (
    <Card className={`border-2 ${levelInfo.borderColor} overflow-hidden relative`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${levelInfo.color} opacity-10`} />
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className={`p-4 rounded-2xl bg-gradient-to-br ${levelInfo.color} shadow-lg`}
            >
              <Icon className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <h3 className="text-sm text-muted-foreground">Current Level</h3>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${levelInfo.textColor}`}>
                  {levelInfo.level}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {totalRating}
                </span>
              </div>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="opacity-20"
          >
            <Icon className="h-24 w-24 text-primary" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};
