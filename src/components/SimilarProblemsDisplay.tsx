import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface SimilarProblemsDisplayProps {
  problems: {
    problem: string;
    answer: string;
    difficulty?: string;
  }[];
}

const getDifficultyVariant = (difficulty?: string): "default" | "secondary" | "destructive" => {
  if (difficulty === 'easy') return 'default';
  if (difficulty === 'hard') return 'destructive';
  return 'secondary';
};

export const SimilarProblemsDisplay = ({ problems }: SimilarProblemsDisplayProps) => {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const toggleAnswer = (index: number) => {
    setExpandedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
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
              const isExpanded = expandedIndices.has(index);
              const difficulty = problem.difficulty || 'medium';
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-xl border border-border bg-white dark:bg-neutral-800 p-5 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-hover)] cursor-pointer"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      Practice Problem #{index + 1}
                    </Badge>
                    <Badge variant={getDifficultyVariant(difficulty)} className="text-xs">
                      {difficulty.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="mb-4 text-sm text-foreground leading-relaxed">{problem.problem}</p>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAnswer(index)}
                    className="w-full justify-between group-hover:border-primary/40 transition-colors"
                  >
                    <span className="text-xs font-semibold">
                      {isExpanded ? 'Hide Answer' : 'Show Answer'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-lg bg-accent/5 border border-accent/20 p-3">
                          <p className="text-xs font-semibold text-accent mb-1.5">Answer:</p>
                          <p className="text-sm text-foreground leading-relaxed">{problem.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
