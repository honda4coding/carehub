"use client";

import { LuUser, LuLock } from "react-icons/lu";

export type ProfileTab = "info" | "security";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: "info", label: "Profile Info", icon: <LuUser className="w-4 h-4" /> },
  { id: "security", label: "Security", icon: <LuLock className="w-4 h-4" /> },
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl mb-6 w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold transition-all duration-150 ${
              isActive
                ? "bg-white text-[hsl(var(--color-primary-strong))] shadow-sm"
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
