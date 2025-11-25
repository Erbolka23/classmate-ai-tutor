import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface SubmitResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCorrect: boolean;
  delta: number;
  ratingBefore: number;
  ratingAfter: number;
  streakDays: number;
  onNextProblem?: () => void;
}

export const SubmitResultModal = ({
  isOpen,
  onClose,
  isCorrect,
  delta,
  ratingBefore,
  ratingAfter,
  streakDays,
  onNextProblem,
}: SubmitResultModalProps) => {
  useEffect(() => {
    if (isOpen && isCorrect && delta >= 20) {
      // Trigger confetti for big wins
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, isCorrect, delta]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`bg-card border-2 rounded-2xl p-8 max-w-md w-full shadow-2xl ${
            isCorrect ? 'border-primary' : 'border-destructive'
          }`}
        >
          <div className="text-center space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              {isCorrect ? (
                <div className="p-4 bg-primary/10 rounded-full">
                  <CheckCircle className="h-16 w-16 text-primary" />
                </div>
              ) : (
                <div className="p-4 bg-destructive/10 rounded-full">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
              )}
            </motion.div>

            {/* Title */}
            <div>
              <h2 className={`text-3xl font-bold mb-2 ${
                isCorrect ? 'text-primary' : 'text-destructive'
              }`}>
                {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
              </h2>
              <p className="text-muted-foreground">
                {isCorrect
                  ? 'Great job! Keep up the momentum.'
                  : 'Don\'t give up! Try again.'}
              </p>
            </div>

            {/* Rating Change */}
            <div className="py-4 px-6 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-center gap-2 mb-2">
                {delta > 0 ? (
                  <TrendingUp className="h-5 w-5 text-primary" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <span className={`text-4xl font-bold ${
                  delta > 0 ? 'text-primary' : 'text-destructive'
                }`}>
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {ratingBefore} → {ratingAfter}
              </div>
            </div>

            {/* Streak */}
            {isCorrect && (
              <div className="py-3 px-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <span className="text-orange-500 font-medium">
                  🔥 {streakDays} day streak!
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {!isCorrect && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
              )}
              <Button
                onClick={onNextProblem || onClose}
                className="flex-1"
              >
                {isCorrect ? 'Next Problem' : 'Back to Practice'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
