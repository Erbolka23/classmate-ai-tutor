import { useState } from "react";
import { History, X, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

export interface HistoryItem {
  id: string;
  subject: string;
  problem: string;
  timestamp: number;
  simplified_problem: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryPanelContent = ({ history, onLoadItem, onClearHistory }: HistoryPanelProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-4 border-b dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">History</h3>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="h-8 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        <AnimatePresence>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No history yet</p>
            </motion.div>
          ) : (
            history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-3 cursor-pointer hover:shadow-md transition-all hover:border-primary/40 bg-white dark:bg-neutral-800 border dark:border-neutral-700"
                  onClick={() => onLoadItem(item)}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.subject}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(item.timestamp).toLocaleDateString('ru-RU', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                    {item.problem.substring(0, 80)}
                    {item.problem.length > 80 ? '...' : ''}
                  </p>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const HistoryPanel = ({ history, onLoadItem, onClearHistory }: HistoryPanelProps) => {
  return (
    <>
      {/* Desktop: Fixed sidebar */}
      <div className="hidden lg:block w-72 border-l dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <HistoryPanelContent
          history={history}
          onLoadItem={onLoadItem}
          onClearHistory={onClearHistory}
        />
      </div>

      {/* Mobile: Sheet (drawer) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <History className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 p-6">
            <SheetHeader className="mb-4">
              <SheetTitle>History</SheetTitle>
            </SheetHeader>
            <HistoryPanelContent
              history={history}
              onLoadItem={onLoadItem}
              onClearHistory={onClearHistory}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
