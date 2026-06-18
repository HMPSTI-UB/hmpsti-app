import {
  Award,
  Calendar,
  Compass,
  Heart,
  LayoutGrid,
  ShoppingBag,
  Users,
  Zap,
} from "lucide-react";
import type {
  AnnouncementPass,
  AspirasiTopic,
  Department,
  LandingMission,
  LandingStat,
  NavLinkData,
  OrganizationMember,
  QuickMenuItem,
  SocialLinkData,
} from "@/types/data";

export const NOISE_TEXTURE =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")';
export const DEPARTMENT_NOISE_TEXTURE =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")';
export const brandLogo = "hmpsti-asset/logos/logo-kabinet";
export const organizationPlaceholderImage =
  "https://ouch-cdn2.icons8.com/3Ro3XNdxB8qJ2XJjZ_zYgZtWv51k5G7oJ7uW_JzZ_Jz/rs:fit:368:368/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9wbmcvOC82/YWU4NzQ2MS0wZGM4/LTRjODMtYjNjOC02YjQ0OGIyOWFhZGYu/cG5n.png";
export const merchInstagramUrl = "https://www.instagram.com/hmpsti.vokasiub/";

export const navLinks: NavLinkData[] = [
  { name: "Beranda", path: "/" },
  { name: "Struktur", path: "/struktur" },
  { name: "Departemen", path: "/departemen" },
  { name: "Kalender", path: "/kalender" },
  { name: "Merch", path: "/merch" },
];

export const quickMenuItems: QuickMenuItem[] = [
  { name: "Struktur", icon: Users, path: "/struktur" },
  { name: "Divisi", icon: LayoutGrid, path: "/departemen" },
  { name: "Kalender", icon: Calendar, path: "/kalender" },
  { name: "Store", icon: ShoppingBag, path: "/merch" },
];

export const landingStats: LandingStat[] = [
  {
    num: "07",
    label: "Departemen Sinergis",
    desc: "Divisi kerja terfokus pengembangan akademik & minat bakat.",
  },
  {
    num: "100+",
    label: "Pengurus Aktif",
    desc: "Anggota kabinet yang menggerakkan roda HMPSTI.",
  },
  {
    num: "30+",
    label: "Program Pembangunan",
    desc: "Agenda taktis terukur berbasis indikator keberhasilan.",
  },
  {
    num: "1.000+",
    label: "Mahasiswa Terlayani",
    desc: "Ruang advokasi, bantuan kesejahteraan, dan perlindungan hak.",
  },
];

export const landingMissions: LandingMission[] = [
  {
    n: "01",
    title: "Tata Kelola Profesional",
    desc: "Menciptakan birokrasi internal organisasi yang solid, akuntabel, dan berbasis indikator kinerja terukur.",
    icon: Award,
  },
  {
    n: "02",
    title: "Kolaborasi Sinergis",
    desc: "Membuka jejaring kemitraan strategis yang solid baik dengan internal kampus maupun mitra industri luar kampus.",
    icon: Users,
  },
  {
    n: "03",
    title: "Jembatan Aspirasi",
    desc: "Bertindak responsif, proaktif, dan taktis dalam advokasi pemenuhan hak-hak serta kesejahteraan mahasiswa.",
    icon: Heart,
  },
  {
    n: "04",
    title: "Ekosistem Prestasi",
    desc: "Menyediakan pembekalan intensif, kompetensi praktis, dan dukungan fasilitas bagi mahasiswa berprestasi.",
    icon: Zap,
  },
  {
    n: "05",
    title: "Inovasi Fungsional",
    desc: "Mengembangkan produk teknologi tepat guna untuk penyempurnaan layanan internal dan efisiensi birokrasi.",
    icon: Compass,
  },
];

