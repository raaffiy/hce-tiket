"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  Upload,
  ImageIcon,
  Trash2,
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
import { QRCodeImage, generateQRCodeDataUrl } from "@/components/ui/QRCodeImage";
import {
  createOrderInSupabase,
  lookupTicketInSupabase,
  fetchTicketsFromSupabase,
  fetchMediaPartnersFromSupabase,
  uploadPaymentProofToSupabase,
} from "@/lib/supabaseServices";
import { MediaPartner } from "@/types/hce";

export default function SinglePageSeminar() {
  // Dynamic Ticket Categories from Supabase (Fallback to seminarData)
  const [categories, setCategories] = useState<TicketCategory[]>(TICKET_CATEGORIES);
  const [partnersList, setPartnersList] = useState<MediaPartner[]>([]);

  useEffect(() => {
    async function loadDynamicData() {
      try {
        const [fetchedTickets, fetchedPartners] = await Promise.all([
          fetchTicketsFromSupabase(),
          fetchMediaPartnersFromSupabase(),
        ]);
        if (fetchedTickets && fetchedTickets.length > 0) {
          // Sync ticket categories
        }
        if (fetchedPartners && fetchedPartners.length > 0) {
          setPartnersList(fetchedPartners.filter((p) => p.status === 'Active'));
        }
      } catch (err) {
        console.warn('Failed to load dynamic data on homepage:', err);
      }
    }
    loadDynamicData();
  }, []);

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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nim, setNim] = useState("");
  const [faculty, setFaculty] = useState<string>(FACULTIES[0]);
  const [studyProgram, setStudyProgram] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string>("qris");
  const [paymentProofFile, setPaymentProofFile] = useState<string | null>(null);
  const [proofFileRaw, setProofFileRaw] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<SeminarOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Lookup / Search Ticket State
  const [searchTicketQuery, setSearchTicketQuery] = useState("");
  const [isSearchingTicket, setIsSearchingTicket] = useState(false);
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
    setShowConfirmModal(false);
    setIsOrderModalOpen(true);
    setIsLookupModalOpen(false);
  };

  // Close Order Modal handler
  const handleCloseOrderModal = () => {
    setShowConfirmModal(false);
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

  // Helper format ticket date time
  const formatTicketDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return '';
    try {
      const d = new Date(dateTimeStr);
      if (isNaN(d.getTime())) return dateTimeStr;
      const dateFormatted = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
      const timeFormatted = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
      return `${dateFormatted} (${timeFormatted} WIB)`;
    } catch {
      return dateTimeStr;
    }
  };

  // Fetch dynamic tickets from Supabase on mount
  useEffect(() => {
    async function loadDynamicTickets() {
      try {
        const dbTickets = await fetchTicketsFromSupabase();
        if (dbTickets && dbTickets.length > 0) {
          const mapped: TicketCategory[] = dbTickets
            .filter((t) => t.visibility === 'PUBLIC' && t.status !== 'Archived')
            .map((t) => {
              const tagText =
                t.badge === 'EARLY'
                  ? 'Paling Hemat'
                  : t.badge === 'NORMAL'
                    ? 'Paling Populer'
                    : t.badge === 'EXTEND'
                      ? 'Akses Eksklusif'
                      : t.badge || 'Official Pass';

              const isEarly = t.badge === 'EARLY' || t.name.toLowerCase().includes('early');
              const isNormal = t.badge === 'NORMAL' || t.name.toLowerCase().includes('presale') || t.name.toLowerCase().includes('regular');
              const badgeColor: 'teal' | 'orange' | 'navy' = isEarly ? 'teal' : isNormal ? 'orange' : 'navy';
              const isPopular = isNormal;
              const isAvailable = t.status === 'Active' && Number(t.remaining) > 0;

              return {
                id: t.id,
                name: t.name,
                description: t.description || '',
                tag: tagText,
                badge: t.badge,
                price: Number(t.price) || 0,
                originalPrice: Number(t.price) > 0 ? Math.round(Number(t.price) * 1.35) : undefined,
                quota: Number(t.quota) || 0,
                sold: Number(t.sold) || 0,
                remaining: Number(t.remaining) !== undefined ? Number(t.remaining) : Number(t.quota) || 0,
                startDate: t.startDate || '',
                endDate: t.endDate || '',
                isPopular,
                isAvailable,
                badgeColor,
                perks: Array.isArray(t.benefits) && t.benefits.length > 0 ? t.benefits : [
                  'Akses Lengkap Seminar (Offline)',
                  'E-Sertifikat Resmi ber-SKP',
                  'E-Booklet Materi Eksklusif Pembicara',
                  'Snack & Coffee Break',
                  'Sesi Tanya Jawab Interaktif'
                ],
              };
            });

          if (mapped.length > 0) {
            setCategories(mapped);
            setSelectedCategory((prev) => mapped.find((m) => m.id === prev.id) || mapped[0]);
          }
        }
      } catch (e) {
        console.warn('Error loading dynamic tickets from Supabase:', e);
      }
    }
    loadDynamicTickets();
  }, []);

  // Quick select category from ticket section & open Order Modal
  const handleSelectCategoryFromPricing = (cat: TicketCategory) => {
    handleOpenOrderModal(cat);
  };

  // Submit step 1: Proceed to upload payment proof step (or directly confirm for Free Tickets)
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
    const isFree = Number(selectedCategory.price) === 0 || selectedCategory.badge === 'FREE';
    const subtotal = isFree ? 0 : Number(selectedCategory.price) || 0;

    const newOrder: SeminarOrder = {
      orderId,
      ticketCode,
      ticketCategoryId: selectedCategory.id,
      ticketCategoryName: selectedCategory.name,
      ticketPrice: subtotal,
      quantity: 1,
      totalPrice: subtotal,
      paymentMethod: isFree ? "Complimentary / Free Pass" : "QRIS Official (Scan QR)",
      paymentStatus: isFree ? "Pembayaran Berhasil" : "Menunggu Pembayaran",
      ticketStatus: isFree ? "Tiket Aktif" : "Tiket Belum Dibayar",
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

    if (isFree) {
      setPaymentProofFile("FREE_PASS");
      setShowConfirmModal(true);
    } else {
      setPaymentProofFile(null);
      setCheckoutStep(2);
    }
  };

  // Upload proof file reader (Local preview, uploads to Supabase Storage on submit)
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 700 * 1024) {
        setErrorMessage("Ukuran file bukti pembayaran maksimal 700KB.");
        return;
      }
      setProofFileRaw(file);
      setPaymentProofFile(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleRemoveProof = () => {
    setPaymentProofFile(null);
    setProofFileRaw(null);
  };

  // Step 2: Open confirmation popup when clicking "Buat Pesanan"
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const isFree = activeOrder.totalPrice === 0 || activeOrder.ticketPrice === 0;
    if (!isFree && !paymentProofFile) {
      setErrorMessage("Wajib mengunggah foto / screenshot bukti transaksi sebelum melanjutkan!");
      return;
    }

    setErrorMessage(null);
    setShowConfirmModal(true);
  };

  // Confirm and proceed to create order & upload proof to Supabase Storage
  const handleConfirmAndSubmitOrder = async () => {
    if (!activeOrder) return;

    const isFree = activeOrder.totalPrice === 0 || activeOrder.ticketPrice === 0;
    if (!isFree && !paymentProofFile) return;

    setShowConfirmModal(false);
    setIsProcessing(true);
    setErrorMessage(null);

    let finalProofUrl = paymentProofFile || (isFree ? "FREE_PASS" : "");

    try {
      // 1. Upload proof file directly to Supabase Storage bucket "payment-proofs" if provided
      if (proofFileRaw && !isFree) {
        try {
          const uploadRes = await uploadPaymentProofToSupabase(proofFileRaw, activeOrder.orderId);
          if (uploadRes.success && uploadRes.url) {
            finalProofUrl = uploadRes.url;
          } else {
            console.warn('Supabase storage upload notice:', uploadRes.error);
          }
        } catch (storageErr) {
          console.warn('Storage upload catch notice:', storageErr);
        }
      }

      const finalizedOrder: SeminarOrder = {
        ...activeOrder,
        paymentProof: finalProofUrl,
        paymentStatus: isFree ? "Pembayaran Berhasil" : "Menunggu Konfirmasi Admin",
        ticketStatus: isFree ? "Tiket Aktif" : "Menunggu Konfirmasi",
      };

      // 2. Save order to Supabase database (transactions & participants table)
      const res = await createOrderInSupabase({
        orderId: finalizedOrder.orderId,
        ticketId: finalizedOrder.ticketCategoryId,
        ticketName: finalizedOrder.ticketCategoryName,
        ticketType: isFree ? "FREE" : "PAID",
        ticketPrice: finalizedOrder.ticketPrice,
        quantity: finalizedOrder.quantity,
        totalPrice: finalizedOrder.totalPrice,
        paymentMethod: finalizedOrder.paymentMethod,
        paymentProof: finalizedOrder.paymentProof,
        customer: finalizedOrder.customer,
      });

      if (!res.success) {
        console.warn('Supabase createOrder notice:', res.error);
      }

      // 3. Local storage persistence (Offline cache recovery)
      saveNewOrder(finalizedOrder);
      setActiveOrder(finalizedOrder);

      // 4. Transition to Success E-Ticket Step (Data is 100% saved)
      setCheckoutStep(3);
    } catch (err: any) {
      console.error('Error saving order to database:', err);
      // Fallback: save locally and notify user safely without losing entered form data
      const fallbackOrder: SeminarOrder = {
        ...activeOrder,
        paymentProof: finalProofUrl,
        paymentStatus: isFree ? "Pembayaran Berhasil" : "Menunggu Konfirmasi Admin",
        ticketStatus: isFree ? "Tiket Aktif" : "Menunggu Konfirmasi",
      };
      saveNewOrder(fallbackOrder);
      setActiveOrder(fallbackOrder);
      setCheckoutStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy ticket code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Dedicated Print E-Ticket PDF Helper
  const handlePrintTicket = async (ticket: SeminarOrder) => {
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      window.print();
      return;
    }

    const qrDataUrl = await generateQRCodeDataUrl(ticket.ticketCode || ticket.orderId, 250);

    const isPaid = ticket.paymentStatus === "Pembayaran Berhasil" || ticket.paymentStatus === "Paid";
    const statusBg = isPaid ? "#dcfce7" : "#e0f2fe";
    const statusColor = isPaid ? "#166534" : "#0369a1";
    const statusBorder = isPaid ? "#86efac" : "#7dd3fc";

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>E-Ticket_${ticket.ticketCode}_${ticket.customer.fullName.replace(/\\s+/g, '_')}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #f8fafc;
            color: #102a43;
            padding: 30px 20px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          .ticket-card {
            max-width: 680px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            border: 2px solid #cbd5e1;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          }
          .header {
            background-color: #102a43;
            color: #ffffff;
            padding: 24px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 4px solid #e05a1f;
          }
          .logo-group {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-icon {
            width: 44px;
            height: 44px;
            background: #ffffff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            color: #102a43;
            font-size: 15px;
            letter-spacing: 0.5px;
          }
          .title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 26px;
            letter-spacing: 1.5px;
            line-height: 1;
          }
          .subtitle {
            font-size: 10px;
            color: #e05a1f;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .status {
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${statusBg};
            color: ${statusColor};
            border: 1.5px solid ${statusBorder};
          }
          .body {
            padding: 26px 28px;
          }
          .event-banner {
            background: #fff8f0;
            border: 1.5px dashed #f97316;
            border-radius: 16px;
            padding: 16px 20px;
            margin-bottom: 22px;
          }
          .event-theme {
            font-size: 15px;
            font-weight: 800;
            color: #102a43;
            line-height: 1.35;
          }
          .speaker-line {
            font-size: 12px;
            color: #475569;
            margin-top: 5px;
          }
          .speaker-line strong {
            color: #102a43;
          }
          .grid-details {
            display: grid;
            grid-template-columns: 1.25fr 1.15fr 0.9fr;
            gap: 18px;
            padding-bottom: 20px;
            border-bottom: 2px dashed #e2e8f0;
          }
          .section-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            font-weight: 800;
            margin-bottom: 6px;
          }
          .info-val {
            font-size: 13px;
            font-weight: 800;
            color: #102a43;
            line-height: 1.4;
          }
          .info-sub {
            font-size: 11.5px;
            color: #64748b;
            line-height: 1.4;
          }
          .qr-box {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 12px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .qr-svg {
            width: 58px;
            height: 58px;
            color: #102a43;
            margin-bottom: 6px;
          }
          .code-label {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
          }
          .code-val {
            font-family: monospace;
            font-weight: 900;
            color: #1a5e61;
            font-size: 13px;
          }
          .order-sub {
            font-size: 9.5px;
            color: #94a3b8;
            margin-top: 2px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 0;
            border-bottom: 2px dashed #e2e8f0;
          }
          .total-amount {
            font-size: 18px;
            font-weight: 900;
            color: #e05a1f;
            font-family: monospace;
          }
          .rules-box {
            margin-top: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 14px 18px;
            font-size: 11px;
            color: #475569;
            line-height: 1.5;
          }
          .rules-box strong {
            color: #102a43;
            display: block;
            margin-bottom: 4px;
            font-size: 11.5px;
          }
          .rules-box ol {
            margin-left: 16px;
          }
          .footer {
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 12px 28px;
            text-align: center;
            font-size: 10.5px;
            color: #94a3b8;
            font-weight: 600;
          }
          @media print {
            body { padding: 0; background: #ffffff; }
            .ticket-card { box-shadow: none; border: 2px solid #102a43; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-card">
          <div class="header">
            <div class="logo-group">
              <div class="logo-icon">HCE</div>
              <div>
                <div class="subtitle">OFFICIAL SEMINAR PASS</div>
                <div class="title">HIPMI COLLAB EXPO 2026</div>
              </div>
            </div>
            <div class="status">
              ${ticket.paymentStatus || 'Menunggu Konfirmasi Admin'}
            </div>
          </div>

          <div class="body">
            <div class="event-banner">
              <div class="event-theme">&ldquo;${SEMINAR_INFO.theme}&rdquo;</div>
              <div class="speaker-line">Keynote Speaker: <strong>${SPEAKER_INFO.name}</strong> &bull; ${SPEAKER_INFO.title}</div>
            </div>

            <div class="grid-details">
              <div>
                <div class="section-title">Data Peserta</div>
                <div class="info-val">${ticket.customer.fullName}</div>
                <div class="info-sub">NIM: <strong>${ticket.customer.nim}</strong></div>
                <div class="info-sub">${ticket.customer.studyProgram}</div>
                <div class="info-sub">${ticket.customer.faculty}</div>
                <div class="info-sub">${ticket.customer.email}</div>
                <div class="info-sub">WA: ${ticket.customer.phone}</div>
              </div>

              <div>
                <div class="section-title">Waktu &amp; Lokasi</div>
                <div class="info-val">${SEMINAR_INFO.date}</div>
                <div class="info-sub">Pukul: <strong>${SEMINAR_INFO.time}</strong></div>
                <div class="info-val" style="margin-top: 4px; font-size: 12px;">${SEMINAR_INFO.venue}</div>
                <div class="info-sub">${SEMINAR_INFO.organizer}</div>
              </div>

              <div class="qr-box">
                <img src="${qrDataUrl}" alt="QR Check-In" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 6px; border-radius: 6px;" />
                <div class="code-label">QR CHECK-IN</div>
                <div class="code-val">${ticket.ticketCode}</div>
                <div class="order-sub">Order: ${ticket.orderId}</div>
              </div>
            </div>

            <div class="summary-row">
              <div>
                <div class="section-title">Paket Seminar</div>
                <div style="font-size: 14px; font-weight: 800; color: #102a43;">${ticket.quantity}x Tiket (${ticket.ticketCategoryName})</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Total Pembayaran</div>
                <div class="total-amount">${formatRupiah(ticket.totalPrice)}</div>
              </div>
            </div>

            <div class="rules-box">
              <strong>Ketentuan &amp; Informasi Check-In:</strong>
              <ol>
                <li>Tunjukkan dokumen E-Ticket resmi ini (cetak atau digital) beserta identitas diri saat registrasi ulang.</li>
                <li>QR Code Check-in hanya berlaku untuk 1 kali pemindaian masuk gate seminar.</li>
                <li>Pintu masuk seminar dibuka 45 menit sebelum acara dimulai. Harap hadir tepat waktu.</li>
                <li>Bila ada kendala verifikasi, silakan hubungi Customer Service Panitia HCE 2026.</li>
              </ol>
            </div>
          </div>

          <div class="footer">
            &copy; 2026 HIPMI PT Telkom University &bull; Himpunan Pengusaha Muda Indonesia &bull; Dokumen Resmi Elektronik
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Lookup ticket helper (Query Supabase first)
  const handleLookupTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupMessage(null);

    const cleanQuery = searchTicketQuery.trim();
    if (!cleanQuery) {
      setLookupTicket(null);
      return;
    }

    setIsSearchingTicket(true);
    try {
      // 1. Search in Supabase (NIM, Order ID, Email, Name)
      const dbMatch = await lookupTicketInSupabase(cleanQuery);
      if (dbMatch) {
        setLookupTicket(dbMatch);
        setIsSearchingTicket(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase lookup warning:', err);
    }

    // 2. Fallback to local storage
    const match = findOrderByCode(cleanQuery);
    if (match) {
      setLookupTicket(match);
    } else {
      setLookupTicket(null);
      setLookupMessage(`Tiket dengan NIM / Kode / Email "${cleanQuery}" tidak ditemukan dalam database.`);
    }
    setIsSearchingTicket(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-hce-cream text-hce-navy font-sans selection:bg-hce-teal/20 selection:text-hce-teal overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">

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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
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
              {categories.map((cat) => {
                const isSoldOut = !cat.isAvailable || (cat.remaining !== undefined && cat.remaining <= 0);
                const hasStartDate = Boolean(cat.startDate);
                const hasEndDate = Boolean(cat.endDate);

                return (
                  <div
                    key={cat.id}
                    className={`rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative border-2 ${cat.isPopular
                      ? "bg-white border-hce-orange shadow-2xl scale-105 z-10"
                      : "bg-slate-50/70 border-slate-200 shadow-lg hover:shadow-xl hover:border-hce-teal/30 hover:bg-white"
                      } ${isSoldOut ? "opacity-90" : ""}`}
                  >
                    {/* 1. Badge Tiket */}
                    {cat.badge && (
                      <span
                        className={`absolute -top-3.5 right-6 px-4 py-1 rounded-full text-[11px] font-black uppercase text-white shadow-md tracking-wider ${cat.badge === "orange"
                          ? "bg-hce-orange"
                          : cat.badge === "teal"
                            ? "bg-hce-teal"
                            : "bg-hce-navy"
                          }`}
                      >
                        {cat.badge}
                      </span>
                    )}

                    <div className="space-y-5">
                      {/* 2. Name Tiket, Deskripsi & Harga */}
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          {isSoldOut && (
                            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              Habis
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-extrabold text-hce-navy">{cat.name}</h3>

                        {/* Deskripsi Tiket */}
                        {cat.description ? (
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            {cat.description}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-2 leading-relaxed italic">
                            Akses tiket resmi seminar HIPMI Collab Expo 2026.
                          </p>
                        )}

                        {/* Harga Tiket */}
                        <div className="flex items-baseline space-x-2 mt-3.5 pt-3 border-t border-slate-100">
                          <span
                            className="text-3xl sm:text-4xl font-black text-hce-teal"
                            style={{ fontFamily: "var(--font-bebas-neue)" }}
                          >
                            {cat.price === 0 ? "Gratis" : formatRupiah(cat.price)}
                          </span>
                          {cat.originalPrice && (
                            <span className="text-xs line-through text-slate-400 font-semibold">
                              {formatRupiah(cat.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3. Quota Tiket & Sisa Kuota */}
                      {/* <div className="bg-slate-100/90 rounded-2xl p-3 border border-slate-200/70 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Users className="w-3.5 h-3.5 text-hce-teal" />
                            <span>Ketersediaan Tiket:</span>
                          </span>
                          <span className={isSoldOut ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                            {isSoldOut ? "Sold Out" : `Sisa ${cat.remaining} Kursi`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isSoldOut
                                ? "bg-rose-500"
                                : cat.remaining <= 15
                                  ? "bg-amber-500"
                                  : "bg-hce-teal"
                              }`}
                            style={{
                              width: `${cat.quota > 0
                                  ? Math.min(
                                    100,
                                    Math.max(
                                      5,
                                      Math.round(
                                        ((cat.quota - (cat.remaining ?? 0)) / cat.quota) * 100
                                      )
                                    )
                                  )
                                  : 100
                                }%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Total Kuota: <strong>{cat.quota}</strong></span>
                          <span>Terjual: <strong>{cat.sold ?? Math.max(0, cat.quota - cat.remaining)}</strong></span>
                        </div>
                      </div> */}

                      {/* 4. Start Date & Time (dan Periode Penjualan) */}
                      {/* {(hasStartDate || hasEndDate) && (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Periode Penjualan Tiket:</span>
                          </div>
                          {hasStartDate && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-800">
                              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>Mulai: <strong>{formatTicketDateTime(cat.startDate)}</strong></span>
                            </div>
                          )}
                          {hasEndDate && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-800">
                              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>Selesai: <strong>{formatTicketDateTime(cat.endDate)}</strong></span>
                            </div>
                          )}
                        </div>
                      )} */}

                      {/* 5. Fasilitas & Benefit Tiket */}
                      <div className="border-t border-slate-100 pt-4 space-y-2.5">
                        <span className="text-xs font-bold text-hce-navy/80 uppercase tracking-wider block">
                          Fasilitas &amp; Benefit Tiket ({cat.perks.length}):
                        </span>
                        {cat.perks && cat.perks.length > 0 ? (
                          <ul className="space-y-2 text-xs">
                            {cat.perks.map((perk, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="text-hce-navy/80 font-medium leading-relaxed">{perk}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Benefit tiket akan diumumkan oleh panitia.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 6. Tombol Aksi */}
                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => handleSelectCategoryFromPricing(cat)}
                        className={`w-full py-4 rounded-2xl text-center text-sm font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 ${isSoldOut
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                          : cat.isPopular
                            ? "bg-hce-orange hover:bg-hce-orange/90 text-white shadow-hce-orange/25 hover:scale-105 cursor-pointer"
                            : "bg-hce-teal hover:bg-hce-teal/90 text-white shadow-hce-teal/20 hover:scale-105 cursor-pointer"
                          }`}
                        style={{ fontFamily: "var(--font-bebas-neue)" }}
                      >
                        <Ticket className="w-4 h-4" />
                        <span>{isSoldOut ? "Tiket Habis (Sold Out)" : "Pilih & Beli Tiket Ini"}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
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

            {/* Media Partners Centered Dynamic Cards */}
            {partnersList.length === 0 ? (
              <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/60 backdrop-blur-xs border border-hce-teal/15 text-center text-xs text-slate-500 shadow-xs">
                Mitra publikasi dan media partner resmi akan segera diperbarui.
              </div>
            ) : (
              <div className="flex flex-wrap justify-center items-stretch gap-4 sm:gap-6 max-w-5xl mx-auto">
                {partnersList.map((mp, index) => (
                  <div
                    key={mp.id || index}
                    className="w-[160px] sm:w-[200px] md:w-[220px] bg-white rounded-2xl border border-slate-200/80 hover:border-hce-teal/40 p-4 sm:p-5 flex flex-col items-center justify-between shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <div className="h-24 sm:h-28 w-full flex items-center justify-center p-2 rounded-xl bg-[#F8F1E5]/40 group-hover:bg-[#F8F1E5]/80 transition-colors">
                      <img
                        src={mp.logo}
                        alt={mp.name}
                        className="max-h-20 max-w-[130px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-108"
                      />
                    </div>
                    <div className="mt-3 text-center w-full">
                      <h4 className="text-xs sm:text-sm font-bold text-hce-navy group-hover:text-hce-teal transition-colors line-clamp-2 leading-snug">
                        {mp.name}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
            <div className="bg-hce-cream border-2 border-slate-300 rounded-3xl p-5 sm:p-8 max-w-3xl lg:max-w-4xl w-full my-auto shadow-2xl relative z-10 max-h-[92vh] overflow-y-auto">

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
                    <div className="bg-[#FFFDE7] p-5 sm:p-6 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base sm:text-lg font-black text-hce-navy uppercase tracking-wider" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                          1. Pilih Kategori &amp; Jumlah Tiket
                        </h4>
                        <span className="text-[11px] text-hce-teal font-bold bg-white px-2.5 py-0.5 rounded-md border border-hce-teal/20">
                          {selectedCategory.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {categories.map((cat) => {
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
                                <span className="text-[10px] text-slate-400 block mt-0.5">/ tiket</span>
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
                          2. Data Identitas Pemesan
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

                    {/* Submit Button Bar */}
                    <div className="p-5 rounded-2xl bg-hce-navy text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-300 font-medium block">
                          Total Pembayaran:
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-hce-orange" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                          {selectedCategory.price === 0 ? "Rp 0 (GRATIS)" : formatRupiah(selectedCategory.price)}
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-7 py-3.5 bg-hce-orange hover:bg-hce-orange/90 text-white rounded-xl text-base font-black uppercase tracking-wider shadow-lg shadow-hce-orange/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        style={{ fontFamily: "var(--font-bebas-neue)" }}
                      >
                        <span>{selectedCategory.price === 0 ? "Konfirmasi & Ambil Tiket" : "Berikutnya: Pembayaran"}</span>
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

                {/* STEP 2: TAMPILKAN QRIS & UPLOAD BUKTI TRANSACTION (SIDE-BY-SIDE) */}
                {checkoutStep === 2 && activeOrder && (
                  <form onSubmit={handleOpenConfirmModal} className="bg-white p-5 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest">Order ID Dibuat</span>
                        <h4 className="text-base font-extrabold text-hce-navy">{activeOrder.orderId}</h4>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-500 font-medium block">Total Pembayaran</span>
                        <span className="text-xl font-black text-hce-orange">{formatRupiah(activeOrder.totalPrice)}</span>
                      </div>
                    </div>

                    {/* Grid 2 Kolom: QRIS di samping Upload Bukti (Tinggi & Tata Letak Seimbang) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                      {/* Kolom Kiri: QRIS Resmi */}
                      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-hce-teal/40 flex flex-col justify-between text-center space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-hce-teal bg-hce-teal/10 px-3 py-1 rounded-full inline-block">
                            Scan QRIS untuk Pembayaran
                          </span>
                          <h5 className="text-xs font-black text-hce-navy">
                            Total: <span className="text-hce-orange font-mono text-sm">{formatRupiah(activeOrder.totalPrice)}</span>
                          </h5>
                        </div>

                        {/* QRIS Image Container */}
                        <div className="w-44 h-44 sm:w-52 sm:h-52 mx-auto bg-white p-2.5 rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center relative">
                          <Image
                            src="/scanqr.jpeg"
                            alt="QRIS HCE 2026"
                            width={208}
                            height={208}
                            priority
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <p className="font-semibold text-hce-navy">
                            BCA, Mandiri, BRI, BNI &amp; E-Wallet
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Pindai QR lalu unggah screenshot bukti pembayaran di samping.
                          </p>
                        </div>
                      </div>

                      {/* Kolom Kanan: Upload Box Bukti Transaksi */}
                      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-hce-teal/40 flex flex-col justify-between text-center space-y-3">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-hce-teal bg-hce-teal/10 px-3 py-1 rounded-full inline-flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Unggah Bukti Transaksi</span>
                          </span>
                        </div>

                        {paymentProofFile ? (
                          <div className="flex-1 flex flex-col items-center justify-center space-y-2 my-auto">
                            <div className="w-44 h-44 sm:w-52 sm:h-52 mx-auto bg-white p-2.5 rounded-2xl border-2 border-emerald-400 shadow-md flex items-center justify-center relative overflow-hidden group">
                              <img
                                src={paymentProofFile}
                                alt="Bukti Transfer Uploaded"
                                className="w-full h-full object-contain p-2"
                              />
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100/90 text-emerald-800 rounded-full text-[11px] font-bold border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Bukti Siap Diunggah</span>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                              <label className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold cursor-pointer transition-all shadow-2xs">
                                Ganti Foto
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProofFileChange}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={handleRemoveProof}
                                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Hapus
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col justify-center my-auto">
                            <label className="w-44 h-44 sm:w-52 sm:h-52 mx-auto bg-white hover:bg-slate-50/80 rounded-2xl border-2 border-dashed border-slate-300 hover:border-hce-teal flex flex-col items-center justify-center p-3 cursor-pointer transition-all shadow-xs group">
                              <div className="w-10 h-10 rounded-full bg-hce-teal/10 text-hce-teal flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-hce-navy text-center leading-tight">
                                Klik untuk upload bukti transfer
                              </span>
                              <span className="text-[10px] text-slate-400 mt-1">
                                JPG, PNG, WEBP (Maks 700KB)
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProofFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <p className="font-semibold text-hce-navy">
                            Verifikasi Otomatis &amp; Akurat
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Pastikan nominal transfer &amp; bukti transaksi terbaca jelas.
                          </p>
                        </div>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Tombol Kiri (Ubah Data Peserta) dan Kanan (Buat Pesanan) */}
                    <div className="flex flex-row items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setCheckoutStep(1)}
                        className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        &larr; <span>Ubah Data Peserta</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base sm:text-lg font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        style={{ fontFamily: "var(--font-bebas-neue)" }}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Memproses...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Buat Pesanan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: E-TICKET TERBIT & STATUS VERIFIKASI */}
                {checkoutStep === 3 && activeOrder && (
                  <div className="space-y-5 animate-fade-in">

                    {/* Dynamic Status Alert Banner */}
                    {activeOrder.paymentStatus === "Pembayaran Berhasil" || activeOrder.paymentStatus === "Paid" ? (
                      <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl text-center space-y-1">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                        <h4 className="text-sm font-bold text-emerald-900">Pembayaran Berhasil! Tiket Anda Telah Aktif</h4>
                        <p className="text-xs text-emerald-700">Tunjukkan QR Code di bawah saat check-in registrasi ulang di venue Telkom University.</p>
                      </div>
                    ) : activeOrder.paymentStatus === "Pembayaran Tidak Berhasil" || activeOrder.paymentStatus === "Failed" ? (
                      <div className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl text-center space-y-1">
                        <AlertCircle className="w-7 h-7 text-rose-600 mx-auto" />
                        <h4 className="text-sm font-bold text-rose-900">Pembayaran Tidak Berhasil / Ditolak</h4>
                        <p className="text-xs text-rose-700">Bukti pembayaran tidak valid. Tiket tidak dapat digunakan untuk check-in. Silakan hubungi admin.</p>
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-blue-400/80 p-4 sm:p-5 rounded-2xl text-center space-y-2 shadow-md">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto border border-blue-200 shadow-2xs">
                          <Clock className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-blue-100/80 text-blue-900 rounded-full text-xs font-black border border-blue-300 mb-1.5">
                            <span>Status: Menunggu Konfirmasi Admin</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-hce-navy">
                            Bukti Transaksi Sedang Diverifikasi
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
                            Bukti transaksi berhasil di-upload dan sedang dalam antrean verifikasi Admin. QR Code &amp; Order ID akan otomatis aktif setelah admin menyetujui pembayaran.
                          </p>
                        </div>
                      </div>
                    )}

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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${activeOrder.paymentStatus === "Pembayaran Berhasil" || activeOrder.paymentStatus === "Paid"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                          : activeOrder.paymentStatus === "Pembayaran Tidak Berhasil" || activeOrder.paymentStatus === "Failed"
                            ? "bg-rose-500/20 text-rose-300 border-rose-400/30"
                            : "bg-blue-500/30 text-blue-200 border-blue-400/40"
                          }`}>
                          {activeOrder.paymentStatus === "Pembayaran Berhasil" || activeOrder.paymentStatus === "Paid"
                            ? "Pembayaran Berhasil"
                            : activeOrder.paymentStatus === "Pembayaran Tidak Berhasil" || activeOrder.paymentStatus === "Failed"
                              ? "Pembayaran Tidak Berhasil"
                              : "Menunggu Konfirmasi Admin"}
                        </span>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest block">Seminar</span>
                            <h4 className="text-base sm:text-lg font-black text-hce-navy">&ldquo;{SEMINAR_INFO.theme}&rdquo;</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Keynote Speaker: <strong>{SPEAKER_INFO.name}</strong></p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Order ID</span>
                            <span className="text-xs font-bold font-mono text-hce-navy">{activeOrder.orderId}</span>
                          </div>
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
                            <QRCodeImage value={activeOrder.ticketCode || activeOrder.orderId} size={80} className="mb-1 bg-white p-1 shadow-xs border border-slate-200" />
                            <span className="text-[9px] text-slate-400 font-bold uppercase">QR Code Check-In</span>
                            <strong className="text-xs font-mono font-black text-hce-teal">{activeOrder.ticketCode}</strong>
                            <span className="text-[9px] text-slate-400 mt-0.5">Gunakan saat check-in gate</span>
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
                              href="https://chat.whatsapp.com/CNdyfvfrIE41LUfOmtKXZA?s=cl&p=a&ilr=4&iam=0"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Join Group</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handlePrintTicket(activeOrder)}
                              className="px-3 py-1.5 bg-hce-navy hover:bg-hce-navy/90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Cetak PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* CONFIRMATION POPUP MODAL */}
            {showConfirmModal && activeOrder && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 space-y-4 animate-scale-in">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border-2 border-amber-200 shadow-inner">
                      <HelpCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-hce-navy uppercase tracking-wide" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                      Konfirmasi Pemesanan
                    </h3>
                    <p className="text-sm font-bold text-slate-800">
                      Apakah data yang dimasukkan sudah sesuai semua?
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Nama Pemesan:</span>
                      <span className="font-bold text-hce-navy truncate max-w-[200px]">{activeOrder.customer.fullName}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Paket Tiket:</span>
                      <span className="font-bold text-hce-navy">{activeOrder.ticketCategoryName}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>NIM / Prodi:</span>
                      <span className="font-semibold text-slate-700">{activeOrder.customer.nim} / {activeOrder.customer.studyProgram}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-200">
                      <span>Total Nominal:</span>
                      <span className="font-black text-sm text-hce-orange font-mono">{formatRupiah(activeOrder.totalPrice)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Cek Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAndSubmitOrder}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-center"
                      style={{ fontFamily: "var(--font-bebas-neue)" }}
                    >
                      Ya, Sudah Sesuai
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    Masukkan <strong>NIM (Nomor Induk Mahasiswa)</strong>- untuk menemukan dan mencetak E-Ticket Anda.
                  </p>

                  <form onSubmit={handleLookupTicket} className="flex gap-2 pt-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-hce-teal absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTicketQuery}
                        onChange={(e) => setSearchTicketQuery(e.target.value)}
                        placeholder="Ketik NIM (contoh: 1201220001), Kode Tiket, Order ID, atau Email..."
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-hce-teal rounded-xl text-xs font-semibold text-hce-navy focus:outline-none focus:bg-white transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingTicket}
                      className="px-5 py-2.5 bg-hce-teal hover:bg-hce-teal/90 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105 flex items-center gap-1.5"
                    >
                      {isSearchingTicket ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mencari...</span>
                        </>
                      ) : (
                        <span>Cari Tiket</span>
                      )}
                    </button>
                  </form>

                  {lookupMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{lookupMessage}</span>
                    </div>
                  )}
                </div>

                {/* TAMPILAN TIKET HASIL CARI */}
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${lookupTicket.paymentStatus === "Pembayaran Berhasil" || lookupTicket.paymentStatus === "Paid"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                        : lookupTicket.paymentStatus === "Pembayaran Tidak Berhasil" || lookupTicket.paymentStatus === "Failed"
                          ? "bg-rose-500/20 text-rose-300 border-rose-400/30"
                          : "bg-blue-500/30 text-blue-200 border-blue-400/40"
                        }`}>
                        {lookupTicket.paymentStatus === "Pembayaran Berhasil" || lookupTicket.paymentStatus === "Paid"
                          ? "Pembayaran Berhasil"
                          : lookupTicket.paymentStatus === "Pembayaran Tidak Berhasil" || lookupTicket.paymentStatus === "Failed"
                            ? "Pembayaran Tidak Berhasil"
                            : "Menunggu Konfirmasi Admin"}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Status Info in Card */}
                      <div className={`p-3 rounded-xl border text-xs font-medium ${lookupTicket.paymentStatus === "Pembayaran Berhasil" || lookupTicket.paymentStatus === "Paid"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : lookupTicket.paymentStatus === "Pembayaran Tidak Berhasil" || lookupTicket.paymentStatus === "Failed"
                          ? "bg-rose-50 border-rose-200 text-rose-800"
                          : "bg-blue-50 border-blue-200 text-blue-900"
                        }`}>
                        {lookupTicket.paymentStatus === "Pembayaran Berhasil" || lookupTicket.paymentStatus === "Paid" ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Status: <strong>Pembayaran Berhasil (Terverifikasi)</strong>. Tiket aktif &amp; siap check-in.</span>
                          </div>
                        ) : lookupTicket.paymentStatus === "Pembayaran Tidak Berhasil" || lookupTicket.paymentStatus === "Failed" ? (
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Status: <strong>Pembayaran Tidak Berhasil</strong>. Bukti transfer ditolak admin.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
                            <span>Status: <strong className="text-blue-900">Menunggu Konfirmasi Admin</strong>. Bukti sedang diverifikasi oleh panitia.</span>
                          </div>
                        )}
                      </div>

                      <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-hce-teal uppercase tracking-widest block">Seminar</span>
                          <h4 className="text-base sm:text-lg font-black text-hce-navy">&ldquo;{SEMINAR_INFO.theme}&rdquo;</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Keynote Speaker: <strong>{SPEAKER_INFO.name}</strong></p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Order ID</span>
                          <span className="text-xs font-bold font-mono text-hce-navy">{lookupTicket.orderId}</span>
                        </div>
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
                          <QRCodeImage value={lookupTicket.ticketCode || lookupTicket.orderId} size={80} className="mb-1 bg-white p-1 shadow-xs border border-slate-200" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase">QR Code Check-In</span>
                          <strong className="text-xs font-mono font-black text-hce-teal">{lookupTicket.ticketCode}</strong>
                          <span className="text-[9px] text-slate-400 mt-0.5">Gunakan saat check-in gate</span>
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
                            href="https://chat.whatsapp.com/CNdyfvfrIE41LUfOmtKXZA?s=cl&p=a&ilr=4&iam=0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Join Group</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handlePrintTicket(lookupTicket)}
                            className="px-3 py-1.5 bg-hce-navy hover:bg-hce-navy/90 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak PDF</span>
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

      </main>
      <Footer />
    </div>
  );
}
