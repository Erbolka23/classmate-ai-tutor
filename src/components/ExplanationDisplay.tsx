import { CheckCircle2, FileText, ListOrdered, Brain, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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

export const ExplanationDisplay = ({ explanation }: ExplanationDisplayProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Simplified Problem */}
      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Problem Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed text-base">{explanation.simplified_problem}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Steps */}
      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ListOrdered className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Step-by-Step Solution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-5">
              {explanation.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-foreground leading-relaxed text-base pt-0.5">{step.replace(/^\d+\.\s*/, '')}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>

      {/* Final Answer */}
      <motion.div variants={itemVariants}>
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 shadow-[var(--shadow-elevated)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-xl font-semibold text-accent">Final Answer</CardTitle>
              </div>
              <div className="flex gap-2">
                {explanation.difficulty && (
                  <Badge variant={
                    explanation.difficulty === 'easy' ? 'default' : 
                    explanation.difficulty === 'medium' ? 'secondary' : 
                    'destructive'
                  }>
                    {explanation.difficulty.toUpperCase()}
                  </Badge>
                )}
                {explanation.confidence && (
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {explanation.confidence}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground leading-relaxed">{explanation.final_answer}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Concept */}
      {explanation.key_concept && (
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">Key Concept</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed text-base">{explanation.key_concept}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Common Mistakes */}
      {explanation.common_mistakes && explanation.common_mistakes.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <CardTitle className="text-xl font-semibold">Common Mistakes to Avoid</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {explanation.common_mistakes.map((mistake, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-destructive font-semibold">•</span>
                    <p className="flex-1 text-foreground leading-relaxed text-base">{mistake}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Substeps */}
      {explanation.substeps && explanation.substeps.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Sub-Problems</h3>
          {explanation.substeps.map((substep, subIndex) => (
            <Card key={subIndex} className="border-border bg-card shadow-[var(--shadow-card)] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">{substep.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="space-y-2">
                  {substep.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-3 text-sm">
                      <span className="text-muted-foreground">{subIndex + 1}.{stepIndex + 1}</span>
                      <p className="flex-1 text-foreground">{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-muted-foreground">Result:</span> {substep.result}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
