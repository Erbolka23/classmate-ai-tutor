import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Check, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SimilarProblemsDisplayProps {
  problems: {
    problem: string;
    solution?: string;
    steps?: string;
    subject?: string;
    answer?: string;
  }[];
  originalProblem?: string;
}

// Enhanced normalize function for answer comparison
const normalize = (str: string): string => {
  return str
    .toString()
    .trim()
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\\div/g, '/')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .toLowerCase();
};

export const SimilarProblemsDisplay = ({ problems, originalProblem }: SimilarProblemsDisplayProps) => {
  const navigate = useNavigate();
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean | null>>({});
  const [checkedCount, setCheckedCount] = useState(0);

  const handleAnswerChange = (index: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [index]: value }));
  };

  const checkAnswer = (index: number, problem: SimilarProblemsDisplayProps['problems'][0]) => {
    const userAnswer = userAnswers[index] || '';
    const correctAnswer = problem.solution || problem.answer || '';
    const isCorrect = normalize(userAnswer) === normalize(correctAnswer);
    
    setResults(prev => {
      const newResults = { ...prev, [index]: isCorrect };
      // Count how many have been checked
      const checked = Object.values(newResults).filter(v => v !== null).length;
      setCheckedCount(checked);
      return newResults;
    });
  };

  const correctCount = Object.values(results).filter(r => r === true).length;
  const incorrectCount = Object.values(results).filter(r => r === false).length;
  const allChecked = checkedCount === problems.length;
  const hasIncorrect = incorrectCount > 0;

  const handlePracticeAgain = () => {
    navigate('/tutor', { state: { preload: originalProblem } });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">Practice Problems</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {problems.map((problem, index) => {
              const result = results[index];
              const isChecked = result !== undefined && result !== null;
              const correctAnswer = problem.solution || problem.answer || '';
              
              return (
                <div
                  key={index}
                  className={`group rounded-xl border p-5 transition-all hover:shadow-[var(--shadow-hover)] ${
                    result === true 
                      ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20' 
                      : result === false 
                        ? 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
                        : 'border-border bg-card hover:border-primary/40'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      Problem #{index + 1}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {problem.subject && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {problem.subject}
                        </Badge>
                      )}
                      {isChecked && (
                        result ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )
                      )}
                    </div>
                  </div>
                  
                  <p className="mb-4 text-sm text-foreground leading-relaxed">{problem.problem}</p>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Your answer..."
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        disabled={isChecked}
                        className={`flex-1 ${
                          result === true 
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                            : result === false 
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                              : ''
                        }`}
                      />
                      <Button
                        size="sm"
                        onClick={() => checkAnswer(index, problem)}
                        disabled={isChecked || !userAnswers[index]?.trim()}
                        className="shrink-0"
                      >
                        Check Answer
                      </Button>
                    </div>

                    {/* Correct */}
                    {result === true && (
                      <div className="mt-2 p-3 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-xl animate-fade-in font-medium">
                        ✓ Correct
                      </div>
                    )}
                    
                    {/* Incorrect */}
                    {result === false && (
                      <div className="mt-2 p-3 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-xl animate-fade-in font-medium">
                        ✗ Incorrect
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      {allChecked && (
        <Card className="border-border bg-card rounded-2xl animate-fade-in">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-lg font-semibold text-foreground">
                  {correctCount}/{problems.length} correct
                </p>
                <p className="text-sm text-muted-foreground">
                  {correctCount === problems.length 
                    ? "Perfect! You've mastered this concept!" 
                    : hasIncorrect 
                      ? "Keep practicing to improve!" 
                      : "Great work!"}
                </p>
              </div>
              
              {hasIncorrect && originalProblem && (
                <Button
                  onClick={handlePracticeAgain}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Practice Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
