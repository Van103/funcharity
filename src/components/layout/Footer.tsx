import { Link } from "react-router-dom";
import { Heart, Twitter, Github, Linkedin, Mail, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

const footerLinks = {
  Platform: [
    { name: "Campaigns", href: "/campaigns" },
    { name: "Needs Map", href: "/needs-map" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "How It Works", href: "/how-it-works" },
  ],
  Community: [
    { name: "For Donors", href: "/donors" },
    { name: "For Volunteers", href: "/volunteers" },
    { name: "For NGOs", href: "/ngos" },
    { name: "Leaderboard", href: "/leaderboard" },
  ],
  Resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Smart Contracts", href: "/contracts" },
    { name: "Blog", href: "/blog" },
    { name: "Support", href: "/support" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "KYC Policy", href: "/kyc" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Github, href: "https://github.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Globe, href: "https://funcharity.org" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo size="md" />
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-4 max-w-xs">
              Từ thiện là ánh sáng. Minh bạch là vàng.
            </p>
            <p className="text-primary-foreground/60 text-xs mb-4 max-w-xs">
              FUN Charity – Nơi lòng tốt trở nên minh bạch – kết nối – và bất tử hóa bằng blockchain.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.href} href={social.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground/70 hover:text-secondary hover:bg-primary-light">
                      <Icon className="w-4 h-4" />
                    </Button>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-secondary mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-light/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">
            © 2024 FUN Charity. All rights reserved. Built with{" "}
            <Heart className="inline w-3 h-3 text-secondary" fill="currentColor" /> on Web3.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>100% Transparent • On-Chain Verified • Community Governed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
