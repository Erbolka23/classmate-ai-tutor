import { Trophy, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url?: string;
  total_rating: number;
  math_rating: number;
  physics_rating: number;
  programming_rating: number;
  streak_days: number;
  solved_count: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

const getRankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-gray-400";
  if (rank === 3) return "text-orange-600";
  return "text-muted-foreground";
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
  return <span className="text-muted-foreground font-medium">#{rank}</span>;
};

export const LeaderboardTable = ({ entries }: LeaderboardTableProps) => {
  return (
    <>
      {/* Desktop Table View */}
      <Card className="hidden md:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Math</TableHead>
              <TableHead className="text-center">Physics</TableHead>
              <TableHead className="text-center">Programming</TableHead>
              <TableHead className="text-center">Streak</TableHead>
              <TableHead className="text-center">Solved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => {
              const rank = index + 1;
              return (
                <TableRow
                  key={entry.id}
                  className={rank <= 3 ? "bg-accent/5" : ""}
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getRankBadge(rank)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar_url} alt={entry.username} />
                        <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{entry.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold ${getRankColor(rank)}`}>
                      {entry.total_rating}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {entry.math_rating}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {entry.physics_rating}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {entry.programming_rating}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-normal">
                      🔥 {entry.streak_days}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {entry.solved_count}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {entries.map((entry, index) => {
          const rank = index + 1;
          return (
            <Card
              key={entry.id}
              className={`p-4 ${rank <= 3 ? "border-primary/30 bg-accent/5" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8">
                  {getRankBadge(rank)}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.avatar_url} alt={entry.username} />
                  <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{entry.username}</div>
                  <div className={`text-lg font-bold ${getRankColor(rank)}`}>
                    {entry.total_rating}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 bg-background rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Math</div>
                  <div className="font-semibold text-foreground">{entry.math_rating}</div>
                </div>
                <div className="p-2 bg-background rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Physics</div>
                  <div className="font-semibold text-foreground">{entry.physics_rating}</div>
                </div>
                <div className="p-2 bg-background rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Prog</div>
                  <div className="font-semibold text-foreground">{entry.programming_rating}</div>
                </div>
              </div>

              <div className="flex justify-between mt-3 text-sm">
                <span className="text-muted-foreground">
                  🔥 {entry.streak_days} day streak
                </span>
                <span className="text-muted-foreground">
                  {entry.solved_count} solved
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};
