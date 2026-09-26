// Centralized Seminar & Ticket Mock Data (HCE 2026)

export interface TicketCategory {
  id: string;
  name: string;
  tag?: string;
  price: number;
  originalPrice?: number;
  quota: number;
  remaining: number;
  isPopular?: boolean;
  isAvailable: boolean;
  badgeColor: "teal" | "orange" | "navy";
  perks: string[];
}

export interface SpeakerTopic {
  number: string;
  title: string;
  desc: string;
}

export interface RundownItem {
  time: string;
  title: string;
  speaker?: string;
  desc: string;
  type: "opening" | "keynote" | "qa" | "break" | "closing";
}

export interface SeminarOrder {
  orderId: string;
  ticketCode: string;
  ticketCategoryId: string;
  ticketCategoryName: string;
  ticketPrice: number;
  quantity: number;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: "Menunggu Pembayaran" | "Pembayaran Berhasil" | "Pembayaran Gagal";
  ticketStatus: "Tiket Aktif" | "Tiket Digunakan" | "Tiket Belum Dibayar";
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    institution: string;
    notes?: string;
  };
}

export const SEMINAR_INFO = {
  title: "HIPMI Collab Expo 2026",
  subtitle: "Seminar Nasional Kewirausahaan & Kepemimpinan",
  theme: "From Potential to Impact: Building Yourself Before Building a Business",
  tagline: "Kembangkan Kapasitas Diri Sebelum Meluncurkan Bisnis yang Berkelanjutan",
  description:
    "Seminar Nasional HCE 2026 menghadirkan ruang refleksi dan strategi praktis bagi generasi muda untuk membangun fondasi mental, resiliensi, dan visi kepemimpinan yang kokoh sebelum melangkah menjadi wirausahawan berdampak nyata.",
  date: "Sabtu, 24 Oktober 2026",
  dateIso: "2026-10-24T09:00:00+07:00",
  time: "12.30 – 16.00 WIB",
  venue: "Gedung Serba Guna , Telkom University Bandung",
  venueType: "Offline di Kampus Telkom University & Akses Streaming Live",
  address: "Jl. Telekomunikasi No. 1, Terusan Buahbatu, Sukapura, Kec. Dayeuhkolot, Bandung, Jawa Barat 40257",
  organizer: "HIPMI PT Telkom University (Kabinet Adhimakayasa)",
  contactWhatsApp: "6285797397454",
  contactPerson: "Zia / Admin Ticketing HCE",
  instagram: "hipmi.collab.expo",
  targetAudience: "Mahasiswa, Fresh Graduate, Pemilik Startup Pemula, dan Calon Entrepreneur",
};

export const SPEAKER_INFO = {
  name: "Sadam Permana",
  title: "Entrepreneur, Business Strategist & Keynote Speaker",
  role: "Keynote Speaker Utama",
  photo: "/sadam.jpg",
  bio: "Praktisi bisnis dan mentor kepemimpinan pemuda yang telah membantu ribuan anak muda menemukan potensi sejati, merumuskan model bisnis yang berakar pada nilai otentik, serta mengonversi ide menjadi dampak nyata bagi masyarakat.",
  quote:
    "“Banyak bisnis gagal bukan karena kekurangan modal uang, tetapi karena pendirinya belum selesai membangun karakter, disiplin, dan integritas dirinya sendiri.”",
  topics: [
    {
      number: "01",
      title: "The Inner Foundation",
      desc: "Memetakan potensi otentik diri, mengatasi self-doubt, serta membangun resiliensi mental sebelum memasuki dinamika dunia bisnis.",
    },
    {
      number: "02",
      title: "From Idea to Execution",
      desc: "Menemukan validasi masalah nyata, merancang positioning produk yang kuat, dan menghindari jebakan tren tanpa arah.",
    },
    {
      number: "03",
      title: "High-Impact Leadership",
      desc: "Menumbuhkan kredibilitas personal, komunikasi persuasif, serta cara memimpin tim perdana dengan visi yang menginspirasi.",
    },
    {
      number: "04",
      title: "Scaling Yourself & Your Business",
      desc: "Menyelaraskan kapasitas kepemimpinan internal agar seimbang dengan pertumbuhan skala bisnis dan ekosistem kemitraan.",
    },
  ] as SpeakerTopic[],
};

