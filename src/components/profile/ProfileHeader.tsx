import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
  if (rating < 1500) return { name: "Silver", color: "bg-gray-400 text-gray-900" };
  if (rating < 1800) return { name: "Gold", color: "bg-yellow-500 text-gray-900" };
  if (rating < 2100) return { name: "Platinum", color: "bg-cyan-400 text-gray-900" };
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
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className="text-2xl">
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">{username}</h1>
            <p className="text-sm text-muted-foreground">
              Joined {new Date(joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={rank.color}>{rank.name}</Badge>
            <span className="text-2xl font-bold text-foreground">{totalRating}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center p-2 bg-background rounded border border-border">
              <div className="text-xs text-muted-foreground mb-1">Math</div>
              <div className="font-semibold text-foreground">{mathRating}</div>
            </div>
            <div className="text-center p-2 bg-background rounded border border-border">
              <div className="text-xs text-muted-foreground mb-1">Physics</div>
              <div className="font-semibold text-foreground">{physicsRating}</div>
            </div>
            <div className="text-center p-2 bg-background rounded border border-border">
              <div className="text-xs text-muted-foreground mb-1">Programming</div>
              <div className="font-semibold text-foreground">{programmingRating}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
