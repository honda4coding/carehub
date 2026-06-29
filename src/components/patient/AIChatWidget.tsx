"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME } from "@/constants/auth";
import { LuBot, LuX, LuSend, LuLoader, LuPlus } from "react-icons/lu";
import ReactMarkdown from "react-markdown";

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
    { role: "ai", content: "Welcome to CareHub AI 🤖. How can I help you today? (e.g., I need a good internal medicine doctor tomorrow)" }
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

  const handleNewChat = () => {
    setMessages([
      { role: "ai", content: "Welcome to CareHub AI 🤖. How can I help you today? (e.g., I need a good internal medicine doctor tomorrow)" }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to state
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Exclude the very first AI welcome message from the history sent to backend if desired,
      // but let's just send the whole history so the AI has full context of the session.
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));

      const res = await axios.post(
        `${BASE_URL}/ai/chatbot`,
        { message: userMessage, chatHistory },
        { headers: authHeaders() }
      );
      
      const aiReply = res.data?.data?.reply || "Sorry, an error occurred during processing.";
      setMessages(prev => [...prev, { role: "ai", content: aiReply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I cannot connect to the server right now. Please try again later." }]);
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
          className="fixed bottom-6 end-6 w-14 h-14 bg-[hsl(var(--color-primary))] text-white rounded-full flex items-center justify-center hover:bg-[hsl(var(--color-primary-dark))] transition-transform hover:scale-105 z-50"
        >
          <LuBot size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 end-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-2xl flex flex-col z-50 overflow-hidden flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[hsl(var(--color-primary))] text-white">
            <div className="flex items-center gap-2 font-bold">
              <LuBot size={20} />
              CareHub AI Assistant
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleNewChat} title="New Chat" className="hover:text-gray-300 transition-colors">
                <LuPlus size={20} />
              </button>
              <button onClick={() => setIsOpen(false)} title="Close" className="hover:text-gray-300 transition-colors">
                <LuX size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[hsl(var(--color-bg-surface))]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === "user" 
                    ? "bg-[hsl(var(--color-primary))] text-white rounded-se-none whitespace-pre-wrap" 
                    : "bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border-soft))] text-[hsl(var(--color-text))] rounded-ss-none  prose prose-sm max-w-none rtl:prose-reverse prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-ul:list-disc prose-ol:list-decimal prose-li:my-0"
                  }`}
                  dir="auto"
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border-soft))] p-3 rounded-2xl rounded-ss-none text-[hsl(var(--color-text-muted))] flex items-center gap-2">
                  <LuLoader className="animate-spin" /> Thinking...
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
              placeholder="Type your message here..."
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
