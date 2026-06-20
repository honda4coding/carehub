"use client";

import { useState, ReactNode } from "react";
import { LuChevronDown, LuUser, LuHeart, LuActivity } from "react-icons/lu";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = {
  id:       string;
  icon:     ReactNode;
  label:    string;
  subtitle: string;
  content:  ReactNode;
};

// ─── Accordion Item ───────────────────────────────────────────────────────────
function AccordionItem({
  section,
  isOpen,
  onToggle,
}: {
  section: Section;
  isOpen:  boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden transition-shadow duration-200"
      style={{ boxShadow: isOpen ? "0 4px 24px hsl(var(--color-primary)/0.08)" : "none" }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors duration-150"
        style={{
          backgroundColor: isOpen
            ? "hsl(var(--color-primary)/0.05)"
            : "hsl(var(--color-bg-surface))",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Icon bubble */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150"
            style={{
              backgroundColor: isOpen
                ? "hsl(var(--color-primary)/0.15)"
                : "hsl(var(--color-bg-soft))",
              color: isOpen
                ? "hsl(var(--color-primary-strong))"
                : "hsl(var(--color-text-muted))",
            }}
          >
            {section.icon}
          </div>

          {/* Labels */}
          <div>
            <p
              className="text-[13px] font-bold leading-tight"
              style={{
                color: isOpen
                  ? "hsl(var(--color-primary-strong))"
                  : "hsl(var(--color-text))",
              }}
            >
              {section.label}
            </p>
            <p className="text-[11px] text-[hsl(var(--color-text-muted))] mt-0.5">
              {section.subtitle}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <LuChevronDown
          className="w-4 h-4 text-[hsl(var(--color-text-muted))] transition-transform duration-300 shrink-0"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Content — animated expand */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "2000px" : "0px", opacity: isOpen ? 1 : 0 }}
      >
        <div className="border-t border-[hsl(var(--color-border))]">
          {section.content}
        </div>
      </div>
    </div>
  );
}

// ─── Main Accordion ───────────────────────────────────────────────────────────
interface Props {
  personalForm:       ReactNode;
  medicalHistoryForm: ReactNode;
}

export default function ProfileAccordion({
  personalForm,
  medicalHistoryForm,
}: Props) {
  const [openSection, setOpenSection] = useState<string>("personal");

  const sections: Section[] = [
    {
      id:       "personal",
      icon:     <LuUser className="w-4 h-4" />,
      label:    "Personal Information",
      subtitle: "Name, contact details & demographics",
      content:  personalForm,
    },
    {
      id:       "medical",
      icon:     <LuHeart className="w-4 h-4" />,
      label:    "Medical History",
      subtitle: "Blood type, allergies, chronic conditions & surgeries",
      content:  medicalHistoryForm,
    },
  ];

  const toggle = (id: string) =>
    setOpenSection((prev) => (prev === id ? "" : id));

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <AccordionItem
          key={section.id}
          section={section}
          isOpen={openSection === section.id}
          onToggle={() => toggle(section.id)}
        />
      ))}
    </div>
  );
}
