import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

async function main() {
  console.log('Seeding IoT Teams...');
  
  try {
    // Clear existing teams and their votes before seeding to avoid unique constraint errors
    await db.delete(schema.votes);
    await db.delete(schema.iot_teams);

    await db.insert(schema.iot_teams).values([
      {
        code: 'T4A1',
        className: 'T4A',
        groupNumber: 1,
        title: "IOT-BASED SMART SILO SYSTEM WITH INVENTORY PREDICTION AND DIGITAL TWIN FACTORY SIMULATION",
        teamMembers: "Mohamad Arya Adinata Kurniawan  - 243140700111005\nNouval Aziz Prasetya - 243140700111014 \nMuhammad Syahharuka Wahyu Adehidayat  - 243140707111020\nNayla Yumina  - 243140701111041",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779530/hmpsti/pameran-iot/banner_T4A1.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781782941/hmpsti/pameran-iot/project_T4A1.jpg',
        sessionId: 1
      },
      {
        code: 'T4A2',
        className: 'T4A',
        groupNumber: 2,
        title: "SIANA: Real-Time Environmental Monitoring and Disaster Alert System Based on Internet of Things Technology",
        teamMembers: "Gabriel Aditya Permana Putra - 243140700111006\nIlham Munawar Hanif - 243140700111012\nAbiyyu Zahy Al Akram - 243140700111030\nMuhammad Hafizh - Zuhdi243140700111011",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779538/hmpsti/pameran-iot/banner_T4A2.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781782956/hmpsti/pameran-iot/project_T4A2.png',
        sessionId: 1
      },
      {
        code: 'T4A3',
        className: 'T4A',
        groupNumber: 3,
        title: "SMART SEDENTARY LIFESTYLE MONITORING SYSTEM",
        teamMembers: "Meysya Indah Calista Putri – 243140701111018\nAde Vina Puspitasari – 243140701111016\nMuhammad Ihsan Firdaus – 243140700111010\nDavid Farrel Hadyan – 243140700111008",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779551/hmpsti/pameran-iot/banner_T4A3.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781782967/hmpsti/pameran-iot/project_T4A3.jpg',
        sessionId: 1
      },
      {
        code: 'T4A4',
        className: 'T4A',
        groupNumber: 4,
        title: "Pawfeeder : Automatic Pet Feeding System",
        teamMembers: "Nadiya Eka Putri Pramesti – 243140700111013\nAdeeva Rashida – 243140700111020\nDewi Suprobo Kencana Mukti – 243140700111028 \nBerinda Alya Kusuma – 243140701111019",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779556/hmpsti/pameran-iot/banner_T4A4.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781782974/hmpsti/pameran-iot/project_T4A4.jpg',
        sessionId: 1
      },
      {
        code: 'T4A5',
        className: 'T4A',
        groupNumber: 5,
        title: "AGRIFLOW: SISTEM CERDAS BERBASIS IOT UNTUK DETEKSI PENYUMBATAN IRIGASI, PEMANTAUAN RISIKO BANJIR, DAN PEMBUANGAN SAMPAH OTOMATIS",
        teamMembers: "Shabrina Rahmadita Ihsan - 243140700111016, Salama Insani - 243140700111029, Najma Salwa - 243140700111044, Najma Salma - 243140700111045",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779572/hmpsti/pameran-iot/banner_T4A5.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781782989/hmpsti/pameran-iot/project_T4A5.jpg',
        sessionId: 1
      },
      {
        code: 'T4A6',
        className: 'T4A',
        groupNumber: 6,
        title: "Agri-Trust: A Decentralized Edge-AI and IoT-Driven Framework for Automated Commodity Grading and Food Supply Chain Integrity",
        teamMembers: "Razaqa Albio Kasyfi - 243140700111021",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780634/hmpsti/pameran-iot/banner_T4A6.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783010/hmpsti/pameran-iot/project_T4A6.jpg',
        sessionId: 1
      },
      {
        code: 'T4A7',
        className: 'T4A',
        groupNumber: 7,
        title: "Rhizomatix - IoT-Based Tempe Fermentation Monitoring & Mitigation System",
        teamMembers: "MUHAMMAD SHAFIQ DZAKWAN ANANDA - 243140700111046",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780648/hmpsti/pameran-iot/banner_T4A7.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783023/hmpsti/pameran-iot/project_T4A7.jpg',
        sessionId: 1
      },
      {
        code: 'T4B1',
        className: 'T4B',
        groupNumber: 1,
        title: "Smart-Way Glasses: Kacamata Pendeteksi Hambatan dengan Umpan Balik Getaran",
        teamMembers: "DAFFA AHMAD AL ATTAS - 243140701111001\nMAHIENDRA FIKRI Z.A - 243140701111004 \nNOUFAL YOGA SALSABILA - 243140701111010\nRAFLI RAIHAN MUSTHOFA - 243140700111002",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779604/hmpsti/pameran-iot/banner_T4B1.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783034/hmpsti/pameran-iot/project_T4B1.jpg',
        sessionId: 1
      },
      {
        code: 'T4B2',
        className: 'T4B',
        groupNumber: 2,
        title: "SIEMOLA",
        teamMembers: "Embun Bening Cantika Dewi-243140700111004, Silmah Nabilah Abidah Adelia-243140700111043, Mohammad David Nur Syahfrudin-243140700111047, Akbar Salahudin Purnomo-243140700111049",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779623/hmpsti/pameran-iot/banner_T4B2.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783059/hmpsti/pameran-iot/project_T4B2.png',
        sessionId: 1
      },
      {
        code: 'T4B3',
        className: 'T4B',
        groupNumber: 3,
        title: "PENGEMBANGAN SISTEM CELENGAN PINTAR COCAINE (COIN CASH INVESTMENT) UNTUK MONITORING TABUNGAN BERBASIS INTERNET OF THINGS",
        teamMembers: "Muhamad Aqilla Umara Yusuf - 243140700111007\nMuhammad Arsa Danendra - 243140700111052\nMardiyanto Yuste Tanggu Solo - 243140701111007\nNashrulloh Qorib - 243140700111036",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779636/hmpsti/pameran-iot/banner_T4B3.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783078/hmpsti/pameran-iot/project_T4B3.png',
        sessionId: 1
      },
      {
        code: 'T4B4',
        className: 'T4B',
        groupNumber: 4,
        title: "Perancangan dan Implementasi Mini AGV (Automated Guided Vehicle) Berbasis ESP32 dengan Integrasi TinyML untuk Sistem Pengiriman Barang Indoor",
        teamMembers: "Alphareno Yanuar Syaputra_243140700111033\nMuhamad Dzaki Dwi Putra_243140701111009\nMuhammad Illyas Dwi Putra_243140701111008\nMuhamad Derby Junio_243140701111003",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779647/hmpsti/pameran-iot/banner_T4B4.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783094/hmpsti/pameran-iot/project_T4B4.png',
        sessionId: 1
      },
      {
        code: 'T4B5',
        className: 'T4B',
        groupNumber: 5,
        title: "RYTHMIQ Smart Health Monitoring",
        teamMembers: "Muhammad Rayyan Fatih - 243140700111034\nAnisa Dwi Nur Rahmawati - 243140700111039\nDivya Rachel Naidu - 243140700111054",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779659/hmpsti/pameran-iot/banner_T4B5.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783109/hmpsti/pameran-iot/project_T4B5.jpg',
        sessionId: 1
      },
      {
        code: 'T4B6',
        className: 'T4B',
        groupNumber: 6,
        title: "Smart Ambulance Telemedicine System",
        teamMembers: "Daniel Jefry Alfero - 243140700111035\nAve Delta Sansisi - 243140700111041\nAditya Putra W. - 243140701111006\nMuhammad Fauzan - 243140700111038",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779672/hmpsti/pameran-iot/banner_T4B6.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783134/hmpsti/pameran-iot/project_T4B6.jpg',
        sessionId: 1
      },
      {
        code: 'T4B7',
        className: 'T4B',
        groupNumber: 7,
        title: "Sistem Pintu Otomatis Kandang Ayam Menggunakan Metode YOLO Object  Detection Berbasis Deep Learning",
        teamMembers: "Muhammad Habib Masyhur - 243140700111051\nSinggih Dama Riofausta - 243240700111040\nNovita Amelia Safitri - 243140701111005  \nRayhan Ramadhan - 24314070011148",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781779681/hmpsti/pameran-iot/banner_T4B7.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783156/hmpsti/pameran-iot/project_T4B7.png',
        sessionId: 1
      },
      {
        code: 'T4C1',
        className: 'T4C',
        groupNumber: 1,
        title: "Adaptive smart lighting system",
        teamMembers: "Ignatius Christian- 223140707111140\nAgus Fathurrahman R-243140700111018\nMuhammad Shirojul Munir - 243140701111013\nSabilah Mudrikah - 243140701111017",
        bannerImageUrl: null,
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783233/hmpsti/pameran-iot/project_T4C1.jpg',
        sessionId: 1
      },
      {
        code: 'T4C2',
        className: 'T4C',
        groupNumber: 2,
        title: "Smart Swimming Pool: Kolam Renang Pintar Berbasis IoT dengan Deteksi Hujan dan Sistem Klorin Otomatis",
        teamMembers: "1. 243140701111011 - Ulfa Abidah Al Haq \n2. 243140700111017 - Ahmad Ikdinal\n3. 243140701111025 - Salsa Billa Arum\n4. 243140700111009 - Tedika Ibnun Adja",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780885/hmpsti/pameran-iot/banner_T4C2.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783258/hmpsti/pameran-iot/project_T4C2.jpg',
        sessionId: 1
      },
      {
        code: 'T4C3',
        className: 'T4C',
        groupNumber: 3,
        title: "RANCANG BANGUN SMART ZEBRA CROSS BERBASIS IOT DENGAN ESP32 TERINTEGRASI WEB MONITORING",
        teamMembers: "1.        Muhammad Abdul Azis – 243140701111012\n2.        Syakie Nor Aditya – 243140701111023\n3.        Salsabila Danesti – 243140701111034\n4.        Lintang Lestari – 243140701111029",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780918/hmpsti/pameran-iot/banner_T4C3.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783291/hmpsti/pameran-iot/project_T4C3.png',
        sessionId: 1
      },
      {
        code: 'T4C4',
        className: 'T4C',
        groupNumber: 4,
        title: "IMPLEMENTASI SISTEM KEAMANAN RUANGAN BERBASIS MIKROKONTROLER UNTUK DETEKSI KEBAKARAN DAN KEBOCORAN GAS",
        teamMembers: "243140700111014 - Adam Fariuz Akmal Aryaguna\n243140701111015 - Giovani Baptista Betang\n243140701111020 - Derajat\n243140701111024  - Djibril Rangga Deja\n243140701111036 - Yosi Dzidni Ilma",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780926/hmpsti/pameran-iot/banner_T4C4.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783298/hmpsti/pameran-iot/project_T4C4.jpg',
        sessionId: 1
      },
      {
        code: 'T4C5',
        className: 'T4C',
        groupNumber: 5,
        title: "Sistem Smart Canopy Berbasis IoT untuk Monitoring dan Kontrol Otomatis Menggunakan Sensor Hujan",
        teamMembers: "Dhea Nur Indah Ramadhani - 243140701111021 \nRaja Shaka Quranique  - 243140701111026 \nNaftalia Frendsiska Rumahorbo - 243140701111035  \nMoetia Safitri Agustina - 243140701111038",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780947/hmpsti/pameran-iot/banner_T4C5.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783316/hmpsti/pameran-iot/project_T4C5.jpg',
        sessionId: 1
      },
      {
        code: 'T4C6',
        className: 'T4C',
        groupNumber: 6,
        title: "SMART POSTURE CORRECTOR BERBASIS INTERNET OF THINGS (IoT)",
        teamMembers: "Kelompok 6\n1.	Aditya Dwi Hardiansyah (243140701111022)\n2.	Adimus Ricky Faisal Sahri (243140701111028)\n3.	Muhammad Syauqi Ibrahim (243140701111032)\n4.	Rizal Syah Putra (243140701111037)\n5.	Mochammad Alfan Aufar (243140701111033)",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780966/hmpsti/pameran-iot/banner_T4C6.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783333/hmpsti/pameran-iot/project_T4C6.jpg',
        sessionId: 1
      },
      {
        code: 'T4D1',
        className: 'T4D',
        groupNumber: 1,
        title: "Sistem Pengharum Ruangan Adaptif Berbasis Jadwal Ibadah dan Sensor Infrared Terintegrasi Web Dashboard",
        teamMembers: "Kelompok 1 : \n1.Leo Rendra (243140707111009)\n2.Rifqi Setya Ardaffa (243140707111007)\n3.Bilawal El Zardari (243140700111022)\n4.Moch. Ijlal Hildani (243140707111014)\n5.Muhammad Dwiyanto Wicaksana (243140707111016)",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781780978/hmpsti/pameran-iot/banner_T4D1.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783343/hmpsti/pameran-iot/project_T4D1.jpg',
        sessionId: 1
      },
      {
        code: 'T4D2',
        className: 'T4D',
        groupNumber: 2,
        title: "HydroGrow",
        teamMembers: "Miftah Afreza Maulana",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781008/hmpsti/pameran-iot/banner_T4D2.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783377/hmpsti/pameran-iot/project_T4D2.jpg',
        sessionId: 1
      },
      {
        code: 'T4D3',
        className: 'T4D',
        groupNumber: 3,
        title: "Sistem Monitoring Kebisingan Rumah Sakit",
        teamMembers: "Panggayuh Arya Bagaskara - 243140701111045\nMutiara Aura Sonita - 243140707111001\nFiona Regita Putri Felisha - 243140707111004\nNabilla Rahma Primadani - 243140707111012",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781020/hmpsti/pameran-iot/banner_T4D3.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783387/hmpsti/pameran-iot/project_T4D3.jpg',
        sessionId: 2
      },
      {
        code: 'T4D4',
        className: 'T4D',
        groupNumber: 4,
        title: "Sistem Pendeteksi Api dan Penyiraman Otomatis Kebakaran Hutan",
        teamMembers: "Nazwa Rahma Aulia N.P\n243140701111056\nAmandania Sagala\n243140701111047\nNaya Claudya\n243140707111005\nLilla Puan Estetik\n243140707111006",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781033/hmpsti/pameran-iot/banner_T4D4.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783396/hmpsti/pameran-iot/project_T4D4.png',
        sessionId: 2
      },
      {
        code: 'T4D6',
        className: 'T4D',
        groupNumber: 6,
        title: "SISTEM PENDETEKSI API",
        teamMembers: "Anisa Anggun Fadelia (243140701111050)\nNi’matus Sholihah (243140707111015)\nRiski Ratna Novianti (243140707111013)\nNaila Virlini Azzahra (243140701111055)",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781043/hmpsti/pameran-iot/banner_T4D6.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783411/hmpsti/pameran-iot/project_T4D6.jpg',
        sessionId: 2
      },
      {
        code: 'T4D7',
        className: 'T4D',
        groupNumber: 7,
        title: "SISTEM PALANG PINTU KERETA API OTOMATIS ERBASIS IoT DENGN MONITORING DAN KONTROL BERBASIS WEB",
        teamMembers: "1. Arisa Zaki Alamsyah ( 243140701111052)\n2. Dicky Adi Nugroho (243140707111002)\n3. Habib Satria Hakiki (243140707111017)\n4. Muhammad Fauzan Aly Ridlo (243140707111003)\n5. Lambang Seto Insani (243140707111011)",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781058/hmpsti/pameran-iot/banner_T4D7.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783423/hmpsti/pameran-iot/project_T4D7.jpg',
        sessionId: 2
      },
      {
        code: 'T4E1',
        className: 'T4E',
        groupNumber: 1,
        title: "Smart Greenhouse Monitoring and Control System Berbasis Internet Of Things",
        teamMembers: "Kelompok 01\nT4E\nAnggota : \n1. Surya Febriyanto (243140707111040)\n2. Tiara Kusuma H.B. (243140707111035)\n3. Neva Aintina Y.P. (243140707111021)\n4. Awalia Wahyu D. (243140700111025)",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781067/hmpsti/pameran-iot/banner_T4E1.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783442/hmpsti/pameran-iot/project_T4E1.jpg',
        sessionId: 2
      },
      {
        code: 'T4E2',
        className: 'T4E',
        groupNumber: 2,
        title: "Smart Automatic Drawbridge",
        teamMembers: "•        Olivia Fauziah                         243140707111025                                  \n•        Febriananta P                        243140707111027                                \n•        Muhammad Farel                        243140707111024",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781095/hmpsti/pameran-iot/banner_T4E2.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783463/hmpsti/pameran-iot/project_T4E2.jpg',
        sessionId: 2
      },
      {
        code: 'T4E3',
        className: 'T4E',
        groupNumber: 3,
        title: "Monitoring Leleku (Monitoring Kualitas Air bioflok berbasis IoT)",
        teamMembers: "Nama Anggota Kelompok :\n● Aiska Putri Allia 243140707111026\n● Kayla Alodia Calista 243140707111028\n● Andrae Cecylia 243140707111031\n● Deshta Jauhar Adhitama 243140707111041",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781110/hmpsti/pameran-iot/banner_T4E3.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783480/hmpsti/pameran-iot/project_T4E3.jpg',
        sessionId: 2
      },
      {
        code: 'T4E4',
        className: 'T4E',
        groupNumber: 4,
        title: "SORTIR.IN: REVOLUSI SMARTCITY MELALUI PEMILAHAN DAN MONITORING SAMPAH OTOMATIS SECARA REAL-TIME",
        teamMembers: "Felisitas Griselda Arindia - 243140707111024\nZein Aisyah Azmi - 243140707111030\nDwi Nurfitriana Salsabila - 243140707111037\nGabrieela Valentina Rudianto - 243140707111047",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781121/hmpsti/pameran-iot/banner_T4E4.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783488/hmpsti/pameran-iot/project_T4E4.jpg',
        sessionId: 2
      },
      {
        code: 'T4E5',
        className: 'T4E',
        groupNumber: 5,
        title: "SOPAN",
        teamMembers: "Ghatan Naufal Daniyal Ariefin           -               243140707111032\nBrilian Pratama Putra Cahyana         -               243140707111034\nSyafira Firdausi Nuzula                       -               243140707111036\nBunga Cinta Lovesia Anatasia    -               243140707111046\nTya Ayu Agustin                                   -               243140707111048",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781130/hmpsti/pameran-iot/banner_T4E5.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783495/hmpsti/pameran-iot/project_T4E5.jpg',
        sessionId: 2
      },
      {
        code: 'T4E6',
        className: 'T4E',
        groupNumber: 6,
        title: "IMPLEMENTASI PIEZOELECTRIC SEBAGAI SUMBER ENERGI LAMPU JALAN BERBASIS TEKANAN KENDARAAN",
        teamMembers: "Alfian Wahyu Prasetya - 243140707111039\nMuhammad Zacky Musyaffa - 243140707111033\nNadia Aisyah - 243140707111038\nRavanello Braima Nugrantoro - 243140707111042",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781158/hmpsti/pameran-iot/banner_T4E6.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783528/hmpsti/pameran-iot/project_T4E6.jpg',
        sessionId: 2
      },
      {
        code: 'T4E7',
        className: 'T4E',
        groupNumber: 7,
        title: "SISTEM IRIGASI DAN PERLINDUNGAN PADI OTOMATIS BERBASIS IOT",
        teamMembers: "Rahajeng Eka Wahyuningtiyas - 243140707111018 \nGalang Ega Yudistira - 243140707111022 \nMuhammad Zaki Athallah - 243140707111045 \nRafa Adi Nugroho – 243140707111044",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781170/hmpsti/pameran-iot/banner_T4E7.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783537/hmpsti/pameran-iot/project_T4E7.jpg',
        sessionId: 2
      },
      {
        code: 'T4F1',
        className: 'T4F',
        groupNumber: 1,
        title: "SMART FAN",
        teamMembers: "NAMA ANGGOTA:\n1. Nasywa Davina Alissa W - 243140707111057\n2. ⁠Shafira Aini Saichu - 243140707111060\n3. ⁠Putri Salsabila - 243140707111065\n4. ⁠Ratu Nabila - 243140707111070",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781191/hmpsti/pameran-iot/banner_T4F1.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783562/hmpsti/pameran-iot/project_T4F1.jpg',
        sessionId: 2
      },
      {
        code: 'T4F2',
        className: 'T4F',
        groupNumber: 2,
        title: "NerveDesk-IoT",
        teamMembers: "Ghabriel Theo Petra Sagala        243140707111076\nNashwa Salsabilah                243140707111054\nMuchamad Dhiya Mirza        243140707111055\nAlisya Aprilia Aura F                243140707111063\nDinda Aril Tria Kusuma Aji        243140707111067",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781202/hmpsti/pameran-iot/banner_T4F2.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783571/hmpsti/pameran-iot/project_T4F2.png',
        sessionId: 2
      },
      {
        code: 'T4F4',
        className: 'T4F',
        groupNumber: 4,
        title: "Samart trash TT",
        teamMembers: "NAMA dan NIM:\n1. atha prayoga\n233140700111019\n2. Muhammad Daffa Albani\n243140707111050\n3. Damanhuri Agil Syirath \n243140707111068\n4. Salman Alfarizi Ansar\n243140707111075\n5. Muhammad Abdillah Hijas\n243140707111052",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781211/hmpsti/pameran-iot/banner_T4F4.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783577/hmpsti/pameran-iot/project_T4F4.jpg',
        sessionId: 2
      },
      {
        code: 'T4F5',
        className: 'T4F',
        groupNumber: 5,
        title: "SENSYNC",
        teamMembers: "Aditya Aza Annuzuli - 243140707111061\nMuhammad Dicky Sabilillah - 243140707111062\nDivo Farelly Sattar - 243140707111074\nMuhammad Ilham Ramadhan - 243140707111071",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781231/hmpsti/pameran-iot/banner_T4F5.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783593/hmpsti/pameran-iot/project_T4F5.jpg',
        sessionId: 2
      },
      {
        code: 'T4F6',
        className: 'T4F',
        groupNumber: 6,
        title: "SMART AQUACULTURE AND MONITORING AUTOMATIC WATER MANAGEMENT SYSTEM",
        teamMembers: "243140707111058 - Nazwa Nur Maulidiyah \n243140707111059 - Gadang Aji Ramadhan \n243140707111064 - Intana Putri Nadewi         \n243140707111073 - Farid Muhammad I.         \n243140707111078 - Yuko Fildza Zafira J.",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781249/hmpsti/pameran-iot/banner_T4F6.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783619/hmpsti/pameran-iot/project_T4F6.png',
        sessionId: 2
      },
      {
        code: 'T4G1',
        className: 'T4G',
        groupNumber: 1,
        title: "SMARESTING: Smart Residential Street Lighting",
        teamMembers: "243140707111106 - Yosua \n243140707111086 – Zainul Alkindi Ahmad \n243140707111107 – Boiman Lumban Goal \n243140707111093 – Rakha Dhiyaul Haq W.",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781266/hmpsti/pameran-iot/banner_T4G1.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783643/hmpsti/pameran-iot/project_T4G1.jpg',
        sessionId: 2
      },
      {
        code: 'T4G2',
        className: 'T4G',
        groupNumber: 2,
        title: "Deteksi kebocoran gas",
        teamMembers: "Seyla Diva Candra \n243140707111085\nMuhammad RafiPasyah Makrup\n243140707111089\nGebby Ariska Nur Efendi\n243140707111092\nNazwa Sri Febiani Sinaga\n243140707111094\nFarrel Akmal Saputra\n243140707111095",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781276/hmpsti/pameran-iot/banner_T4G2.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783665/hmpsti/pameran-iot/project_T4G2.jpg',
        sessionId: 2
      },
      {
        code: 'T4G3',
        className: 'T4G',
        groupNumber: 3,
        title: "SISTEM DETEKSI DAN MONITORING DETAK JANTUNG BERBASIS INTERNET OF THINGS (IoT)",
        teamMembers: "24314070711198 - Arya Sena Satyanegara - T4G\n24314070711187 - Rafif Nabiha - T4G\n24314070711188 - Regan Gradasi Matahari Jingga- T4G\n24314070711180 - Rio Pratama Putra - T4G\n24314070711191 - Yanuar Akbar - T4G",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781288/hmpsti/pameran-iot/banner_T4G3.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783675/hmpsti/pameran-iot/project_T4G3.jpg',
        sessionId: 2
      },
      {
        code: 'T4G4',
        className: 'T4G',
        groupNumber: 4,
        title: "Smart Flood Warning",
        teamMembers: "Angga Yoga Syahputra - 243140707111099\nMafaza Maulana Efendi - 243140707111097\nKevin Naufal Fernanda - 243140707111081\nAbdyka Irsyadi Ahmad - 243140707111108",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781312/hmpsti/pameran-iot/banner_T4G4.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783700/hmpsti/pameran-iot/project_T4G4.png',
        sessionId: 2
      },
      {
        code: 'T4G5',
        className: 'T4G',
        groupNumber: 5,
        title: "Easypark (Sensor Parkir Terdigitalisasi )",
        teamMembers: "Danica Javier Kaeysaa Billghiz (243140707111082)\nDiego Armansyah Yuwono (243140707111083)\nTasya Rizky Lispitasari (243140707111096)\nFredy Putra Effendi (243140707111109)",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781320/hmpsti/pameran-iot/banner_T4G5.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783707/hmpsti/pameran-iot/project_T4G5.jpg',
        sessionId: 2
      },
      {
        code: 'T4G6',
        className: 'T4G',
        groupNumber: 6,
        title: "Smart Garden",
        teamMembers: "-Darari Mazaya Aisy - 243140707111105\n-Syafira Handayani-243140707111101\n-Muhammad Rafli Rinaldy - 243140700111032\n-Azhar Fadhila Rahman - 243140707111102",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781345/hmpsti/pameran-iot/banner_T4G6.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783729/hmpsti/pameran-iot/project_T4G6.jpg',
        sessionId: 2
      },
      {
        code: 'T4D5',
        className: 'T4D',
        groupNumber: 5,
        title: "Flood Monitoring System Berbasis IoT",
        teamMembers: "Daffa Raditya - 243140701111054\nDaniel T.S - 243140701111043\nFerdinan - 243140701111057\nFathan Fathurohman - 243140701111049\nM. Vito Fadgham - 243140707111008",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781358/hmpsti/pameran-iot/banner_T4D5.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783744/hmpsti/pameran-iot/project_T4D5.png',
        sessionId: 2
      },
      {
        code: 'T4F3',
        className: 'T4F',
        groupNumber: 3,
        title: "Sistem IoT Smoke Detector untuk Mitigasi Asap Rokok pada Kamar Kost Eksklusif Non-Smoking",
        teamMembers: "1. 243140700111019 - Muhammad Tsaqif Eka Putra - T4F\n2. 243140707111049 - Jiddan Fillah Wibowo - T4F\n3. 243140707111051 - Nabilah Saffanah Azhar - T4F\n4. 243140707111056 - Wiratama Satrio Herlambang - T4F\n5. 243140707111077 - Feni Kusuma Dewi  - T4F",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781781367/hmpsti/pameran-iot/banner_T4F3.jpg',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781783752/hmpsti/pameran-iot/project_T4F3.jpg',
        sessionId: 2
      },
      {
        code: 'T4A8',
        className: 'T4A',
        groupNumber: 8,
        title: "SMART FALL DETECTION & EMERGENCY ALERT SYSTEM",
        teamMembers: "Dzaky Alfauzy Naw-waf Akbar 243140701111046\nRusenda Immanuel Bagasanto 243140707111019\nM. Taufiequrohim Ridwan 243140701111023\nPhillipus Zerah Suhardiman 243140701111051",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781875425/hmpsti/pameran-iot/banner_T4A8.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781875444/hmpsti/pameran-iot/project_T4A8.jpg',
        sessionId: 1
      },
      {
        code: 'T4C7',
        className: 'T4C',
        groupNumber: 7,
        title: "Smart Infus Monitoring System",
        teamMembers: "Muhajir Amrullah 243140701111042\nAdam Ahmad Bimantoro 24314070111127\nM Alfian Bagus Hamdani 24314070111139\nMuhammad Arga Pradana 24314070111131",
        bannerImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781875477/hmpsti/pameran-iot/banner_T4C7.png',
        projectImageUrl: 'https://res.cloudinary.com/drhn0kkxq/image/upload/v1781875530/hmpsti/pameran-iot/project_T4C7.jpg',
        sessionId: 1
      },
    ]);
    console.log('Successfully seeded IoT Teams.');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

main();