export const TICKET_CATEGORIES: TicketCategory[] = [
  {
    id: "early-bird",
    name: "Early Bird",
    tag: "Paling Hemat",
    price: 35000,
    originalPrice: 50000,
    quota: 100,
    remaining: 18,
    badgeColor: "teal",
    isAvailable: true,
    perks: [
      "Akses Lengkap Seminar Nasional (Offline)",
      "E-Sertifikat Nasional Resmi ber-SKP",
      "E-Booklet Materi Eksklusif Pembicara",
      "Snack & Coffee Break",
      "Sesi Tanya Jawab Interaktif",
    ],
  },
  {
    id: "regular",
    name: "Presale / Regular",
    tag: "Paling Populer",
    price: 50000,
    originalPrice: 75000,
    quota: 250,
    remaining: 142,
    badgeColor: "orange",
    isPopular: true,
    isAvailable: true,
    perks: [
      "Semua benefit paket Early Bird",
      "Official HCE Seminar Kit & Goodie Bag",
      "Priority Seating (Area Tengah Depan)",
      "Sesi Networking bersama 500+ Peserta",
      "Doorprize & Voucher Pelatihan Eksklusif",
    ],
  },
  {
    id: "vip",
    name: "VIP Experience",
    tag: "Akses Eksklusif",
    price: 85000,
    originalPrice: 120000,
    quota: 50,
    remaining: 9,
    badgeColor: "navy",
    isAvailable: true,
    perks: [
      "Semua benefit paket Regular",
      "VIP Front-Row Seat (Baris Terdepan Panggung)",
      "Exclusive Meet & Greet + Foto bersama Sadam Permana",
      "VIP Lunch Box & Premium Merchandise Box",
      "Akses Komunitas Entrepreneur HCE VIP Network",
    ],
  },
];

export const RUNDOWN_SCHEDULE: RundownItem[] = [
  {
    time: "08.00 – 09.00 WIB",
    title: "Open Gate & Registrasi Ulang",
    desc: "Penukaran e-ticket dengan wristband seminar kit di meja registrasi lobby Gedung Serba Guna.",
    type: "opening",
  },
  {
    time: "09.00 – 09.30 WIB",
    title: "Opening Ceremony & Sambutan",
    desc: "Menyanyikan Indonesia Raya, sambutan Ketua Pelaksana HCE 2026 & Ketua Umum HIPMI PT Telkom.",
    type: "opening",
  },
  {
    time: "09.30 – 11.30 WIB",
    title: "Sesi 1: Unlocking Your True Potential",
    speaker: "Sadam Permana",
    desc: "Membangun mindset fondasi diri, kepemimpinan mental, dan pemetaan tujuan hidup sebelum bisnis.",
    type: "keynote",
  },
  {
    time: "11.30 – 12.30 WIB",
    title: "Interactive Live Q&A Session",
    speaker: "Sadam Permana & Moderator",
    desc: "Sesi tanya jawab terbuka dan konsultasi studi kasus langsung dari peserta seminar.",
    type: "qa",
  },
  {
    time: "12.30 – 13.30 WIB",
    title: "Break, Ishoma & VIP Meet & Greet",
    desc: "Istirahat, salat, makan siang, serta sesi privat meet and greet eksklusif pemegang tiket VIP.",
    type: "break",
  },
  {
    time: "13.30 – 15.00 WIB",
    title: "Sesi 2: Bridging Potential into Tangible Impact",
    speaker: "Sadam Permana",
    desc: "Langkah konkret eksekusi bisnis, validasi pasar, dan strategi menjaga pertumbuhan berkelanjutan.",
    type: "keynote",
  },
  {
    time: "15.00 – 15.30 WIB",
    title: "Networking Session, Doorprize & Penutupan",
    desc: "Sesi foto bersama seluruh peserta, pengundian doorprize menarik, dan pembagian sertifikat.",
    type: "closing",
  },
];

