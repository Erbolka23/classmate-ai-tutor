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
    <div className="space-y-4 animate-in fade-in-50 duration-500">
      {/* Simplified Problem */}
      <Card className="border-primary/20 bg-card shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Problem Breakdown</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{explanation.simplified_problem}</p>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card className="border-accent/20 bg-card shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">Step-by-Step Solution</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {explanation.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <Badge className="mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  {index + 1}
                </Badge>
                <p className="flex-1 text-foreground leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Final Answer */}
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 shadow-[var(--shadow-elevated)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">Final Answer</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-foreground">{explanation.final_answer}</p>
        </CardContent>
      </Card>
    </div>
  );
};
