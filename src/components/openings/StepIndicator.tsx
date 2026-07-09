"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      {steps.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <motion.div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                transition-all duration-300
                ${
                  isCompleted
                    ? "bg-red-500 text-noir-950"
                    : isCurrent
                    ? "bg-red-500/20 text-red-400 border-2 border-red-500"
                    : "bg-noir-800 text-noir-500 border border-noir-600"
                }
              `}
              animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isCompleted ? <Check size={14} /> : i + 1}
            </motion.div>

            {/* Label */}
            <span
              className={`ml-2 text-xs font-medium hidden sm:inline ${
                isCurrent
                  ? "text-red-400"
                  : isCompleted
                  ? "text-noir-200"
                  : "text-noir-500"
              }`}
            >
              {label}
            </span>

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div className="flex-1 mx-3 h-[2px] rounded-full overflow-hidden bg-noir-700">
                <motion.div
                  className="h-full bg-red-500"
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
