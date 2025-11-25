import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { SubmitResultModal } from "@/components/practice/SubmitResultModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  correct_answer: string | null;
}

const PracticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    loadProblem();
  }, [id]);

  const loadProblem = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setProblem(data);
    } catch (error: any) {
      console.error('Error loading problem:', error);
      toast({
        title: "Error",
        description: "Failed to load problem. Please try again.",
        variant: "destructive",
      });
      navigate('/practice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please enter your answer.",
        variant: "destructive",
      });
      return;
    }

    if (!problem) return;

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit answers.",
          variant: "destructive",
        });
        return;
      }

      // Validate answer against correct answer
      const normalizeAnswer = (answer: string) => {
        return answer.trim().toLowerCase().replace(/\s+/g, ' ');
      };

      const isCorrect = problem.correct_answer 
        ? normalizeAnswer(userAnswer) === normalizeAnswer(problem.correct_answer)
        : false;

      if (!problem.correct_answer) {
        toast({
          title: "Error",
          description: "This problem doesn't have a correct answer set.",
          variant: "destructive",
        });
        return;
      }

      // Submit attempt
      const { data: attemptData, error: attemptError } = await supabase.functions.invoke(
        'submit_attempt',
        {
          body: {
            user_id: user.id,
            problem_id: problem.id,
            is_correct: isCorrect,
            user_answer: userAnswer,
          }
        }
      );

      if (attemptError) throw attemptError;

      setResultData({
        ...attemptData,
        isCorrect,
      });
      setShowResultModal(true);
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 animate-pulse max-w-3xl mx-auto">
            <div className="h-8 bg-muted rounded w-3/4 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2 mb-8" />
            <div className="h-32 bg-muted rounded" />
          </Card>
        </main>
      </div>
    );
  }

  if (!problem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/practice')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Practice
          </Button>

          {/* Problem Card */}
          <Card className="p-8 rounded-3xl shadow-elevated border-2">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {problem.subject}
                  </Badge>
                  <Badge className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    Rating: {problem.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">Problem Statement</h3>
              <p className="text-foreground whitespace-pre-wrap">{problem.statement}</p>
            </div>

            <div className="border-t border-border pt-6">
              <Label htmlFor="answer" className="text-base font-semibold mb-3 block">
                Your Answer
              </Label>
              <Textarea
                id="answer"
                placeholder="Enter your solution here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="min-h-32 resize-none mb-4"
              />

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="w-full sm:w-auto text-lg"
              >
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Submit Result Modal */}
      {resultData && (
        <SubmitResultModal
          isOpen={showResultModal}
          onClose={() => {
            setShowResultModal(false);
            if (resultData.isCorrect) {
              navigate('/practice');
            }
          }}
          isCorrect={resultData.isCorrect}
          delta={resultData.delta}
          ratingBefore={resultData.rating_before}
          ratingAfter={resultData.rating_after}
          streakDays={resultData.streak_days}
          onNextProblem={() => navigate('/practice')}
        />
      )}
    </div>
  );
};

export default PracticeDetail;
