import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Atom, Code } from "lucide-react";

interface SubjectSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const subjects = [
  { value: "Math", icon: Calculator, label: "Mathematics" },
  { value: "Physics", icon: Atom, label: "Physics" },
  { value: "Programming", icon: Code, label: "Programming" },
];

export const SubjectSelector = ({ value, onChange }: SubjectSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="subject">Subject</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="subject" className="bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {subjects.map(({ value, icon: Icon, label }) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
