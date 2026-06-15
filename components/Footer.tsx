// src/components/Footer.tsx
import { Instagram, Linkedin } from "@/components/social-icons";
import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";
import { socialLinks } from "@/constant/data";

// --- IKON CUSTOM (TikTok & WA) ---
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

// --- COMPONENT SOCIAL LINK ---
type SocialIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const socialIconMap: Record<(typeof socialLinks)[number]["icon"], SocialIcon> =
  {
    instagram: Instagram,
    tiktok: TikTokIcon,
    linkedin: Linkedin,
    whatsapp: WhatsAppIcon,
  };

const SocialLink = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: SocialIcon;
  label?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative p-3 bg-white/5 rounded-full border border-white/10 hover:border-[#33A5D3]/50 transition-all duration-300 hover:bg-[#33A5D3]/10 hover:-translate-y-1 overflow-hidden cursor-pointer flex items-center justify-center"
    title={label}
  >
    <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#33A5D3] transition-colors relative z-10" />
  </a>
);

// --- MAIN FOOTER COMPONENT ---
export default function Footer() {
  return (
    <footer className="relative py-20 bg-[#050505] border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center relative z-10">
        {/* 1. LOGO BESAR (INNOVARA) */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mb-10 cursor-default"
        >
          <span className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#33A5D3] to-[#F59E0B] tracking-tighter select-none drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity">
            INNOVARA
          </span>
        </motion.div>

        {/* 2. SOCIAL MEDIA ICONS */}
        <div className="flex gap-6 mb-12">
          {socialLinks.map((link) => (
            <SocialLink
              key={link.href}
              href={link.href}
              icon={socialIconMap[link.icon]}
              label={link.label}
            />
          ))}
        </div>

        {/* 3. COPYRIGHT */}
        <div className="text-center border-t border-white/5 pt-8 w-full max-w-lg">
          <p className="text-gray-600 font-mono text-[10px] uppercase tracking-widest mb-3">
            © 2026 HMPSTI UB •{" "}
            <span className="text-[#33A5D3]">Kabinet Innovara</span>
          </p>
          <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-[#33A5D3] to-[#F59E0B] tracking-widest uppercase">
            Satu Hati, Satu Gerak, TI Jaya!
          </p>
        </div>
      </div>
    </footer>
  );
}
