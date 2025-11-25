import { NavBar } from "@/components/NavBar";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">Top performers in ClassMate AI</p>
          </div>

          <Card className="p-12 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              The leaderboard feature will be available soon. Keep solving problems to improve your rating!
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
