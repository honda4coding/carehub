import { LuMapPin, LuPhone, LuAward, LuBuilding, LuImage, LuSmartphone } from "react-icons/lu";
import { DoctorListItem } from "@/services/appointmentService";
import { Clinic } from "@/services/clinicService";
import { initialsOf } from "@/components/appointments/format";
import { useState } from "react";
import { DocumentModal } from "@/components/shared/DocumentModal";

interface Props {
  doctor: DoctorListItem;
  clinics?: Clinic[];
  onBook: () => void;
}

export default function DoctorProfileCard({ doctor, clinics = [], onBook }: Props) {
  const [docModalUrl, setDocModalUrl] = useState<string | null>(null);
  const fullName = doctor.userId.fullName;
  const initials = initialsOf(fullName);
  const specialization = doctor.specialization ?? "General Practice";

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-5 md:p-8 border border-[hsl(var(--color-border-soft))]">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
        {/* Left: Large Photo */}
        <div className="w-[220px] sm:w-[260px] md:w-1/3 shrink-0">
          <div className="w-full aspect-[4/5] rounded-[2rem] bg-gradient-to-b from-[hsl(var(--color-primary)/0.2)] to-[hsl(var(--color-primary)/0.05)] flex items-center justify-center overflow-hidden border border-[hsl(var(--color-primary)/0.1)]">
            {doctor.userId.profilepicture?.secure_url ? (
              <img src={doctor.userId.profilepicture.secure_url} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[60px] font-black text-[hsl(var(--color-primary))]">{initials}</span>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="flex-1 flex flex-col justify-center w-full">
          <h2 className="text-[26px] md:text-[32px] font-black text-[hsl(var(--color-text))] leading-tight tracking-tight text-center md:text-left mt-2 md:mt-0">
            Dr. {fullName}
          </h2>
          
          <p className="text-[14px] md:text-[15px] font-medium text-[hsl(var(--color-text-muted))] mt-1 mb-6 text-center md:text-left">
            Specialist in {specialization}
          </p>

          <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

          {/* Clinics Section */}
          <div className="py-2">
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <LuBuilding className="text-[14px]" /> Clinics & Locations
            </p>
            {clinics.length === 0 ? (
              <p className="text-[13px] text-[hsl(var(--color-text-muted))]">No clinics available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinics.map((clinic) => (
                  <div key={clinic._id} className="p-4 rounded-xl bg-[hsl(var(--color-bg))] border border-[hsl(var(--color-border))]">
                    <h3 className="text-[14px] font-bold text-[hsl(var(--color-text))] mb-2 truncate" title={clinic.name}>{clinic.name}</h3>
                    
                    <div className="flex items-start gap-2 mb-2">
                      <LuMapPin className="text-[hsl(var(--color-primary))] mt-1 shrink-0 w-3.5 h-3.5" />
                      <p className="text-[13px] font-medium text-[hsl(var(--color-text))] leading-snug">
                        {clinic.address}, {clinic.governorate}
                      </p>
                    </div>

                    {clinic.phone && (
                      <div className="flex items-center gap-2 mb-1">
                        <LuPhone className="text-[hsl(var(--color-text-muted))] w-3.5 h-3.5" />
                        <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">{clinic.phone}</p>
                      </div>
                    )}
                    {clinic.whatsapp && (
                      <div className="flex items-center gap-2 mb-1">
                        <LuSmartphone className="text-[hsl(var(--color-text-muted))] w-3.5 h-3.5" />
                        <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))]">WA: {clinic.whatsapp}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

          {/* Certifications & Degrees */}
          <div className="py-2">
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <LuAward className="text-[14px]" /> Certifications & Achievements
            </p>
            {(!doctor.certificates || doctor.certificates.length === 0) ? (
              <p className="text-[13px] text-[hsl(var(--color-text-muted))]">No certificates uploaded.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {doctor.certificates.map((cert) => (
                  <button 
                    key={cert._id} 
                    onClick={() => setDocModalUrl(cert.secure_url)}
                    className="group block border border-[hsl(var(--color-border))] rounded-lg overflow-hidden bg-[hsl(var(--color-bg))] hover:border-[hsl(var(--color-primary))] transition-colors text-left"
                  >
                    <div className="aspect-[4/3] bg-black/5 relative flex items-center justify-center">
                      {cert.secure_url.endsWith(".pdf") ? (
                        <div className="text-center text-[hsl(var(--color-text-muted))]">
                          <LuImage className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px] font-semibold">PDF</span>
                        </div>
                      ) : (
                        <img src={cert.secure_url} alt={cert.title} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                        View
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h4 className="font-bold text-[12px] truncate" title={cert.title}>{cert.title}</h4>
                      <p className="text-[11px] text-[hsl(var(--color-text-muted))] truncate" title={cert.issuer}>{cert.issuer}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {doctor.bio && (
            <>
              <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>
              <div className="py-2">
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">About</p>
                <p className="text-[14px] font-medium text-[hsl(var(--color-text))] leading-relaxed">
                  {doctor.bio}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Experience Stats Row (Simplified) */}
      <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center mt-8 mb-8 flex flex-col items-center justify-center max-w-sm mx-auto">
        <p className="text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Total Experience</p>
        <p className="text-[16px] font-black text-[hsl(var(--color-text))]">
          {doctor.experience != null ? `${doctor.experience}+ Years in Practice` : "Highly Experienced"}
        </p>
      </div>

      {/* Book Button */}
      <button
        onClick={onBook}
        className="w-full py-3.5 rounded-xl bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white text-[15px] font-black transition-all cursor-pointer shadow-lg shadow-[hsl(var(--color-primary)/0.2)]"
      >
        Book Appointment Now
      </button>

      <DocumentModal 
        url={docModalUrl} 
        onClose={() => setDocModalUrl(null)} 
        title="View Certificate"
      />
    </div>
  );
}
