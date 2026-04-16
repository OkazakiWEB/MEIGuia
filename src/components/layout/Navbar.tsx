"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, FileText, CreditCard, Settings, LogOut, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoInline } from "@/components/ui/Logo";
import type { Profile } from "@/types/database";

interface NavbarProps {
  profile: Profile | null;
  notasMes: number;
}

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/notas",         label: "Notas Fiscais",  icon: FileText },
  { href: "/assinatura",    label: "Assinatura",     icon: CreditCard },
  { href: "/configuracoes", label: "Configurações",  icon: Settings },
];

export function Navbar({ profile, notasMes }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isFree = profile?.plano !== "pro";
  // Cor do contador baseada na proximidade do limite
  const counterColor =
    notasMes >= 10 ? "text-red-400 font-bold" :
    notasMes >= 8  ? "text-amber-400 font-semibold" :
    notasMes >= 6  ? "text-yellow-400" :
    "text-petroleo-300";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const isActive = pathname.startsWith(href);
    const isNotas = href === "/notas";
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-petroleo-600 text-white"
            : "text-petroleo-200 hover:bg-petroleo-700 hover:text-white"
        )}
      >
        <span className="flex items-center gap-3">
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </span>
        {/* Contador de notas apenas para plano free */}
        {isNotas && isFree && (
          <span className={cn("text-xs tabular-nums", counterColor)}>
            {notasMes}/10
          </span>
        )}
      </Link>
    );
  }

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-petroleo-900 min-h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-petroleo-700">
          <LogoInline href="/dashboard" className="[&_.font-portal]:text-petroleo-300 [&_.text-petroleo-700]:text-white [&_.text-agua-500]:text-agua-400" />
        </div>

        {/* Plano badge */}
        {profile && (
          <div className="px-4 pt-4">
            <span className={
              profile.plano === "pro"
                ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-agua-500 text-white"
                : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-petroleo-700 text-petroleo-200"
            }>
              {profile.plano === "pro" ? "✨ Plano Pro" : "Plano Gratuito"}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Banner upgrade para free (quando >= 15 notas) */}
        {isFree && notasMes >= 6 && (
          <div className="mx-3 mb-3 bg-petroleo-800 border border-petroleo-600 rounded-xl p-3">
            <p className="text-xs text-petroleo-200 mb-2">
              {notasMes >= 10
                ? "Limite atingido este mês."
                : `Você usou ${notasMes}/10 notas este mês.`}
            </p>
            <Link
              href="/assinatura"
              className="flex items-center justify-center gap-1.5 w-full bg-agua-500 hover:bg-agua-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade para Pro
            </Link>
          </div>
        )}

        {/* User info + logout */}
        <div className="p-4 border-t border-petroleo-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-agua-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || "Usuário"}
              </p>
              <p className="text-xs text-petroleo-300 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-petroleo-300 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Header mobile ── */}
      <header className="lg:hidden bg-petroleo-900 sticky top-0 z-40 px-4 h-14 flex items-center justify-between">
        <LogoInline href="/dashboard" className="[&_.font-portal]:text-petroleo-300 [&_.text-petroleo-700]:text-white [&_.text-agua-500]:text-agua-400" />
        <div className="flex items-center gap-2">
          {/* Contador compacto no mobile */}
          {isFree && (
            <span className={cn("text-xs tabular-nums", counterColor)}>
              {notasMes}/10
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-petroleo-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileOpen(false)}>
          <nav
            className="absolute top-14 left-0 right-0 bg-petroleo-900 border-b border-petroleo-700 shadow-2xl p-3 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}

            {/* Banner upgrade mobile */}
            {isFree && notasMes >= 6 && (
              <Link
                href="/assinatura"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-agua-500 hover:bg-agua-600 text-white text-sm font-semibold py-3 rounded-lg transition-colors mt-2"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade para Pro — R$ 14,90/mês
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-base text-red-400 px-4 py-3.5 w-full rounded-lg min-h-[52px] active:bg-petroleo-800"
            >
              <LogOut className="w-5 h-5" />
              Sair da conta
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
