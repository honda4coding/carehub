"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuBrainCircuit, LuX, LuSend, LuLoader } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import UpgradeModal from "@/components/doctor/subscriptions/UpgradeModal";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Message {
  role: "user" | "ai" | "system";
  content: string;
}

export default function DoctorAIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Welcome, Doctor! 🧠 I am your Clinical AI Assistant. You can ask me medical questions or upload documents to query against your personal knowledge base." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const payload: any = { symptoms: userMessage };
      if (params?.sessionId) payload.sessionId = params.sessionId;
      if (params?.patientId) payload.patientId = params.patientId;

      const res = await axios.post(
        `${BASE_URL}/ai/ask`,
        payload,
        { headers: authHeaders() }
      );
      
      const aiReply = res.data?.data?.response || "An error occurred while processing the request.";
      setMessages(prev => [...prev, { role: "ai", content: aiReply }]);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 403) {
        setMessages(prev => [...prev, { role: "system", content: "Access denied. Premium subscription required." }]);
        setUpgradeModalOpen(true);
      } else {
        setMessages(prev => [...prev, { role: "system", content: "Error connecting to Clinical Assistant." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessages(prev => [...prev, { role: "system", content: `Uploading ${file.name} to knowledge base...` }]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${BASE_URL}/ai/upload`, formData, {
        headers: {
          ...authHeaders(),
          "Content-Type": "multipart/form-data"
        }
      });
      setMessages(prev => [...prev, { role: "system", content: `✅ ${file.name} successfully analyzed and added to your knowledge base.` }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: "system", content: `❌ Failed to upload ${file.name}. ${error.response?.data?.message || ''}` }]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 z-50"
          title="Clinical Assistant"
        >
          <LuBrainCircuit size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 w-full h-[100dvh] rounded-none sm:bottom-6 sm:right-6 sm:inset-auto sm:w-[450px] sm:h-[550px] sm:max-h-[85vh] sm:rounded-2xl bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-white">
            <div className="flex items-center gap-2 font-bold">
              <LuBrainCircuit size={20} />
              Clinical Assistant
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsOpen(false)} className="hover:text-white/80 transition-colors">
                <LuX size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[hsl(var(--color-bg-surface))]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user" 
                    ? "bg-primary text-white rounded-tr-none" 
                    : msg.role === "system"
                    ? "bg-primary/10 text-primary rounded-lg text-xs w-full text-center border border-primary/20"
                    : "bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border-soft))] text-[hsl(var(--color-text))] rounded-tl-none  prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                  }`}
                  dir="auto"
                >
                  {msg.role === "ai" ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border-soft))] p-3 rounded-2xl rounded-tl-none text-[hsl(var(--color-text-muted))] flex items-center gap-2">
                  <LuLoader className="animate-spin" /> Analyzing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[hsl(var(--color-bg-base))] border-t border-[hsl(var(--color-border))] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a clinical question..."
              className="flex-1 px-4 py-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] rounded-full text-sm focus:outline-none focus:border-primary"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
            >
              <LuSend size={18} />
            </button>
          </div>
        </div>
      )}

      <UpgradeModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        featureName="AI Clinical Assistant" 
      />
    </>
  );
}
