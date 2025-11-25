import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StreakPanel } from "@/components/profile/StreakPanel";
import { StatsCards } from "@/components/profile/StatsCards";
import { RecentAttempts } from "@/components/profile/RecentAttempts";
import { AchievementsBadges } from "@/components/profile/AchievementsBadges";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [userRatings, setUserRatings] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    correctPercentage: 0,
    hardestRating: 0,
    averageRating: 0,
    maxStreak: 0,
    hasHardSolved: false,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Load profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Load ratings
      const { data: ratings, error: ratingsError } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (ratingsError) throw ratingsError;

      // Load attempts with problem details
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('problem_attempts')
        .select(`
          *,
          problems (
            title,
            difficulty,
            rating
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (attemptsError) throw attemptsError;

      setProfileData(profile);
      setUserRatings(ratings);
      setAttempts(attemptsData || []);

      // Calculate stats
      if (attemptsData && attemptsData.length > 0) {
        const correctAttempts = attemptsData.filter(a => a.is_correct).length;
        const correctPercentage = Math.round((correctAttempts / attemptsData.length) * 100);
        
        const hardestRating = Math.max(...attemptsData
          .filter(a => a.is_correct)
          .map(a => a.problems?.rating || 0));
        
        const avgRating = Math.round(
          attemptsData
            .filter(a => a.is_correct)
            .reduce((sum, a) => sum + (a.problems?.rating || 0), 0) / correctAttempts
        ) || 0;

        const hasHardSolved = attemptsData.some(a => 
          a.is_correct && a.problems?.difficulty === 'hard'
        );

        setStats({
          correctPercentage,
          hardestRating,
          averageRating: avgRating,
          maxStreak: ratings?.streak_days || 0,
          hasHardSolved,
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48 lg:col-span-2" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileData || !userRatings) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Authentication Required</h2>
              <p className="text-muted-foreground text-lg">
                Please sign in to view your profile and track your progress.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/auth'}
              className="gap-2"
            >
              <User className="h-5 w-5" />
              Go to Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <ProfileHeader
            username={profileData.username || 'User'}
            avatarUrl={profileData.avatar_url}
            joinDate={profileData.created_at}
            totalRating={userRatings.total_rating}
            mathRating={userRatings.math_rating}
            physicsRating={userRatings.physics_rating}
            programmingRating={userRatings.programming_rating}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <StatsCards
                totalSolved={userRatings.solved_count}
                correctPercentage={stats.correctPercentage}
                hardestRating={stats.hardestRating}
                lastActivity={userRatings.last_solved_at}
                averageRating={stats.averageRating}
              />

              <RecentAttempts attempts={attempts} />
            </div>

            <div className="space-y-6">
              <StreakPanel
                currentStreak={userRatings.streak_days}
                maxStreak={stats.maxStreak}
              />

              <AchievementsBadges
                solvedCount={userRatings.solved_count}
                streakDays={userRatings.streak_days}
                totalRating={userRatings.total_rating}
                hasHardSolved={stats.hasHardSolved}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
