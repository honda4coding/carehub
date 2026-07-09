"use client";

import { useState, FormEvent, useEffect } from "react";
import { LuMail, LuPhone, LuSend, LuLifeBuoy, LuLock } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { submitSupportMessage } from "@/services/supportService";
import toast from "react-hot-toast";
import Link from "next/link";

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
      const names = user.fullName ? user.fullName.split(" ") : ["", ""];
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
    <main className="min-h-screen bg-[hsl(var(--color-bg))] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-12 text-center">
          <Badge variant="primary" className="mb-6 gap-2">
            <LuLifeBuoy className="w-4 h-4" />
            <span>Help Center</span>
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[hsl(var(--color-text))] tracking-tight mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-[hsl(var(--color-text-muted))] max-w-2xl mx-auto">
            Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mt-16">
          {/* Contact Form */}
          <div className="bg-[hsl(var(--color-bg-surface))] p-8 lg:p-10 rounded-[2.5rem] border border-[hsl(var(--color-border))] shadow-sm">
            <h2 className="text-2xl font-bold text-[hsl(var(--color-text))] mb-8">Send us a message</h2>
            
            {!isAuthenticated ? (
              <div className="text-center py-10 bg-[hsl(var(--color-bg-soft))] rounded-2xl border border-[hsl(var(--color-border))]">
                <div className="w-16 h-16 bg-[hsl(var(--color-primary)/0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <LuLock className="w-8 h-8 text-[hsl(var(--color-primary))]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-2">Authentication Required</h3>
                <p className="text-[hsl(var(--color-text-muted))] mb-6 max-w-sm mx-auto">
                  You need to be logged in to send a message to our support team. This helps us serve you better.
                </p>
                <Link href="/login?callbackUrl=/support">
                  <Button variant="primary" className="px-8">
                    Login to Send Message
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))]">First Name</label>
                    <Input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Last Name</label>
                    <Input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Email Address</label>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Phone Number</label>
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+20 123 456 7890" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Subject</label>
                  <Input name="subject" value={formData.subject} onChange={handleChange} required minLength={3} placeholder="How can we help?" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    rows={4}
                    className="w-full py-4 px-4 rounded-2xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.6)] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] border-[hsl(var(--color-border))] focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)] resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                <Button disabled={loading} variant="primary" className="w-full mt-4 flex items-center justify-center gap-2 py-4">
                  {loading ? "Sending..." : "Send Message"}
                  {!loading && <LuSend className="w-4 h-4" />}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-8">
            <div className="bg-[hsl(var(--color-bg-surface))] p-8 rounded-[2rem] border border-[hsl(var(--color-border))] flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-primary)/0.1)] flex items-center justify-center shrink-0">
                <LuMail className="w-6 h-6 text-[hsl(var(--color-primary))]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-1.5">Email Support</h3>
                <p className="text-[hsl(var(--color-text-muted))] mb-4">Our team typically replies within 2 hours.</p>
                <a href={`mailto:${supportEmail}`} className="text-[hsl(var(--color-primary))] font-semibold hover:underline">{supportEmail}</a>
              </div>
            </div>

            <div className="bg-[hsl(var(--color-bg-surface))] p-8 rounded-[2rem] border border-[hsl(var(--color-border))] flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-secondary)/0.1)] flex items-center justify-center shrink-0">
                <LuPhone className="w-6 h-6 text-[hsl(var(--color-secondary))]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-1.5">Phone Support</h3>
                <p className="text-[hsl(var(--color-text-muted))] mb-4">Available Mon-Fri, 9am-6pm EST.</p>
                <a href={`tel:${supportPhone}`} className="text-[hsl(var(--color-secondary))] font-semibold hover:underline">{supportPhone}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
