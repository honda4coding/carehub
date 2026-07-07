import React from "react";
import { LuHardDrive, LuTrash2 } from "react-icons/lu";
import { Card } from "@/components/ui/Card";

interface KBInfo {
  sizeMB: string;
  activeDb: string;
  databases: string[];
}

interface KBStorageInfoProps {
  info: KBInfo | null;
  loading: boolean;
  switchingDb: boolean;
  creatingDb: boolean;
  onSwitchDatabase: (dbName: string) => void;
  onCreateDatabase: () => void;
  onClearDB: () => void;
}

export default function KBStorageInfo({
  info,
  loading,
  switchingDb,
  creatingDb,
  onSwitchDatabase,
  onCreateDatabase,
  onClearDB,
}: KBStorageInfoProps) {
  return (
    <Card className="p-0 overflow-hidden border border-[hsl(var(--color-border))]">
      <div className="p-4 bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border))] font-bold text-xs uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-2">
        <LuHardDrive className="text-base" /> Storage Information
      </div>
      <div className="p-5 flex flex-col gap-5">
        {/* Size */}
        <div>
          <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1.5">
            Vector DB Size
          </p>
          <div className="text-xl md:text-2xl font-black text-[hsl(var(--color-text))]">
            {loading ? "..." : (
              info?.sizeMB?.includes("N/A") || info?.sizeMB === "Cloud Storage" ? (
                <span className="text-lg">Cloud Storage</span>
              ) : (
                <>
                  {info?.sizeMB}{" "}
                  <span className="text-sm font-bold text-[hsl(var(--color-text-muted))]">MB</span>
                </>
              )
            )}
          </div>
        </div>

        {/* Active DB */}
        <div>
          <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1.5">
            Active Database
          </p>
          <div className="bg-[hsl(var(--color-bg-soft))] p-2.5 rounded-xl border border-[hsl(var(--color-border))] text-sm font-bold text-[hsl(var(--color-primary))] flex items-center gap-2">
            <LuHardDrive className="text-base shrink-0" />{" "}
            <span className="truncate">{loading ? "..." : info?.activeDb}</span>
          </div>
        </div>

        <hr className="border-[hsl(var(--color-border))]" />

        {/* Switch DB */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-[hsl(var(--color-text-muted))]">
            Switch Database
          </p>
          <select
            value={info?.activeDb || ""}
            onChange={(e) => onSwitchDatabase(e.target.value)}
            disabled={switchingDb || loading}
            className="w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] text-[hsl(var(--color-text))] text-sm rounded-xl px-3 py-2.5 outline-none focus:border-primary transition-colors cursor-pointer font-bold disabled:opacity-60 disabled:pointer-events-none appearance-none"
          >
            {info?.databases?.map((db) => (
               <option key={db} value={db}>
                 {db}
               </option>
            ))}
          </select>
          <button
            onClick={onCreateDatabase}
            disabled={creatingDb || loading}
            className="w-full bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            {creatingDb ? "Creating..." : "Create New Database"}
          </button>
        </div>

        <hr className="border-[hsl(var(--color-border))]" />

        {/* Clear DB */}
        <div>
          <button
            onClick={onClearDB}
            className="w-full bg-[hsl(var(--color-danger)/0.1)] hover:bg-[hsl(var(--color-danger)/0.15)] border border-[hsl(var(--color-danger)/0.2)] text-[hsl(var(--color-danger))] font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LuTrash2 className="text-base shrink-0" /> Clear Database
          </button>
        </div>
      </div>
    </Card>
  );
}
