import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Superscript,
  SquareRadical,
  Divide,
  Pi,
  ChevronLeft,
  ChevronRight,
  Keyboard,
} from "lucide-react";

// MathLive types
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          ref?: React.RefObject<any>;
          "virtual-keyboard-mode"?: string;
          "smart-mode"?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  latex: string;
  tooltip: string;
}

const toolbarButtons: ToolbarButton[] = [
  { icon: <span className="font-mono text-sm">x²</span>, label: "x²", latex: "x^2", tooltip: "Square (x²)" },
  { icon: <span className="font-mono text-sm">xⁿ</span>, label: "xⁿ", latex: "x^{#0}", tooltip: "Power (xⁿ)" },
  { icon: <SquareRadical className="h-4 w-4" />, label: "√", latex: "\\sqrt{#0}", tooltip: "Square Root (√x)" },
  { icon: <span className="font-mono text-sm">ⁿ√</span>, label: "ⁿ√", latex: "\\sqrt[#0]{#0}", tooltip: "Nth Root" },
  { icon: <Divide className="h-4 w-4" />, label: "a/b", latex: "\\frac{#0}{#0}", tooltip: "Fraction (a/b)" },
  { icon: <span className="font-serif text-base">∫</span>, label: "∫", latex: "\\int_{#0}^{#0} #0 \\, dx", tooltip: "Integral (∫)" },
  { icon: <span className="font-serif text-base">∑</span>, label: "∑", latex: "\\sum_{#0}^{#0} #0", tooltip: "Summation (∑)" },
  { icon: <span className="font-serif text-base">∏</span>, label: "∏", latex: "\\prod_{#0}^{#0} #0", tooltip: "Product (∏)" },
  { icon: <span className="font-serif text-base">lim</span>, label: "lim", latex: "\\lim_{#0 \\to #0} #0", tooltip: "Limit" },
  { icon: <Pi className="h-4 w-4" />, label: "π", latex: "\\pi", tooltip: "Pi (π)" },
  { icon: <span className="font-serif italic">θ</span>, label: "θ", latex: "\\theta", tooltip: "Theta (θ)" },
  { icon: <span className="font-serif italic">α</span>, label: "α", latex: "\\alpha", tooltip: "Alpha (α)" },
  { icon: <span className="font-serif italic">β</span>, label: "β", latex: "\\beta", tooltip: "Beta (β)" },
  { icon: <span className="font-serif italic">γ</span>, label: "γ", latex: "\\gamma", tooltip: "Gamma (γ)" },
  { icon: <span className="font-serif italic">Δ</span>, label: "Δ", latex: "\\Delta", tooltip: "Delta (Δ)" },
  { icon: <span className="font-mono text-sm">≥</span>, label: "≥", latex: "\\geq", tooltip: "Greater or Equal (≥)" },
  { icon: <span className="font-mono text-sm">≤</span>, label: "≤", latex: "\\leq", tooltip: "Less or Equal (≤)" },
  { icon: <span className="font-mono text-sm">≠</span>, label: "≠", latex: "\\neq", tooltip: "Not Equal (≠)" },
  { icon: <span className="font-mono text-sm">±</span>, label: "±", latex: "\\pm", tooltip: "Plus-Minus (±)" },
  { icon: <span className="font-mono text-sm">∞</span>, label: "∞", latex: "\\infty", tooltip: "Infinity (∞)" },
  { icon: <span className="font-mono text-sm">|x|</span>, label: "|x|", latex: "\\left| #0 \\right|", tooltip: "Absolute Value |x|" },
  { icon: <span className="font-mono text-sm">()</span>, label: "()", latex: "\\left( #0 \\right)", tooltip: "Parentheses ( )" },
  { icon: <span className="font-mono text-sm">[]</span>, label: "[]", latex: "\\left[ #0 \\right]", tooltip: "Brackets [ ]" },
  { icon: <span className="font-mono text-sm">{"{}"}</span>, label: "{}", latex: "\\left\\{ #0 \\right\\}", tooltip: "Braces { }" },
  { icon: <span className="font-mono text-sm">log</span>, label: "log", latex: "\\log_{#0}(#0)", tooltip: "Logarithm" },
  { icon: <span className="font-mono text-sm">ln</span>, label: "ln", latex: "\\ln(#0)", tooltip: "Natural Log (ln)" },
  { icon: <span className="font-mono text-sm">sin</span>, label: "sin", latex: "\\sin(#0)", tooltip: "Sine" },
  { icon: <span className="font-mono text-sm">cos</span>, label: "cos", latex: "\\cos(#0)", tooltip: "Cosine" },
];