export const departments: Department[] = [
  {
    id: "psdm",
    nama: "PSDM",
    panjang: "Pengembangan Sumber Daya Mahasiswa",
    desc: "Mewujudkan sumber daya mahasiswa Teknologi Informasi yang aktif, kompeten, berintegritas, adaptif, dan berjiwa kepemimpinan melalui proses kaderisasi dan pengembangan organisasi yang berkelanjutan.",
    theme: "sky",
    logo: "hmpsti-asset/logos/psdm",
    motto: "Membentuk Kader, Membangun Karakter.",
    focus: [
      "Leadership Development Camp",
      "TI Career Simulation",
      "Rangkaian Samba TI",
      "Maba to Maba (M2M)",
    ],
    leaders: [
      {
        nama: "Adam Ahmad Bimantoro",
        jabatan: "Ketua Departemen",
        foto: "",
        ig: "",
      },
      {
        nama: "Muhammad Hafizh Fajariyanto",
        jabatan: "Wakil Ketua 1",
        foto: "hmpsti-asset/leaders/hafizh-wakil-ketua-departemen-1-psdm",
        ig: "hapiz24_",
      },
      {
        nama: "Vallerina Gracela Purba",
        jabatan: "Wakil Ketua 2",
        foto: "hmpsti-asset/leaders/vallerina-wakil-ketua-departemen-2-psdm",
        ig: "vallerinacelaa",
      },
    ],
  },
  {
    id: "inotek",
    nama: "INOTEK",
    panjang: "Inovasi & Teknologi",
    desc: "Pusat pengembangan kompetensi teknis yang praktis dan berdampak nyata. Kami berperan sebagai 'Tech-Hub' yang menjembatani mahasiswa dengan tren industri IT terkini melalui riset, kompetisi, dan portofolio karya.",
    theme: "amber",
    logo: "hmpsti-asset/logos/inotek",
    motto: "Explore, Compete, Create.",
    focus: ["Ignite Academy", "InKnowledge", "Roots X InnoFair"],
    leaders: [
      {
        nama: "Muhammad Rohan Rifqi",
        jabatan: "Ketua Departemen",
        foto: "hmpsti-asset/leaders/muhammad-rohan-rifqi-ketua-departemen-inotek",
        ig: "rclhan",
      },
      {
        nama: "Muhammad Mu'taz Syafiq",
        jabatan: "Wakil Ketua 1",
        foto: "hmpsti-asset/leaders/muhammad-mu-taz-syafiq-wakil-ketua-departemen-1-inotek",
        ig: "mutazsyafiq_",
      },
      {
        nama: "Seila Salsabiela",
        jabatan: "Wakil Ketua 2",
        foto: "hmpsti-asset/leaders/seila-salsabiela-wakil-departemen-inotek",
        ig: "selai_____x",
      },
    ],
  },
  {
    id: "medinfo",
    nama: "MEDINFO",
    panjang: "Media & Informasi",
    desc: "Gardu kreatif yang mengoptimalkan sistem komunikasi dan informasi berbasis teknologi. Kami fokus memperkuat identitas visual, menjembatani arus informasi, dan meningkatkan citra digital HMPSTI secara profesional.",
    theme: "sky",
    logo: "hmpsti-asset/logos/medinfo",
    motto: "Creativity Beyond Limit.",
    focus: [
      "Company Profile & Branding",
      "Workshop Design & Video",
      "Medinfo Class",
    ],
    leaders: [
      {
        nama: "Muhammad Raihan Hidayah",
        jabatan: "Ketua Departemen",
        foto: "hmpsti-asset/leaders/han-kepala-departemen-medinfo",
        ig: "raihanhidayah06",
      },
      {
        nama: "Tiara Nurfadilah",
        jabatan: "Wakil Ketua 1",
        foto: "hmpsti-asset/leaders/tiara-wakil-departemen-1-medinfo",
        ig: "tiaraa_nfh",
      },
      {
        nama: "Latisha Syifa Pratiwi",
        jabatan: "Wakil Ketua 2",
        foto: "hmpsti-asset/leaders/latisha-wakil-departemen-2-medinfo",
        ig: "latisha.prtiwi",
      },
    ],
  },
  {
    id: "advo",
    nama: "ADVOKESMA",
    panjang: "Advokasi & Kesejahteraan",
    desc: "Pusat advokasi dan pengabdian yang progresif. Kami hadir sebagai jembatan strategis untuk memperjuangkan hak mahasiswa, menyalurkan aspirasi, serta memberikan solusi nyata bagi kesejahteraan mahasiswa dan masyarakat.",
    theme: "amber",
    logo: "hmpsti-asset/logos/advokesma",
    motto: "Melayani dengan Hati.",
    focus: [
      "TI Speaks (Layanan Advokasi)",
      "HaloADVO (Pusat Aspirasi)",
      "IT Charity (Pengabdian)",
      "SEAVO (Social Event)",
      "SE-TI",
    ],
    leaders: [
      {
        nama: "Kayla Alodia Calista",
        jabatan: "Ketua Departemen",
        foto: "hmpsti-asset/leaders/kayla-alodia-calista-kepala-departmentadvokesma",
        ig: "kaylalodia",
      },
      {
        nama: "Dean Adiba Anugrah",
        jabatan: "Wakil Ketua 1",
        foto: "hmpsti-asset/leaders/dean-adiba-anugrah-wakil-kepala-departemen-bidang-kesma-advokesma",
        ig: "deanadiba._",
      },
      {
        nama: "Nadia Salwa Oktavia",
        jabatan: "Wakil Ketua 2",
        foto: "hmpsti-asset/leaders/nadia-salwa-oktavia-wakil-kepala-departemen-bidang-advokasi-advokesma",
        ig: "naadiiiaaa.a",
      },
    ],
  },
  {
    id: "hubeks",
    nama: "HUBEKS",
    panjang: "Hubungan Eksternal",
    desc: "Inisiator kolaborasi yang adaptif dan profesional. Kami menjadi garda terdepan dalam membangun sinergi strategis dengan mitra eksternal, alumni, dan industri untuk membuka peluang karier dan networking bagi mahasiswa.",
    theme: "sky",
    logo: "hmpsti-asset/logos/hubeks",
    motto: "The Synergy Hub.",
    focus: [
      "Vistech 2.0 (Visit Technology)",
      "Tech Career Radar",
      "Ramadhan Charity Connect",
    ],
    leaders: [
      {
        nama: "Nathanael Eleazar Handata",
        jabatan: "Ketua Departemen",
        foto: "hmpsti-asset/leaders/nathanael-ketua-departemen-hubeks",
        ig: "nthanaellll",
      },
      {
        nama: "Evan Swardana Adinata",
        jabatan: "Wakil Ketua",
        foto: "hmpsti-asset/leaders/evan-wakil-kepala-departemen-hubeks",
        ig: "epanlagi_",
      },
    ],
  },
  {
    id: "ekraf",
    nama: "EKRAF",
    panjang: "Ekonomi Kreatif",
    desc: "Inkubator wirausaha bagi mahasiswa TI. Kami membekali mahasiswa dengan kemampuan mengemas skill IT menjadi produk bernilai ekonomi, sekaligus menjadi motor penggerak kemandirian finansial organisasi.",
    theme: "amber",
    logo: "hmpsti-asset/logos/ekraf",
    motto: "Business with Passion.",
    focus: ["Jelajah Teknologi", "TI Merch", "Inspired Talk", "Creatrip"],
    leaders: [
      {
        nama: "Muktabar Zaki Pramana Wlbisono",
        jabatan: "Ketua Departemen",
        foto: "hmpsti-asset/leaders/muktabar-zaki-kadepekraf-hmpsti",
        ig: "muktabarzaki",
      },
      {
        nama: "Dinda Eka Cantika",
        jabatan: "Wakil Ketua",
        foto: "hmpsti-asset/leaders/dinda-wakildepartemen-ekraf",
        ig: "dindaecaa",
      },
    ],
  },
  {
    id: "mikat",
    nama: "KORA",
    panjang: "Kreatifitas & Olahraga",
    desc: "Wadah pengembangan potensi non-akademik yang berbasis kolaborasi dan inovasi. Kami memfasilitasi penyaluran minat bakat di bidang seni dan olahraga untuk mendorong prestasi dan keseimbangan hidup mahasiswa.",
    theme: "sky",
    logo: "hmpsti-asset/logos/kora",
    motto: "Sportive Spirit, Creative Mind.",
    focus: [
      "Techno Competition",
      "Techno Cup (E-Sport)",
      "IT Fun Game",
      "Hall Of Fame & Akustik",
    ],
    leaders: [
      {
        nama: "Wiratama Satrio Herlambang",
        jabatan: "Ketua Departemen",
        foto: "hmpsti-asset/leaders/wiratama-satrio-h-ketua-departemen-kora",
        ig: "wirattamaa_",
      },
      {
        nama: "Raihan Ammar Ahsani",
        jabatan: "Wakil Ketua 1",
        foto: "hmpsti-asset/leaders/raihan-ammar-ahsani-wakil-departemen-kora",
        ig: "amar.rhn",
      },
      {
        nama: "Damar Putra Hartono",
        jabatan: "Wakil Ketua 2",
        foto: "",
        ig: "",
      },
    ],
  },
];

