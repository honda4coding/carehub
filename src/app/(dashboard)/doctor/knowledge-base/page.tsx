"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuBrainCircuit, LuTrash2, LuUpload, LuFileText, LuHardDrive, LuLoader } from "react-icons/lu";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface KBInfo {
  files: string[];
  sizeMB: string;
  path: string;
}

export default function KnowledgeBasePage() {
  const [info, setInfo] = useState<KBInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dbPathInput, setDbPathInput] = useState("");
  const [savingPath, setSavingPath] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchKBInfo = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ai/knowledge-base`, { headers: authHeaders() });
      setInfo(res.data?.data);
      // We assume res.data?.data?.path exists but the actual profile might be different.
      // But we will populate the input if it's empty so user sees current path.
      if (!dbPathInput && res.data?.data?.path) {
          setDbPathInput(res.data.data.path);
      }
    } catch (err) {
      console.error("Failed to fetch KB info", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKBInfo();
  }, []);

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Are you sure you want to remove ${fileName} from your AI Knowledge Base?`)) return;
    
    try {
      await axios.delete(`${BASE_URL}/ai/knowledge-base/${encodeURIComponent(fileName)}`, { headers: authHeaders() });
      fetchKBInfo(); // refresh
    } catch (err) {
      console.error(err);
      alert("Failed to delete file.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    try {
      await axios.post(`${BASE_URL}/ai/upload/bulk`, formData, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data"
        }
      });
      fetchKBInfo(); // refresh
    } catch (error: any) {
      console.error(error);
      alert(`Failed to upload files. ${error.response?.data?.message || ''}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearDB = async () => {
    if (!confirm("Are you sure you want to WIPE your entire Knowledge Base? This cannot be undone.")) return;
    
    try {
      await axios.delete(`${BASE_URL}/ai/knowledge-base/clear`, { headers: authHeaders() });
      fetchKBInfo(); // refresh
    } catch (err) {
      console.error(err);
      alert("Failed to clear database.");
    }
  };

  const handleSavePath = async () => {
    if (!dbPathInput.trim()) return;
    setSavingPath(true);
    try {
      await axios.put(`${BASE_URL}/ai/knowledge-base/settings`, { vectorDbPath: dbPathInput }, { headers: authHeaders() });
      alert("Storage path updated successfully!");
      fetchKBInfo();
    } catch (err) {
      console.error(err);
      alert("Failed to update path.");
    } finally {
      setSavingPath(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[hsl(var(--color-bg-surface))] p-6 rounded-2xl border border-[hsl(var(--color-border))] shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[hsl(var(--color-text))] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LuBrainCircuit />
            </div>
            My Knowledge Base
          </h1>
          <p className="text-[hsl(var(--color-text-muted))] text-sm mt-1">Manage the documents your Clinical Assistant learns from.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 justify-center"
          >
            {uploading ? <LuLoader className="animate-spin" /> : <LuUpload />}
            Upload File(s)
          </button>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf,.txt,.docx" 
            multiple 
          />

          <button 
            onClick={() => {
                // @ts-ignore
                document.getElementById('folderUploadInput')?.click();
            }} 
            disabled={uploading}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold shadow-md transition-colors flex items-center gap-2 justify-center"
          >
            {uploading ? <LuLoader className="animate-spin" /> : <LuUpload />}
            Upload Folder
          </button>
          <input 
            id="folderUploadInput"
            type="file" 
            className="hidden" 
            onChange={handleFileUpload} 
            accept=".pdf,.txt,.docx" 
            multiple 
            {...({ webkitdirectory: "", directory: "" } as any)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-1 space-y-6">
          {/* Storage Info Card */}
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] shadow-sm overflow-hidden">
            <div className="p-4 bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border))] font-bold text-[13px] uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-2">
              <LuHardDrive /> Storage Information
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1">Vector DB Size</p>
                <div className="text-2xl font-black text-[hsl(var(--color-text))]">
                  {loading ? "..." : info?.sizeMB} <span className="text-sm font-bold text-[hsl(var(--color-text-muted))]">MB</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mb-1">Current File Path</p>
                <div className="bg-[hsl(var(--color-bg-base))] p-2 rounded-lg border border-[hsl(var(--color-border-soft))] text-xs font-mono text-[hsl(var(--color-text-muted))] break-all">
                  {loading ? "..." : info?.path}
                </div>
              </div>

              <div className="pt-2 border-t border-[hsl(var(--color-border-soft))]">
                <p className="text-xs font-bold text-[hsl(var(--color-text-muted))] mb-2">Custom Vector Folder Path</p>
                <input 
                  type="text" 
                  value={dbPathInput}
                  onChange={(e) => setDbPathInput(e.target.value)}
                  placeholder="e.g. C:/Clinic/Vectors"
                  className="w-full bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border-soft))] text-[hsl(var(--color-text))] text-sm rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors mb-2 font-mono"
                />
                <button 
                  onClick={handleSavePath}
                  disabled={savingPath || loading}
                  className="w-full bg-[hsl(var(--color-bg-soft))] hover:bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] font-bold text-xs py-2 rounded-lg transition-colors"
                >
                  {savingPath ? "Saving..." : "Save Path"}
                </button>
              </div>

              <div className="pt-2 border-t border-[hsl(var(--color-border-soft))]">
                <button 
                  onClick={handleClearDB}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LuTrash2 size={14} /> Clear Database
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {/* Files List */}
          <div className="bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] shadow-sm overflow-hidden h-full">
            <div className="p-4 bg-[hsl(var(--color-bg-soft))] border-b border-[hsl(var(--color-border))] font-bold text-[13px] uppercase tracking-wider text-[hsl(var(--color-text-muted))] flex items-center gap-2">
              <LuFileText /> Uploaded Documents
            </div>
            
            {loading ? (
              <div className="p-10 flex flex-col items-center justify-center text-[hsl(var(--color-text-muted))]">
                <LuLoader className="animate-spin text-3xl mb-2" />
                <p className="text-sm font-medium">Loading documents...</p>
              </div>
            ) : info?.files.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-[hsl(var(--color-text-muted))] text-center">
                <LuFileText className="text-4xl mb-3 opacity-20" />
                <p className="text-sm font-bold">No documents found.</p>
                <p className="text-xs mt-1">Upload a PDF or text document to train your Clinical Assistant.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[hsl(var(--color-border-soft))]">
                {info?.files.map((file, idx) => (
                  <li key={idx} className="p-4 flex items-center justify-between hover:bg-[hsl(var(--color-bg-soft))] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <LuFileText className="text-xl" />
                      </div>
                      <p className="text-sm font-bold text-[hsl(var(--color-text))] break-all">{file}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(file)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center shrink-0 transition-colors"
                      title="Remove from Knowledge Base"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
