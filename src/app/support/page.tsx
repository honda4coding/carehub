"use client";

import { useState, FormEvent, useEffect } from "react";
import { LuMail, LuPhone, LuSend, LuLifeBuoy, LuLock, LuMessageSquare, LuHeadphones } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { submitSupportMessage } from "@/services/supportService";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function SupportPage() {
  const { isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@carehub.com";
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "01211635126";

  useEffect(() => {
    if (user) {
      const names = user.name ? user.name.split(" ") : ["", ""];
      setFormData(prev => ({
        ...prev,
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to send a message.");
      return;
    }

    try {
      setLoading(true);
      await submitSupportMessage(formData);
      toast.success("Message sent successfully! Our team will contact you soon.");
      setFormData(prev => ({ ...prev, subject: "", message: "", phone: "" }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[hsl(var(--color-bg))] selection:bg-[hsl(var(--color-primary)/0.2)]">
      {/* Hero Section */}
      <div className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden border-b border-[hsl(var(--color-border))]">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-1/2 -right-1/4 w-full md:w-[800px] h-[800px] rounded-full bg-[hsl(var(--color-primary)/0.05)] blur-[100px]" />
          <div className="absolute -bottom-1/2 -left-1/4 w-full md:w-[600px] h-[600px] rounded-full bg-[hsl(var(--color-secondary)/0.05)] blur-[100px]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <Badge variant="primary" className="mb-6 gap-2 border-[hsl(var(--color-primary)/0.2)] shadow-sm">
            <LuHeadphones className="w-4 h-4" />
            <span>24/7 Support Center</span>
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-black text-[hsl(var(--color-text))] tracking-tight mb-6">
            We're here to <span className="text-[hsl(var(--color-primary))]">help you</span>
          </h1>
          <p className="text-lg lg:text-xl text-[hsl(var(--color-text-muted))] max-w-2xl mx-auto leading-relaxed">
            Got a question, issue, or just want to say hi? Fill out the form below or reach us directly via our support channels.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="bg-[hsl(var(--color-bg-surface))] rounded-[2.5rem] border border-[hsl(var(--color-border))] shadow-[var(--shadow-card)] overflow-hidden flex flex-col lg:flex-row">
          
          {/* Contact Details Panel */}
          <div className="lg:w-[400px] xl:w-[450px] shrink-0 bg-[hsl(var(--color-bg-soft))] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-[hsl(var(--color-border))] relative overflow-hidden flex flex-col justify-between">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--color-primary)/0.08)] rounded-bl-[100px] -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[hsl(var(--color-secondary)/0.08)] rounded-tr-[100px] -ml-10 -mb-10 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-8 flex items-center gap-3">
                <LuMessageSquare className="text-[hsl(var(--color-primary))]" />
                Get in touch
              </h2>
              
              <div className="space-y-8">
                <div className="group flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-primary)/0.1)] group-hover:bg-[hsl(var(--color-primary))] group-hover:text-white text-[hsl(var(--color-primary))] flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm border border-[hsl(var(--color-primary)/0.2)]">
                    <LuMail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Email Support</h3>
                    <a href={`mailto:${supportEmail}`} className="text-lg font-bold text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-primary))] transition-colors block">
                      {supportEmail}
                    </a>
                    <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">Typically replies in 2 hours</p>
                  </div>
                </div>

                <div className="group flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--color-secondary)/0.1)] group-hover:bg-[hsl(var(--color-secondary))] group-hover:text-white text-[hsl(var(--color-secondary))] flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm border border-[hsl(var(--color-secondary)/0.2)]">
                    <LuPhone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[hsl(var(--color-text-muted))] uppercase tracking-wider mb-1">Phone Support</h3>
                    <a href={`tel:${supportPhone}`} className="text-lg font-bold text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-secondary))] transition-colors block">
                      {supportPhone}
                    </a>
                    <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">Mon-Fri from 9am to 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-16 lg:mt-0 p-6 bg-[hsl(var(--color-bg-surface))] rounded-2xl border border-[hsl(var(--color-border))] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <LuLifeBuoy className="text-[hsl(var(--color-primary))] w-5 h-5" />
                <h4 className="font-bold text-[hsl(var(--color-text))]">CareHub Guarantee</h4>
              </div>
              <p className="text-sm text-[hsl(var(--color-text-muted))] leading-relaxed">
                We are committed to providing the best healthcare management experience. Your feedback helps us improve every day.
              </p>
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="flex-1 p-8 lg:p-12 xl:p-16 relative flex flex-col">
            <h2 className="text-3xl font-bold text-[hsl(var(--color-text))] mb-8 lg:mb-10 shrink-0">
              Send us a message
            </h2>
            
            {!isAuthenticated ? (
              <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center text-center p-8 bg-[hsl(var(--color-bg-soft))] rounded-[2rem] border border-[hsl(var(--color-border))]">
                <div className="w-20 h-20 bg-[hsl(var(--color-primary)/0.1)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[hsl(var(--color-primary)/0.2)] shrink-0">
                  <LuLock className="w-10 h-10 text-[hsl(var(--color-primary))]" />
                </div>
                <h3 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-3">Authentication Required</h3>
                <p className="text-[hsl(var(--color-text-muted))] mb-8 max-w-sm mx-auto text-lg">
                  For your security and to serve you better, please sign in to contact support.
                </p>
                <Link href="/login?callbackUrl=/support">
                  <Button variant="primary" className="px-10 py-6 text-lg w-full sm:w-auto shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    Login to Continue
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))] ml-1">First Name</label>
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" className="bg-[hsl(var(--color-bg-soft))] border-transparent focus:border-[hsl(var(--color-primary))] focus:bg-[hsl(var(--color-bg-surface))] py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))] ml-1">Last Name</label>
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" className="bg-[hsl(var(--color-bg-soft))] border-transparent focus:border-[hsl(var(--color-primary))] focus:bg-[hsl(var(--color-bg-surface))] py-3" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))] ml-1">Email Address</label>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="bg-[hsl(var(--color-bg-soft))] border-transparent focus:border-[hsl(var(--color-primary))] focus:bg-[hsl(var(--color-bg-surface))] py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))] ml-1">Phone Number</label>
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+20 123 456 7890" className="bg-[hsl(var(--color-bg-soft))] border-transparent focus:border-[hsl(var(--color-primary))] focus:bg-[hsl(var(--color-bg-surface))] py-3" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[hsl(var(--color-text))] ml-1">Subject</label>
                  <Input name="subject" value={formData.subject} onChange={handleChange} required minLength={3} placeholder="How can we help you today?" className="bg-[hsl(var(--color-bg-soft))] border-transparent focus:border-[hsl(var(--color-primary))] focus:bg-[hsl(var(--color-bg-surface))] py-3" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[hsl(var(--color-text))] ml-1">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    rows={5}
                    className="w-full py-4 px-5 rounded-2xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.5)] bg-[hsl(var(--color-bg-soft))] text-[hsl(var(--color-text))] border-2 border-transparent focus:border-[hsl(var(--color-primary))] focus:bg-[hsl(var(--color-bg-surface))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)] resize-none"
                    placeholder="Tell us more about your inquiry... We are listening."
                  ></textarea>
                </div>
                
                <Button disabled={loading} variant="primary" className="w-full mt-4 flex items-center justify-center gap-3 py-6 text-lg font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-[0.98] transition-transform">
                  {loading ? "Sending Message..." : "Send Message"}
                  {!loading && <LuSend className="w-5 h-5" />}
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