export const bphInti: OrganizationMember[] = [
  {
    role: "leader",
    nama: "Radja Shaka",
    jabatan: "Ketua Himpunan",
    foto: "hmpsti-asset/logos/images/radja",
    quote: "Memimpin dengan visi, melangkah dengan aksi.",
    instagram: "https://www.instagram.com/rs.quranique/",
  },
  {
    role: "vice",
    nama: "Putri Salsabila",
    jabatan: "Wakil Ketua",
    foto: "hmpsti-asset/logos/images/putri",
    quote: "Sinergi adalah kunci keberhasilan.",
    instagram: "https://www.instagram.com/ptrisabill/",
  },
  {
    role: "staff",
    nama: "Mutia Aura",
    jabatan: "Sekretaris I",
    foto: "hmpsti-asset/logos/images/mutia",
    instagram: "https://www.instagram.com/mutiaauraaaa_/",
  },
  {
    role: "staff",
    nama: "Raja Esa",
    jabatan: "Sekretaris II",
    foto: "hmpsti-asset/logos/images/esa",
    instagram: "https://www.instagram.com/rajaesa_/",
  },
  {
    role: "staff",
    nama: "Vivi",
    jabatan: "Bendahara I",
    foto: "hmpsti-asset/logos/images/vivi",
    instagram: "https://www.instagram.com/fwairypiyy/",
  },
  {
    role: "staff",
    nama: "Angel",
    jabatan: "Bendahara II",
    foto: "hmpsti-asset/logos/images/angel",
    instagram: "https://www.instagram.com/angelinvcn_/",
  },
];

