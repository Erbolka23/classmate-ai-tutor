import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Leaderboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_rating', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLeaderboardData(data || []);
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">Top performers in ClassMate AI</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No leaderboard data yet. Be the first to solve problems!
            </div>
          ) : (
            <LeaderboardTable entries={leaderboardData} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
