"use client";

import Image from "next/image";
import { MapPin, Phone, MessageSquare, ArrowUpRight, Ticket, Calendar, Search } from "lucide-react";
import { SEMINAR_INFO } from "@/utils/seminarData";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const scrollToSection = (id: string) => {
    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-white border-t border-hce-teal/10 pt-16 pb-12 overflow-hidden print:hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] glow-dot-teal -z-10 opacity-15 pointer-events-none" />
      <div className="absolute top-0 left-10 w-[300px] h-[300px] glow-dot-orange -z-10 opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Logo & Description */}
          <div className="space-y-4">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("hero");
              }}
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative">
                <Image
                  src="/HCE LOGO.png"
                  alt="HCE Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-hce-navy text-2xl tracking-wider leading-none font-bold"
                  style={{ fontFamily: "var(--font-fredoka)" }}
                >
                  HCE <span className="text-hce-orange">2026</span>
                </span>
                <span
                  className="text-[10px] text-hce-teal tracking-widest uppercase mt-0.5 font-semibold"
                  style={{ fontFamily: "var(--font-fredoka)" }}
                >
                  SEMINAR
                </span>
              </div>
            </a>
            <p className="text-xs sm:text-sm text-hce-navy/70 leading-relaxed font-medium">
              Seminar HCE 2026: <em>&ldquo;From Potential to Impact: Building Yourself Before Building a Business&rdquo;</em> bersama Sadam Permana.
            </p>

            {/* Social Icons */}
            <div className="flex space-x-2.5 pt-1">
              <a
                href={`https://instagram.com/${SEMINAR_INFO.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-hce-cream border border-hce-teal/15 flex items-center justify-center text-hce-navy/60 hover:text-hce-teal hover:bg-hce-teal/10 hover:border-hce-teal/30 transition-all"
                aria-label="Instagram HIPMI Collab Expo"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${SEMINAR_INFO.contactWhatsApp}?text=Halo%20Admin%20HCE%202026,%20saya%20ingin%20bertanya%20tentang%20tiket%20Seminar...`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-hce-cream border border-hce-teal/15 flex items-center justify-center text-hce-navy/60 hover:text-green-600 hover:bg-green-50 hover:border-green-200 transition-all"
                aria-label="WhatsApp Admin Ticketing"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-hce-navy uppercase tracking-widest mb-4">Navigasi Halaman</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("hero");
                  }}
                  className="text-xs sm:text-sm text-hce-navy/70 hover:text-hce-teal transition-colors flex items-center font-medium cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-hce-teal/40 mr-2" />
                  Beranda Utama
                </a>
              </li>
              <li>
                <a
                  href="#tentang"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("tentang");
                  }}
                  className="text-xs sm:text-sm text-hce-navy/70 hover:text-hce-teal transition-colors flex items-center font-medium cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-hce-teal/40 mr-2" />
                  Tentang Seminar
                </a>
              </li>
              <li>
                <a
                  href="#pembicara"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("pembicara");
                  }}
                  className="text-xs sm:text-sm text-hce-navy/70 hover:text-hce-teal transition-colors flex items-center font-medium cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-hce-teal/40 mr-2" />
                  Profil Sadam Permana
                </a>
              </li>
              <li>
                <a
                  href="#informasi"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("informasi");
                  }}
                  className="text-xs sm:text-sm text-hce-navy/70 hover:text-hce-teal transition-colors flex items-center font-medium cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-hce-teal/40 mr-2" />
                  Rundown &amp; Fasilitas
                </a>
              </li>
              <li>
                <a
                  href="#tiket"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("tiket");
                  }}
                  className="text-xs sm:text-sm text-hce-navy/70 hover:text-hce-teal transition-colors flex items-center font-medium cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-hce-teal/40 mr-2" />
                  Kategori Tiket
                </a>
              </li>
            </ul>
          </div>

          {/* Ticketing Links */}
          <div>
            <h3 className="text-xs font-bold text-hce-navy uppercase tracking-widest mb-4">Pemesanan Tiket</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-checkout-modal", { detail: { tab: "order" } }));
                    }
                  }}
                  className="text-xs sm:text-sm text-hce-orange hover:text-hce-orange/80 transition-colors flex items-center font-bold cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5 mr-2 text-hce-orange" />
                  Formulir Beli Tiket
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-checkout-modal", { detail: { tab: "lookup" } }));
                    }
                  }}
                  className="text-xs sm:text-sm text-hce-navy/70 hover:text-hce-teal transition-colors flex items-center font-medium cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 mr-2 text-hce-teal" />
                  Cari / Cetak E-Ticket
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Venue Details */}
          <div>
            <h3 className="text-xs font-bold text-hce-navy uppercase tracking-widest mb-4">Waktu &amp; Lokasi</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2.5 text-xs sm:text-sm text-hce-navy/70 font-medium">
                <Calendar className="w-4 h-4 text-hce-teal shrink-0 mt-0.5" />
                <span>{SEMINAR_INFO.date} ({SEMINAR_INFO.time})</span>
              </li>
              <li className="flex items-start space-x-2.5 text-xs sm:text-sm text-hce-navy/70 font-medium">
                <MapPin className="w-4 h-4 text-hce-teal shrink-0 mt-0.5" />
                <span className="leading-relaxed">{SEMINAR_INFO.venue}</span>
              </li>
              <li className="flex items-center space-x-2.5 text-xs sm:text-sm text-hce-navy/70 font-medium">
                <Phone className="w-4 h-4 text-hce-teal shrink-0" />
                <span>+62 857-9739-7454 ({SEMINAR_INFO.contactPerson})</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-hce-teal/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-hce-navy/50 font-semibold">
            &copy; 2026 Hipmi Collab Expo 2026 - Nabil & Rafi
          </p>
          <p className="text-xs text-hce-navy/40 font-medium">
            Seminar HCE: From Potential to Impact &bull; Keynote Speaker: Sadam Permana
          </p>
        </div>
      </div>
    </footer>
  );
}