export const MathInput = ({
  value,
  onChange,
  placeholder = "Enter your problem here... For example: x² + 5x + 6 = 0",
}: MathInputProps) => {
  const mathFieldRef = useRef<any>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isMathMode, setIsMathMode] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load MathLive dynamically
  useEffect(() => {
    import("mathlive").then((mathlive) => {
      // Configure MathLive
      mathlive.MathfieldElement.soundsDirectory = null;
      setIsLoaded(true);
    });
  }, []);

  // Sync value with mathfield
  useEffect(() => {
    if (mathFieldRef.current && isLoaded) {
      const mf = mathFieldRef.current;
      if (mf.getValue && mf.getValue() !== value) {
        mf.setValue(value, { silenceNotifications: true });
      }
    }
  }, [value, isLoaded]);

  // Handle mathfield input changes
  useEffect(() => {
    if (!isLoaded) return;
    
    const mf = mathFieldRef.current;
    if (!mf) return;

    const handleInput = () => {
      if (mf.getValue) {
        const newValue = mf.getValue("latex");
        onChange(newValue);
      }
    };

    mf.addEventListener("input", handleInput);
    return () => {
      mf.removeEventListener("input", handleInput);
    };
  }, [onChange, isLoaded]);

  // Handle toolbar scroll arrows visibility
  const updateScrollArrows = () => {
    if (toolbarRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = toolbarRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (toolbar) {
      toolbar.addEventListener("scroll", updateScrollArrows);
      updateScrollArrows();
      return () => toolbar.removeEventListener("scroll", updateScrollArrows);
    }
  }, []);

  const scrollToolbar = (direction: "left" | "right") => {
    if (toolbarRef.current) {
      const scrollAmount = 200;
      toolbarRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const insertSymbol = (latex: string) => {
    const mf = mathFieldRef.current;
    if (mf && mf.executeCommand) {
      mf.executeCommand(["insert", latex]);
      mf.focus();
    }
  };

  const handlePlainTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="problem">Your Problem</Label>
          <button
            type="button"
            onClick={() => setIsMathMode(!isMathMode)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Keyboard className="h-3.5 w-3.5" />
            {isMathMode ? "Plain Text Mode" : "Math Mode"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isMathMode ? (
            <motion.div
              key="math-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Formula Toolbar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative"
              >
                {/* Left scroll arrow */}
                <AnimatePresence>
                  {showLeftArrow && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      type="button"
                      onClick={() => scrollToolbar("left")}
                      className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-gradient-to-r from-card via-card to-transparent"
                    >
                      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Toolbar */}
                <div
                  ref={toolbarRef}
                  className="flex gap-1 overflow-x-auto scrollbar-hide px-1 py-2 rounded-xl bg-muted/50 border border-border"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {toolbarButtons.map((btn, index) => (
                    <motion.div
                      key={btn.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => insertSymbol(btn.latex)}
                            className="flex-shrink-0 flex items-center justify-center h-9 min-w-[36px] px-2 rounded-lg bg-card text-foreground border border-transparent hover:border-primary/50 hover:bg-primary/10 hover:shadow-md transition-all duration-200 active:scale-95"
                          >
                            {btn.icon}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {btn.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  ))}
                </div>

                {/* Right scroll arrow */}
                <AnimatePresence>
                  {showRightArrow && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      type="button"
                      onClick={() => scrollToolbar("right")}
                      className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-8 bg-gradient-to-l from-card via-card to-transparent"
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* MathField Input */}
              <div className="relative">
                {isLoaded ? (
                  <math-field
                    ref={mathFieldRef}
                    virtual-keyboard-mode="off"
                    smart-mode="on"
                    className="w-full min-h-32 p-4 rounded-xl border border-input bg-background text-foreground text-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-all"
                    style={{
                      fontSize: "1.125rem",
                      lineHeight: "1.75",
                      outline: "none",
                    }}
                  />
                ) : (
                  <div className="w-full min-h-32 p-4 rounded-xl border border-input bg-background animate-pulse flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Loading math editor...</span>
                  </div>
                )}
                {!value && isLoaded && (
                  <div className="absolute top-4 left-4 pointer-events-none text-muted-foreground">
                    {placeholder}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="plain-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                id="problem"
                placeholder={placeholder}
                value={value}
                onChange={handlePlainTextChange}
                className="w-full min-h-32 p-4 rounded-xl border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint text */}
        <p className="text-xs text-muted-foreground">
          {isMathMode
            ? "Use the toolbar to insert math symbols, or type LaTeX directly."
            : "Type your problem in plain text format."}
        </p>
      </div>
    </TooltipProvider>
  );
};
