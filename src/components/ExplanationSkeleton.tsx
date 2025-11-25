import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ExplanationSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Problem Breakdown Skeleton */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Skeleton */}
      <Card className="border-border bg-card shadow-[var(--shadow-card)] rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Answer Skeleton */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 shadow-[var(--shadow-elevated)] rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
};
