import { LuShieldCheck, LuX, LuSmartphone, LuUserPlus, LuCheck } from "react-icons/lu";
import { OTPInput } from "./OTPComponents";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { fetchClient } from "@/services/fetchClient";

export const DashboardModals = ({
  isOTPModalOpen,
  setOTPModalOpen,
  isWalkInModalOpen,
  setWalkInModalOpen,
  currentOtp,
  setCurrentOtp,
  handleVerifyOTP,
  walkInName,
  setWalkInName,
  walkInPhone,
  setWalkInPhone,
  walkInAge,
  setWalkInAge,
  handleWalkInRegister,
  // new props for existing patient queue entry
  isExistingPatientModalOpen,
  setExistingPatientModalOpen,
  handleExistingPatientQueueEntry,
  selectedExistingPatient
}: any) => {
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [skipQueue, setSkipQueue] = useState<boolean>(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (isWalkInModalOpen || isExistingPatientModalOpen) {
      setSlotsLoading(true);
      const currentTime = new Date();
      const endOfToday = new Date();
      endOfToday.setHours(23,59,59,999);
      fetchClient.get(`/appointments/available-slots/me?limit=50&startDate=${currentTime.toISOString()}&endDate=${endOfToday.toISOString()}`)
        .then(res => {
          const responseData = res.data ?? res;
          setAvailableSlots(Array.isArray(responseData) ? responseData : (responseData.slots ?? responseData.data?.slots ?? []));
          setSelectedSlot("");
          setSkipQueue(false);
        })
        .catch(err => console.error("Failed to fetch slots", err))
        .finally(() => setSlotsLoading(false));
    }
  }, [isWalkInModalOpen, isExistingPatientModalOpen]);

  const renderSlotSelector = () => (
    <div className="space-y-4 mb-6 mt-4 border-t border-[hsl(var(--color-border))] pt-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Select Appointment Slot</label>
        {slotsLoading ? (
          <div className="text-sm text-[hsl(var(--color-text-muted))]">Loading slots...</div>
        ) : availableSlots.length === 0 ? (
          <div className="text-sm text-[hsl(var(--color-danger))] bg-[hsl(var(--color-danger)/0.1)] p-3 rounded-xl border border-[hsl(var(--color-danger)/0.2)]">No available slots for today. Please generate slots from the Appointments page first.</div>
        ) : (
          <select 
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            disabled={skipQueue}
            className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors disabled:opacity-50"
          >
            <option value="">-- Select a Slot --</option>
            {availableSlots.map((s: any) => (
              <option key={s._id} value={s._id}>
                {new Date(s.startDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.endDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </option>
            ))}
          </select>
        )}
      </div>

      <label className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--color-danger)/0.3)] bg-[hsl(var(--color-danger)/0.05)] cursor-pointer hover:bg-[hsl(var(--color-danger)/0.1)] transition-colors">
        <input 
          type="checkbox" 
          checked={skipQueue}
          onChange={(e) => {
            setSkipQueue(e.target.checked);
            if (e.target.checked) setSelectedSlot("");
          }}
          className="w-5 h-5 rounded border-gray-300 text-[hsl(var(--color-danger))] focus:ring-[hsl(var(--color-danger))]"
        />
        <div>
          <div className="text-sm font-bold text-[hsl(var(--color-danger))] flex items-center gap-1.5">
            <span className="text-base">⚡</span> Skip Queue
          </div>
          <div className="text-xs text-[hsl(var(--color-text-muted))] mt-0.5">Patient will be placed at the absolute front of the queue.</div>
        </div>
      </label>
    </div>
  );

  return (
    <>
      {/* OTP Verification Modal */}
      {isOTPModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))]">
              <div className="flex items-center gap-2 text-primary">
                <LuShieldCheck className="text-xl" />
                <h3 className="font-black text-[hsl(var(--color-text))]">Secure Access Handshake</h3>
              </div>
              <button onClick={() => setOTPModalOpen(false)} className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors">
                <LuX className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                   <LuSmartphone className="text-3xl text-primary" />
                </div>
                <h4 className="text-lg font-black text-[hsl(var(--color-text))]">Enter Patient OTP</h4>
                <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mt-1">
                  We've sent a 6-digit code to the patient. Ask them for the code to securely access their file.
                </p>
              </div>
              
              <OTPInput 
                length={6} 
                onComplete={(val) => setCurrentOtp(val)} 
              />

              <Button 
                onClick={handleVerifyOTP}
                disabled={currentOtp.length !== 6}
                className="w-full !rounded-xl !py-3.5 mt-2"
                icon={LuCheck}
                iconPosition="right"
              >
                Verify & Open File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-In Registration Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))]">
              <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
                <LuUserPlus className="text-[18px]" />
                <h3 className="font-black text-[hsl(var(--color-text))] text-[15px]">Walk-in Patient</h3>
              </div>
              <button onClick={() => setWalkInModalOpen(false)} className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors cursor-pointer">
                <LuX className="text-[18px]" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-5">
                Register a quick session for an offline patient. They won't need to verify an OTP.
              </p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Patient Name</label>
                  <input 
                    type="text" 
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                    placeholder="e.g. Ahmed Ali" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                      placeholder="010..." 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--color-text-muted))] mb-1.5">Age (Optional)</label>
                    <input 
                      type="number" 
                      value={walkInAge}
                      onChange={(e) => setWalkInAge(e.target.value)}
                      className="w-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-soft))] rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors" 
                      placeholder="e.g. 25" 
                      min="0"
                      max="120"
                    />
                  </div>
                </div>
              </div>

              {renderSlotSelector()}

              <Button 
                onClick={() => handleWalkInRegister(selectedSlot, skipQueue)}
                disabled={(!walkInName.trim() || !walkInPhone.trim()) || (!skipQueue && !selectedSlot)}
                className="w-full !rounded-xl !py-3.5 mt-2"
                icon={LuCheck}
                iconPosition="right"
              >
                Start Consultation Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Patient Queue Entry Modal */}
      {isExistingPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-[hsl(var(--color-border))] flex justify-between items-center bg-[hsl(var(--color-bg-soft))]">
              <div className="flex items-center gap-2 text-[hsl(var(--color-primary))]">
                <LuUserPlus className="text-[18px]" />
                <h3 className="font-black text-[hsl(var(--color-text))] text-[15px]">Add Patient to Queue</h3>
              </div>
              <button onClick={() => setExistingPatientModalOpen(false)} className="text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-danger))] transition-colors cursor-pointer">
                <LuX className="text-[18px]" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-[hsl(var(--color-text-muted))] mb-2">
                You are adding <strong className="text-[hsl(var(--color-text))]">{selectedExistingPatient?.fullName || "the patient"}</strong> to the clinic queue.
              </p>
              
              {renderSlotSelector()}

              <Button 
                onClick={() => handleExistingPatientQueueEntry(selectedSlot, skipQueue)}
                disabled={!skipQueue && !selectedSlot}
                className="w-full !rounded-xl !py-3.5 mt-2"
                icon={LuCheck}
                iconPosition="right"
              >
                Add to Queue
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
