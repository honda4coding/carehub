"use client";

import { useState, useRef } from "react";
import { LuPlus, LuTrash2, LuImage, LuInfo } from "react-icons/lu";
import { LuLoader } from "react-icons/lu";
import { DoctorProfile } from "@/services/doctorService";
import { uploadDoctorCertificate, deleteDoctorCertificate } from "@/services/doctorService";
import { Button } from "@/components/ui/Button";
import { DocumentModal } from "@/components/shared/DocumentModal";

interface CertificateSectionProps {
  profile: DoctorProfile;
  onUpdate: (updatedProfile: DoctorProfile) => void;
}

export default function CertificateSection({ profile, onUpdate }: CertificateSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [docModalUrl, setDocModalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for new certificate
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const certificates = profile.certificates || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title || !issuer) {
      setError("Please fill all required fields and select an image/pdf.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      const updatedCertificates = await uploadDoctorCertificate(selectedFile, title, issuer, issueDate);
      onUpdate({ ...profile, certificates: updatedCertificates });
      
      // Reset form
      setTitle("");
      setIssuer("");
      setIssueDate("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Failed to upload certificate");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoctorCertificate(id);
      const newCerts = certificates.filter((c) => c._id !== id);
      onUpdate({ ...profile, certificates: newCerts });
    } catch (err: any) {
      setError(err.message || "Failed to delete certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-5 shadow-sm">
        <h2 className="text-[16px] font-bold text-[hsl(var(--color-text))] mb-1">Add Certificate</h2>
        <p className="text-[13px] text-[hsl(var(--color-text-muted))] mb-4">
          Upload your professional certificates and achievements.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--color-danger-bg))] text-[hsl(var(--color-danger))] flex items-center gap-2 text-sm">
            <LuInfo className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Certificate Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] transition-colors"
                placeholder="e.g. Board Certification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issuer / Organization *</label>
              <input
                type="text"
                required
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] transition-colors"
                placeholder="e.g. American Board of Internal Medicine"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload File (Image/PDF) *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                required
                ref={fileInputRef}
                onChange={handleFileChange}
                className="w-full h-10 px-3 py-1.5 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))] outline-none focus:border-[hsl(var(--color-primary))] transition-colors file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--color-primary-bg))] file:text-[hsl(var(--color-primary))] hover:file:bg-[hsl(var(--color-primary-bg))]/80"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !title || !issuer}
              className="gap-2"
            >
              {isUploading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuPlus className="w-4 h-4" />}
              Upload Certificate
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-5 shadow-sm">
        <h2 className="text-[16px] font-bold text-[hsl(var(--color-text))] mb-4">My Certificates</h2>
        
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--color-text-muted))]">
            <LuImage className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No certificates uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div key={cert._id} className="border border-[hsl(var(--color-border))] rounded-xl overflow-hidden bg-[hsl(var(--color-bg))]">
                <div className="aspect-video bg-black/5 relative group flex items-center justify-center">
                  {cert.secure_url.endsWith(".pdf") ? (
                    <div className="text-center text-[hsl(var(--color-text-muted))]">
                      <LuImage className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <span className="text-xs font-semibold">PDF Document</span>
                    </div>
                  ) : (
                    <img src={cert.secure_url} alt={cert.title} className="w-full h-full object-cover" />
                  )}
                  
                  {/* Overlay for view */}
                  <button 
                    onClick={() => setDocModalUrl(cert.secure_url)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-semibold cursor-pointer border-none"
                  >
                    View File
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-[14px] truncate" title={cert.title}>{cert.title}</h3>
                  <p className="text-[12px] text-[hsl(var(--color-text-muted))] truncate" title={cert.issuer}>{cert.issuer}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] font-medium px-2 py-1 bg-[hsl(var(--color-border))] rounded">
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "No Date"}
                    </span>
                    <button
                      onClick={() => handleDelete(cert._id)}
                      disabled={loading}
                      className="p-1.5 text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger-bg))] rounded-md transition-colors disabled:opacity-50"
                    >
                      {loading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuTrash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DocumentModal 
        url={docModalUrl} 
        onClose={() => setDocModalUrl(null)} 
        title="View Certificate"
      />
    </div>
  );
}

