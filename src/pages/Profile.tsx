import { NavBar } from "@/components/NavBar";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">Your learning stats and achievements</p>
          </div>

          <Card className="p-12 text-center">
            <User className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Your profile page is under construction. Soon you'll be able to view your stats, achievements, and learning progress!
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
