import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SimilarProblemsDisplayProps {
  problems: {
    problem: string;
    answer: string;
  }[];
}

export const SimilarProblemsDisplay = ({ problems }: SimilarProblemsDisplayProps) => {
  return (
    <div className="animate-in fade-in-50 duration-500">
      <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold">Practice Problems</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {problems.map((problem, index) => (
              <div 
                key={index} 
                className="group rounded-xl border border-border bg-muted/30 p-5 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)] hover:bg-card"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    Problem {index + 1}
                  </Badge>
                </div>
                <p className="mb-4 text-sm text-foreground leading-relaxed">{problem.problem}</p>
                <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                  <p className="text-xs font-semibold text-accent mb-1.5">Answer:</p>
                  <p className="text-sm text-foreground leading-relaxed">{problem.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
