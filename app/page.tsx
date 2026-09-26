"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Clock,
  Calendar,
  MapPin,
  ArrowRight,
  Trophy,
  Users,
  Award,
  Ticket,
  CheckCircle2,
  Quote,
  HelpCircle,
  ChevronDown,
  Gift,
  MessageSquare,
  ShieldCheck,
  Building,
  Target,
  Info,
  QrCode,
  CreditCard,
  Printer,
  Copy,
  Check,
  Search,
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Layers,
  Loader2,
  X,
} from "lucide-react";
import {
  SEMINAR_INFO,
  SPEAKER_INFO,
  TICKET_CATEGORIES,
  PAYMENT_METHODS,
  FACULTIES,
  TicketCategory,
  SeminarOrder,
  getSavedOrders,
  saveNewOrder,
  findOrderByCode,
  formatRupiah,
} from "@/utils/seminarData";

const mediaPartners = [
  { name: "Info Olimpiade", logo: "/media_partners/LOGO INFO OLIMPIADE.png" },
  { name: "Pojok Event", logo: "/media_partners/Logo Pojok Event-20.jpg" },
  { name: "Event Update", logo: "/media_partners/Logo event update.png" },
  { name: "Seminar Utama", logo: "/media_partners/Seminar utama.png" },
  { name: "Info Lomba", logo: "/media_partners/imfolomba.jpg" },
  { name: "Telyu Info", logo: "/media_partners/telyuinfo.jpg" },
  { name: "Telyutizen", logo: "/media_partners/telyutizen.jpg" },
];

