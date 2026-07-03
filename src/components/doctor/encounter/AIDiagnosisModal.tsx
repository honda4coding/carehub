import { useState } from "react";
import axios from "axios";
import { LuStethoscope, LuWand, LuX, LuTriangleAlert, LuCheck, LuSparkles, LuCircleAlert, LuFileText } from "react-icons/lu";
import UpgradeModal from "@/components/doctor/subscriptions/UpgradeModal";

interface AIDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptoms: string;
  currentDiagnosis: string;
  sessionId: string;
  patientId?: string;
  token: string;
  onSelectDiagnosis: (diagnosis: string) => void;
}

export default function AIDiagnosisModal({
  isOpen,
  onClose,
  symptoms,
  currentDiagnosis,
  sessionId,
  patientId,
  token,
  onSelectDiagnosis
}: AIDiagnosisModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [diagnoses, setDiagnoses] = useState<{ condition: string; rationale: string }[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  if (!isOpen) return null;

  const fetchDiagnoses = async () => {
    if (!symptoms || symptoms.trim() === "") {
      setError("Please dictate or type some symptoms first before asking the AI.");
      return;
    }

    setLoading(true);
    setError("");
    setHasFetched(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${baseUrl}/ai/differential-diagnosis`,
        {
          symptoms,
          currentDiagnosis,
          sessionId,
          patientId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDiagnoses(response.data.data.diagnoses || []);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("Feature 'ai' requires an active subscription upgrade.");
        setUpgradeModalOpen(true);
      } else {
        setError(err.response?.data?.message || "Failed to analyze symptoms. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (condition: string) => {
    onSelectDiagnosis(condition);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-200 shadow-xl">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LuWand className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">AI Differential Diagnosis</h2>
                <p className="text-xs font-semibold text-gray-500">Powered by Medical AI Assistant</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LuX />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 bg-white flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
            
            {!hasFetched && !loading && (
              <div className="text-center py-8">
                <LuStethoscope className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 font-bold mb-2">Ready to Analyze Symptoms</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  The AI will analyze the patient's chief complaints alongside their medical history to suggest potential differential diagnoses.
                </p>
                <button 
                  onClick={fetchDiagnoses}
                  className="bg-primary hover:bg-primary-strong text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 mx-auto"
                >
                  <LuWand /> Generate Diagnoses
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-[hsl(var(--color-text))] font-bold animate-pulse">Analyzing symptoms and history...</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <LuTriangleAlert className="text-red-600 text-xl shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 font-bold text-sm">Analysis Failed</h4>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {diagnoses.length > 0 && !loading && (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                  <LuCheck className="text-green-600 text-base" /> AI Suggestions
                </p>
                {diagnoses.map((diag, index) => (
                  <div 
                    key={index}
                    className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-gray-900 font-bold text-base mb-1">
                          {diag.condition}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {diag.rationale}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleSelect(diag.condition)}
                        className="shrink-0 bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {(hasFetched || error) && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 transition-all"
              >
                Close
              </button>
              <button 
                onClick={fetchDiagnoses}
                disabled={loading}
                className="bg-primary hover:bg-primary-strong text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <LuWand /> Retry Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        featureName="AI Differential Diagnosis" 
      />
    </>
  );
}
