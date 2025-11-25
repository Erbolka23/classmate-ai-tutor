import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Attempt {
  id: string;
  problem_id: string;
  subject: string;
  is_correct: boolean;
  delta: number;
  created_at: string;
  problems?: {
    title: string;
    difficulty: string;
  };
}

interface RecentAttemptsProps {
  attempts: Attempt[];
}

export const RecentAttempts = ({ attempts }: RecentAttemptsProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'medium':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'hard':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const attemptDate = new Date(date);
    const diffMs = now.getTime() - attemptDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attempts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {attempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attempts yet. Start solving problems!
              </div>
            ) : (
              attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between gap-3 p-3 bg-background border border-border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {attempt.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {attempt.problems?.title || "Unknown Problem"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {attempt.subject}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(attempt.problems?.difficulty || '')}`}>
                          {attempt.problems?.difficulty || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`font-semibold ${
                        attempt.delta > 0 ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {attempt.delta > 0 ? '+' : ''}{attempt.delta}
                    </span>
                    <span className="text-xs text-muted-foreground min-w-[60px] text-right">
                      {formatTimeAgo(attempt.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