export default function SinglePageSeminar() {
  // Live Countdown Timer State (Target: Oct 24, 2026 09:00:00 WIB)
  const [timeLeft, setTimeLeft] = useState({
    days: "28",
    hours: "11",
    minutes: "45",
    seconds: "00",
  });

  // Modal Dialog States (2 Separate Popups)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState(false);

  // Checkout & Order States
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>(TICKET_CATEGORIES[1]);
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nim, setNim] = useState("");
  const [faculty, setFaculty] = useState<string>(FACULTIES[0]);
  const [studyProgram, setStudyProgram] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<SeminarOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Lookup / Search Ticket State
  const [searchTicketQuery, setSearchTicketQuery] = useState("");
  const [lookupTicket, setLookupTicket] = useState<SeminarOrder | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Open Formulir Pembelian Tiket Modal handler
  const handleOpenOrderModal = (category?: TicketCategory) => {
    if (category) {
      setSelectedCategory(category);
    }
    setCheckoutStep(1);
    setErrorMessage(null);
    setIsOrderModalOpen(true);
    setIsLookupModalOpen(false);
  };

  // Close Order Modal handler
  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
  };

  // Open Cari / Cetak E-Ticket Modal handler
  const handleOpenLookupModal = () => {
    setLookupMessage(null);
    setIsLookupModalOpen(true);
    setIsOrderModalOpen(false);
  };

  // Close Lookup Modal handler
  const handleCloseLookupModal = () => {
    setIsLookupModalOpen(false);
  };

  // Listen to custom window events & hash changes
  useEffect(() => {
    const handleOpenOrderEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: TicketCategory }>;
      handleOpenOrderModal(customEvent.detail?.category);
    };

    const handleOpenLookupEvent = () => {
      handleOpenLookupModal();
    };

    const handleHashChange = () => {
      if (window.location.hash === "#checkout" || window.location.hash === "#beli-tiket") {
        setIsOrderModalOpen(true);
      } else if (window.location.hash === "#cari-tiket") {
        setIsLookupModalOpen(true);
      }
    };

    window.addEventListener("open-order-modal", handleOpenOrderEvent);
    window.addEventListener("open-lookup-modal", handleOpenLookupEvent);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("open-order-modal", handleOpenOrderEvent);
      window.removeEventListener("open-lookup-modal", handleOpenLookupEvent);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isOrderModalOpen || isLookupModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOrderModalOpen, isLookupModalOpen]);

  // Live countdown timer hook
  useEffect(() => {
    const targetDate = new Date(SEMINAR_INFO.dateIso).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: days < 10 ? `0${days}` : `${days}`,
          hours: hours < 10 ? `0${hours}` : `${hours}`,
          minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
          seconds: seconds < 10 ? `0${seconds}` : `${seconds}`,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Quick select category from ticket section & open Order Modal
  const handleSelectCategoryFromPricing = (cat: TicketCategory) => {
    handleOpenOrderModal(cat);
  };

  // Submit step 1: Proceed to simulated payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Harap lengkapi Nama Lengkap, Email, dan Nomor WhatsApp!");
      return;
    }

    if (!nim.trim()) {
      setErrorMessage("Harap mengisi Nomor Induk Mahasiswa (NIM)!");
      return;
    }

    if (!studyProgram.trim()) {
      setErrorMessage("Harap mengisi Program Studi (Prodi)!");
      return;
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-2026-${randomNum}`;
    const ticketCode = `SEM-2026-${randomNum}`;
    const subtotal = selectedCategory.price;

    const newOrder: SeminarOrder = {
      orderId,
      ticketCode,
      ticketCategoryId: selectedCategory.id,
      ticketCategoryName: selectedCategory.name,
      ticketPrice: selectedCategory.price,
      quantity: 1,
      totalPrice: subtotal,
      paymentMethod:
        PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.name || "QRIS Instant",
      paymentStatus: "Menunggu Pembayaran",
      ticketStatus: "Tiket Belum Dibayar",
      createdAt: new Date().toISOString(),
      customer: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        nim: nim.trim(),
        faculty: faculty || FACULTIES[0],
        studyProgram: studyProgram.trim(),
      },
    };

    setActiveOrder(newOrder);
    setCheckoutStep(2);
  };

  // Simulate payment confirmation
  const handleSimulatePaymentSuccess = () => {
    if (!activeOrder) return;
    setIsProcessing(true);

    setTimeout(() => {
      const finalizedOrder: SeminarOrder = {
        ...activeOrder,
        paymentStatus: "Pembayaran Berhasil",
        ticketStatus: "Tiket Aktif",
      };

      saveNewOrder(finalizedOrder);
      setActiveOrder(finalizedOrder);
      setIsProcessing(false);
      setCheckoutStep(3);
    }, 1000);
  };

  // Copy ticket code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Lookup ticket helper
  const handleLookupTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupMessage(null);

    if (!searchTicketQuery.trim()) {
      setLookupTicket(null);
      return;
    }

    const match = findOrderByCode(searchTicketQuery);
    if (match) {
      setLookupTicket(match);
    } else {
      setLookupTicket(null);
      setLookupMessage(`Tiket dengan kode/email "${searchTicketQuery}" tidak ditemukan.`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-hce-cream text-hce-navy font-sans selection:bg-hce-teal/20 selection:text-hce-teal overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (#hero) */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] glow-dot-teal -z-10 opacity-30 pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] glow-dot-orange -z-10 opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Headline, Theme, CTAs & Countdown */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">

              {/* Event Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-hce-teal/20 shadow-xs backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-hce-orange" />
                <span
                  className="text-xs font-black uppercase text-hce-teal tracking-widest"
                  style={{ fontFamily: "var(--font-bebas-neue)" }}
                >
                  SEMINAR HCE 2026 &bull; TELKOM UNIVERSITY
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-1">
                <h1
                  className="text-4xl sm:text-6xl xl:text-7xl font-black text-hce-navy tracking-tight leading-[1.05] uppercase"
                  style={{ fontFamily: "var(--font-bebas-neue)" }}
                >
                  From Potential <br className="hidden sm:inline" />
                  <span className="text-hce-orange">to Impact</span>
                </h1>
                <p
                  className="text-lg sm:text-2xl font-extrabold text-hce-teal tracking-wide leading-snug"
                  style={{ fontFamily: "var(--font-fredoka)" }}
                >
                  &ldquo;Building Yourself Before Building a Business&rdquo;
                </p>
              </div>

              {/* Sub-description */}
              <p className="text-xs sm:text-base text-hce-navy/75 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Kembangkan fondasi mental, kapasitas kepemimpinan, dan kesiapan diri sebelum melangkah membangun bisnis yang berdampak nyata bersama <strong>Sadam Permana</strong>.
              </p>

              {/* Date & Venue Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-hce-navy/85 pt-1">
                <div className="flex items-center space-x-2 px-3.5 py-2 bg-white rounded-xl border border-hce-teal/15 shadow-xs">
                  <Calendar className="w-4 h-4 text-hce-teal" />
                  <span>{SEMINAR_INFO.date}</span>
                </div>
                <div className="flex items-center space-x-2 px-3.5 py-2 bg-white rounded-xl border border-hce-teal/15 shadow-xs">
                  <Clock className="w-4 h-4 text-hce-teal" />
                  <span>{SEMINAR_INFO.time}</span>
                </div>
                <div className="flex items-center space-x-2 px-3.5 py-2 bg-white rounded-xl border border-hce-teal/15 shadow-xs">
                  <MapPin className="w-4 h-4 text-hce-teal" />
                  <span>Telkom University Bandung</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  type="button"
                  // onclick berpindah ke /#tiket bukan ke handleOpenCheckoutModal(undefined, "order")
                  onClick={() => window.location.href = "/#tiket"}
                  className="w-full sm:w-auto px-8 py-4 bg-hce-orange hover:bg-hce-orange/90 text-white rounded-2xl text-base font-black uppercase tracking-wider shadow-lg shadow-hce-orange/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2.5 group cursor-pointer"
                  style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.05em" }}
                >
                  <Ticket className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                  <span className="text-lg">Beli Tiket Sekarang</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToId("tentang")}
                  className="w-full sm:w-auto px-6 py-4 bg-white/90 hover:bg-white text-hce-navy border-2 border-hce-teal/20 hover:border-hce-teal/50 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Lihat Pembicara &darr;</span>
                </button>
              </div>

              {/* Live Countdown Component */}
              <div className="pt-4 border-t border-hce-teal/10">
                <span className="text-[11px] font-bold text-hce-navy/60 uppercase tracking-widest block mb-2">
                  Waktu Menuju Pelaksanaan Seminar:
                </span>
                <div className="flex items-center justify-center lg:justify-start space-x-2.5 sm:space-x-4">
                  {[
                    { label: "Hari", value: timeLeft.days },
                    { label: "Jam", value: timeLeft.hours },
                    { label: "Menit", value: timeLeft.minutes },
                    { label: "Detik", value: timeLeft.seconds },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center justify-center bg-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl border border-hce-teal/20 shadow-sm min-w-[64px] sm:min-w-[76px]"
                    >
                      <span
                        className="text-2xl sm:text-3xl font-black text-hce-teal leading-none"
                        style={{ fontFamily: "var(--font-bebas-neue)" }}
                      >
                        {item.value}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-hce-navy/60 uppercase mt-0.5">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Speaker Spotlight Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md">

                {/* Background Card Offset Frame */}
                <div className="absolute inset-0 bg-hce-teal/20 rounded-3xl transform rotate-3 scale-105 -z-10" />

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-2xl space-y-5">

                  {/* Speaker Photo */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md group">
                    <Image
                      src="/sadam.jpg"
                      alt={SPEAKER_INFO.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-hce-navy/85 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-extrabold text-hce-orange uppercase tracking-wider block">
                        Keynote Speaker Utama
                      </span>
                      <h3 className="text-xl font-extrabold leading-tight">{SPEAKER_INFO.name}</h3>
                      <p className="text-xs text-slate-200">{SPEAKER_INFO.title}</p>
                    </div>
                  </div>

                  {/* Speaker Quote Preview */}
                  <div className="p-4 bg-hce-cream/60 rounded-2xl border-l-3 border-hce-orange text-xs text-hce-navy/80 italic font-medium leading-relaxed">
                    {SPEAKER_INFO.quote}
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TENTANG SEMINAR SECTION (#tentang) */}
      {/* ========================================================================= */}
      <section id="tentang" className="py-20 bg-white border-y border-hce-teal/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-hce-cream border border-hce-teal/20 shadow-xs">
              <Info className="w-4 h-4 text-hce-orange" />
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-wider"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Tentang Seminar 
              </span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Membangun Karakter &amp; Kapasitas Diri Sebelum Bisnis
            </h2>
            <p className="text-xs sm:text-sm text-hce-navy/70 leading-relaxed font-medium">
              Banyak pemuda terburu-buru meluncurkan produk dan mencari pendanaan, namun rapuh ketika diterpa kegagalan. Seminar ini hadir sebagai kompas membangun fondasi mental, integritas, dan visi kepemimpinan yang kokoh.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold text-hce-teal uppercase tracking-widest">
                Latar Belakang &amp; Visi
              </span>
              <h3 className="text-2xl font-extrabold text-hce-navy leading-snug">
                Transformasi Potensi Otentik Menjadi Dampak Sosial &amp; Ekonomi
              </h3>
              <p className="text-xs sm:text-sm text-hce-navy/75 leading-relaxed font-medium">
                “Building Yourself Before Building a Business” dilatarbelakangi oleh pentingnya kesiapan diri sebelum membangun sebuah bisnis. Memiliki ide dan potensi saja tidak cukup, karena seorang entrepreneur juga membutuhkan mindset, keterampilan, keberanian, konsistensi, dan kemampuan beradaptasi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-hce-cream/60 border border-hce-teal/15 space-y-1.5">
                  <Target className="w-5 h-5 text-hce-teal" />
                  <h4 className="font-bold text-xs text-hce-navy">Visi Kolaborasi</h4>
                  <p className="text-[11px] text-hce-navy/70 leading-tight">Wadah inkubasi &amp; relasi bisnis mahasiswa se-Indonesia.</p>
                </div>
                <div className="p-4 rounded-2xl bg-hce-cream/60 border border-hce-teal/15 space-y-1.5">
                  <Users className="w-5 h-5 text-hce-orange" />
                  <h4 className="font-bold text-xs text-hce-navy">Mentoring Praktis</h4>
                  <p className="text-[11px] text-hce-navy/70 leading-tight">Mentoring praktis bersama praktisi bisnis berpengalaman.</p>
                </div>
                <div className="p-4 rounded-2xl bg-hce-cream/60 border border-hce-teal/15 space-y-1.5">
                  <Award className="w-5 h-5 text-hce-teal" />
                  <h4 className="font-bold text-xs text-hce-navy">Dampak Nyata</h4>
                  <p className="text-[11px] text-hce-navy/70 leading-tight">Mencetak wirausaha tangguh dan membuka lapangan kerja.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FFFDE7] p-6 sm:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-4">
              <h4 className="text-lg font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                Informasi Pelaksanaan
              </h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start space-x-2.5">
                  <span className="text-hce-teal font-bold">📅</span>
                  <div>
                    <strong className="text-hce-navy block">Hari &amp; Tanggal</strong>
                    <span className="text-hce-navy/70">{SEMINAR_INFO.date}</span>
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-hce-teal font-bold">⏰</span>
                  <div>
                    <strong className="text-hce-navy block">Waktu Acara</strong>
                    <span className="text-hce-navy/70">{SEMINAR_INFO.time}</span>
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-hce-teal font-bold">📍</span>
                  <div>
                    <strong className="text-hce-navy block">Lokasi Venue</strong>
                    <span className="text-hce-navy/70">{SEMINAR_INFO.venue}</span>
                  </div>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-hce-teal font-bold">🏛️</span>
                  <div>
                    <strong className="text-hce-navy block">Penyelenggara</strong>
                    <span className="text-hce-navy/70">{SEMINAR_INFO.organizer}</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PEMBICARA UTAMA SECTION (#pembicara) */}
      {/* ========================================================================= */}
      <section id="pembicara" className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-hce-teal/20 shadow-xs">
              <Sparkles className="w-4 h-4 text-hce-orange" />
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-wider"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Keynote Speaker Utama
              </span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Mengenal Pembicara: {SPEAKER_INFO.name}
            </h2>
            <p className="text-xs sm:text-sm text-hce-navy/70 font-medium max-w-xl mx-auto">
              {SPEAKER_INFO.title} &bull; Praktisi wirausaha dan mentor kepemimpinan pemuda.
            </p>
          </div>

          {/* Speaker Profile Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              <div className="lg:col-span-5 relative">
                <div className="w-full aspect-square rounded-3xl overflow-hidden border-4 border-[#FFFDE7] shadow-xl relative group">
                  <Image
                    src="/sadam.jpg"
                    alt={SPEAKER_INFO.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-hce-navy/85 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-extrabold text-hce-orange uppercase tracking-wider block">
                      Keynote Speaker Utama
                    </span>
                    <h3 className="text-2xl font-extrabold">{SPEAKER_INFO.name}</h3>
                    <p className="text-xs text-slate-200">{SPEAKER_INFO.title}</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-hce-teal uppercase tracking-widest">Biografi Singkat</span>
                  <h3 className="text-2xl font-extrabold text-hce-navy leading-snug">
                    Mentor Wirausaha &amp; Strategi Bisnis Berkelanjutan
                  </h3>
                  <p className="text-xs sm:text-sm text-hce-navy/75 leading-relaxed font-medium">
                    {SPEAKER_INFO.bio}
                  </p>
                </div>

                <div className="p-5 bg-hce-cream/60 rounded-2xl border-l-4 border-hce-orange space-y-2">
                  <Quote className="w-5 h-5 text-hce-orange/70" />
                  <p className="text-xs sm:text-sm text-hce-navy italic font-semibold leading-relaxed">
                    {SPEAKER_INFO.quote}
                  </p>
                  <span className="text-[11px] font-bold text-hce-teal block">— {SPEAKER_INFO.name}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-hce-navy uppercase tracking-wider block">
                    Topik Pembahasan Spesial:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SPEAKER_INFO.topics.map((t) => (
                      <div key={t.number} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-extrabold text-hce-orange">{t.number}.</span>
                          <strong className="text-xs text-hce-navy font-bold">{t.title}</strong>
                        </div>
                        <p className="text-[11px] text-hce-navy/70 leading-relaxed pl-5 font-medium">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TIKET & SPONSOR / MEDPART SECTION (#tiket) */}
      {/* ========================================================================= */}
      <section id="tiket" className="py-20 lg:py-28 bg-white border-y border-hce-teal/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-hce-cream border border-hce-teal/20 shadow-xs">
              <Ticket className="w-4 h-4 text-hce-orange" />
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-wider"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Pilihan Kategori Tiket
              </span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Investasi Terbaik untuk Masa Depan Anda
            </h2>
            <p className="text-xs sm:text-sm text-hce-navy/70 font-medium max-w-xl mx-auto">
              Pilih kategori tiket yang sesuai dengan kebutuhan Anda. Kuota sangat terbatas untuk menjaga kenyamanan sesi interaksi.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {TICKET_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative border-2 ${cat.isPopular
                    ? "bg-white border-hce-orange shadow-2xl scale-105 z-10"
                    : "bg-slate-50/70 border-slate-200 shadow-lg hover:shadow-xl hover:border-hce-teal/30 hover:bg-white"
                  }`}
              >
                {cat.tag && (
                  <span
                    className={`absolute -top-3.5 right-6 px-4 py-1 rounded-full text-[11px] font-black uppercase text-white shadow-md tracking-wider ${cat.badgeColor === "orange"
                        ? "bg-hce-orange"
                        : cat.badgeColor === "teal"
                          ? "bg-hce-teal"
                          : "bg-hce-navy"
                      }`}
                  >
                    {cat.tag}
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-hce-navy">{cat.name}</h3>
                    <div className="flex items-baseline space-x-2 mt-2">
                      <span
                        className="text-3xl sm:text-4xl font-black text-hce-teal"
                        style={{ fontFamily: "var(--font-bebas-neue)" }}
                      >
                        {formatRupiah(cat.price)}
                      </span>
                      {cat.originalPrice && (
                        <span className="text-xs line-through text-slate-400 font-semibold">
                          {formatRupiah(cat.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <span className="text-xs font-bold text-hce-navy/80 uppercase tracking-wider block">
                      Benefit Termasuk:
                    </span>
                    <ul className="space-y-2 text-xs">
                      {cat.perks.map((perk, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-hce-navy/80 font-medium">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleSelectCategoryFromPricing(cat)}
                    className={`w-full py-4 rounded-2xl text-center text-sm font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${cat.isPopular
                        ? "bg-hce-orange hover:bg-hce-orange/90 text-white shadow-hce-orange/25 hover:scale-105"
                        : "bg-hce-teal hover:bg-hce-teal/90 text-white shadow-hce-teal/20 hover:scale-105"
                      }`}
                    style={{ fontFamily: "var(--font-bebas-neue)" }}
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Pilih &amp; Beli Tiket Ini</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SPONSORS & MEDIA PARTNERS SECTION (#sponsor) */}
      {/* ========================================================================= */}
      <section id="sponsor" className="py-20 lg:py-24 relative overflow-hidden">
        {/* Subtle Background Glow Dots */}
        <div className="absolute top-1/2 left-10 w-[350px] h-[350px] glow-dot-teal -z-10 opacity-15 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] glow-dot-orange -z-10 opacity-15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#EAF3F3] border border-hce-teal/20 shadow-xs">
              <Sparkles className="w-4 h-4 text-hce-orange" />
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-widest"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Partnership &amp; Media Network
              </span>
            </div>
            <h3
              className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Didukung &amp; Bekerja Sama Dengan
            </h3>
            <p className="text-xs sm:text-sm text-hce-navy/75 font-medium max-w-lg mx-auto leading-relaxed">
              Seminar HCE 2026 berkolaborasi dengan jaringan media partner dan institusi terkemuka untuk memperluas jangkauan dampak positif.
            </p>
          </div>

          {/* Media Partners Logo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {mediaPartners.map((mp, index) => (
              <div
                key={index}
                className="bg-[#F8F1E5]/80 backdrop-blur-xs border border-hce-teal/15 hover:border-hce-teal/40 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group hover:bg-white"
              >
                <div className="h-14 sm:h-16 w-full flex items-center justify-center">
                  <Image
                    src={mp.logo}
                    alt={mp.name}
                    width={120}
                    height={50}
                    className="max-h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="text-xs font-bold text-hce-navy/80 text-center group-hover:text-hce-teal transition-colors">
                  {mp.name}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STICKY ACTION BUTTON (BOTTOM RIGHT): CARI E-TICKET */}
      {/* ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={handleOpenLookupModal}
          className="group flex items-center space-x-2 bg-hce-navy hover:bg-hce-teal text-white pl-2.5 pr-3.5 py-1.5 sm:py-2 rounded-[10px] shadow-lg border border-white/25 hover:border-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-hce-navy/30"
          aria-label="Cari E-Ticket"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] bg-hce-orange/20 flex items-center justify-center text-hce-orange group-hover:bg-white group-hover:text-hce-teal transition-colors">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="text-[8px] sm:text-[9px] text-hce-cream/80 font-bold block uppercase tracking-wider leading-none">
              Sudah Punya Tiket?
            </span>
            <span
              className="text-xs sm:text-sm font-black uppercase tracking-wide leading-tight text-white"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Cari E-Ticket
            </span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 7. POPUP MODAL 1: FORMULIR PEMBELIAN TIKET */}
      {/* ========================================================================= */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">

          {/* Backdrop Click Close */}
          <div
            className="fixed inset-0"
            onClick={handleCloseOrderModal}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="bg-hce-cream border-2 border-slate-300 rounded-3xl p-5 sm:p-8 max-w-3xl w-full my-auto shadow-2xl relative z-10 max-h-[92vh] overflow-y-auto">

            {/* Modal Header & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-hce-teal/15 mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-hce-orange/15 text-hce-orange flex items-center justify-center shadow-xs">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest block">
                    SEMINAR HCE 2026
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-black text-hce-navy uppercase tracking-wide leading-none"
                    style={{ fontFamily: "var(--font-bebas-neue)" }}
                  >
                    Formulir Pembelian Tiket
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseOrderModal}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-hce-navy border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105"
                aria-label="Tutup popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">

              {/* Step indicator */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-hce-teal/15 shadow-sm max-w-md mx-auto">
                <div className="flex items-center justify-between relative">
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${checkoutStep >= 1 ? "bg-hce-teal text-white shadow-xs" : "bg-slate-100 text-slate-400"}`}>1</div>
                    <span className="text-[10px] font-bold mt-1 text-hce-navy">Data Tiket</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 rounded-full ${checkoutStep >= 2 ? "bg-hce-teal" : "bg-slate-200"}`} />
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${checkoutStep >= 2 ? "bg-hce-teal text-white shadow-xs" : "bg-slate-100 text-slate-400"}`}>2</div>
                    <span className="text-[10px] font-bold mt-1 text-hce-navy">Bayar</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 rounded-full ${checkoutStep >= 3 ? "bg-hce-teal" : "bg-slate-200"}`} />
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${checkoutStep === 3 ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400"}`}>3</div>
                    <span className="text-[10px] font-bold mt-1 text-hce-navy">E-Ticket</span>
                  </div>
                </div>
              </div>

              {/* STEP 1: PILIH TIKET & ISI DATA IDENTITAS MAHASISWA / PESERTA */}
              {checkoutStep === 1 && (
                <form onSubmit={handleProceedToPayment} className="space-y-5">

                  {/* 1. Category Selection in Form */}
                  <div className="bg-[#FFFDE7] p-5 sm:p-6 rounded-2xl border-2 border-slate-300 shadow-sm space-y-3">
                    <h4 className="text-base sm:text-lg font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                      1. Pilih Kategori
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {TICKET_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory.id === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-3.5 rounded-xl cursor-pointer border-2 transition-all flex flex-col justify-between ${isSelected
                                ? "bg-white border-hce-teal shadow-md"
                                : "bg-white/60 border-hce-teal/15 hover:bg-white"
                              }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-xs text-hce-navy">{cat.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-hce-teal font-bold" />}
                              </div>
                              <span className="text-base font-black text-hce-teal">{formatRupiah(cat.price)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Benefit Termasuk */}
                    <div className="pt-3 border-t border-hce-teal/15 space-y-2">
                      <span className="text-xs font-bold text-hce-navy uppercase tracking-wider block">
                        Benefit Termasuk ({selectedCategory.name}):
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {selectedCategory.perks.map((perk, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-hce-navy/85 font-medium">{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 2. Customer Identity Data (NIM, Fakultas, Prodi) */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base sm:text-lg font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                        2. Data Identitas Peserta
                      </h4>
                      <span className="text-[11px] text-hce-teal font-bold bg-[#EAF3F3] px-2.5 py-0.5 rounded-md">
                        Wajib Diisi Lengkap
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Nama Lengkap */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-hce-navy/80 flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-hce-teal" />
                          <span>Nama Lengkap *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nama Lengkap.."
                          className="w-full px-3.5 py-2.5 bg-hce-cream/40 border border-hce-teal/25 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-hce-navy/80 flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-hce-teal" />
                          <span>Alamat E-mail Aktif *</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Aktif..."
                          className="w-full px-3.5 py-2.5 bg-hce-cream/40 border border-hce-teal/25 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-hce-navy/80 flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 text-hce-teal" />
                          <span>Nomor WhatsApp Aktif *</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-3.5 py-2.5 bg-hce-cream/40 border border-hce-teal/25 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all"
                        />
                      </div>

                      {/* NIM */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-hce-navy/80 flex items-center space-x-1">
                          <GraduationCap className="w-3.5 h-3.5 text-hce-teal" />
                          <span>Nomor Induk Mahasiswa (NIM) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={nim}
                          onChange={(e) => setNim(e.target.value)}
                          placeholder="Contoh: 1201220001"
                          className="w-full px-3.5 py-2.5 bg-hce-cream/40 border border-hce-teal/25 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all"
                        />
                      </div>

                      {/* Fakultas Dropdown */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-hce-navy/80 flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-hce-teal" />
                          <span>Fakultas *</span>
                        </label>
                        <select
                          required
                          value={faculty}
                          onChange={(e) => setFaculty(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-hce-cream/40 border border-hce-teal/25 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all cursor-pointer"
                        >
                          {FACULTIES.map((fac) => (
                            <option key={fac} value={fac}>
                              {fac}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Program Studi (Prodi) */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-hce-navy/80 flex items-center space-x-1">
                          <BookOpen className="w-3.5 h-3.5 text-hce-teal" />
                          <span>Program Studi (Prodi) *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={studyProgram}
                          onChange={(e) => setStudyProgram(e.target.value)}
                          placeholder="Contoh: S1 Rekayasa Perangkat Lunak"
                          className="w-full px-3.5 py-2.5 bg-hce-cream/40 border border-hce-teal/25 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Payment Method Selector */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-base sm:text-lg font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                      3. Metode Pembayaran
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {PAYMENT_METHODS.map((pm) => (
                        <div
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${selectedPayment === pm.id
                              ? "border-hce-teal bg-[#E8F4F4]"
                              : "border-slate-200 bg-slate-50/50 hover:bg-white"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hce-navy">{pm.name}</span>
                            {selectedPayment === pm.id && <Check className="w-3 h-3 text-hce-teal" />}
                          </div>
                          {pm.badge && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md w-fit">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button Bar */}
                  <div className="p-5 rounded-2xl bg-hce-navy text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-300 font-medium block">Total Pembayaran:</span>
                      <span className="text-2xl sm:text-3xl font-black text-hce-orange" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                        {formatRupiah(selectedCategory.price)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3.5 bg-hce-orange hover:bg-hce-orange/90 text-white rounded-xl text-base font-black uppercase tracking-wider shadow-lg shadow-hce-orange/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      style={{ fontFamily: "var(--font-bebas-neue)" }}
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </form>
              )}

              {/* STEP 2: SIMULASI PEMBAYARAN */}
              {checkoutStep === 2 && activeOrder && (
                <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest">Order ID</span>
                      <h4 className="text-base font-extrabold text-hce-navy">{activeOrder.orderId}</h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 font-medium block">Total Tagihan</span>
                      <span className="text-xl font-black text-hce-orange">{formatRupiah(activeOrder.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-hce-teal/30 text-center space-y-2.5">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                      Simulasi Gateway QRIS Instant
                    </span>
                    <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl border shadow-inner flex items-center justify-center">
                      <Image
                        src="/scanqr.jpeg"
                        alt="QRIS Mock Payment"
                        width={150}
                        height={150}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <p className="text-[11px] text-hce-navy/60">
                      Klik tombol hijau di bawah untuk memverifikasi pembayaran simulasi secara instan.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatePaymentSuccess}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                      style={{ fontFamily: "var(--font-bebas-neue)" }}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Memverifikasi Pembayaran...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Simulasikan Pembayaran Berhasil</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setCheckoutStep(1)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      &larr; Ubah Rincian Pesanan
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: E-TICKET TERBIT LANGSUNG */}
              {checkoutStep === 3 && activeOrder && (
                <div className="space-y-5 animate-fade-in">

                  {/* Success Alert Banner */}
                  <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl text-center space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-900">Pembayaran Berhasil! E-Ticket Resmi Telah Terbit</h4>
                    <p className="text-xs text-emerald-700">Tunjukkan tiket di bawah saat registrasi ulang di venue.</p>
                  </div>

                  {/* E-TICKET CARD */}
                  <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden">
                    <div className="bg-hce-navy text-white px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-xs">
                          <Image src="/HCE LOGO.png" alt="HCE" width={24} height={24} className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                          <span className="text-[10px] text-hce-orange font-bold uppercase tracking-widest">OFFICIAL SEMINAR PASS</span>
                          <h4 className="text-base font-black leading-tight" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                            HIPMI Collab Expo 2026
                          </h4>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {activeOrder.ticketStatus}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="border-b pb-3">
                        <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest block">Seminar</span>
                        <h4 className="text-base sm:text-lg font-black text-hce-navy">&ldquo;{SEMINAR_INFO.theme}&rdquo;</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Keynote Speaker: <strong>{SPEAKER_INFO.name}</strong></p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-slate-400 font-semibold block text-[10px]">Data Peserta:</span>
                          <strong className="text-hce-navy text-xs block">{activeOrder.customer.fullName}</strong>
                          <span className="text-slate-500 block">NIM: <strong>{activeOrder.customer.nim}</strong></span>
                          <span className="text-slate-500 block">{activeOrder.customer.faculty}</span>
                          <span className="text-slate-500 block">{activeOrder.customer.studyProgram}</span>
                          <span className="text-slate-500 block text-[11px]">{activeOrder.customer.email}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-slate-400 font-semibold block text-[10px]">Waktu &amp; Lokasi:</span>
                          <span className="text-hce-navy font-bold block">{SEMINAR_INFO.date}</span>
                          <span className="text-slate-500 block">{SEMINAR_INFO.time}</span>
                          <span className="text-slate-500 block">{SEMINAR_INFO.venue}</span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border-2 border-dashed border-hce-teal/20 text-center flex flex-col items-center justify-center">
                          <QrCode className="w-16 h-16 text-hce-navy mb-1" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase">TICKET CODE</span>
                          <strong className="text-xs font-mono font-black text-hce-teal">{activeOrder.ticketCode}</strong>
                        </div>
                      </div>

                      <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Paket:</span>
                          <strong>{activeOrder.ticketCategoryName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total:</span>
                          <strong className="text-hce-teal">{formatRupiah(activeOrder.totalPrice)}</strong>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href="https://chat.whatsapp.com/CNdyfvfrIE41LUfOmtKXZA?mode=gi_t"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Join Group</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-1.5 bg-hce-navy hover:bg-hce-navy/90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(activeOrder.ticketCode)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-hce-navy rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode ? "Tersalin" : "Salin"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. POPUP MODAL 2: CARI / CETAK E-TICKET */}
      {/* ========================================================================= */}
      {isLookupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">

          {/* Backdrop Click Close */}
          <div
            className="fixed inset-0"
            onClick={handleCloseLookupModal}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="bg-hce-cream border-2 border-slate-300 rounded-3xl p-5 sm:p-8 max-w-3xl w-full my-auto shadow-2xl relative z-10 max-h-[92vh] overflow-y-auto">

            {/* Modal Header & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-hce-teal/15 mb-6">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-hce-teal/15 text-hce-teal flex items-center justify-center shadow-xs">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest block">
                    PORTAL E-TICKET
                  </span>
                  <h3
                    className="text-xl sm:text-2xl font-black text-hce-navy uppercase tracking-wide leading-none"
                    style={{ fontFamily: "var(--font-bebas-neue)" }}
                  >
                    Cari / Cetak E-Ticket
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseLookupModal}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-hce-navy border border-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105"
                aria-label="Tutup popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-5">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-3">
                <p className="text-xs text-hce-navy/70 leading-relaxed font-medium">
                  Masukkan <strong>Kode Tiket</strong> (contoh: <span className="font-mono text-hce-teal">SEM-2026-1001</span>) atau <strong>Alamat Email</strong> yang didaftarkan saat pembelian untuk menemukan dan mencetak E-Ticket Anda.
                </p>

                <form onSubmit={handleLookupTicket} className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-hce-teal absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTicketQuery}
                      onChange={(e) => setSearchTicketQuery(e.target.value)}
                      placeholder="Ketik Kode Tiket atau Email peserta..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-hce-teal hover:bg-hce-teal/90 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105"
                  >
                    Cari Tiket
                  </button>
                </form>

                {lookupMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{lookupMessage}</span>
                  </div>
                )}
              </div>

              {/* TAMPILAN TIKET HASIL CARI (IDENTICAL TO ORDER MODAL PASS) */}
              {lookupTicket && (
                <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xl overflow-hidden animate-fade-in">
                  <div className="bg-hce-navy text-white px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-xs">
                        <Image src="/HCE LOGO.png" alt="HCE" width={24} height={24} className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] text-hce-orange font-bold uppercase tracking-widest">OFFICIAL SEMINAR PASS</span>
                        <h4 className="text-base font-black leading-tight" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                          HIPMI Collab Expo 2026
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {lookupTicket.ticketStatus}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="border-b pb-3">
                      <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest block">Seminar</span>
                      <h4 className="text-base sm:text-lg font-black text-hce-navy">&ldquo;{SEMINAR_INFO.theme}&rdquo;</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Keynote Speaker: <strong>{SPEAKER_INFO.name}</strong></p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold block text-[10px]">Data Peserta:</span>
                        <strong className="text-hce-navy text-xs block">{lookupTicket.customer.fullName}</strong>
                        <span className="text-slate-500 block">NIM: <strong>{lookupTicket.customer.nim}</strong></span>
                        <span className="text-slate-500 block">{lookupTicket.customer.faculty}</span>
                        <span className="text-slate-500 block">{lookupTicket.customer.studyProgram}</span>
                        <span className="text-slate-500 block text-[11px]">{lookupTicket.customer.email}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold block text-[10px]">Waktu &amp; Lokasi:</span>
                        <span className="text-hce-navy font-bold block">{SEMINAR_INFO.date}</span>
                        <span className="text-slate-500 block">{SEMINAR_INFO.time}</span>
                        <span className="text-slate-500 block">{SEMINAR_INFO.venue}</span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border-2 border-dashed border-hce-teal/20 text-center flex flex-col items-center justify-center">
                        <QrCode className="w-16 h-16 text-hce-navy mb-1" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase">TICKET CODE</span>
                        <strong className="text-xs font-mono font-black text-hce-teal">{lookupTicket.ticketCode}</strong>
                      </div>
                    </div>

                    <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Paket:</span>
                        <strong>{lookupTicket.ticketCategoryName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total:</span>
                        <strong className="text-hce-teal">{formatRupiah(lookupTicket.totalPrice)}</strong>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="https://chat.whatsapp.com/CNdyfvfrIE41LUfOmtKXZA?mode=gi_t"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Join Group</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-hce-navy hover:bg-hce-navy/90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(lookupTicket.ticketCode)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-hce-navy rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode ? "Tersalin" : "Salin"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
