import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProblemInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ProblemInput = ({ value, onChange }: ProblemInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="problem">Your Problem</Label>
      <Textarea
        id="problem"
        placeholder="Enter your problem here... For example: 'Solve the quadratic equation x² + 5x + 6 = 0'"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-32 resize-none bg-background"
      />
    </div>
  );
};
