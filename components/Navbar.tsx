"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, LogIn, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle scroll listener to change navbar background & detect active section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      const sections = ["hero", "tentang", "pembicara", "tiket"];
      const scrollPos = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Tentang Seminar", href: "#tentang", id: "tentang" },
    { name: "Pembicara", href: "#pembicara", id: "pembicara" },
    { name: "Tiket & Sponsor", href: "#tiket", id: "tiket" },
  ];

  const scrollToSection = (href: string) => {
    setIsOpen(false);
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Silakan isi email dan password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLoginModalOpen(false);
      router.push("/admin/dashboard");
    }, 600);
  };

  const handleDemoFill = () => {
    setEmail("superadmin@hce-event.id");
    setPassword("admin12345");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-[#FFF6E9]/95 backdrop-blur-md border-b border-[#1A5E61]/10 shadow-sm"
            : "py-4 sm:py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo Brand (Scroll to top) */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#hero");
              }}
              className="flex items-center space-x-2.5 group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative">
                <Image
                  src="/HCE LOGO.png"
                  alt="HCE Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain drop-shadow-sm"
                  priority
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

            {/* Desktop Navigation Links & Login Button */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex space-x-1 bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 border border-hce-teal/10 shadow-xs">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className={`relative px-5 py-2 text-xs xl:text-sm font-bold tracking-wide rounded-xl transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "text-white"
                          : "text-hce-navy/75 hover:text-hce-teal hover:bg-hce-teal/5"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-0 bg-hce-teal rounded-xl shadow-sm shadow-hce-teal/20" />
                      )}
                      <span className="relative z-10">{link.name}</span>
                    </a>
                  );
                })}
              </div>

              {/* Login Button */}
              <button
                onClick={() => setIsLoginModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#102A43] hover:bg-[#1a3d60] text-white text-xs xl:text-sm font-bold tracking-wide shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#E05A1F]" />
                <span>Login</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-[#102A43] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E05A1F]" />
                <span>Login</span>
              </button>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="p-2 rounded-xl bg-white/80 border border-hce-teal/15 text-hce-navy hover:text-hce-teal focus:outline-none shadow-xs cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[#FFF6E9]/95 backdrop-blur-md border-b border-hce-teal/15 shadow-xl animate-fade-in px-4 pt-3 pb-5">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-hce-teal text-white"
                        : "text-hce-navy/80 hover:bg-white hover:text-hce-teal"
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* LOGIN MODAL WITH EMAIL & PASSWORD */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsLoginModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header / Accent Top */}
            <div className="bg-gradient-to-r from-[#102A43] via-[#1A5E61] to-[#102A43] p-6 text-white text-center relative">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-[#E05A1F]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Login Portal Staff</h3>
              <p className="text-xs text-white/80 mt-1">
                Masuk ke dashboard Super Admin & Operasional HCE 2026
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email Akun <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@hce-event.id"
                    className="w-full pl-10 pr-4 py-2.5 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] text-[#102A43] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="text-[11px] font-semibold text-[#1A5E61] hover:underline"
                  >
                    Auto-Fill Demo
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs lg:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A5E61]/20 focus:border-[#1A5E61] text-[#102A43] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#102A43] hover:bg-[#1a3d60] text-white rounded-xl text-xs lg:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Hint */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400">
                  Demo Super Admin: <span className="font-mono text-slate-600 font-semibold">superadmin@hce-event.id</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
