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
      <Card className="border-primary/20 bg-card shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Practice Problems</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {problems.map((problem, index) => (
              <div 
                key={index} 
                className="group rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50 hover:shadow-[var(--shadow-card)]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Problem {index + 1}
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-foreground">{problem.problem}</p>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Answer:</p>
                  <p className="text-sm text-foreground">{problem.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
