"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-noir-800/50 animate-pulse border border-noir-700/50"></div>
    );
  }

  const currentIcon =
    theme === "system" ? (
      <Monitor size={18} />
    ) : theme === "dark" ? (
      <Moon size={18} />
    ) : (
      <Sun size={18} />
    );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-noir-300 hover:text-red-400 hover:bg-white/5 transition-colors focus:outline-none"
        aria-label="Toggle theme"
      >
        {currentIcon}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-36 rounded-xl border border-border-glass bg-noir-900 shadow-xl overflow-hidden z-50 p-1"
            >
              <button
                onClick={() => {
                  setTheme("light");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === "light"
                    ? "bg-red-500/10 text-red-500 font-medium"
                    : "text-noir-200 hover:bg-white/5 hover:text-noir-50"
                }`}
              >
                <Sun size={16} /> Light
              </button>
              <button
                onClick={() => {
                  setTheme("dark");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1 ${
                  theme === "dark"
                    ? "bg-red-500/10 text-red-500 font-medium"
                    : "text-noir-200 hover:bg-white/5 hover:text-noir-50"
                }`}
              >
                <Moon size={16} /> Dark
              </button>
              <button
                onClick={() => {
                  setTheme("system");
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mt-1 ${
                  theme === "system"
                    ? "bg-red-500/10 text-red-500 font-medium"
                    : "text-noir-200 hover:bg-white/5 hover:text-noir-50"
                }`}
              >
                <Monitor size={16} /> System
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