export const dataKompas: {
  ketua: OrganizationMember;
  anggota: OrganizationMember[];
} = {
  ketua: {
    nama: "Ghabriel Sagala",
    jabatan: "Ketua KOMPAS",
    foto: "hmpsti-asset/logos/images/gabriel",
    instagram: "https://www.instagram.com/ghabrielsagala/",
  },
  anggota: [
    {
      nama: "Divo Farelly",
      jabatan: "Kompas PSDM",
      instagram: "https://www.instagram.com/divo.farrelly/",
      foto: "hmpsti-asset/logos/images/divo",
    },
    {
      nama: "Jiddan",
      jabatan: "Kompas Inotek",
      instagram: "https://www.instagram.com/jiddanfillah_/",
      foto: "hmpsti-asset/logos/images/jiddan",
    },
    {
      nama: "Daffa Ahmad",
      jabatan: "Kompas Medinfo",
      instagram: "https://www.instagram.com/dfaahm/",
      foto: "hmpsti-asset/logos/images/damad",
    },
    {
      nama: "Alisya",
      jabatan: "Kompas Advokesma",
      instagram: "https://www.instagram.com/alisyaauraf/",
      foto: "hmpsti-asset/logos/images/alisya",
    },
    {
      nama: "Brillian Pratama",
      jabatan: "Kompas Hubeks",
      instagram: "https://www.instagram.com/brilianpratama__/",
      foto: "hmpsti-asset/logos/images/brillian",
    },
    {
      nama: "Felisha",
      jabatan: "Kompas Ekraf",
      instagram: "https://www.instagram.com/felisharegitaa/",
      foto: "hmpsti-asset/logos/images/felisha",
    },
    {
      nama: "Ghatan Naufal",
      jabatan: "Kompas Kora",
      instagram: "https://www.instagram.com/ghatan.naufal/",
      foto: "hmpsti-asset/logos/images/ghatan",
    },
  ],
};

export const socialLinks: SocialLinkData[] = [
  {
    href: "https://www.instagram.com/hmpsti.vokasiub/",
    icon: "instagram",
    label: "Instagram",
  },
  {
    href: "https://www.tiktok.com/@hmpsti.vokasiub",
    icon: "tiktok",
    label: "TikTok",
  },
  {
    href: "https://www.linkedin.com/company/hmpsti-vokasi-ub/",
    icon: "linkedin",
    label: "LinkedIn",
  },
  {
    href: "https://wa.me/6282218361690",
    icon: "whatsapp",
    label: "Contact Person",
  },
];

export const aspirasiPhone = "6285111220570";
export const aspirasiTopics: AspirasiTopic[] = [
  {
    id: "Akademik",
    label: "🎓 Akademik (Nilai, Dosen, Matkul)",
    value: "Akademik",
  },
  { id: "Fasilitas", label: "🏢 Fasilitas Kampus", value: "Fasilitas Kampus" },
  { id: "Keuangan", label: "💰 Keuangan / UKT", value: "Keuangan / UKT" },
  { id: "Lainnya", label: "💡 Lainnya / Kritik Saran", value: "Lainnya" },
];

export const calendarUrl = "https://kalender.hmpstiub.web.id/";

export const announcementLinks = {
  admin:
    "https://wa.me/6282218361690?text=Halo%20Admin,%20saya%20sudah%20cek%20pengumuman%20dan%20dinyatakan%20lolos%20Staff%20Ahli%20HMPSTI.%20Mohon%20izin%20untuk%20bergabung%20ke%20grup.",
  group: "https://chat.whatsapp.com/FeeL6bSUNn8BUqfoPJnQFO?mode=hq2tswa",
};

