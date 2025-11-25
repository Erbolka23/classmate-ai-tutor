import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Filter } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Problem {
  id: string;
  subject: string;
  title: string;
  statement: string;
  difficulty: string;
  rating: number;
}

const Practice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [ratingRange, setRatingRange] = useState<number[]>([800, 2400]);

  useEffect(() => {
    loadProblems();
  }, [subjectFilter, difficultyFilter, ratingRange]);

  const loadProblems = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('problems')
        .select('*')
        .gte('rating', ratingRange[0])
        .lte('rating', ratingRange[1])
        .order('created_at', { ascending: false })
        .limit(20);

      if (subjectFilter !== 'all') {
        query = query.eq('subject', subjectFilter);
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty', difficultyFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProblems(data || []);
    } catch (error: any) {
      console.error('Error loading problems:', error);
      toast({
        title: "Error",
        description: "Failed to load problems. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Practice Library</h1>
          <p className="text-muted-foreground">Solve problems to improve your rating</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              </div>

              <div className="space-y-6">
                {/* Subject Filter */}
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Range */}
                <div className="space-y-3">
                  <Label>Rating Range</Label>
                  <div className="px-2">
                    <Slider
                      min={800}
                      max={2400}
                      step={100}
                      value={ratingRange}
                      onValueChange={setRatingRange}
                      className="mb-2"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{ratingRange[0]}</span>
                    <span>{ratingRange[1]}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSubjectFilter("all");
                    setDifficultyFilter("all");
                    setRatingRange([800, 2400]);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </Card>
          </aside>

          {/* Problems List */}
          <div>
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </Card>
                ))}
              </div>
            ) : problems.length === 0 ? (
              <Card className="p-12 text-center">
                <Target className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Problems Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back later.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {problems.map((problem) => (
                  <Card
                    key={problem.id}
                    className="p-6 hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
                    onClick={() => navigate(`/practice/${problem.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-foreground flex-1">
                        {problem.title}
                      </h3>
                      <Badge variant="outline" className="capitalize">
                        {problem.subject}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {problem.statement}
                    </p>

                    <div className="flex items-center gap-3">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        Rating: {problem.rating}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Practice;
