"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuLoader, LuUpload } from "react-icons/lu";
import DashboardHeader from "@/components/global/DashboardHeader";
import KBStorageInfo from "@/components/doctor/knowledge-base/KBStorageInfo";
import KBDocumentsList from "@/components/doctor/knowledge-base/KBDocumentsList";
import { useTranslations } from "next-intl";

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

export default function KnowledgeBasePage() {
    const t = useTranslations("auto");
  const [info, setInfo] = useState<KBInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [switchingDb, setSwitchingDb] = useState(false);
  const [creatingDb, setCreatingDb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchKBInfo = async () => {
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

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DashboardHeader
        title={t('knowledgeBase')}
        subtitle={t('manageTheDocumentsYour_clre')}
        backPath="/doctor"
        rightElement={
          <div className="flex gap-2 w-full md:w-auto no-print">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary))] hover:text-white text-[hsl(var(--color-primary))] px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 justify-center cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              {uploading ? <LuLoader className="animate-spin text-base" /> : <LuUpload className="text-base" />}
              {t('uploadFiles')}</button>
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
              className="bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 justify-center cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              {uploading ? <LuLoader className="animate-spin text-base" /> : <LuUpload className="text-base" />}
              {t('uploadFolder')}</button>
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
        }
      />
      <div className="flex-1 overflow-auto min-w-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">

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
