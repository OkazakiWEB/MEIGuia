"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, Sparkles, Receipt, Lock, UserCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoInline } from "@/components/ui/Logo";
import type { Profile } from "@/types/database";

interface NavbarProps {
  profile: Profile | null;
  notasMes: number;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { href: "/notas",     label: "Notas Fiscais", icon: FileText },
  { href: "/das",       label: "Guias DAS",     icon: Receipt },
  { href: "/perfil",    label: "Perfil",        icon: UserCircle },
];

export function Navbar({ profile, notasMes }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const plano = profile?.plano ?? "free";
  const isFree = plano === "free";
  const isPremium = plano === "premium";
  const notasLimit = plano === "pro" ? 30 : 5;
  const counterColor =
    notasMes >= notasLimit     ? "text-red-400 font-bold" :
    notasMes >= notasLimit * 0.8 ? "text-amber-400 font-semibold" :
    notasMes >= notasLimit * 0.6 ? "text-yellow-400" :
    "text-petroleo-300";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const isActive  = pathname === href || pathname.startsWith(href + "/");
    const isNotas   = href === "/notas";
    const isDas     = href === "/das";
    const dasLocked = isDas && !isPremium;

    if (dasLocked) {
      return (
        <Link
          href="/assinatura?upgrade=premium"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-petroleo-400 hover:bg-petroleo-700 hover:text-petroleo-200"
        >
          <span className="flex items-center gap-3">
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </span>
          <Lock className="w-3 h-3 flex-shrink-0" />
        </Link>
      );
    }

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
        {isNotas && !isPremium && (
          <span className={cn("text-xs tabular-nums", counterColor)}>
            {notasMes}/{notasLimit}
          </span>
        )}
      </Link>
    );
  }

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-petroleo-900 h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="p-6 border-b border-petroleo-700">
          <LogoInline href="/dashboard" className="[&_.font-portal]:text-petroleo-300 [&_.text-petroleo-700]:text-white [&_.text-agua-500]:text-agua-400" />
        </div>

        {/* Plano badge */}
        {profile && (
          <div className="px-4 pt-4">
            <span className={
              plano === "premium"
                ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500 text-white"
                : plano === "pro"
                ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-agua-500 text-white"
                : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-petroleo-700 text-petroleo-200"
            }>
              {plano === "premium" ? "⭐ Plano Premium" : plano === "pro" ? "✨ Plano Pro" : "Plano Gratuito"}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Upgrade CTA — free e pro veem (premium não precisa) */}
        {!isPremium && (
          <div className={cn(
            "mx-3 mb-3 rounded-xl p-3 border",
            notasMes >= 10
              ? "bg-red-900/40 border-red-700"
              : notasMes >= 6
              ? "bg-petroleo-800 border-petroleo-600"
              : "bg-petroleo-800/60 border-petroleo-700"
          )}>
            <p className="text-xs text-petroleo-200 mb-2 leading-snug">
              {notasMes >= notasLimit
                ? "Limite atingido este mês."
                : notasMes >= notasLimit * 0.6
                ? `Você usou ${notasMes}/${notasLimit} notas este mês.`
                : isFree
                ? "Alertas, previsão e mais notas no Pro."
                : "WhatsApp, DAS e NF no Premium."}
            </p>
            <Link
              href="/assinatura"
              className={cn(
                "flex items-center justify-center gap-1.5 w-full text-white text-xs font-semibold py-2 rounded-lg transition-colors",
                notasMes >= 10
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-agua-500 hover:bg-agua-600"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {notasMes >= notasLimit
                ? isFree ? "Upgrade para Pro" : "Upgrade para Premium"
                : isFree ? "Fazer upgrade" : "Ver Premium"}
            </Link>
          </div>
        )}

        {/* User info + logout */}
        <div className="p-4 border-t border-petroleo-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-agua-500 flex items-center justify-center text-white font-bold text-sm">
                  {profile?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || "Usuário"}
              </p>
              <p className="text-xs text-petroleo-300 truncate">{profile?.email}</p>
            </div>
            <Link
              href="/configuracoes"
              onClick={() => setMobileOpen(false)}
              className="flex-shrink-0 p-1.5 text-petroleo-400 hover:text-white transition-colors"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Link>
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
          {!isPremium && (
            <span className={cn("text-xs tabular-nums", counterColor)}>
              {notasMes}/{notasLimit}
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

            {/* Configurações */}
            <Link
              href="/configuracoes"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/configuracoes")
                  ? "bg-petroleo-600 text-white"
                  : "text-petroleo-200 hover:bg-petroleo-700 hover:text-white"
              )}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Configurações
            </Link>

            {/* Banner upgrade mobile */}
            {!isPremium && (
              <Link
                href="/assinatura"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-center gap-2 w-full text-white text-sm font-semibold py-3 rounded-lg transition-colors mt-2",
                  notasMes >= 10
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-agua-500 hover:bg-agua-600"
                )}
              >
                <Sparkles className="w-4 h-4" />
                {isFree ? "Fazer upgrade para Pro — R$ 24,90/mês" : "Fazer upgrade para Premium — R$ 49,90/mês"}
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
