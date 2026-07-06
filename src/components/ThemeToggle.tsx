"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { LuMoon, LuSun, LuLeaf, LuWaves, LuSunset, LuFlower2, LuGem, LuCircle, LuZap, LuStar } from "react-icons/lu";

const THEMES = [
  { id: "light", label: "Light", icon: LuSun },
  { id: "dark", label: "Dark", icon: LuMoon },
  { id: "theme-nature", label: "Nature", icon: LuLeaf },
  { id: "theme-ocean", label: "Ocean", icon: LuWaves },
  { id: "theme-sunset", label: "Sunset", icon: LuSunset },
  { id: "theme-rose", label: "Rose", icon: LuFlower2 },
  { id: "theme-violet", label: "Violet", icon: LuGem },
  { id: "theme-monochrome", label: "Mono", icon: LuCircle },
  { id: "theme-cyberpunk", label: "Cyberpunk", icon: LuZap },
  { id: "theme-midnight", label: "Midnight", icon: LuStar },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl border border-transparent" />; // Placeholder
  }

  const activeTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  const ActiveIcon = activeTheme.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-primary-soft))] hover:text-[hsl(var(--color-primary))] text-[hsl(var(--color-text-muted))] transition-colors border border-[hsl(var(--color-border))] shrink-0 active:scale-95"
        aria-label="Toggle Theme"
        title={`Current Theme: ${activeTheme.label}`}
      >
        <ActiveIcon className="text-lg" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl shadow-2xl shadow-[hsl(var(--color-text-muted)/0.15)] z-50 overflow-hidden animate-slide-up">
          <div className="p-1 flex flex-col gap-0.5">
            {THEMES.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left
                    ${isActive 
                      ? "bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary-strong))] shadow-sm translate-x-1" 
                      : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-bg-soft))] hover:text-[hsl(var(--color-text))] hover:translate-x-0.5"
                    }`}
                >
                  <Icon className={`text-base ${isActive ? "text-[hsl(var(--color-primary))]" : "text-[hsl(var(--color-text-muted))]"}`} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
