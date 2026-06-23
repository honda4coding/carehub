import React, { useRef } from "react";
import { LuBrainCircuit, LuLoader, LuUpload } from "react-icons/lu";

interface KBHeaderProps {
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function KBHeader({ uploading, onFileUpload }: KBHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[hsl(var(--color-bg-surface))] p-6 rounded-2xl border border-[hsl(var(--color-border))]">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-[hsl(var(--color-text))] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--color-primary)/0.1)] text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0">
            <LuBrainCircuit />
          </div>
          My Knowledge Base
        </h1>
        <p className="text-[hsl(var(--color-text-muted))] text-sm mt-1">
          Manage the documents your Clinical Assistant learns from.
        </p>
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.2)] text-[hsl(var(--color-primary))] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 justify-center cursor-pointer disabled:opacity-60 disabled:pointer-events-none flex-1 md:flex-auto"
        >
          {uploading ? <LuLoader className="animate-spin text-base" /> : <LuUpload className="text-base" />}
          Upload File(s)
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            onFileUpload(e);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          accept=".pdf,.txt,.docx"
          multiple
        />

        <button
          onClick={() => {
            document.getElementById("folderUploadInput")?.click();
          }}
          disabled={uploading}
          className="bg-[hsl(var(--color-primary))] hover:opacity-90 text-[hsl(var(--color-text-inverse))] px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity flex items-center gap-2 justify-center cursor-pointer disabled:opacity-60 disabled:pointer-events-none flex-1 md:flex-auto"
        >
          {uploading ? <LuLoader className="animate-spin text-base" /> : <LuUpload className="text-base" />}
          Upload Folder
        </button>
        <input
          id="folderUploadInput"
          type="file"
          className="hidden"
          onChange={(e) => {
            onFileUpload(e);
            const el = document.getElementById("folderUploadInput") as HTMLInputElement;
            if (el) el.value = "";
          }}
          accept=".pdf,.txt,.docx"
          multiple
          {...({ webkitdirectory: "", directory: "" } as any)}
        />
      </div>
    </div>
  );
}
