import { LuMapPin, LuPhone, LuAward, LuBuilding, LuStar } from "react-icons/lu";
import { DoctorListItem } from "@/services/appointmentService";
import { initialsOf } from "@/components/appointments/format";
import { useTranslations } from "next-intl";

interface Props {
  doctor: DoctorListItem;
  onBook: () => void;
}

export default function DoctorProfileCard({ doctor, onBook }: Props) {
  const t = useTranslations("patient.DoctorProfileCard");
  const tSpec = useTranslations("common.specialties");
  const fullName = doctor.userId.fullName;
  const initials = initialsOf(fullName);
  const specialization = doctor.specialization ?? "General Practice";

  return (
    <div className="bg-[hsl(var(--color-bg-surface))] rounded-[2rem] p-5 md:p-8 border border-[hsl(var(--color-border-soft))]">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
        {/* Left: Large Photo */}
        <div className="w-[220px] sm:w-[260px] md:w-1/3 shrink-0">
          <div className="w-full aspect-[4/5] rounded-[2rem] bg-gradient-to-b from-[hsl(var(--color-primary)/0.2)] to-[hsl(var(--color-primary)/0.05)] flex items-center justify-center overflow-hidden border border-[hsl(var(--color-primary)/0.1)]">
            {doctor.profilepicture?.secure_url ? (
              <img src={doctor.profilepicture.secure_url} alt={fullName} className="w-full h-full object-cover" />
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
            {t("specialistIn", { specialization: tSpec(specialization) })}
          </p>

          <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 py-2">
            {/* Clinics / Address */}
            <div>
              <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <LuBuilding className="text-[14px]" /> {t("clinicsAddress")}
              </p>
              <div className="flex items-start gap-2">
                <LuMapPin className="text-[hsl(var(--color-primary))] mt-1 shrink-0" />
                <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] leading-snug">
                  {(doctor as any).address || t("mainClinicFallback")}
                </p>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <LuPhone className="text-[14px]" /> {t("contactNumbers")}
              </p>
              <p className="text-[14px] font-bold text-[hsl(var(--color-text))]">
                {doctor.userId.phone || doctor.userId.phoneNumber || "+20 123 456 7890"}
              </p>
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium mt-0.5">{t("availableForEmergencies")}</p>
            </div>
          </div>

          <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

          {/* Certifications & Degrees */}
          <div className="py-2">
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <LuAward className="text-[14px]" /> {t("certificationsDegrees")}
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[14px] font-medium text-[hsl(var(--color-text))]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary))] shrink-0"></div>
                {t("mdFromCairo")}
              </li>
              <li className="flex items-center gap-2 text-[14px] font-medium text-[hsl(var(--color-text))]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary))] shrink-0"></div>
                {t("boardCertified", { specialization: tSpec(specialization) })}
              </li>
              <li className="flex items-center gap-2 text-[14px] font-medium text-[hsl(var(--color-text))]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary))] shrink-0"></div>
                {t("memberSyndicate")}
              </li>
            </ul>
          </div>

          {doctor.bio && (
            <>
              <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>
              <div className="py-2">
                <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">{t("about")}</p>
                <p className="text-[14px] font-medium text-[hsl(var(--color-text))] leading-relaxed">
                  {doctor.bio}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 mb-8">
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">{t("totalExperience")}</p>
          <p className="text-[14px] md:text-[15px] font-black text-[hsl(var(--color-text))]">
            {doctor.experience != null ? t("yearsExperience", { years: doctor.experience }) : t("experienced")}
          </p>
        </div>
        
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">{t("verification")}</p>
          <p className="text-[14px] md:text-[15px] font-black text-[hsl(var(--color-text))]">{t("approved")}</p>
        </div>
        
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">{t("status")}</p>
          <p className="text-[14px] md:text-[15px] font-black text-[hsl(var(--color-text))]">{t("active")}</p>
        </div>
        
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">{t("rating")}</p>
          <p className="text-[14px] md:text-[15px] font-black text-[hsl(var(--color-text))] flex items-center justify-center md:justify-start gap-1">
            <LuStar className="text-[hsl(var(--color-warning))] fill-[hsl(var(--color-warning))] text-[14px]" /> (5.00)
          </p>
        </div>
      </div>

      {/* Book Button */}
      <button
        onClick={onBook}
        className="w-full py-3 rounded-xl bg-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary-strong))] text-white text-[14px] font-black transition-all cursor-pointer"
      >
        {t("bookNow")}
      </button>
    </div>
  );
}
