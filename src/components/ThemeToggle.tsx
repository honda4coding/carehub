"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { LuMoon, LuSun } from "react-icons/lu";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-7 h-7" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-7 h-7 rounded-lg bg-slate-800/50 text-slate-400 flex items-center justify-center hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
      title="Toggle Theme"
    >
      {theme === "dark" ? <LuSun className="text-[13px]" /> : <LuMoon className="text-[13px]" />}
    </button>
  );
}
