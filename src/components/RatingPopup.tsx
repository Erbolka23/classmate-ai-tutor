import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Award, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  delta: number;
  ratingBefore: number;
  ratingAfter: number;
  totalRating: number;
  subjectRating: number;
  streakDays: number;
  solvedCount: number;
}

export const RatingPopup = ({
  isOpen,
  onClose,
  delta,
  ratingBefore,
  ratingAfter,
  totalRating,
  subjectRating,
  streakDays,
  solvedCount,
}: RatingPopupProps) => {
  const isPositive = delta > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card rounded-2xl shadow-[var(--shadow-elevated)] p-8 mx-4">
              {/* Rating Change */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-4 ${
                    isPositive 
                      ? "bg-primary/10 text-primary" 
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : (
                    <TrendingDown className="h-6 w-6" />
                  )}
                  <span className="text-3xl font-bold">
                    {isPositive ? "+" : ""}{delta}
                  </span>
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {isPositive ? "Great Job!" : "Keep Trying!"}
                </h2>
                <p className="text-muted-foreground">
                  {isPositive 
                    ? "Your rating has increased!" 
                    : "Don't give up, practice makes perfect!"}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-accent/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Subject Rating</p>
                  <p className="text-2xl font-bold text-foreground">
                    {ratingBefore} → {ratingAfter}
                  </p>
                </div>

                <div className="bg-accent/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Rating</p>
                  <p className="text-2xl font-bold text-foreground">{totalRating}</p>
                </div>

                <div className="bg-accent/50 rounded-xl p-4 flex items-center gap-3">
                  <Flame className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-xl font-bold text-foreground">{streakDays} days</p>
                  </div>
                </div>

                <div className="bg-accent/50 rounded-xl p-4 flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Solved</p>
                    <p className="text-xl font-bold text-foreground">{solvedCount}</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button onClick={onClose} className="w-full">
                Continue Learning
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
