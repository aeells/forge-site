import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Shield, 
  Zap, 
  Eye, 
  Settings, 
  ArrowRight, 
  Check,
  ChevronRight
} from "lucide-react";

// Stripe Product IDs
const STRIPE_PRODUCTS = {
  starter: "prod_U111jstSxpFPJD",
  professional: "prod_U112Ow8zXBv4DC",
};

// Formspree form ID
const FORMSPREE_FORM_ID = "mreaadaz";

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleCheckout = (tier: "starter" | "professional" | "enterprise") => {
    if (tier === "enterprise") {
      scrollToSection("contact");
      toast.info("Please fill out the contact form for enterprise pricing");
      return;
    }

    const productId = STRIPE_PRODUCTS[tier];
    if (productId) {
      // Redirect to Stripe Checkout with product ID
      const checkoutUrl = `https://checkout.stripe.com/pay/${productId}`;
      toast.info("Redirecting to checkout...");
      window.open(checkoutUrl, "_blank");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      // Using Formspree for contact form handling
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          company: contactForm.company,
          message: contactForm.message,
        }),
      });

      if (response.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setContactForm({ name: "", email: "", company: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Forge Platform" className="w-8 h-8" />
            <span className="font-semibold text-foreground">Forge</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground border border-border">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Now in public beta
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground">
              Build enterprise microservices{" "}
              <span className="text-primary">in hours</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Launch production-ready applications with zero-trust security, horizontal scaling, and full observability. Built on Java, Maven, and Quarkus on AWS.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => scrollToSection("pricing")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 px-6"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("features")}
                className="font-semibold h-11 px-6"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Zero-Trust</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">∞</div>
                <div className="text-sm text-muted-foreground">Horizontal Scale</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">AWS</div>
                <div className="text-sm text-muted-foreground">Native</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built-in security, observability, and operational tooling to scale your platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Authentication",
                description: "Zero-trust security model with OAuth, JWT, and role-based access control.",
              },
              {
                icon: Eye,
                title: "Observability",
                description: "Distributed tracing, metrics, and log aggregation out of the box.",
              },
              {
                icon: Settings,
                title: "Operational Tooling",
                description: "CI/CD pipelines, automated deployments, and infrastructure as code.",
              },
              {
                icon: Zap,
                title: "Scalable Infrastructure",
                description: "Auto-scaling microservices on AWS with Kubernetes orchestration.",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="p-6 bg-card border-border hover:border-primary/30 transition-all group"
              >
                <div className="mb-4 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border bg-secondary/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Scale as you grow. All plans include core features.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={billingPeriod === "monthly" ? "text-foreground font-semibold" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch
                checked={billingPeriod === "annual"}
                onCheckedChange={(checked) => setBillingPeriod(checked ? "annual" : "monthly")}
              />
              <span className={billingPeriod === "annual" ? "text-foreground font-semibold" : "text-muted-foreground"}>
                Annual <span className="text-primary text-xs ml-1">(Save 17%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                tier: "starter" as const,
                name: "Starter",
                monthlyPrice: 49,
                annualPrice: 490,
                description: "Perfect for small teams",
                features: [
                  "Up to 5 microservices",
                  "Basic authentication",
                  "Standard observability",
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
                description: "For growing teams",
                features: [
                  "Unlimited microservices",
                  "Advanced zero-trust security",
                  "Full observability suite",
                  "Operational tooling",
                  "Priority support",
                  "99.9% uptime SLA",
                ],
                highlight: true,
              },
              {
                tier: "enterprise" as const,
                name: "Enterprise",
                monthlyPrice: 999,
                annualPrice: 9990,
                description: "For large deployments",
                features: [
                  "Everything in Professional",
                  "Dedicated infrastructure",
                  "Custom compliance policies",
                  "24/7 phone & Slack support",
                  "Solutions architect",
                  "99.99% uptime SLA",
                ],
                highlight: false,
              },
            ].map((plan) => {
              const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
              const displayPrice = billingPeriod === "monthly" ? price : Math.round(price / 12);

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
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">${displayPrice}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingPeriod === "annual" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Billed ${plan.annualPrice} annually
                      </p>
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
                    Get Started
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

      {/* Contact Section */}
      <section id="contact" className="py-24 border-t border-border">
        <div className="container px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Get in touch
              </h2>
              <p className="text-lg text-muted-foreground">
                Have questions? Our team is here to help.
              </p>
            </div>

            <Card className="p-8 bg-card border-border">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
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
                    onChange={(e) =>
                      setContactForm({ ...contactForm, company: e.target.value })
                    }
                    className="bg-secondary border-border"
                    placeholder="Your company"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
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

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Forge Platform" className="w-6 h-6" />
                <span className="font-semibold text-foreground">Forge</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise microservices platform built for scale.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => scrollToSection("features")} className="hover:text-foreground transition-colors flex items-center gap-1">
                    Features <ChevronRight className="h-3 w-3" />
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("pricing")} className="hover:text-foreground transition-colors flex items-center gap-1">
                    Pricing <ChevronRight className="h-3 w-3" />
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
                    Docs <ChevronRight className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
                    About <ChevronRight className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollToSection("contact")} className="hover:text-foreground transition-colors flex items-center gap-1">
                    Contact <ChevronRight className="h-3 w-3" />
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
                    Blog <ChevronRight className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
                    Privacy <ChevronRight className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
                    Terms <ChevronRight className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-mono">
              © 2026 Forge Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