export const SEMINAR_BENEFITS = [
  {
    title: "E-Sertifikat Nasional",
    desc: "Sertifikat resmi terverifikasi yang ditandatangani oleh Ketua Umum HIPMI PT Telkom.",
    icon: "Award",
  },
  {
    title: "Insight Langsung dari Praktisi",
    desc: "Dapatkan framework praktis membangun kapasitas diri dan bisnis dari Sadam Permana.",
    icon: "Sparkles",
  },
  {
    title: "Koneksi & Networking Luas",
    desc: "Terhubung dengan 500+ mahasiswa, calon co-founder, dan wirausahawan muda se-Indonesia.",
    icon: "Users",
  },
  {
    title: "Exclusive Seminar Kit",
    desc: "Merchandise resmi HCE, modul materi ringkas, stiker, dan souvenir eksklusif.",
    icon: "Gift",
  },
  {
    title: "Akses Q&A Langsung",
    desc: "Konsultasikan pertanyaan atau tantangan ide bisnismu secara interaktif pada sesi tanya jawab.",
    icon: "MessageSquare",
  },
  {
    title: "Kesempatan Doorprize",
    desc: "Raih hadiah menarik, merchandise edisi khusus, dan voucher bernilai jutaan rupiah.",
    icon: "Trophy",
  },
];



export const PAYMENT_METHODS = [
  {
    id: "qris",
    name: "QRIS Instant (GoPay, OVO, DANA, BCA, ShopeePay)",
    type: "qris",
    badge: "Otomatis & Tercepat",
    icon: "QrCode",
  },
  {
    id: "bca",
    name: "Transfer Bank BCA",
    type: "bank",
    accountNumber: "1300892837",
    accountName: "HIPMI COLLAB EXPO",
    icon: "CreditCard",
  },
  {
    id: "mandiri",
    name: "Transfer Bank Mandiri",
    type: "bank",
    accountNumber: "1310029384756",
    accountName: "HIPMI COLLAB EXPO",
    icon: "Building",
  },
];

// Initial Dummy Orders for previewing tickets
export const INITIAL_ORDERS: SeminarOrder[] = [
  {
    orderId: "ORD-2026-00125",
    ticketCode: "SEM-2026-00125",
    ticketCategoryId: "vip",
    ticketCategoryName: "VIP Experience",
    ticketPrice: 85000,
    quantity: 1,
    totalPrice: 85000,
    paymentMethod: "QRIS Instant",
    paymentStatus: "Pembayaran Berhasil",
    ticketStatus: "Tiket Aktif",
    createdAt: "2026-09-26T10:30:00Z",
    customer: {
      fullName: "Rafi Maulana Pratama",
      email: "raffi@example.com",
      phone: "081234567890",
      institution: "Telkom University",
      notes: "Ingin berkonsultasi tentang startup AI",
    },
  },
  {
    orderId: "ORD-2026-00088",
    ticketCode: "SEM-2026-00088",
    ticketCategoryId: "regular",
    ticketCategoryName: "Presale / Regular",
    ticketPrice: 50000,
    quantity: 2,
    totalPrice: 100000,
    paymentMethod: "Transfer Bank BCA",
    paymentStatus: "Pembayaran Berhasil",
    ticketStatus: "Tiket Aktif",
    createdAt: "2026-09-25T14:15:00Z",
    customer: {
      fullName: "Alya Nabilah Putri",
      email: "alya@example.com",
      phone: "082159597960",
      institution: "Institut Teknologi Bandung",
    },
  },
];

// Helper Functions for Local Storage & Mock Orders
export function getSavedOrders(): SeminarOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem("hce_seminar_orders");
    if (!raw) {
      localStorage.setItem("hce_seminar_orders", JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveNewOrder(order: SeminarOrder): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSavedOrders();
    const updated = [order, ...existing.filter((o) => o.orderId !== order.orderId)];
    localStorage.setItem("hce_seminar_orders", JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save order to localStorage:", err);
  }
}

export function findOrderByCode(query: string): SeminarOrder | undefined {
  const clean = query.trim().toUpperCase();
  const all = getSavedOrders();
  return all.find(
    (o) =>
      o.orderId.toUpperCase() === clean ||
      o.ticketCode.toUpperCase() === clean ||
      o.customer.email.toLowerCase() === query.trim().toLowerCase()
  );
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
