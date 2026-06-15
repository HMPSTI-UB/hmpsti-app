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
export const brandLogo = "/assets/logos/logo-kabinet.png";
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
    logo: "/assets/logos/PSDM.png",
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
        foto: "/assets/leaders/Hafizh_Wakil Ketua Departemen 1_PSDM .jpg",
        ig: "hapiz24_",
      },
      {
        nama: "Vallerina Gracela Purba",
        jabatan: "Wakil Ketua 2",
        foto: "/assets/leaders/Vallerina_Wakil Ketua Departemen 2_PSDM.jpg",
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
    logo: "/assets/logos/Inotek.png",
    motto: "Explore, Compete, Create.",
    focus: ["Ignite Academy", "InKnowledge", "Roots X InnoFair"],
    leaders: [
      {
        nama: "Muhammad Rohan Rifqi",
        jabatan: "Ketua Departemen",
        foto: "/assets/leaders/Muhammad Rohan Rifqi_Ketua Departemen_INOTEK.jpeg",
        ig: "rclhan",
      },
      {
        nama: "Muhammad Mu'taz Syafiq",
        jabatan: "Wakil Ketua 1",
        foto: "/assets/leaders/Muhammad Mu_taz Syafiq_Wakil Ketua Departemen 1_INOTEK.jpg",
        ig: "mutazsyafiq_",
      },
      {
        nama: "Seila Salsabiela",
        jabatan: "Wakil Ketua 2",
        foto: "/assets/leaders/Seila Salsabiela_Wakil Departemen_Inotek.jpg",
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
    logo: "/assets/logos/Medinfo.png",
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
        foto: "/assets/leaders/Han_Kepala Departemen Medinfo.JPG",
        ig: "raihanhidayah06",
      },
      {
        nama: "Tiara Nurfadilah",
        jabatan: "Wakil Ketua 1",
        foto: "/assets/leaders/Tiara_Wakil Departemen 1_MEDINFO.jpg",
        ig: "tiaraa_nfh",
      },
      {
        nama: "Latisha Syifa Pratiwi",
        jabatan: "Wakil Ketua 2",
        foto: "/assets/leaders/Latisha_Wakil Departemen 2_MEDINFO.jpg",
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
    logo: "/assets/logos/Advokesma.png",
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
        foto: "/assets/leaders/Kayla Alodia Calista_Kepala DepartmentAdvokesma.jpg",
        ig: "kaylalodia",
      },
      {
        nama: "Dean Adiba Anugrah",
        jabatan: "Wakil Ketua 1",
        foto: "/assets/leaders/Dean Adiba Anugrah_Wakil Kepala Departemen Bidang Kesma_ADVOKESMA.jpg",
        ig: "deanadiba._",
      },
      {
        nama: "Nadia Salwa Oktavia",
        jabatan: "Wakil Ketua 2",
        foto: "/assets/leaders/Nadia Salwa Oktavia_Wakil Kepala Departemen Bidang Advokasi_ADVOKESMA.jpg",
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
    logo: "/assets/logos/Hubeks.png",
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
        foto: "/assets/leaders/nathanael_ketua departemen_hubeks.jpg",
        ig: "nthanaellll",
      },
      {
        nama: "Evan Swardana Adinata",
        jabatan: "Wakil Ketua",
        foto: "/assets/leaders/Evan_Wakil Kepala Departemen_HUBEKS.jpg",
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
    logo: "/assets/logos/Ekraf.png",
    motto: "Business with Passion.",
    focus: ["Jelajah Teknologi", "TI Merch", "Inspired Talk", "Creatrip"],
    leaders: [
      {
        nama: "Muktabar Zaki Pramana Wlbisono",
        jabatan: "Ketua Departemen",
        foto: "/assets/leaders/Muktabar Zaki_KadepEkraf_HMPSTI.jpg",
        ig: "muktabarzaki",
      },
      {
        nama: "Dinda Eka Cantika",
        jabatan: "Wakil Ketua",
        foto: "/assets/leaders/Dinda_WakilDepartemen_EKRAF.jpg",
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
    logo: "/assets/logos/Kora.png",
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
        foto: "/assets/leaders/Wiratama Satrio H_Ketua Departemen_Kora",
        ig: "wirattamaa_",
      },
      {
        nama: "Raihan Ammar Ahsani",
        jabatan: "Wakil Ketua 1",
        foto: "/assets/leaders/Raihan Ammar Ahsani_Wakil Departemen_KORA.jpg",
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
    foto: "/assets/logos/images/radja.png",
    quote: "Memimpin dengan visi, melangkah dengan aksi.",
    instagram: "https://www.instagram.com/rs.quranique/",
  },
  {
    role: "vice",
    nama: "Putri Salsabila",
    jabatan: "Wakil Ketua",
    foto: "/assets/logos/images/putri.png",
    quote: "Sinergi adalah kunci keberhasilan.",
    instagram: "https://www.instagram.com/ptrisabill/",
  },
  {
    role: "staff",
    nama: "Mutia Aura",
    jabatan: "Sekretaris I",
    foto: "/assets/logos/images/mutia.png",
    instagram: "https://www.instagram.com/mutiaauraaaa_/",
  },
  {
    role: "staff",
    nama: "Raja Esa",
    jabatan: "Sekretaris II",
    foto: "/assets/logos/images/esa.png",
    instagram: "https://www.instagram.com/rajaesa_/",
  },
  {
    role: "staff",
    nama: "Vivi",
    jabatan: "Bendahara I",
    foto: "/assets/logos/images/vivi.png",
    instagram: "https://www.instagram.com/fwairypiyy/",
  },
  {
    role: "staff",
    nama: "Angel",
    jabatan: "Bendahara II",
    foto: "/assets/logos/images/angel.png",
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
    foto: "/assets/logos/images/gabriel.png",
    instagram: "https://www.instagram.com/ghabrielsagala/",
  },
  anggota: [
    {
      nama: "Divo Farelly",
      jabatan: "Kompas PSDM",
      instagram: "https://www.instagram.com/divo.farrelly/",
      foto: "/assets/logos/images/divo.png",
    },
    {
      nama: "Jiddan",
      jabatan: "Kompas Inotek",
      instagram: "https://www.instagram.com/jiddanfillah_/",
      foto: "/assets/logos/images/jiddan.png",
    },
    {
      nama: "Daffa Ahmad",
      jabatan: "Kompas Medinfo",
      instagram: "https://www.instagram.com/dfaahm/",
      foto: "/assets/logos/images/damad.png",
    },
    {
      nama: "Alisya",
      jabatan: "Kompas Advokesma",
      instagram: "https://www.instagram.com/alisyaauraf/",
      foto: "/assets/logos/images/alisya.png",
    },
    {
      nama: "Brillian Pratama",
      jabatan: "Kompas Hubeks",
      instagram: "https://www.instagram.com/brilianpratama__/",
      foto: "/assets/logos/images/brillian.png",
    },
    {
      nama: "Felisha",
      jabatan: "Kompas Ekraf",
      instagram: "https://www.instagram.com/felisharegitaa/",
      foto: "/assets/logos/images/felisha.png",
    },
    {
      nama: "Ghatan Naufal",
      jabatan: "Kompas Kora",
      instagram: "https://www.instagram.com/ghatan.naufal/",
      foto: "/assets/logos/images/ghatan.png",
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
