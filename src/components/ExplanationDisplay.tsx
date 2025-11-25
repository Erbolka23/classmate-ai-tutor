import { useState } from "react";
import { ChevronDown, ChevronUp, Brain, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface ExplanationDisplayProps {
  explanation: {
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
  };
}

// Helper to detect and render LaTeX
const renderTextWithLatex = (text: string) => {
  // Split by $$ for block math and $ for inline math
  const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/);
  
  return blockParts.map((part, idx) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const formula = part.slice(2, -2);
      return <BlockMath key={idx} math={formula} />;
    }
    
    // Check for inline math
    const inlineParts = part.split(/(\$[^\$]+?\$)/);
    return inlineParts.map((inlinePart, inlineIdx) => {
      if (inlinePart.startsWith('$') && inlinePart.endsWith('$')) {
        const formula = inlinePart.slice(1, -1);
        return <InlineMath key={`${idx}-${inlineIdx}`} math={formula} />;
      }
      return <span key={`${idx}-${inlineIdx}`}>{inlinePart}</span>;
    });
  });
};

export const ExplanationDisplay = ({ explanation }: ExplanationDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const detectLanguage = (text: string) => {
    const russianChars = (text.match(/[а-яА-ЯёЁ]/g) || []).length;
    return russianChars > text.length * 0.3 ? "ru" : "en";
  };

  const lang = detectLanguage(explanation.final_answer);
  const quickAnswerLabel = lang === "ru" ? "Быстрый ответ" : "Quick Answer";
  const showFullLabel = lang === "ru" ? "Показать полное объяснение ↓" : "Show Full Explanation ↓";
  const hideLabel = lang === "ru" ? "Скрыть объяснение ↑" : "Hide Explanation ↑";

  return (
    <div className="space-y-4">
      {/* Quick Answer Block */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/20">
                <Lightbulb className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  {quickAnswerLabel}
                </p>
                <p className="text-lg font-semibold text-foreground leading-relaxed break-words">
                  {renderTextWithLatex(explanation.final_answer)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toggle Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="w-full h-11 text-sm font-medium hover:bg-accent/10 transition-colors"
        >
          {isExpanded ? hideLabel : showFullLabel}
          {isExpanded ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </motion.div>

      {/* Collapsible Full Explanation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-6 overflow-hidden"
          >
            {/* Merged Explanation Block (Problem + Steps) */}
            <Card className="border-border bg-card shadow-md hover:shadow-lg transition-shadow rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl font-semibold">
                    {lang === "ru" ? "Объяснение" : "Explanation"}
                  </CardTitle>
                  <div className="flex gap-2 shrink-0">
                    {explanation.difficulty && (
                      <Badge
                        variant={
                          explanation.difficulty === "easy"
                            ? "default"
                            : explanation.difficulty === "medium"
                            ? "secondary"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {explanation.difficulty.toUpperCase()}
                      </Badge>
                    )}
                    {explanation.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {explanation.confidence}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Simplified Problem */}
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-foreground leading-relaxed text-base">
                    {renderTextWithLatex(explanation.simplified_problem)}
                  </p>
                </div>

                {/* Steps */}
                <ol className="space-y-5">
                  {explanation.steps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-foreground leading-relaxed text-base pt-0.5">
                        {renderTextWithLatex(step.replace(/^\d+\.\s*/, ""))}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Substeps - Enhanced Visual Split */}
            {explanation.substeps && explanation.substeps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground px-1">
                  {lang === "ru" ? "Подзадачи" : "Sub-Problems"}
                </h3>
                <div className="grid gap-4">
                  {explanation.substeps.map((substep, subIndex) => (
                    <Card
                      key={subIndex}
                      className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md rounded-xl"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary text-sm font-bold">
                            {subIndex + 1}
                          </div>
                          <CardTitle className="text-lg font-semibold">
                            {renderTextWithLatex(substep.title)}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ol className="space-y-3">
                          {substep.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex gap-3 text-sm">
                              <span className="text-muted-foreground font-medium shrink-0">
                                {subIndex + 1}.{stepIndex + 1}
                              </span>
                              <p className="flex-1 text-foreground leading-relaxed">
                                {renderTextWithLatex(step)}
                              </p>
                            </li>
                          ))}
                        </ol>
                        <div className="pt-3 mt-3 border-t border-border/50">
                          <div className="flex items-start gap-2 p-3 bg-background/50 rounded-lg">
                            <span className="text-xs font-semibold text-accent uppercase tracking-wide shrink-0 pt-0.5">
                              {lang === "ru" ? "Результат:" : "Result:"}
                            </span>
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                              {renderTextWithLatex(substep.result)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Key Concept */}
            {explanation.key_concept && (
              <Card className="border-border bg-card shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {lang === "ru" ? "Ключевая концепция" : "Key Concept"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed text-base">
                    {renderTextWithLatex(explanation.key_concept)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Common Mistakes */}
            {explanation.common_mistakes && explanation.common_mistakes.length > 0 && (
              <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-md hover:shadow-lg transition-shadow rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {lang === "ru" ? "Частые ошибки" : "Common Mistakes to Avoid"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {explanation.common_mistakes.map((mistake, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-destructive font-semibold text-lg leading-none">•</span>
                        <p className="flex-1 text-foreground leading-relaxed text-base">
                          {renderTextWithLatex(mistake)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
