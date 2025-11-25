import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  joinDate: string;
  totalRating: number;
  mathRating: number;
  physicsRating: number;
  programmingRating: number;
}

const getRankInfo = (rating: number) => {
  if (rating < 1200) return { name: "Bronze", color: "bg-orange-700 text-white" };
  if (rating < 1400) return { name: "Silver", color: "bg-gray-400 text-gray-900" };
  if (rating < 1600) return { name: "Gold", color: "bg-yellow-500 text-gray-900" };
  if (rating < 1900) return { name: "Platinum", color: "bg-cyan-400 text-gray-900" };
  return { name: "Diamond", color: "bg-blue-600 text-white" };
};

export const ProfileHeader = ({
  username,
  avatarUrl,
  joinDate,
  totalRating,
  mathRating,
  physicsRating,
  programmingRating,
}: ProfileHeaderProps) => {
  const rank = getRankInfo(totalRating);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/60">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 space-y-3">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold text-foreground mb-1"
            >
              {username}
            </motion.h1>
            <p className="text-sm text-muted-foreground">
              Joined {new Date(joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge className={`${rank.color} shadow-md`}>{rank.name}</Badge>
            </motion.div>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-2xl font-bold text-foreground"
            >
              {totalRating}
            </motion.span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "Math", rating: mathRating },
              { label: "Physics", rating: physicsRating },
              { label: "Programming", rating: programmingRating }
            ].map((subject, index) => (
              <motion.div
                key={subject.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -2 }}
                className="text-center p-2 bg-background rounded border border-border hover:border-primary/50 transition-all"
              >
                <div className="text-xs text-muted-foreground mb-1">{subject.label}</div>
                <div className="font-semibold text-foreground">{subject.rating}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
