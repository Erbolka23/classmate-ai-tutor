import { Trophy, CheckCircle, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

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

  const stats = [
    { icon: Trophy, value: totalSolved, label: "Total Solved", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    { icon: CheckCircle, value: `${correctPercentage}%`, label: "Correct Rate", color: "text-green-500", bgColor: "bg-green-500/10" },
    { icon: Target, value: hardestRating, label: "Hardest Solved", color: "text-red-500", bgColor: "bg-red-500/10" },
    { icon: Clock, value: formatDate(lastActivity), label: "Last Activity", color: "text-blue-500", bgColor: "bg-blue-500/10", isText: true },
    { icon: Trophy, value: averageRating, label: "Avg Rating", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="hover:shadow-lg transition-all border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`p-3 ${stat.bgColor} rounded-lg`}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </motion.div>
                  <div>
                    <motion.div
                      key={stat.value}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`${stat.isText ? 'text-lg' : 'text-2xl'} font-bold text-foreground`}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
