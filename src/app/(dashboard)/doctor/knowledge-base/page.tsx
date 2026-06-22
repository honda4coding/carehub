"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";

import KBHeader from "@/components/doctor/knowledge-base/KBHeader";
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

export default function KnowledgeBasePage() {
  const [info, setInfo] = useState<KBInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [switchingDb, setSwitchingDb] = useState(false);
  const [creatingDb, setCreatingDb] = useState(false);

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
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-6">
      <KBHeader uploading={uploading} onFileUpload={handleFileUpload} />

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
  );
}
