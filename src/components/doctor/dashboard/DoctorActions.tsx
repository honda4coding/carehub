import { LuSearch, LuShieldCheck, LuUserPlus } from "react-icons/lu";
import { Button } from "@/components/ui/Button";

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {/* Welcome Card - Left, larger */}
      <div className="md:col-span-2">
        <div className="bg-gradient-doctor rounded-xl p-5 h-full flex items-center gap-4 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute right-12 top-2 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-[22px] font-black border-2 border-white/25 shrink-0">
            {user?.name?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || "D"}
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-[13px] font-semibold text-white/70 mb-0.5">Welcome back,</p>
            <h2 className="text-[20px] font-black text-white leading-tight">Dr. {user?.name || user?.fullName || "Doctor"}</h2>
            <p className="text-[12px] font-medium text-white/60 mt-1">Have a productive day ahead ✨</p>
          </div>
        </div>
      </div>

      {/* Start Consultation - Larger Card */}
      <div className="md:col-span-2 relative">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-3.5 h-full flex flex-col justify-center relative">
          <h2 className="text-[15px] font-black text-[hsl(var(--color-text))] mb-2 leading-tight">Start Consultation</h2>
          
          <div className="relative w-full">
            <div className="flex items-center border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-[8px] p-0.5 focus-within:border-[hsl(var(--color-primary)/0.5)] focus-within:ring-2 focus-within:ring-[hsl(var(--color-primary)/0.1)] transition-all min-w-0">
              <LuSearch className="ml-2.5 mr-2 text-[hsl(var(--color-text-muted))] text-[14px] shrink-0" />
              <input 
                type="text" 
                placeholder="Search patient phone or name..." 
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] font-medium py-1.5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="!text-[12px] !px-4 !py-1.5 !h-auto !rounded-[6px] ml-0.5 shrink-0"
              >
                {isSearching ? "..." : "Search"}
              </Button>
            </div>

            {showSearchResults && (
              <div className="absolute top-full right-0 mt-2 w-full md:w-[400px] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
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
      <div className="md:col-span-1">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl p-3.5 h-full flex flex-row md:flex-col items-center md:items-stretch justify-between relative">
          <div className="flex items-center gap-3 mb-0 md:mb-2">
            <div className="w-12 h-12 bg-[hsl(var(--color-primary)/0.1)] rounded-xl flex items-center justify-center text-[hsl(var(--color-primary))] text-[24px] shrink-0">
              <LuUserPlus />
            </div>
            <div>
              <h2 className="text-[hsl(var(--color-text))] text-[16px] font-black leading-tight">Walk-In</h2>
              <p className="text-[hsl(var(--color-text-muted))] text-[12px] font-semibold">Offline patients</p>
            </div>
          </div>
          <Button 
            size="sm"
            onClick={() => setWalkInModalOpen(true)}
            className="!text-[11px] !py-1 !px-3 !h-[32px] !rounded-lg w-fit md:self-end shrink-0"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};
