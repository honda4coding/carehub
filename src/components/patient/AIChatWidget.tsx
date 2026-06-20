"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuBot, LuX, LuSend, LuLoader } from "react-icons/lu";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function authHeaders() {
  const token = Cookies.get(AUTH_COOKIE_NAME);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "أهلاً بك في نظام CareHub الذكي 🤖. كيف يمكنني مساعدتك اليوم؟ (مثال: محتاج دكتور باطنة شاطر في أكتوبر بكرة)" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const res = await axios.post(
        `${BASE_URL}/ai/chatbot`,
        { message: userMessage },
        { headers: authHeaders() }
      );
      
      const aiReply = res.data?.data?.reply || "عذراً، حدث خطأ أثناء المعالجة.";
      setMessages(prev => [...prev, { role: "ai", content: aiReply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", content: "عذراً، لا يمكنني الاتصال بالخادم الآن. يرجى المحاولة لاحقاً." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[hsl(var(--color-primary))] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[hsl(var(--color-primary-dark))] transition-transform hover:scale-105 z-50"
        >
          <LuBot size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[hsl(var(--color-primary))] text-white">
            <div className="flex items-center gap-2 font-bold">
              <LuBot size={20} />
              CareHub AI Assistant
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 transition-colors">
              <LuX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[hsl(var(--color-bg-surface))]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user" 
                    ? "bg-[hsl(var(--color-primary))] text-white rounded-tr-none" 
                    : "bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border-soft))] text-[hsl(var(--color-text))] rounded-tl-none shadow-sm"
                  }`}
                  dir="auto"
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border-soft))] p-3 rounded-2xl rounded-tl-none shadow-sm text-[hsl(var(--color-text-muted))] flex items-center gap-2">
                  <LuLoader className="animate-spin" /> جاري التفكير...
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
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 px-4 py-2 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border-soft))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--color-primary))]"
              dir="rtl"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-[hsl(var(--color-primary))] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[hsl(var(--color-primary-dark))] transition-colors shrink-0"
            >
              <LuSend size={18} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
