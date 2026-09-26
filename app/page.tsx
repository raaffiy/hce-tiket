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
  Loader2,
} from "lucide-react";
import {
  SEMINAR_INFO,
  SPEAKER_INFO,
  TICKET_CATEGORIES,
  RUNDOWN_SCHEDULE,
  SEMINAR_BENEFITS,
  SEMINAR_FAQS,
  PAYMENT_METHODS,
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

  // FAQ Accordion & Search State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState("");

  // Checkout & Ticketing States (Single Page Embedded Flow)
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<"order" | "lookup">("order");
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory>(TICKET_CATEGORIES[1]);
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [notes, setNotes] = useState("");
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

  // Quick select category from ticket section & scroll to checkout form
  const handleSelectCategoryFromPricing = (cat: TicketCategory) => {
    setSelectedCategory(cat);
    setActiveTab("order");
    setCheckoutStep(1);
    scrollToId("checkout");
  };

  // Submit step 1: Proceed to simulated payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Harap lengkapi nama, email, dan nomor WhatsApp!");
      return;
    }

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-2026-${randomNum}`;
    const ticketCode = `SEM-2026-${randomNum}`;
    const subtotal = selectedCategory.price * quantity;

    const newOrder: SeminarOrder = {
      orderId,
      ticketCode,
      ticketCategoryId: selectedCategory.id,
      ticketCategoryName: selectedCategory.name,
      ticketPrice: selectedCategory.price,
      quantity,
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
        institution: institution.trim() || "Umum / Mahasiswa",
        notes: notes.trim(),
      },
    };

    setActiveOrder(newOrder);
    setCheckoutStep(2);
    scrollToId("checkout");
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
      scrollToId("checkout");
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

  const filteredFaqs = SEMINAR_FAQS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

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
                  SEMINAR NASIONAL HCE 2026 &bull; TELKOM UNIVERSITY
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
                  onClick={() => scrollToId("tiket")}
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
                  <span>Pelajari Seminar &darr;</span>
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

                  {/* Quick Perks Bar */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold">Kapasitas</span>
                      <strong className="text-hce-navy font-bold">500+ Peserta</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 block font-semibold">Harga Mulai</span>
                      <strong className="text-hce-teal font-extrabold">Rp 35.000</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToId("checkout")}
                    className="w-full py-3 bg-hce-teal hover:bg-hce-teal/90 text-white rounded-xl text-center font-bold text-xs shadow-md shadow-hce-teal/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Pesan Tiket Seminar</span>
                  </button>

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
                Tentang Seminar Nasional
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
                Melalui seminar ini, Anda akan mempelajari bagaimana mengenali kekuatan internal, mengatasi <em>imposter syndrome</em>, serta merumuskan strategi eksekusi bisnis yang berakar pada penyelesaian masalah nyata di masyarakat.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-hce-cream/60 border border-hce-teal/15 space-y-1.5">
                  <Target className="w-5 h-5 text-hce-teal" />
                  <h4 className="font-bold text-xs text-hce-navy">Visi Kolaborasi</h4>
                  <p className="text-[11px] text-hce-navy/70 leading-tight">Wadah inkubasi &amp; relasi bisnis mahasiswa se-Indonesia.</p>
                </div>
                <div className="p-4 rounded-2xl bg-hce-cream/60 border border-hce-teal/15 space-y-1.5">
                  <Users className="w-5 h-5 text-hce-orange" />
                  <h4 className="font-bold text-xs text-hce-navy">Eksplorasi Potensi</h4>
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

              <button
                type="button"
                onClick={() => scrollToId("checkout")}
                className="w-full py-3 bg-hce-orange hover:bg-hce-orange/90 text-white rounded-xl text-center font-bold text-xs shadow-md shadow-hce-orange/20 transition-all cursor-pointer"
              >
                Daftar &amp; Amankan Tiket
              </button>
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
                    src={SPEAKER_INFO.photo}
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

                <div className="p-5 bg-hce-cream/70 rounded-2xl border-l-4 border-hce-orange text-xs sm:text-sm font-semibold text-hce-navy/90 italic leading-relaxed relative">
                  <Quote className="w-6 h-6 text-hce-orange/30 absolute top-2 right-2" />
                  {SPEAKER_INFO.quote}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToId("checkout")}
                    className="inline-flex items-center space-x-2 px-7 py-3.5 bg-hce-orange hover:bg-hce-orange/90 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-hce-orange/20 transition-all cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Daftar Sesi Bersama Sadam Permana</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h3
                className="text-2xl sm:text-3xl font-black text-hce-navy uppercase tracking-wide"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                4 Pilar Materi yang Akan Dibahas
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SPEAKER_INFO.topics.map((topic) => (
                <div
                  key={topic.number}
                  className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm hover:border-hce-teal/40 transition-all flex gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-hce-teal text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-hce-teal/20">
                    {topic.number}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-hce-navy text-base">{topic.title}</h4>
                    <p className="text-xs text-hce-navy/70 leading-relaxed font-medium">{topic.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INFORMASI SEMINAR (RUNDOWN & BENEFITS & MEDIA PARTNERS) (#informasi) */}
      {/* ========================================================================= */}
      <section id="informasi" className="py-20 bg-white border-y border-hce-teal/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* Rundown Subsection */}
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-widest"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Jadwal Kegiatan
              </span>
              <h2
                className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Rundown Acara Seminar
              </h2>
              <p className="text-xs sm:text-sm text-hce-navy/70 font-medium">
                Rangkaian agenda padat &amp; interaktif pada Sabtu, 24 Oktober 2026.
              </p>
            </div>

            <div className="space-y-3.5">
              {RUNDOWN_SCHEDULE.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#FFFDE7] border-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-hce-teal/30 transition-all"
                >
                  <div className="flex items-start sm:items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-hce-teal/10 text-hce-teal flex items-center justify-center font-bold text-xs shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-hce-orange block">{item.time}</span>
                      <h3 className="text-sm sm:text-base font-extrabold text-hce-navy">{item.title}</h3>
                      <p className="text-xs text-hce-navy/70">{item.desc}</p>
                    </div>
                  </div>

                  {item.speaker && (
                    <div className="px-3 py-1 bg-white rounded-xl border border-hce-teal/20 text-xs font-bold text-hce-teal shrink-0 shadow-2xs">
                      {item.speaker}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Subsection */}
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2
                className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Fasilitas &amp; Benefit Peserta
              </h2>
              <p className="text-xs sm:text-sm text-hce-navy/70 font-medium max-w-xl mx-auto">
                Setiap peserta resmi memperoleh berbagai benefit eksklusif untuk menunjang wawasan &amp; relasi bisnis.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SEMINAR_BENEFITS.map((b, idx) => (
                <div
                  key={idx}
                  className="bg-hce-cream/40 p-6 rounded-3xl border-2 border-slate-200 shadow-sm space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-hce-teal/10 text-hce-teal flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-hce-navy text-base">{b.title}</h3>
                  <p className="text-xs text-hce-navy/70 leading-relaxed font-medium">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Media Partners Subsection */}
          <div className="text-center space-y-6 pt-4 border-t border-slate-100">
            <span
              className="text-xs font-black uppercase text-hce-teal tracking-widest block"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Media Partners &amp; Jaringan Kolaborasi Resmi
            </span>
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
              {mediaPartners.map((mp, index) => (
                <div
                  key={index}
                  className="w-28 sm:w-36 h-14 bg-slate-50 border border-slate-200 rounded-2xl p-2 flex items-center justify-center shadow-xs"
                >
                  <Image
                    src={mp.logo}
                    alt={mp.name}
                    width={100}
                    height={50}
                    className="max-h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TIKET PRICING SECTION (#tiket) */}
      {/* ========================================================================= */}
      <section id="tiket" className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-hce-teal/20 shadow-xs">
              <Ticket className="w-4 h-4 text-hce-orange" />
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-wider"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Katalog Tiket Seminar
              </span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Pilih Paket Tiket Anda
            </h2>
            <p className="text-xs sm:text-sm text-hce-navy/70 font-medium max-w-lg mx-auto">
              Pilih paket tiket yang sesuai dengan kebutuhan Anda dan selesaikan pemesanan langsung di formulir bawah.
            </p>
          </div>

          {/* Ticket Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {TICKET_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative border-2 ${cat.isPopular
                    ? "bg-white border-hce-orange shadow-2xl scale-105 z-10"
                    : "bg-white/90 border-slate-200 shadow-lg hover:shadow-xl hover:border-hce-teal/30"
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

                <div>
                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-hce-navy uppercase tracking-wide">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold block mt-0.5">
                      Sisa kuota: <strong className="text-hce-orange">{cat.remaining} tiket</strong>
                    </span>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <span
                      className="text-4xl sm:text-5xl font-black text-hce-teal"
                      style={{ fontFamily: "var(--font-bebas-neue)" }}
                    >
                      {formatRupiah(cat.price)}
                    </span>
                    {cat.originalPrice && (
                      <span className="text-sm text-slate-400 line-through ml-2 font-bold">
                        {formatRupiah(cat.originalPrice)}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 block mt-1 font-semibold">/ pax (Sekali Bayar)</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-bold text-hce-navy uppercase tracking-wider block">
                      Benefit Paket:
                    </span>
                    <ul className="space-y-2.5">
                      {cat.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-xs text-hce-navy/80 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
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
      {/* 6. FAQ SECTION (#faq) */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-white border-y border-hce-teal/10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-hce-cream border border-hce-teal/20 shadow-xs">
              <HelpCircle className="w-4 h-4 text-hce-orange" />
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-wider"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Pusat Bantuan &amp; Tanya Jawab
              </span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Pertanyaan yang Sering Diajukan
            </h2>

            {/* FAQ Search Box */}
            <div className="pt-3 max-w-lg mx-auto">
              <div className="relative">
                <Search className="w-4 h-4 text-hce-teal absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Cari FAQ (sertifikat, lokasi, tiket, refund)..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-hce-teal rounded-2xl text-xs font-semibold text-hce-navy focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Accordion list */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-hce-cream/40 rounded-2xl border-2 border-slate-200 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-xs sm:text-sm text-hce-navy hover:text-hce-teal transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-hce-teal shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-hce-navy/70 leading-relaxed border-t border-slate-100 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CHECKOUT & E-TICKET PORTAL SECTION (#checkout) */}
      {/* ========================================================================= */}
      <section id="checkout" className="py-20 lg:py-28 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-hce-teal/20 shadow-xs">
              <Ticket className="w-4 h-4 text-hce-orange" />
              <span
                className="text-xs font-black uppercase text-hce-teal tracking-wider"
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                Pemesanan &amp; E-Ticket Portal
              </span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black text-hce-navy uppercase tracking-wide leading-tight"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              Formulir Pembelian Tiket &amp; Cek E-Ticket
            </h2>
            <p className="text-xs sm:text-sm text-hce-navy/70 max-w-lg mx-auto font-medium">
              Selesaikan pemesanan tiket seminar atau cari tiket yang sudah pernah Anda pesan di sini.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="inline-flex p-1.5 bg-white border border-hce-teal/20 rounded-2xl shadow-xs mt-2">
              <button
                type="button"
                onClick={() => setActiveTab("order")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "order" ? "bg-hce-teal text-white shadow-sm" : "text-hce-navy/70 hover:text-hce-teal"
                  }`}
              >
                Pesan Tiket Baru
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("lookup")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "lookup" ? "bg-hce-teal text-white shadow-sm" : "text-hce-navy/70 hover:text-hce-teal"
                  }`}
              >
                Cari / Cetak E-Ticket
              </button>
            </div>
          </div>

          {/* TAB 1: FORMULIR PEMESANAN TIKET */}
          {activeTab === "order" && (
            <div className="space-y-6">

              {/* Step indicator */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-hce-teal/15 shadow-sm max-w-xl mx-auto">
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

              {/* STEP 1: PILIH TIKET & ISI DATA PESERTA */}
              {checkoutStep === 1 && (
                <form onSubmit={handleProceedToPayment} className="space-y-6">

                  {/* Category Selection in Form */}
                  <div className="bg-[#FFFDE7] p-6 sm:p-8 rounded-3xl border-2 border-slate-300 shadow-md space-y-4">
                    <h3 className="text-xl font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                      1. Kategori &amp; Jumlah Tiket
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {TICKET_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory.id === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat)}
                            className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex flex-col justify-between ${isSelected
                                ? "bg-white border-hce-teal shadow-md"
                                : "bg-white/60 border-hce-teal/15 hover:bg-white"
                              }`}
                          >
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-xs text-hce-navy">{cat.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-hce-teal font-bold" />}
                              </div>
                              <span className="text-lg font-black text-hce-teal">{formatRupiah(cat.price)}</span>
                            </div>
                            <span className="text-[10px] text-hce-orange font-bold mt-2">Sisa {cat.remaining} tiket</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-hce-teal/10 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-hce-navy block">Jumlah Tiket:</span>
                        <span className="text-[10px] text-hce-navy/60">Maksimal 5 tiket per transaksi</span>
                      </div>
                      <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-xl border border-hce-teal/20">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-hce-navy font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-hce-navy">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.min(5, quantity + 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-hce-navy font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Customer Data */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-md space-y-4">
                    <h3 className="text-xl font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                      2. Data Identitas Peserta
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          placeholder="contoh: Rafi Maulana Pratama"
                          className="w-full px-4 py-2.5 bg-hce-cream/40 border border-hce-teal/20 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none"
                        />
                      </div>

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
                          placeholder="contoh: rafi@example.com"
                          className="w-full px-4 py-2.5 bg-hce-cream/40 border border-hce-teal/20 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none"
                        />
                      </div>

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
                          placeholder="contoh: 081234567890"
                          className="w-full px-4 py-2.5 bg-hce-cream/40 border border-hce-teal/20 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-hce-navy/80 flex items-center space-x-1">
                          <Building className="w-3.5 h-3.5 text-hce-teal" />
                          <span>Institusi / Kampus / Pekerjaan</span>
                        </label>
                        <input
                          type="text"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          placeholder="contoh: Telkom University"
                          className="w-full px-4 py-2.5 bg-hce-cream/40 border border-hce-teal/20 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-hce-navy/80">Pertanyaan untuk Sadam Permana / Catatan (Opsional)</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tuliskan pertanyaan menarik yang ingin kamu tanyakan di sesi Q&A..."
                        className="w-full px-4 py-2 bg-hce-cream/40 border border-hce-teal/20 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-md space-y-3">
                    <h3 className="text-xl font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                      3. Metode Pembayaran
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {PAYMENT_METHODS.map((pm) => (
                        <div
                          key={pm.id}
                          onClick={() => setSelectedPayment(pm.id)}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${selectedPayment === pm.id
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
                  <div className="p-6 rounded-3xl bg-hce-navy text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-300 font-medium block">Total Pembayaran ({quantity} Tiket):</span>
                      <span className="text-3xl font-black text-hce-orange" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                        {formatRupiah(selectedCategory.price * quantity)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 bg-hce-orange hover:bg-hce-orange/90 text-white rounded-2xl text-base font-black uppercase tracking-wider shadow-lg shadow-hce-orange/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      style={{ fontFamily: "var(--font-bebas-neue)" }}
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </form>
              )}

              {/* STEP 2: SIMULASI PEMBAYARAN */}
              {checkoutStep === 2 && activeOrder && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest">Order ID</span>
                      <h3 className="text-lg font-extrabold text-hce-navy">{activeOrder.orderId}</h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-500 font-medium block">Total Tagihan</span>
                      <span className="text-2xl font-black text-hce-orange">{formatRupiah(activeOrder.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-hce-teal/30 text-center space-y-3">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block">
                      Simulasi Gateway QRIS Instant
                    </span>
                    <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl border shadow-inner flex items-center justify-center">
                      <Image
                        src="/scanqr.jpeg"
                        alt="QRIS Mock Payment"
                        width={160}
                        height={160}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <p className="text-[11px] text-hce-navy/60">
                      Klik tombol hijau di bawah untuk memverifikasi pembayaran simulasi secara instan.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatePaymentSuccess}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-base font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
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
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      &larr; Ubah Rincian Pesanan
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: E-TICKET TERBIT LANGSUNG DI SINGLE PAGE */}
              {checkoutStep === 3 && activeOrder && (
                <div className="space-y-6 animate-fade-in">

                  {/* Success Alert Banner */}
                  <div className="bg-emerald-50 border-2 border-emerald-200 p-5 rounded-2xl text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="text-base font-bold text-emerald-900">Pembayaran Berhasil! E-Ticket Resmi Telah Terbit</h3>
                    <p className="text-xs text-emerald-700">Tunjukkan tiket di bawah saat registrasi ulang di venue.</p>
                  </div>

                  {/* E-TICKET CARD */}
                  <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-2xl overflow-hidden">
                    <div className="bg-hce-navy text-white px-6 py-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xs">
                          <Image src="/HCE LOGO.png" alt="HCE" width={28} height={28} className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                          <span className="text-[10px] text-hce-orange font-bold uppercase tracking-widest">OFFICIAL SEMINAR PASS</span>
                          <h4 className="text-lg font-black leading-tight" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                            HIPMI Collab Expo 2026
                          </h4>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {activeOrder.ticketStatus}
                      </span>
                    </div>

                    <div className="p-6 sm:p-8 space-y-5">
                      <div className="border-b pb-4">
                        <span className="text-xs font-bold text-hce-teal uppercase tracking-widest block">Seminar Nasional</span>
                        <h4 className="text-lg sm:text-xl font-black text-hce-navy">&ldquo;{SEMINAR_INFO.theme}&rdquo;</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Keynote Speaker: <strong>{SPEAKER_INFO.name}</strong></p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <span className="text-slate-400 font-semibold block text-[11px]">Nama Peserta:</span>
                          <strong className="text-hce-navy text-sm block">{activeOrder.customer.fullName}</strong>
                          <span className="text-slate-500 block">{activeOrder.customer.email}</span>
                          <span className="text-slate-500 block">{activeOrder.customer.institution}</span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-slate-400 font-semibold block text-[11px]">Waktu &amp; Lokasi:</span>
                          <span className="text-hce-navy font-bold block">{SEMINAR_INFO.date}</span>
                          <span className="text-slate-500 block">{SEMINAR_INFO.time}</span>
                          <span className="text-slate-500 block">{SEMINAR_INFO.venue}</span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-2xl border-2 border-dashed border-hce-teal/20 text-center flex flex-col items-center justify-center">
                          <QrCode className="w-20 h-20 text-hce-navy mb-1" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">TICKET CODE</span>
                          <strong className="text-xs font-mono font-black text-hce-teal">{activeOrder.ticketCode}</strong>
                        </div>
                      </div>

                      <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Paket:</span>
                          <strong>{activeOrder.ticketCategoryName}</strong> ({activeOrder.quantity} Pax)
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Total:</span>
                          <strong className="text-hce-teal">{formatRupiah(activeOrder.totalPrice)}</strong>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-hce-navy hover:bg-hce-navy/90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(activeOrder.ticketCode)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-hce-navy rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode ? "Tersalin" : "Salin"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutStep(1);
                        setFullName("");
                        setEmail("");
                        setPhone("");
                      }}
                      className="px-6 py-3 bg-hce-teal text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Pesan Tiket Tambahan Baru
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: CARI / LOOKUP E-TICKET TERSIMPAN */}
          {activeTab === "lookup" && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-md space-y-4 max-w-2xl mx-auto">
                <form onSubmit={handleLookupTicket} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-hce-teal absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTicketQuery}
                      onChange={(e) => setSearchTicketQuery(e.target.value)}
                      placeholder="Ketik Kode Tiket (SEM-2026-...) atau Email..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-hce-teal rounded-xl text-xs sm:text-sm font-semibold text-hce-navy focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-hce-teal hover:bg-hce-teal/90 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    Cari Tiket
                  </button>
                </form>

                {lookupMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600">
                    {lookupMessage}
                  </div>
                )}
              </div>

              {/* TAMPILAN TIKET HASIL CARI */}
              {lookupTicket && (
                <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden max-w-2xl mx-auto animate-fade-in">
                  <div className="bg-hce-navy text-white px-6 py-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-hce-orange font-bold uppercase tracking-widest">HASIL PENCARIAN TIKET</span>
                      <h4 className="text-base font-black">{lookupTicket.ticketCode}</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {lookupTicket.ticketStatus}
                    </span>
                  </div>

                  <div className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nama Peserta:</span>
                        <strong className="text-sm text-hce-navy block">{lookupTicket.customer.fullName}</strong>
                        <span className="text-slate-500">{lookupTicket.customer.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Kategori &amp; Total:</span>
                        <strong className="text-sm text-hce-teal block">{lookupTicket.ticketCategoryName}</strong>
                        <span>{formatRupiah(lookupTicket.totalPrice)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <QrCode className="w-12 h-12 text-hce-navy shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">LOKASI &amp; WAKTU:</span>
                          <span className="font-bold">{SEMINAR_INFO.venue}</span>
                          <span className="text-slate-500 block">{SEMINAR_INFO.date} ({SEMINAR_INFO.time})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-2 bg-hce-navy text-white rounded-xl font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
