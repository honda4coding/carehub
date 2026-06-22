import { LuSearch, LuShieldCheck, LuUserPlus } from "react-icons/lu";

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
}: any) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 relative">
        <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl p-6 h-full flex flex-col justify-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--color-primary)/0.05)] rounded-bl-full rounded-tr-2xl -z-10" />
          <h2 className="text-lg font-black text-[hsl(var(--color-text))] mb-1">Start New Consultation</h2>
          <p className="text-xs text-[hsl(var(--color-text-muted))] font-medium mb-4">Search for an online patient by name, phone, or ID to request access.</p>
          
          <div className="relative">
            <div className="flex items-center border border-[hsl(var(--color-primary)/0.3)] bg-[hsl(var(--color-bg-surface))] rounded-xl p-1 focus-within:ring-2 focus-within:ring-[hsl(var(--color-primary)/0.2)] transition-all min-w-0">
              <LuSearch className="ml-2 sm:ml-3 mr-2 text-[hsl(var(--color-primary))] text-base sm:text-lg shrink-0" />
              <input 
                type="text" 
                placeholder="e.g. 01012345678 or Mahmoud..." 
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] sm:text-sm py-2 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-primary text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 ml-1"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-[hsl(var(--color-border-soft))] bg-[hsl(var(--color-bg-soft))] flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))]">Search Results</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-[10px] text-[hsl(var(--color-danger))] font-bold">Close</button>
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
                      className="flex items-center justify-between p-3 hover:bg-[hsl(var(--color-bg-soft))] transition-colors border-b border-[hsl(var(--color-border-soft))]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--color-secondary)/0.15)] text-[hsl(var(--color-secondary-strong))] flex items-center justify-center text-xs font-black uppercase">
                          {patient.fullName ? patient.fullName.slice(0, 2) : "PT"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[hsl(var(--color-text))]">{patient.fullName}</p>
                          <p className="text-xs font-medium text-[hsl(var(--color-text-muted))]">{patient.phoneNumber}</p>
                        </div>
                      </div>
                      <button className="text-[11px] font-bold bg-[hsl(var(--color-primary)/0.1)] hover:bg-[hsl(var(--color-primary)/0.2)] text-primary px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      onClick={() => handleRequestAccess(patient)}
                      >
                        <LuShieldCheck className="text-[13px]" />
                        Request Access
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="bg-gradient-doctor rounded-2xl p-6 h-full flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl mb-3 backdrop-blur-sm">
            <LuUserPlus />
          </div>
          <h2 className="text-white text-lg font-black mb-1 relative z-10">Walk-In Patient</h2>
          <p className="text-white/80 text-xs font-medium mb-4 relative z-10">For patients without the app</p>
          <button 
            onClick={() => setWalkInModalOpen(true)}
            className="w-full bg-white text-primary text-sm font-bold py-2.5 rounded-xl hover:scale-[1.02] transition-transform relative z-10"
          >
            Register Offline Patient
          </button>
        </div>
      </div>
    </div>
  );
};
