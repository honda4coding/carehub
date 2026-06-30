import { LuMail, LuPhone, LuMapPin, LuSend, LuLifeBuoy } from "react-icons/lu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SupportPage() {
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
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[hsl(var(--color-text))]">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Email Address</label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Subject</label>
                <Input placeholder="How can we help?" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[hsl(var(--color-text))]">Message</label>
                <textarea 
                  rows={4}
                  className="w-full py-4 px-4 rounded-2xl outline-none transition-all placeholder:text-[hsl(var(--color-text-muted)/0.6)] bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text))] border-[1.5px] border-transparent focus:border-[hsl(var(--color-primary))] focus:ring-4 focus:ring-[hsl(var(--color-primary)/0.1)] resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>
              <Button variant="primary" className="w-full mt-4 flex items-center justify-center gap-2 py-4">
                Send Message
                <LuSend className="w-4 h-4" />
              </Button>
            </form>
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
                <a href="mailto:support@carehub.com" className="text-[hsl(var(--color-primary))] font-semibold hover:underline">support@carehub.com</a>
              </div>
            </div>

            <div className="bg-[hsl(var(--color-bg-surface))] p-8 rounded-[2rem] border border-[hsl(var(--color-border))] flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-secondary)/0.1)] flex items-center justify-center shrink-0">
                <LuPhone className="w-6 h-6 text-[hsl(var(--color-secondary))]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-1.5">Phone Support</h3>
                <p className="text-[hsl(var(--color-text-muted))] mb-4">Available Mon-Fri, 9am-6pm EST.</p>
                <a href="tel:+18001234567" className="text-[hsl(var(--color-secondary))] font-semibold hover:underline">+1 (800) 123-4567</a>
              </div>
            </div>

            <div className="bg-[hsl(var(--color-bg-surface))] p-8 rounded-[2rem] border border-[hsl(var(--color-border))] flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--color-success)/0.1)] flex items-center justify-center shrink-0">
                <LuMapPin className="w-6 h-6 text-[hsl(var(--color-success))]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--color-text))] mb-1.5">Headquarters</h3>
                <p className="text-[hsl(var(--color-text-muted))] mb-4">Visit our main office for business inquiries.</p>
                <p className="text-[hsl(var(--color-text))] font-semibold">123 Health Ave, Suite 400<br/>San Francisco, CA 94105</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
