import { LuMapPin, LuPhone, LuAward, LuBuilding, LuStar } from "react-icons/lu";
import { DoctorListItem } from "@/services/appointmentService";
import { initialsOf } from "@/components/appointments/format";

interface Props {
  doctor: DoctorListItem;
  onBook: () => void;
}

export default function DoctorProfileCard({ doctor, onBook }: Props) {
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
            Specialist in {specialization}
          </p>

          <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 py-2">
            {/* Clinics / Address */}
            <div>
              <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <LuBuilding className="text-[14px]" /> Clinics & Address
              </p>
              <div className="flex items-start gap-2">
                <LuMapPin className="text-[hsl(var(--color-primary))] mt-1 shrink-0" />
                <p className="text-[14px] font-semibold text-[hsl(var(--color-text))] leading-snug">
                  {(doctor as any).address || "CareHub Main Clinic, Cairo Branch"}
                </p>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <LuPhone className="text-[14px]" /> Contact Numbers
              </p>
              <p className="text-[14px] font-bold text-[hsl(var(--color-text))]">
                {doctor.userId.phone || doctor.userId.phoneNumber || "+20 123 456 7890"}
              </p>
              <p className="text-[12px] text-[hsl(var(--color-text-muted))] font-medium mt-0.5">Available for emergencies</p>
            </div>
          </div>

          <div className="border-t border-dashed border-[hsl(var(--color-border))] my-4"></div>

          {/* Certifications & Degrees */}
          <div className="py-2">
            <p className="text-[12px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <LuAward className="text-[14px]" /> Certifications & Degrees
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[14px] font-medium text-[hsl(var(--color-text))]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary))] shrink-0"></div>
                MD from Cairo University
              </li>
              <li className="flex items-center gap-2 text-[14px] font-medium text-[hsl(var(--color-text))]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary))] shrink-0"></div>
                Board Certified in {specialization}
              </li>
              <li className="flex items-center gap-2 text-[14px] font-medium text-[hsl(var(--color-text))]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--color-primary))] shrink-0"></div>
                Member of Egyptian Medical Syndicate
              </li>
            </ul>
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 mb-8">
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Total Experience</p>
          <p className="text-[14px] md:text-[15px] font-black text-[hsl(var(--color-text))]">
            {doctor.experience != null ? `${doctor.experience}+ Years` : "Experienced"}
          </p>
        </div>
        
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Verification</p>
          <p className="text-[14px] md:text-[15px] font-black text-[hsl(var(--color-text))]">Approved</p>
        </div>
        
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Status</p>
          <p className="text-[14px] md:text-[15px] font-black text-[hsl(var(--color-text))]">Active</p>
        </div>
        
        <div className="bg-[hsl(var(--color-bg-soft))] rounded-2xl p-4 md:p-5 border border-[hsl(var(--color-border))] text-center md:text-left">
          <p className="text-[10px] md:text-[11px] font-bold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Rating</p>
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
        Book Appointment Now
      </button>
    </div>
  );
}
