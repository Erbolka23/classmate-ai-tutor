import { useState } from "react";
import { BookOpen, Sparkles, Lightbulb } from "lucide-react";
import { SubjectSelector } from "@/components/SubjectSelector";
import { ProblemInput } from "@/components/ProblemInput";
import { ExplanationDisplay } from "@/components/ExplanationDisplay";
import { SimilarProblemsDisplay } from "@/components/SimilarProblemsDisplay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExplanationResult {
  simplified_problem: string;
  steps: string[];
  final_answer: string;
}

interface SimilarProblem {
  problem: string;
  answer: string;
}

const Index = () => {
  const [subject, setSubject] = useState("Math");
  const [problemText, setProblemText] = useState("");
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [similarProblems, setSimilarProblems] = useState<SimilarProblem[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
    setSimilarProblems([]);

    try {
      const { data, error } = await supabase.functions.invoke('explain', {
        body: { subject, problem_text: problemText }
      });

      if (error) throw error;

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

  const handleGenerateSimilar = async () => {
    if (!problemText.trim()) {
      toast({
        title: "Problem Required",
        description: "Please enter a problem first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setSimilarProblems([]);

    try {
      const { data, error } = await supabase.functions.invoke('similar', {
        body: { subject, problem_text: problemText }
      });

      if (error) throw error;

      setSimilarProblems(data.problems || []);
      toast({
        title: "Practice Problems Ready! 📚",
        description: `Generated ${data.problems?.length || 0} similar problems for practice.`,
      });
    } catch (error: any) {
      console.error('Error generating similar problems:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate similar problems. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="mx-auto max-w-[850px] flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ClassMate AI</h1>
              <p className="text-sm text-muted-foreground">Your Smart Classmate</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-[850px] space-y-8">
          {/* Input Section */}
          <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <div className="space-y-5">
              <SubjectSelector value={subject} onChange={setSubject} />
              <ProblemInput value={problemText} onChange={setProblemText} />
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleExplain}
                  disabled={isExplaining}
                  className="flex-1 sm:flex-none"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isExplaining ? "Explaining..." : "Explain Step by Step"}
                </Button>
                
                {explanation && (
                  <Button 
                    onClick={handleGenerateSimilar}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate Similar Problems"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Explanation Display */}
          {explanation && <ExplanationDisplay explanation={explanation} />}

          {/* Similar Problems Display */}
          {similarProblems.length > 0 && (
            <SimilarProblemsDisplay problems={similarProblems} />
          )}

          {/* Empty State */}
          {!explanation && !isExplaining && (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/40 p-12 sm:p-16 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">Ready to Learn!</h3>
              <p className="text-muted-foreground">
                Enter a problem above and click "Explain Step by Step" to get started.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
