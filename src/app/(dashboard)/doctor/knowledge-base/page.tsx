"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuLoader, LuUpload } from "react-icons/lu";
import DashboardHeader from "@/components/global/DashboardHeader";
import KBStorageInfo from "@/components/doctor/knowledge-base/KBStorageInfo";
import KBDocumentsList from "@/components/doctor/knowledge-base/KBDocumentsList";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface KBInfo {
  files: string[];
  sizeMB: string;
  activeDb: string;
  databases: string[];
}

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { LuBrainCircuit, LuZap } from "react-icons/lu";

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const hasAI = user?.subscriptionFeatures?.some(f => f.code === 'ai' && f.enabled) ?? false;
  
  const [info, setInfo] = useState<KBInfo | null>(null);
  const [loading, setLoading] = useState(hasAI); // only load if they have access
  const [uploading, setUploading] = useState(false);
  const [switchingDb, setSwitchingDb] = useState(false);
  const [creatingDb, setCreatingDb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchKBInfo = async () => {
    if (!hasAI) return;
    try {
      const res = await axios.get(`${BASE_URL}/ai/knowledge-base`, {
        headers: authHeaders(),
      });
      setInfo(res.data?.data);
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
    if (
      !confirm(
        `Are you sure you want to remove ${fileName} from your AI Knowledge Base?`
      )
    )
      return;

    try {
      await axios.delete(
        `${BASE_URL}/ai/knowledge-base/${encodeURIComponent(fileName)}`,
        { headers: authHeaders() }
      );
      fetchKBInfo();
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
          "Content-Type": "multipart/form-data",
        },
      });
      fetchKBInfo();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to upload files. ${error.response?.data?.message || ""}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClearDB = async () => {
    if (
      !confirm(
        "Are you sure you want to WIPE your entire Knowledge Base? This cannot be undone."
      )
    )
      return;

    try {
      await axios.delete(`${BASE_URL}/ai/knowledge-base/clear`, {
        headers: authHeaders(),
      });
      fetchKBInfo();
    } catch (err) {
      console.error(err);
      alert("Failed to clear database.");
    }
  };

  const handleSwitchDatabase = async (dbName: string) => {
    if (!dbName || dbName === info?.activeDb) return;
    setSwitchingDb(true);
    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/ai/knowledge-base/databases/active`,
        { dbName },
        { headers: authHeaders() }
      );
      await fetchKBInfo();
    } catch (err) {
      console.error(err);
      alert("Failed to switch database.");
      setLoading(false);
    } finally {
      setSwitchingDb(false);
    }
  };

  const handleCreateDatabase = async () => {
    const dbName = prompt(
      "Enter a name for the new database (e.g., Cardiology_DB):"
    );
    if (!dbName || !dbName.trim()) return;

    setCreatingDb(true);
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/ai/knowledge-base/databases`,
        { dbName: dbName.trim() },
        { headers: authHeaders() }
      );
      await fetchKBInfo();
    } catch (err) {
      console.error(err);
      alert("Failed to create database.");
      setLoading(false);
    } finally {
      setCreatingDb(false);
    }
  };

  if (!hasAI) {
    return (
      <div className="flex flex-col flex-1 min-h-screen bg-[hsl(var(--color-bg-base))]">
        <DashboardHeader
          title="Knowledge Base"
          subtitle="Manage the documents your Clinical Assistant learns from"
          showBack={true}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-[hsl(var(--color-warning-bg))] border border-[hsl(var(--color-warning-soft))] rounded-full flex items-center justify-center mx-auto mb-6">
              <LuBrainCircuit className="w-8 h-8 text-[hsl(var(--color-warning))]" />
            </div>
            <h2 className="text-xl font-black text-[hsl(var(--color-text))] mb-3">
              AI Clinical Assistant
            </h2>
            <p className="text-sm font-semibold text-[hsl(var(--color-text-muted))] mb-8">
              Upgrade to the Gold or Premium plan to unlock the AI Clinical Assistant. Feed it your personal medical documents, guidelines, and research papers, and chat with it to get instant diagnostic support and second opinions tailored to your exact methodology.
            </p>
            <Link 
              href="/doctor/settings/subscription"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[hsl(var(--color-primary))] text-white text-sm font-black rounded-xl hover:bg-[hsl(var(--color-primary-strong))] transition-colors"
            >
              <LuZap className="w-4 h-4" />
              View Subscription Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title="Knowledge Base"
        subtitle="Manage the documents your Clinical Assistant learns from"
        showBack={true}
      />
      <div className="flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[hsl(var(--color-bg-surface))] p-4 sm:p-5 rounded-2xl border border-[hsl(var(--color-border))]">
            <div>
              <h2 className="text-[16px] font-black text-[hsl(var(--color-text))]">Document Uploads</h2>
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))]">Upload medical guidelines, PDFs, and folders to enrich your AI Assistant.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary))] hover:text-white text-[hsl(var(--color-primary))] px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 justify-center cursor-pointer disabled:opacity-60 disabled:pointer-events-none w-full sm:w-auto"
              >
                {uploading ? <LuLoader className="animate-spin text-base" /> : <LuUpload className="text-base" />}
                Upload File(s)
              </button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  handleFileUpload(e);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                accept=".pdf,.txt,.docx"
                multiple
              />

              <button
                onClick={() => document.getElementById("folderUploadInput")?.click()}
                disabled={uploading}
                className="bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 justify-center cursor-pointer disabled:opacity-60 disabled:pointer-events-none w-full sm:w-auto shadow-sm"
              >
                {uploading ? <LuLoader className="animate-spin text-base" /> : <LuUpload className="text-base" />}
                Upload Folder
              </button>
              <input
                id="folderUploadInput"
                type="file"
                className="hidden"
                onChange={(e) => {
                  handleFileUpload(e);
                  const el = document.getElementById("folderUploadInput") as HTMLInputElement;
                  if (el) el.value = "";
                }}
                accept=".pdf,.txt,.docx"
                multiple
                {...({ webkitdirectory: "", directory: "" } as any)}
              />
            </div>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <KBStorageInfo
              info={info}
              loading={loading}
              switchingDb={switchingDb}
              creatingDb={creatingDb}
              onSwitchDatabase={handleSwitchDatabase}
              onCreateDatabase={handleCreateDatabase}
              onClearDB={handleClearDB}
            />
          </div>

          <div className="md:col-span-2">
            <KBDocumentsList
              files={info?.files}
              loading={loading}
              onDelete={handleDelete}
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
