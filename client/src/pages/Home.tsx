import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check } from "lucide-react";

// Stripe Payment Link URLs (from Dashboard: Product → Payment link → copy link).
const STRIPE_PAYMENT_LINKS: Record<string, { monthly: string; annual: string }> = {
  builder: {
    monthly: "https://buy.stripe.com/5kQ5kCcJ3bjP4Pfa6xaMU00",
    annual: "https://buy.stripe.com/fZu6oGgZj4Vr1D30vXaMU02",
  },
  scale: {
    monthly: "https://buy.stripe.com/cNi9AScJ3fA52H7diJaMU01",
    annual: "https://buy.stripe.com/7sYeVc7oJgE93Lb5QhaMU03",
  },
};

const FORMSPREE_FORM_ID = "mreaadaz";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const PLANS = [
  {
    tier: "builder" as const,
    name: "Builder",
    monthlyPrice: 99,
    annualPrice: 1010, // 15% off (99 × 12 × 0.85)
    description: "For early-stage teams building their first production system.",
    features: [
      "Organisations with < 10 employees",
      "Full Forge architecture",
      "Standard documentation and community support",
      "Email-based support",
      "Ideal for MVP and early revenue stage",
    ],
    highlight: false,
  },
  {
    tier: "scale" as const,
    name: "Scale",
    monthlyPrice: 299,
    annualPrice: 3050, // 15% off (299 × 12 × 0.85)
    description: "For scaling teams that need architectural consistency.",
    features: [
      "Organisations between 10–50 employees",
      "Full Forge architecture",
      "Priority support and Slack channel access",
      "Architecture guidance sessions (e.g., quarterly review call)",
      "Best suited for funded startups scaling engineering teams",
    ],
    highlight: true,
  },
  {
    tier: "enterprise" as const,
    name: "Enterprise",
    monthlyPrice: null,
    annualPrice: null,
    description: "For established organisations requiring structured oversight.",
    features: [
      "Organizations of 50+ employees",
      "Full Forge architecture",
      "Direct engagement with founder / architect",
      "Optional post-sale consulting and architectural advisory",
      "Strategic input and collaboration on the Forge Platform roadmap",
    ],
    highlight: false,
  },
];

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleCheckout = (tier: "builder" | "scale" | "enterprise") => {
    if (tier === "enterprise") {
      scrollToSection("contact");
      toast.info("Please fill out the contact form for enterprise pricing");
      return;
    }
    const links = STRIPE_PAYMENT_LINKS[tier];
    const paymentLink = billingPeriod === "annual" ? links?.annual : links?.monthly;
    if (paymentLink) {
      window.open(paymentLink, "_blank");
      toast.info("Redirecting to checkout...");
    } else {
      toast.info("Checkout not configured for this plan. Use the contact form.");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (response.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setContactForm({ name: "", email: "", company: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <>
      <section id="pricing" className="py-24 border-t border-border bg-secondary/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Pricing aligned with scale. Not features.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
            Forge is a foundational architecture, not a feature bundle. All customers receive the same production-ready platform.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className={billingPeriod === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch
                checked={billingPeriod === "annual"}
                onCheckedChange={(checked) => setBillingPeriod(checked ? "annual" : "monthly")}
              />
              <span className={billingPeriod === "annual" ? "text-foreground font-semibold" : "text-muted-foreground"}>
                Annual <span className="text-primary text-xs ml-1">(Save 15%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => {
              const isEnterprise = plan.tier === "enterprise";
              const price = !isEnterprise && plan.monthlyPrice != null
                ? (billingPeriod === "monthly" ? plan.monthlyPrice : Math.round((plan.annualPrice ?? 0) / 12))
                : null;
              return (
                <Card
                  key={plan.tier}
                  className={`p-8 transition-all ${
                    plan.highlight
                      ? "border-primary bg-card ring-1 ring-primary/20 relative"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-1 text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    {price != null ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground">${price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {billingPeriod === "annual" && plan.annualPrice != null && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Billed ${plan.annualPrice} annually
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-lg font-semibold text-foreground">Custom pricing</p>
                    )}
                  </div>
                  <Button
                    className={`w-full mb-6 font-semibold h-10 ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                    }`}
                    onClick={() => handleCheckout(plan.tier)}
                  >
                    {isEnterprise ? "Contact Us" : "Get Started"}
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 border-t border-border">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Get in touch</h2>
              <p className="text-lg text-muted-foreground">Have questions? Our team is here to help.</p>
            </div>
            <Card className="p-8 bg-card border-border">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm((c) => ({ ...c, name: e.target.value }))}
                      required
                      className="bg-secondary border-border"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm((c) => ({ ...c, email: e.target.value }))}
                      required
                      className="bg-secondary border-border"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                  <Input
                    id="company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm((c) => ({ ...c, company: e.target.value }))}
                    className="bg-secondary border-border"
                    placeholder="Your company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm((c) => ({ ...c, message: e.target.value }))}
                    required
                    rows={5}
                    className="bg-secondary border-border resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-10"
                  disabled={isSubmittingContact}
                >
                  {isSubmittingContact ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
