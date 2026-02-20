import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Shield, 
  Zap, 
  Eye, 
  Settings, 
  ArrowRight, 
  Check,
  Terminal,
  Lock,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const createCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({ name: "", email: "", company: "", message: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleCheckout = (tier: "starter" | "professional" | "enterprise") => {
    if (!isAuthenticated) {
      toast.info("Please sign in to subscribe");
      window.location.href = getLoginUrl();
      return;
    }
    createCheckout.mutate({ tier, billingPeriod });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(contactForm);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              <span className="text-primary">[</span>
              ZERO-TRUST
              <span className="text-secondary">]</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </button>
          </div>
          <div>
            {isAuthenticated ? (
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Error code decoration */}
            <div className="inline-block mb-6 px-4 py-2 border border-primary/30 bg-primary/5 font-mono text-xs text-primary">
              <span className="text-secondary">&gt;&gt;</span> SYSTEM_STATUS: OPERATIONAL{" "}
              <span className="text-accent">0x00</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="inline-block" style={{ 
                textShadow: "2px 0 0 cyan, -2px 0 0 magenta" 
              }}>
                ZERO-TRUST
              </span>
              <br />
              <span className="text-primary">MICRO-SERVICES</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-5xl">
                PLATFORM
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Launch production-ready applications in hours, not months. Built with{" "}
              <span className="text-primary font-bold">Java</span>,{" "}
              <span className="text-secondary font-bold">Maven</span>, and{" "}
              <span className="text-accent font-bold">Quarkus</span> on AWS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => scrollToSection("pricing")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("features")}
                className="border-primary/50 text-foreground hover:bg-primary/10"
              >
                Explore Features
              </Button>
            </div>

            {/* Technical brackets decoration */}
            <div className="mt-12 flex justify-center gap-8 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                ZERO-TRUST
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                HORIZONTAL-SCALE
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                AWS-NATIVE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-1 border border-secondary/30 bg-secondary/5 font-mono text-xs text-secondary">
              <span className="text-primary">&lt;</span> CORE_CAPABILITIES{" "}
              <span className="text-primary">/&gt;</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Enterprise-Grade Infrastructure
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale modern applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Authentication",
                description: "Zero-trust security model with built-in OAuth, JWT, and role-based access control.",
                color: "text-primary",
              },
              {
                icon: Eye,
                title: "Observability",
                description: "Full-stack monitoring with distributed tracing, metrics, and log aggregation.",
                color: "text-secondary",
              },
              {
                icon: Settings,
                title: "Operational Tooling",
                description: "CI/CD pipelines, automated deployments, and infrastructure as code.",
                color: "text-accent",
              },
              {
                icon: Zap,
                title: "Scalable Infrastructure",
                description: "Auto-scaling microservices on AWS with Kubernetes orchestration.",
                color: "text-primary",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="p-6 bg-card border-border hover:border-primary/50 transition-all group"
              >
                <div className="mb-4">
                  <feature.icon className={`h-10 w-10 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-1 border border-accent/30 bg-accent/5 font-mono text-xs text-accent">
              <span className="text-primary">$</span> PRICING_TIERS{" "}
              <span className="text-secondary">[ ]</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Scale as you grow. All plans include core features.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={billingPeriod === "monthly" ? "text-foreground font-bold" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch
                checked={billingPeriod === "annual"}
                onCheckedChange={(checked) => setBillingPeriod(checked ? "annual" : "monthly")}
              />
              <span className={billingPeriod === "annual" ? "text-foreground font-bold" : "text-muted-foreground"}>
                Annual <span className="text-primary text-xs">(Save 17%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                tier: "starter" as const,
                name: "Starter",
                monthlyPrice: 49,
                annualPrice: 490,
                description: "Perfect for small teams and proof-of-concept projects",
                features: [
                  "Up to 5 microservices",
                  "Basic authentication & authorization",
                  "Standard observability dashboard",
                  "Community support",
                  "99.5% uptime SLA",
                ],
                highlight: false,
              },
              {
                tier: "professional" as const,
                name: "Professional",
                monthlyPrice: 199,
                annualPrice: 1990,
                description: "For growing teams ready to scale production workloads",
                features: [
                  "Unlimited microservices",
                  "Advanced zero-trust security",
                  "Full observability suite with APM",
                  "Operational tooling & automation",
                  "Priority email support",
                  "99.9% uptime SLA",
                ],
                highlight: true,
              },
              {
                tier: "enterprise" as const,
                name: "Enterprise",
                monthlyPrice: 999,
                annualPrice: 9990,
                description: "Custom solutions for large-scale deployments",
                features: [
                  "Everything in Professional",
                  "Dedicated infrastructure",
                  "Custom compliance & security policies",
                  "24/7 phone & Slack support",
                  "Dedicated solutions architect",
                  "99.99% uptime SLA",
                  "Custom SLA available",
                ],
                highlight: false,
              },
            ].map((plan) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
              const displayPrice = billingPeriod === "monthly" ? price : Math.round(price / 12);

              return (
                <Card
                  key={plan.tier}
                  className={`p-8 ${
                    plan.highlight
                      ? "border-primary bg-primary/5 relative"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      RECOMMENDED
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-primary">${displayPrice}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingPeriod === "annual" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed ${plan.annualPrice} annually
                      </p>
                    )}
                  </div>

                  <Button
                    className={`w-full mb-6 font-bold ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    }`}
                    onClick={() => handleCheckout(plan.tier)}
                    disabled={createCheckout.isPending}
                  >
                    {createCheckout.isPending ? "Processing..." : "Get Started"}
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-card/30">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1 border border-primary/30 bg-primary/5 font-mono text-xs text-primary">
                <span className="text-secondary">@</span> CONTACT_FORM{" "}
                <span className="text-accent">{"{ }"}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">Get In Touch</h2>
              <p className="text-lg text-muted-foreground">
                Have questions? Our team is here to help you get started.
              </p>
            </div>

            <Card className="p-8 bg-card border-border">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      required
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={contactForm.company}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, company: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
                    required
                    rows={6}
                    className="bg-input border-border resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  disabled={submitContact.isPending}
                >
                  {submitContact.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="h-5 w-5 text-primary" />
                <span className="font-bold">
                  <span className="text-primary">[</span>
                  ZERO-TRUST
                  <span className="text-secondary">]</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade micro-services platform for modern application development.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => scrollToSection("features")} className="hover:text-foreground transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("pricing")} className="hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollToSection("contact")} className="hover:text-foreground transition-colors">
                    Contact
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-mono">
              <span className="text-primary">&copy;</span> 2026 Zero-Trust Micro-Services Platform.{" "}
              <span className="text-secondary">All rights reserved.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
