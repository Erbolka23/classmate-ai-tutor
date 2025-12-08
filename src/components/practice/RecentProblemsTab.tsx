import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, RefreshCw, Sparkles, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SimilarProblemsDisplay } from "@/components/SimilarProblemsDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RecentQuery {
  id: string;
  subject: string;
  original_problem: string;
  simplified_problem: string | null;
  created_at: string;
}

interface SimilarProblem {
  problem: string;
  answer: string;
  difficulty?: string;
}

export const RecentProblemsTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [queries, setQueries] = useState<RecentQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [similarProblems, setSimilarProblems] = useState<SimilarProblem[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [showSimilarModal, setShowSimilarModal] = useState(false);

  useEffect(() => {
    loadRecentQueries();
  }, []);

  const loadRecentQueries = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setQueries([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_recent_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setQueries(data || []);
    } catch (error: any) {
      console.error('Error loading recent queries:', error);
      toast({
        title: "Error",
        description: "Failed to load your recent problems.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeAgain = (query: RecentQuery) => {
    navigate('/tutor', { state: { problem: query.original_problem, subject: query.subject } });
  };

  const handleGenerateSimilar = async (query: RecentQuery) => {
    setIsLoadingSimilar(true);
    setShowSimilarModal(true);
    setSimilarProblems([]);

    try {
      const { data, error } = await supabase.functions.invoke('similar', {
        body: { subject: query.subject, problem_text: query.original_problem }
      });

      if (error) throw error;

      const tasks = data?.tasks || [];
      const mappedProblems = tasks.map((t: any) => ({
        problem: t.task || t.problem || '',
        answer: t.answer || '',
        difficulty: t.difficulty,
      }));
      setSimilarProblems(mappedProblems);
    } catch (error: any) {
      console.error('Error generating similar problems:', error);
      toast({
        title: "Error",
        description: "Failed to generate similar problems.",
        variant: "destructive",
      });
      setShowSimilarModal(false);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case 'math': return '📐';
      case 'physics': return '⚛️';
      case 'programming': return '💻';
      default: return '📚';
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mb-4" />
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded w-32" />
              <div className="h-10 bg-muted rounded w-40" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!queries || queries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <History className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Recent Problems</h3>
        <p className="text-muted-foreground mb-4">
          Ask questions in the AI Tutor to build your personalized practice library.
        </p>
        <Button onClick={() => navigate('/tutor')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Go to AI Tutor
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {queries.map((query) => (
          <Card 
            key={query.id} 
            className="p-6 rounded-2xl hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30 animate-fade-in"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <p className="text-base font-medium text-foreground line-clamp-2 mb-2">
                  {query.original_problem}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {getSubjectIcon(query.subject)} {query.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(query.created_at)}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="capitalize shrink-0">
                {query.subject}
              </Badge>
            </div>

            {query.simplified_problem && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1 italic">
                "{query.simplified_problem}"
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handlePracticeAgain(query)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Practice Again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleGenerateSimilar(query)}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Generate Similar Problems
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Similar Problems Modal */}
      <Dialog open={showSimilarModal} onOpenChange={setShowSimilarModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Similar Problems</DialogTitle>
          </DialogHeader>
          
          {isLoadingSimilar ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </Card>
              ))}
            </div>
          ) : similarProblems.length > 0 ? (
            <SimilarProblemsDisplay problems={similarProblems} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No similar problems generated.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
