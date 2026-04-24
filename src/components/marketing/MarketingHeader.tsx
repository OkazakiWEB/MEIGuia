"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/landing#planos", label: "Preços" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo href="/" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "text-petroleo-700 bg-petroleo-50"
                  : "text-gray-600 hover:text-petroleo-700 hover:bg-gray-50"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm py-2 px-4">Entrar</Link>
          <Link href="/landing" className="btn-primary text-sm py-2 px-4">Começar grátis</Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-lg">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "text-petroleo-700 bg-petroleo-50"
                  : "text-gray-600 hover:text-petroleo-700 hover:bg-gray-50"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary text-center text-sm py-3">Entrar</Link>
            <Link href="/landing" onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-3 font-bold">Começar grátis</Link>
          </div>
        </div>
      )}
    </header>
  );
}
