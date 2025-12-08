import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Lightbulb, Moon, Sun } from "lucide-react";
import { SubjectSelector } from "@/components/SubjectSelector";
import { MathInput } from "@/components/MathInput";
import { ExplanationDisplay } from "@/components/ExplanationDisplay";
import { SimilarProblemsDisplay } from "@/components/SimilarProblemsDisplay";
import { ExplanationSkeleton } from "@/components/ExplanationSkeleton";
import { HistoryPanel, HistoryItem } from "@/components/HistoryPanel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";

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

interface SimilarProblem {
  problem: string;
  solution?: string;
  steps?: string;
  subject?: string;
  answer?: string;
}

const Index = () => {
  const [subject, setSubject] = useState("Math");
  const [problemText, setProblemText] = useState("");
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [similarProblems, setSimilarProblems] = useState<SimilarProblem[]>([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('classmate-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save to history
  const addToHistory = (newExplanation: ExplanationResult) => {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      subject,
      problem: problemText,
      timestamp: Date.now(),
      simplified_problem: newExplanation.simplified_problem
    };

    const newHistory = [historyItem, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('classmate-history', JSON.stringify(newHistory));
  };

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

      // Check if AI returned an error
      if (data.error) {
        toast({
          title: "Invalid Input",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setExplanation(data);
      addToHistory(data);
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

  const loadHistoryItem = (item: HistoryItem) => {
    setSubject(item.subject);
    setProblemText(item.problem);
    // Optionally auto-explain when loading from history
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('classmate-history');
    toast({
      title: "History Cleared",
      description: "All history items have been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="mx-auto max-w-[850px] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ClassMate AI</h1>
                  <p className="text-sm text-muted-foreground">Your Smart Classmate</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10 rounded-xl"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 sm:py-12 flex-1">
          <div className="mx-auto max-w-[850px] space-y-8">
            {/* Input Section */}
            <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
              <div className="space-y-5">
                <SubjectSelector value={subject} onChange={setSubject} />
                <MathInput value={problemText} onChange={setProblemText} />
                
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

            {/* Loading Skeleton */}
            {isExplaining && <ExplanationSkeleton />}

            {/* Explanation Display */}
            {explanation && !isExplaining && <ExplanationDisplay explanation={explanation} />}

            {/* Similar Problems Display */}
            {similarProblems.length > 0 && (
              <SimilarProblemsDisplay problems={similarProblems} originalProblem={problemText} />
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

      {/* History Panel */}
      <HistoryPanel
        history={history}
        onLoadItem={loadHistoryItem}
        onClearHistory={clearHistory}
      />
    </div>
  );
};

export default Index;
