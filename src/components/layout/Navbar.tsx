"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, FileText, Settings, LogOut, Menu, X, Sparkles, Receipt, Lock, UserCircle, FilePlus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoInline } from "@/components/ui/Logo";
import type { Profile } from "@/types/database";

interface NavbarProps {
  profile: Profile | null;
  notasMes: number;
}

const navItems = [
  { href: "/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { href: "/notas",      label: "Notas Fiscais", icon: FileText },
  { href: "/emitir-nf",  label: "Emitir NF",    icon: FilePlus },
  { href: "/das",        label: "Guias DAS",     icon: Receipt },
  { href: "/perfil",     label: "Perfil",        icon: UserCircle },
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
    notasMes >= notasLimit       ? "text-red-400 font-bold" :
    notasMes >= notasLimit * 0.8 ? "text-amber-400 font-semibold" :
    notasMes >= notasLimit * 0.6 ? "text-yellow-400" :
    "text-white/40";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const isActive   = pathname === href || pathname.startsWith(href + "/");
    const isNotas    = href === "/notas";
    const isDas      = href === "/das";
    const isEmitirNF = href === "/emitir-nf";
    const locked     = (isDas || isEmitirNF) && !isPremium;

    if (locked) {
      return (
        <Link
          href="/assinatura?upgrade=premium"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-white/30 hover:bg-white/5 hover:text-white/50"
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
          "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
            : "text-white/60 hover:bg-white/8 hover:text-white"
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

  const planoBadge =
    plano === "premium"
      ? { label: "⭐ Premium", cls: "bg-brand-500/20 text-brand-300 border border-brand-500/30" }
      : plano === "pro"
      ? { label: "✨ Pro",     cls: "bg-white/10 text-white/70 border border-white/10" }
      : { label: "Gratuito",   cls: "bg-white/5 text-white/40 border border-white/10" };

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 overflow-y-auto"
        style={{ background: "#1e1e1e" }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <LogoInline
            href="/dashboard"
            className="[&_.font-portal]:text-white/30 [&_.text-petroleo-700]:text-white [&_.text-agua-500]:text-brand-400"
          />
        </div>

        {/* Plano badge */}
        {profile && (
          <div className="px-4 pt-4">
            <span className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
              planoBadge.cls
            )}>
              {planoBadge.label}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Upgrade CTA */}
        {!isPremium && (
          <div className="mx-3 mb-3 rounded-xl p-3 bg-white/5 border border-white/8">
            <p className="text-xs text-white/50 mb-2.5 leading-snug">
              {notasMes >= notasLimit
                ? "Você atingiu o limite de notas deste mês."
                : notasMes >= notasLimit * 0.6
                ? `Você usou ${notasMes}/${notasLimit} notas este mês.`
                : isFree
                ? "Alertas, previsão e mais notas no Pro."
                : "WhatsApp, DAS e NF no Premium."}
            </p>
            <Link
              href="/assinatura"
              className="flex items-center justify-center gap-1.5 w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {notasMes >= notasLimit
                ? isFree ? "Upgrade para Pro" : "Upgrade para Premium"
                : isFree ? "Fazer upgrade" : "Ver Premium"}
            </Link>
          </div>
        )}

        {/* User info + logout */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                  {profile?.full_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || "Usuário"}
              </p>
              <p className="text-xs text-white/40 truncate">{profile?.email}</p>
            </div>
            <Link
              href="/configuracoes"
              onClick={() => setMobileOpen(false)}
              className="flex-shrink-0 p-1.5 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/8"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/30 hover:text-red-400 transition-colors w-full py-1 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Header mobile ── */}
      <header className="lg:hidden sticky top-0 z-40 px-4 h-14 flex items-center justify-between border-b border-white/8"
        style={{ background: "#1e1e1e" }}>
        <LogoInline
          href="/dashboard"
          className="[&_.font-portal]:text-white/30 [&_.text-petroleo-700]:text-white [&_.text-agua-500]:text-brand-400"
        />
        <div className="flex items-center gap-2">
          {!isPremium && (
            <span className={cn("text-xs tabular-nums", counterColor)}>
              {notasMes}/{notasLimit}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-white/60 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/70" onClick={() => setMobileOpen(false)}>
          <nav
            className="absolute top-14 left-0 right-0 border-b border-white/8 shadow-2xl p-3 space-y-0.5"
            style={{ background: "#1e1e1e" }}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}

            <Link
              href="/configuracoes"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname.startsWith("/configuracoes")
                  ? "bg-brand-500 text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              )}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Configurações
            </Link>

            {!isPremium && (
              <Link
                href="/assinatura"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-3 rounded-xl transition-colors mt-2"
              >
                <Sparkles className="w-4 h-4" />
                {isFree ? "Fazer upgrade para Pro — R$ 24,90/mês" : "Fazer upgrade para Premium — R$ 49,90/mês"}
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm text-white/40 hover:text-red-400 px-4 py-3.5 w-full rounded-xl min-h-[52px] transition-colors"
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
