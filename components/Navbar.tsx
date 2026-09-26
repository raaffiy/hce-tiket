"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

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

  return (
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
                SEMINAR NASIONAL
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center">
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
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center lg:hidden">
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
  );
}
