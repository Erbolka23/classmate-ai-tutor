import { useState } from "react";
import { Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { SubjectSelector } from "@/components/SubjectSelector";
import { ProblemInput } from "@/components/ProblemInput";
import { ExplanationDisplay } from "@/components/ExplanationDisplay";
import { ExplanationSkeleton } from "@/components/ExplanationSkeleton";
import { RatingPopup } from "@/components/RatingPopup";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExplanationResult {
  simplified_problem: string;
  steps: string[];
  final_answer: string;
  difficulty?: string;
  confidence?: string;
  key_concept?: string;
  common_mistakes?: string[];
  substeps?: Array<{
    title: string;
    steps: string[];
    result: string;
  }>;
  error?: string;
}

const Tutor = () => {
  const [subject, setSubject] = useState("Math");
  const [problemText, setProblemText] = useState("");
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratingData, setRatingData] = useState<any>(null);
  const { toast } = useToast();

  const handleExplain = async () => {
    if (!problemText.trim()) {
      toast({
        title: "Problem Required",
        description: "Please enter a problem to solve.",
        variant: "destructive",
      });
      return;
    }

    setIsExplaining(true);
    setExplanation(null);

    try {
      const { data, error } = await supabase.functions.invoke('explain', {
        body: { subject, problem_text: problemText }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Invalid Input",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setExplanation(data);
      toast({
        title: "Explanation Ready! 🎓",
        description: "Step-by-step solution generated successfully.",
      });
    } catch (error: any) {
      console.error('Error explaining problem:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleMarkAsSolved = async () => {
    if (!explanation) return;

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to earn ratings.",
          variant: "destructive",
        });
        return;
      }

      // Determine rating based on difficulty
      const difficultyRatingMap: { [key: string]: number } = {
        easy: 800 + Math.floor(Math.random() * 400),
        medium: 1400 + Math.floor(Math.random() * 400),
        hard: 1900 + Math.floor(Math.random() * 500),
      };

      const problemRating = difficultyRatingMap[explanation.difficulty?.toLowerCase() || 'medium'];

      // Create problem in database
      const { data: problemData, error: problemError } = await supabase
        .from('problems')
        .insert({
          subject: subject.toLowerCase(),
          title: explanation.simplified_problem.substring(0, 100),
          statement: problemText,
          difficulty: explanation.difficulty?.toLowerCase() || 'medium',
          rating: problemRating,
          source: 'ai',
          created_by: user.id,
        })
        .select()
        .single();

      if (problemError) throw problemError;

      // Submit attempt
      const { data: attemptData, error: attemptError } = await supabase.functions.invoke(
        'submit_attempt',
        {
          body: {
            user_id: user.id,
            problem_id: problemData.id,
            is_correct: true,
            user_answer: explanation.final_answer,
          }
        }
      );

      if (attemptError) throw attemptError;

      setRatingData(attemptData);
      setShowRatingPopup(true);

      toast({
        title: "Success! 🎉",
        description: `Rating ${attemptData.delta > 0 ? '+' : ''}${attemptData.delta}`,
      });
    } catch (error: any) {
      console.error('Error marking as solved:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-[850px] space-y-8">
          {/* Input Section */}
          <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <div className="space-y-5">
              <SubjectSelector value={subject} onChange={setSubject} />
              <ProblemInput value={problemText} onChange={setProblemText} />
              
              <Button 
                onClick={handleExplain}
                disabled={isExplaining}
                className="w-full sm:w-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isExplaining ? "Explaining..." : "Explain Step by Step"}
              </Button>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isExplaining && <ExplanationSkeleton />}

          {/* Explanation Display */}
          {explanation && !isExplaining && (
            <>
              <ExplanationDisplay explanation={explanation} />
              
              {/* Action Buttons */}
              <div className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Did you understand the solution?
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleMarkAsSolved}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Mark as Solved → Earn Rating"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setExplanation(null);
                      setProblemText("");
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Not Solved
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Rating Popup */}
      {ratingData && (
        <RatingPopup
          isOpen={showRatingPopup}
          onClose={() => setShowRatingPopup(false)}
          delta={ratingData.delta}
          ratingBefore={ratingData.rating_before}
          ratingAfter={ratingData.rating_after}
          totalRating={ratingData.total_rating}
          subjectRating={ratingData.subject_rating}
          streakDays={ratingData.streak_days}
          solvedCount={ratingData.solved_count}
        />
      )}
    </div>
  );
};

export default Tutor;
