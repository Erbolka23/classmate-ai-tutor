import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Admin = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{
    processed: number;
    succeeded: number;
    failed: number;
  } | null>(null);

  const handleGenerateAnswers = async () => {
    setIsGenerating(true);
    setProgress(null);

    try {
      const { data, error } = await supabase.functions.invoke('fill_answers');

      if (error) {
        throw error;
      }

      setProgress({
        processed: data.processed || 0,
        succeeded: data.succeeded || 0,
        failed: data.failed || 0,
      });

      if (data.succeeded > 0) {
        toast({
          title: "Success!",
          description: `Generated ${data.succeeded} answers successfully!`,
        });
      }

      if (data.failed > 0) {
        toast({
          title: "Partial Success",
          description: `${data.failed} answers could not be generated.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error generating answers:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate answers.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Admin Panel
                </CardTitle>
                <CardDescription>
                  Manage problems and generate correct answers automatically using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Generate Correct Answers</h3>
                  <p className="text-sm text-muted-foreground">
                    This tool will automatically generate correct answers for all problems that don't have one yet.
                    It uses AI to solve each problem and stores the answer in the database.
                  </p>

                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleGenerateAnswers}
                      disabled={isGenerating}
                      size="lg"
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating Answers...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate All Answers
                        </>
                      )}
                    </Button>

                    {progress && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-muted rounded-lg space-y-3"
                      >
                        <h4 className="font-semibold">Results:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Processed:</span>
                            <span className="font-semibold">{progress.processed}</span>
                          </div>
                          <div className="flex items-center justify-between text-green-600">
                            <span className="text-sm flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Succeeded:
                            </span>
                            <span className="font-semibold">{progress.succeeded}</span>
                          </div>
                          <div className="flex items-center justify-between text-red-600">
                            <span className="text-sm flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              Failed:
                            </span>
                            <span className="font-semibold">{progress.failed}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold mb-2">How it works:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Finds all problems without correct answers</li>
                    <li>• Uses Lovable AI to solve each problem</li>
                    <li>• Processes up to 100 problems at a time</li>
                    <li>• Rate limited to 3 problems per second</li>
                    <li>• Automatically stores answers in the database</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
