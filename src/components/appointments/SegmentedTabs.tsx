interface Tab {
  value: string;
  label: string;
  count?: number;
}

export default function SegmentedTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-[hsl(var(--color-bg-soft))] p-1 rounded-xl">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all duration-150 flex items-center gap-1.5 ${
              isActive
                ? "bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] "
                : "text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={`text-[10px] font-bold px-1.5 rounded-full ${
                  isActive
                    ? "bg-[hsl(var(--color-badge-bg))] text-[hsl(var(--color-badge-text))]"
                    : "bg-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
