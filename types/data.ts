import type { LucideIcon } from "lucide-react";

export type QuickMenuItem = {
  name: string;
  icon: LucideIcon;
  path: string;
};

export type LandingStat = {
  num: string;
  label: string;
  desc: string;
};

export type LandingMission = {
  n: string;
  title: string;
  desc: string;
  icon: LucideIcon;
};

export type DepartmentTheme = "sky" | "amber";

export type DepartmentLeader = {
  nama: string;
  jabatan: string;
  foto: string;
  ig: string;
};

export type Department = {
  id: string;
  nama: string;
  panjang: string;
  desc: string;
  theme: DepartmentTheme;
  logo: string;
  motto: string;
  focus: string[];
  leaders: DepartmentLeader[];
};

export type OrganizationMember = {
  role?: "leader" | "vice" | "staff";
  nama: string;
  jabatan: string;
  foto: string;
  instagram: string;
  quote?: string;
};

export type AnnouncementPass = {
  name: string;
  divisi: string;
};

export type SocialLinkData = {
  href: string;
  label: string;
  icon: "instagram" | "tiktok" | "linkedin" | "whatsapp";
};

export type NavLinkData = {
  name: string;
  path: string;
};

export type AspirasiTopic = {
  id: string;
  label: string;
  value: string;
};
