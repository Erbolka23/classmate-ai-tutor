import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

const SkeletonPulse = ({ className }: { className?: string }) => (
  <motion.div
    className={`bg-gradient-to-r from-muted via-muted/50 to-muted rounded ${className}`}
    animate={{
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }}
    style={{
      backgroundSize: '200% 100%'
    }}
  />
);

export const ExplanationSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Problem Breakdown Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border bg-card rounded-2xl shadow-[var(--shadow-card)]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-10 w-10 rounded-xl" />
              <SkeletonPulse className="h-6 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <SkeletonPulse className="h-4 w-full" />
              <SkeletonPulse className="h-4 w-4/5" />
              <SkeletonPulse className="h-4 w-3/5" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Steps Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-border bg-card rounded-2xl shadow-[var(--shadow-card)]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-10 w-10 rounded-xl" />
              <SkeletonPulse className="h-6 w-56" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <SkeletonPulse className="h-7 w-7 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonPulse className="h-4 w-full" />
                    <SkeletonPulse className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Final Answer Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl shadow-[var(--shadow-elevated)]">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <SkeletonPulse className="h-10 w-10 rounded-xl" />
              <SkeletonPulse className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <SkeletonPulse className="h-6 w-2/3" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
