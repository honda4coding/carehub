"use client";

import { useState } from "react";
import {
  LuMapPin,
  LuPhone,
  LuAward,
  LuImage,
  LuSmartphone,
  LuBadgeCheck,
  LuGlobe,
  LuUsers,
  LuGraduationCap,
  LuFacebook,
  LuInstagram,
  LuLinkedin,
  LuBriefcase,
  LuBuilding2,
  LuUser
} from "react-icons/lu";
import { DoctorListItem } from "@/services/appointmentService";
import { Clinic } from "@/services/clinicService";
import { initialsOf } from "@/components/appointments/format";
import { DocumentModal } from "@/components/shared/DocumentModal";

interface Props {
  doctor: DoctorListItem;
  clinics?: Clinic[];
  hasBooked?: boolean;
  onBook: () => void;
}

function formatSpecialization(spec: string) {
  return spec
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function DoctorProfileCard({
  doctor,
  clinics = [],
  hasBooked = false,
  onBook,
}: Props) {
  const [docModalUrl, setDocModalUrl] = useState<string | null>(null);

  const fullName = doctor.userId.fullName;
  const initials = initialsOf(fullName);
  const specialization = doctor.specialization 
    ? formatSpecialization(doctor.specialization) 
    : "General Practice";

  const {
    tagline,
    languages = [],
    socialLinks,
    patientsTreated,
    university,
    graduationYear,
    experience,
    bio,
    certificates = [],
  } = doctor;

  // Fix image source path
  const profileImage = doctor.userId?.profilepicture?.secure_url || doctor.profilepicture?.secure_url;

  return (
    <div className="flex flex-col relative pb-24 md:pb-0">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] mb-8 shadow-[var(--shadow-card)]">
        {/* Abstract Gradient Background (using opacity instead of /alpha for Turbopack compatibility) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] opacity-[0.08] pointer-events-none" />
        
        {/* Subtle pattern or shape (optional) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--color-primary))] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative p-6 lg:p-10 flex flex-col lg:flex-row items-center lg:items-start gap-8">
          
          {/* Photo */}
          <div className="shrink-0 relative group">
            <div className="w-[160px] h-[160px] lg:w-[180px] lg:h-[180px] rounded-full p-1.5 bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] shadow-lg shadow-[hsl(var(--color-primary))]/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-[hsl(var(--color-bg-surface))] flex items-center justify-center border-4 border-white dark:border-[hsl(var(--color-bg-surface))]">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[60px] font-black text-[hsl(var(--color-primary))]">
                    {initials}
                  </span>
                )}
              </div>
            </div>
            {/* Verified Badge */}
            <div className="absolute bottom-2 right-4 bg-white dark:bg-[hsl(var(--color-bg-surface))] rounded-full p-1 shadow-md">
              <LuBadgeCheck className="w-8 h-8 text-[hsl(var(--color-primary))] fill-[hsl(var(--color-primary))]/10" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left pt-2">
            
            {/* Specialization Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--color-primary))]/10 text-[hsl(var(--color-primary-strong))] text-[12px] font-bold uppercase tracking-wider mb-3">
              <LuBriefcase className="w-3.5 h-3.5" />
              {specialization}
            </div>

            {/* Name */}
            <h1 className="text-[32px] lg:text-[40px] font-black text-[hsl(var(--color-text))] leading-tight mb-2 break-words w-full">
              Dr. {fullName}
            </h1>

            {/* Tagline */}
            <p className="text-[16px] lg:text-[18px] font-medium text-[hsl(var(--color-text-muted))] mb-6 max-w-2xl">
              {tagline || `Providing expert care and consultation in ${specialization.toLowerCase()}.`}
            </p>

            {/* Languages & Social Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8">
              {languages.length > 0 && (
                <div className="flex items-center gap-2">
                  <LuGlobe className="text-[hsl(var(--color-text-muted))] w-4 h-4" />
                  <div className="flex gap-1.5">
                    {languages.map((lang) => (
                      <span key={lang} className="text-[12px] font-bold text-[hsl(var(--color-text))] bg-[hsl(var(--color-bg-soft))] px-2.5 py-1 rounded-md">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Divider if both exist */}
              {languages.length > 0 && (socialLinks?.facebook || socialLinks?.instagram || socialLinks?.linkedin) && (
                <div className="w-1 h-1 rounded-full bg-[hsl(var(--color-border-strong))]" />
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks?.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="text-[hsl(var(--color-text-muted))] hover:text-[#1877F2] transition-colors">
                    <LuFacebook className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-[hsl(var(--color-text-muted))] hover:text-[#E4405F] transition-colors">
                    <LuInstagram className="w-5 h-5" />
                  </a>
                )}
                {socialLinks?.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-[hsl(var(--color-text-muted))] hover:text-[#0A66C2] transition-colors">
                    <LuLinkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Stats Strip */}
            <div className="flex flex-wrap items-center gap-6 lg:gap-10 border-y border-[hsl(var(--color-border))] py-4 w-full lg:w-auto justify-center lg:justify-start">
              {experience != null && (
                <div className="flex flex-col items-center lg:items-start">
                  <div className="flex items-center gap-1.5 text-[hsl(var(--color-text-muted))] mb-1">
                    <LuAward className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Experience</span>
                  </div>
                  <span className="text-[20px] font-black text-[hsl(var(--color-text))]">{experience}+ Yrs</span>
                </div>
              )}

              <div className="w-[1px] h-10 bg-[hsl(var(--color-border))]" />

              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-[hsl(var(--color-text-muted))] mb-1">
                  <LuBuilding2 className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Clinics</span>
                </div>
                <span className="text-[20px] font-black text-[hsl(var(--color-text))]">{clinics.length}</span>
              </div>

              {patientsTreated != null && (
                <>
                  <div className="w-[1px] h-10 bg-[hsl(var(--color-border))]" />
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="flex items-center gap-1.5 text-[hsl(var(--color-text-muted))] mb-1">
                      <LuUsers className="w-4 h-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Patients</span>
                    </div>
                    <span className="text-[20px] font-black text-[hsl(var(--color-text))]">{patientsTreated}+</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: About & Certs */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* ABOUT SECTION */}
          <section className="bg-white dark:bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-6 md:p-8 border border-[hsl(var(--color-border))] shadow-[var(--shadow-card)]">
            <h3 className="text-[18px] font-black text-[hsl(var(--color-text))] mb-6 flex items-center gap-2">
              <LuUser className="w-5 h-5 text-[hsl(var(--color-primary))]" />
              About the Doctor
            </h3>
            
            <div className="relative">
              <span className="absolute -top-4 -left-2 text-[60px] leading-none text-[hsl(var(--color-primary))]/10 font-serif select-none">"</span>
              <p className="text-[15px] font-medium text-[hsl(var(--color-text))] leading-relaxed relative z-10 pl-4">
                {bio || "This doctor has not provided a biography yet."}
              </p>
            </div>

            {university && (
              <div className="mt-6 flex items-center gap-3 bg-[hsl(var(--color-bg-soft))] p-4 rounded-xl border border-[hsl(var(--color-border))]">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary))]/10 flex items-center justify-center text-[hsl(var(--color-primary-strong))]">
                  <LuGraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[hsl(var(--color-text))]">{university}</p>
                  {graduationYear && (
                    <p className="text-[12px] font-medium text-[hsl(var(--color-text-muted))]">Class of {graduationYear}</p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* CERTIFICATIONS */}
          {certificates.length > 0 && (
            <section className="bg-white dark:bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-6 md:p-8 border border-[hsl(var(--color-border))] shadow-[var(--shadow-card)]">
              <h3 className="text-[18px] font-black text-[hsl(var(--color-text))] mb-6 flex items-center gap-2">
                <LuAward className="w-5 h-5 text-[hsl(var(--color-primary))]" />
                Certifications & Achievements
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <button
                    key={cert._id}
                    onClick={() => setDocModalUrl(cert.secure_url)}
                    className="group relative flex flex-col border border-[hsl(var(--color-border))] rounded-2xl overflow-hidden bg-[hsl(var(--color-bg))] hover:border-[hsl(var(--color-primary))]/50 hover:shadow-[var(--shadow-float)] transition-all text-left"
                  >
                    <div className="h-32 bg-black/5 relative flex items-center justify-center overflow-hidden">
                      {cert.secure_url.endsWith(".pdf") ? (
                        <div className="text-center text-[hsl(var(--color-text-muted))]">
                          <LuImage className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <span className="text-[12px] font-bold tracking-widest uppercase">PDF Document</span>
                        </div>
                      ) : (
                        <img src={cert.secure_url} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[hsl(var(--color-primary))]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[13px] font-bold px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm">
                          View Certificate
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-[14px] text-[hsl(var(--color-text))] truncate mb-1" title={cert.title}>{cert.title}</h4>
                      <p className="text-[12px] font-semibold text-[hsl(var(--color-text-muted))] truncate" title={cert.issuer}>{cert.issuer}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN: Clinics & Booking */}
        <div className="space-y-8">
          
          {/* CLINICS */}
          <section className="bg-white dark:bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-6 md:p-8 border border-[hsl(var(--color-border))] shadow-[var(--shadow-card)]">
            <h3 className="text-[18px] font-black text-[hsl(var(--color-text))] mb-6 flex items-center gap-2">
              <LuBuilding2 className="w-5 h-5 text-[hsl(var(--color-primary))]" />
              Clinics & Locations
            </h3>

            {clinics.length === 0 ? (
              <div className="text-center py-8">
                <LuBuilding2 className="w-12 h-12 text-[hsl(var(--color-border-strong))] mx-auto mb-3 opacity-50" />
                <p className="text-[14px] font-medium text-[hsl(var(--color-text-muted))]">No clinics available currently.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {clinics.map((clinic) => (
                  <div key={clinic._id} className="group relative p-5 rounded-2xl bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))]/40 transition-colors">
                    
                    {/* Fee Badge */}
                    {clinic.consultationFee != null && (
                      <div className="absolute top-4 right-4 bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] px-2.5 py-1 rounded-full text-[12px] font-black border border-[hsl(var(--color-success))]/20">
                        {clinic.consultationFee} LE
                      </div>
                    )}

                    <h4 className="text-[15px] font-bold text-[hsl(var(--color-text))] mb-3 pr-16 leading-tight">{clinic.name}</h4>
                    
                    <div className="flex items-start gap-2.5 mb-4">
                      <LuMapPin className="text-[hsl(var(--color-primary))] mt-0.5 shrink-0 w-4 h-4" />
                      <p className="text-[13px] font-medium text-[hsl(var(--color-text-muted))] leading-relaxed">
                        {clinic.address}, <span className="font-bold text-[hsl(var(--color-text))]">{clinic.governorate}</span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {(clinic.phone || clinic.whatsapp) && (
                      <div className="flex items-center gap-2 pt-4 border-t border-[hsl(var(--color-border))]">
                        {clinic.phone && (
                          <a href={`tel:${clinic.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white dark:bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary))] text-[hsl(var(--color-text))] text-[12px] font-bold transition-all">
                            <LuPhone className="w-3.5 h-3.5 text-[hsl(var(--color-primary))]" />
                            Call
                          </a>
                        )}
                        {clinic.whatsapp && (
                          <a href={`https://wa.me/${clinic.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:border-[#25D366]/50 text-[#128C7E] dark:text-[#25D366] text-[12px] font-bold transition-all">
                            <LuSmartphone className="w-4 h-4" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* DESKTOP BOOKING CTA */}
          <div className="hidden xl:block sticky top-6">
            {!hasBooked ? (
              <button
                onClick={onBook}
                className="group relative w-full py-4 rounded-2xl overflow-hidden shadow-xl shadow-[hsl(var(--color-primary))]/25 transition-all hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-strong))]" />
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
                <span className="relative z-10 text-white text-[16px] font-black tracking-wide flex items-center justify-center gap-2">
                  Book Appointment Now
                </span>
              </button>
            ) : (
              <div className="w-full py-4 rounded-2xl bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] text-[14px] font-black text-center border border-[hsl(var(--color-success))]/20">
                You have an upcoming appointment
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOOKING CTA */}
      <div className="xl:hidden sticky bottom-6 mt-8 z-50 flex justify-center pointer-events-none px-4 pb-4">
        <div className="pointer-events-auto w-full max-w-sm bg-white/90 dark:bg-[hsl(var(--color-bg-surface))/90] backdrop-blur-xl p-2 rounded-2xl border border-[hsl(var(--color-border))] shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
          {!hasBooked ? (
            <button
              onClick={onBook}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-primary-strong))] text-white text-[15px] font-black shadow-lg shadow-[hsl(var(--color-primary))]/30 active:scale-[0.98] transition-transform"
            >
              Book Appointment
            </button>
          ) : (
            <div className="w-full py-3.5 rounded-xl bg-[hsl(var(--color-success-bg))] text-[hsl(var(--color-success))] text-[14px] font-black text-center border border-[hsl(var(--color-success))]/20">
              Appointment Booked
            </div>
          )}
        </div>
      </div>

      <DocumentModal
        url={docModalUrl}
        onClose={() => setDocModalUrl(null)}
        title="View Certificate"
      />
    </div>
  );
}
