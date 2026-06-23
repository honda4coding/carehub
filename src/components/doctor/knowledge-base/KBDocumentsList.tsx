import React from "react";
import { LuFileText, LuLoader, LuTrash2 } from "react-icons/lu";
import { Card } from "@/components/ui/Card";

interface KBDocumentsListProps {
  files: string[] | undefined;
  loading: boolean;
  onDelete: (fileName: string) => void;
}

export default function KBDocumentsList({
  files,
  loading,
  onDelete,
}: KBDocumentsListProps) {
  return (
    <Card className="p-0 overflow-hidden border border-[hsl(var(--color-border))] h-full flex flex-col">
      <div className="p-4 bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border))] font-bold text-xs uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-2">
        <LuFileText className="text-base" /> Uploaded Documents
      </div>

      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-[hsl(var(--color-text-muted))] flex-1">
            <LuLoader className="animate-spin text-3xl mb-3" />
            <p className="text-sm font-bold">Loading documents...</p>
          </div>
        ) : !files || files.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-[hsl(var(--color-text-muted))] text-center flex-1">
            <LuFileText className="text-5xl mb-4 opacity-20" />
            <p className="text-base font-bold">No documents found.</p>
            <p className="text-sm mt-1">
              Upload a PDF or text document to train your Clinical Assistant.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[hsl(var(--color-border-soft))]">
            {files.map((file, idx) => (
              <li
                key={idx}
                className="p-4 flex items-center justify-between hover:bg-[hsl(var(--color-bg-soft))] transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0">
                    <LuFileText className="text-lg" />
                  </div>
                  <p className="text-sm font-bold text-[hsl(var(--color-text))] break-all">
                    {file}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(file)}
                  className="w-9 h-9 rounded-xl bg-[hsl(var(--color-danger)/0.1)] text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.2)] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  title="Remove from Knowledge Base"
                >
                  <LuTrash2 className="text-base" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
