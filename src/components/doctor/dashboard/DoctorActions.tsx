import { LuSearch, LuShieldCheck, LuUserPlus } from "react-icons/lu";
import { Button } from "@/components/ui/Button";
import { useClinicContext } from "@/context/ClinicContext";
import ClinicSelector from "@/components/doctor/ClinicSelector";

export const DoctorActions = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  showSearchResults,
  setShowSearchResults,
  searchError,
  realSearchResults,
  handleRequestAccess,
  setWalkInModalOpen,
  user,
}: any) => {
  const { activeClinicId } = useClinicContext();
  const hasActiveClinic = !!activeClinicId && activeClinicId !== "all";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      {/* Welcome Card - Left, larger */}
      <div className="md:col-span-2 lg:col-span-12 xl:col-span-4">
        <div className="bg-gradient-doctor rounded-xl p-5 h-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute right-12 top-2 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-[22px] font-black border-2 border-white/25 shrink-0 overflow-hidden relative">
              {user?.profilepicture?.secure_url ? (
                <img src={user.profilepicture.secure_url} alt="Doctor" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || "D"
              )}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-white/70 mb-0.5">Welcome back,</p>
              <h2 className="text-[20px] font-black text-white leading-tight">Dr. {user?.name || user?.fullName || "Doctor"}</h2>
              <p className="text-[12px] font-medium text-white/60 mt-1">Have a productive day ahead ✨</p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right relative z-10 opacity-90 pr-2">
            <div className="text-[24px] font-black text-white leading-none tracking-tight">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="text-[13px] font-medium text-white/70 mt-1.5 uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Start Consultation - Larger Card */}
      <div className="md:col-span-1 lg:col-span-8 xl:col-span-5 relative">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-3.5 h-full flex flex-col justify-center relative">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-black text-[hsl(var(--color-text))] leading-tight">Start Consultation</h2>
          </div>
          
          <div className="relative w-full">
            <div className="flex items-center border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-[8px] p-0.5 focus-within:border-[hsl(var(--color-primary)/0.5)] focus-within:ring-2 focus-within:ring-[hsl(var(--color-primary)/0.1)] transition-all min-w-0">
              <ClinicSelector />
              <div className="w-px h-5 bg-[hsl(var(--color-border))] mx-1 shrink-0"></div>
              <LuSearch className="ml-1 mr-2 text-[hsl(var(--color-text-muted))] text-[14px] shrink-0" />
              <input 
                type="text" 
                placeholder={hasActiveClinic ? "Search patient phone or name..." : "No active clinic selected"} 
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] font-medium py-1.5 disabled:opacity-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && hasActiveClinic && handleSearch()}
                disabled={!hasActiveClinic}
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !hasActiveClinic}
                className="!text-[12px] !px-4 !py-1.5 !h-auto !rounded-[6px] ml-0.5 shrink-0"
              >
                {isSearching ? "..." : "Search"}
              </Button>
            </div>

            {showSearchResults && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden z-50 shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-[hsl(var(--color-border-soft))] bg-[hsl(var(--color-bg-soft))] flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Search Results</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-[10px] text-[hsl(var(--color-danger))] font-bold hover:underline cursor-pointer">Close</button>
                </div>
                
                {isSearching ? (
                  <div className="p-4 text-center text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                    Searching database...
                  </div>
                ) : searchError ? (
                  <div className="p-4 text-center text-[12px] font-bold text-[hsl(var(--color-danger))]">
                    {searchError}
                  </div>
                ) : (!realSearchResults || realSearchResults.length === 0) ? (
                  <div className="p-4 text-center text-[12px] font-semibold text-[hsl(var(--color-text-muted))]">
                    No patients found. Try another phone or name.
                  </div>
                ) : (
                  realSearchResults.map((patient: any) => (
                    <div 
                      key={patient._id} 
                      className="flex items-center justify-between p-3 hover:bg-[hsl(var(--color-bg-soft))] transition-colors border-b border-[hsl(var(--color-border-soft))] last:border-0"
                    >
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))] flex items-center justify-center text-[11px] font-black uppercase shrink-0">
                          {patient.fullName ? patient.fullName.slice(0, 2) : "PT"}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[hsl(var(--color-text))] leading-tight">{patient.fullName}</p>
                          <p className="text-[11px] font-semibold text-[hsl(var(--color-text-muted))]">{patient.phoneNumber}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestAccess(patient)}
                        icon={LuShieldCheck}
                        className="!text-[10px] !px-2 !py-1 !h-auto !rounded-[7px] text-[hsl(var(--color-primary))] border-[hsl(var(--color-primary)/0.3)] hover:bg-[hsl(var(--color-primary)/0.1)] hover:text-[hsl(var(--color-primary-strong))] hover:border-[hsl(var(--color-primary)/0.5)] shrink-0"
                      >
                        Access
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Walk-In Patient - Compact & Narrow */}
      <div className="md:col-span-1 lg:col-span-4 xl:col-span-3">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-3.5 h-full flex flex-row items-center justify-between relative gap-2">
          <div className="flex items-center gap-2 2xl:gap-3 min-w-0">
            <div className="w-10 h-10 bg-[hsl(var(--color-primary)/0.1)] rounded-xl flex items-center justify-center text-[hsl(var(--color-primary))] text-[20px] shrink-0">
              <LuUserPlus />
            </div>
            <div className="min-w-0">
              <h2 className="text-[hsl(var(--color-text))] text-[14px] font-black leading-tight truncate">Walk-In</h2>
              <p className="text-[hsl(var(--color-text-muted))] text-[11px] font-semibold truncate hidden sm:block">Offline patients</p>
            </div>
          </div>
          <Button 
            size="sm"
            onClick={() => setWalkInModalOpen(true)}
            disabled={!hasActiveClinic}
            className="!text-[12px] !py-1.5 !px-3 2xl:!px-4 !h-auto !rounded-lg shrink-0"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};