export const announcementColors = {
  gulfBlue: "#9FD1ED",
  gulfOrange: "#F05822",
  gulfDarkBg: "#0F0F0F",
  redError: "#EF4444",
};

export const announcementData: AnnouncementPass[] = [
  { name: "Iksan Arlatin", divisi: "PSDM" },
  { name: "Cantika Rizky R P", divisi: "PSDM" },
  { name: "Imtinan darin huwaida", divisi: "PSDM" },
  { name: "Yulinafaesa Sinaga", divisi: "PSDM" },
  { name: "Shafa Kamalia", divisi: "PSDM" },
  { name: "Ahmad Amril Zul Hafizza", divisi: "PSDM" },
  { name: "Muhammad Albar Athaillah", divisi: "PSDM" },
  { name: "Jonathan Winner Naya", divisi: "Inotek" },
  { name: "Miftakhul dzakira Asma", divisi: "Inotek" },
  { name: "Akmal Cahya Pamungkas", divisi: "Inotek" },
  { name: "Nafhisa Nailah Husnah", divisi: "Inotek" },
  { name: "Fauzi Ahmad Zaki", divisi: "Inotek" },
  { name: "Rafif Arvazean", divisi: "Inotek" },
  { name: "Oktovia Enjelika Br Nababan", divisi: "Inotek" },
  { name: "Vanesia Chelselia", divisi: "Inotek" },
  { name: "Zefanya Angelika Putri Bagariang", divisi: "Ekraf" },
  { name: "Annisa Intan Khoirina", divisi: "Ekraf" },
  { name: "Egalia Diantika Putri", divisi: "Ekraf" },
  { name: "Andhika Ahmad G.", divisi: "Ekraf" },
  { name: "M Pasha", divisi: "Ekraf" },
  { name: "Tania Syabandiah", divisi: "Ekraf" },
  { name: "Tania Hertawan", divisi: "Ekraf" },
  { name: "Muhammad Rendy Ramadhani", divisi: "Hubeks" },
  { name: "Muhammad Nizam Putra Rasya", divisi: "Hubeks" },
  { name: "Indah Brilliant", divisi: "Hubeks" },
  { name: "Tzurayya Aisyah Priantika", divisi: "Hubeks" },
  { name: "Abdulloh Hammad", divisi: "Hubeks" },
  { name: "Muhammad Muzakky", divisi: "Hubeks" },
  { name: "Hafiz Maulana Al Fauzi", divisi: "Hubeks" },
  { name: "Anisa Dwi Ariyanti", divisi: "Medinfo" },
  { name: "Nasywa Putri Rachmitha", divisi: "Medinfo" },
  { name: "David Bimantoro Sarashadi", divisi: "Medinfo" },
  { name: "Kasiva Imtiyas Zaidah Iftinan", divisi: "Medinfo" },
  { name: "Mayla Tahmida", divisi: "Medinfo" },
  { name: "Sabil Rizki", divisi: "Medinfo" },
  { name: "Zulfa Fitri", divisi: "Medinfo" },
  { name: "Sabrina Aulia Putri", divisi: "Medinfo" },
  { name: "Kayla rihadatul", divisi: "Medinfo" },
  { name: "Keisya Lanika", divisi: "Medinfo" },
  { name: "Jessica Ester Nolia", divisi: "Medinfo" },
  { name: "Mifta Annisa Rabbani", divisi: "Medinfo" },
  { name: "Anne Sada Dewi", divisi: "Advokesma" },
  { name: "Firyal zalfaa aulia", divisi: "Advokesma" },
  { name: "Rahel Jessica Lestari Habeahan", divisi: "Advokesma" },
  { name: "Muhammad Fidho Pratama", divisi: "Advokesma" },
  { name: "Jenri Setiawan Sitepu", divisi: "Advokesma" },
  { name: "Bilqis Nailatul Muna", divisi: "Advokesma" },
  { name: "Angeliqia V G Pardosi", divisi: "Advokesma" },
  { name: "Muhammad Ardan Al ayubi", divisi: "Advokesma" },
  { name: "Joshua Winner Naya", divisi: "Kora" },
  { name: "Achmad Fachri amrullah", divisi: "Kora" },
  { name: "Sabila Rahma Aulia", divisi: "Kora" },
  { name: "Neza Frischa", divisi: "Kora" },
];

export const failedAnnouncementNames = [
  "Serli Maharani Putri Yustina",
  "TOPAN SYAHPUTRA",
  "Ridhwan Purwahdani",
  "Dwiki Ilman Nafian",
];
