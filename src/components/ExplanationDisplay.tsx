import { CheckCircle2, FileText, ListOrdered } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExplanationDisplayProps {
  explanation: {
    simplified_problem: string;
    steps: string[];
    final_answer: string;
  };
}

export const ExplanationDisplay = ({ explanation }: ExplanationDisplayProps) => {
  return (
    <div className="space-y-6">
      {/* Simplified Problem */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-2xl animate-fade-slide-in">
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

      {/* Steps */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-2xl animate-fade-slide-in animation-delay-150">
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

      {/* Final Answer */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 shadow-[var(--shadow-elevated)] rounded-2xl animate-fade-slide-in animation-delay-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-xl font-semibold text-accent">Final Answer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-foreground leading-relaxed">{explanation.final_answer}</p>
        </CardContent>
      </Card>
    </div>
  );
};
