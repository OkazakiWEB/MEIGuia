"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader2 as LoaderFallback } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, ShieldCheck, CreditCard, AlertCircle,
  CheckCircle, XCircle, Bell, TrendingUp, Sparkles,
  FileDown, Lock, RotateCcw, MessageSquare, Receipt, FileText, Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { track } from "@vercel/analytics";

interface Profile {
  plano: string;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
}

type Interval = "monthly" | "annual";

const PRO_FEATURES = [
  { icon: Bell,       headline: "Aviso antes de ultrapassar o limite",        sub: "Alerta automático quando estiver perto dos R$ 81.000 — antes de ser tarde." },
  { icon: TrendingUp, headline: "Saiba exatamente quanto ainda pode ganhar",   sub: "Veja em tempo real quanto falta para o limite anual." },
  { icon: Sparkles,   headline: "Teto mensal calculado automaticamente",       sub: "O sistema calcula quanto você pode cobrar por mês sem risco de estouro." },
  { icon: FileDown,   headline: "Exportar para o contador em segundos",        sub: "Planilha pronta — sem procurar nota por nota." },
  { icon: ShieldCheck,headline: "Histórico completo sempre disponível",        sub: "Seus dados guardados com segurança, nunca perde nada." },
];

const PREMIUM_FEATURES = [
  { icon: MessageSquare, headline: "Alertas via WhatsApp",          sub: "Receba notificações diretamente no seu WhatsApp quando se aproximar do limite." },
  { icon: Receipt,       headline: "Emissão de guia DAS integrada", sub: "Gere e acompanhe o pagamento do DAS sem sair do portal." },
  { icon: FileText,      headline: "Emissão de Nota Fiscal",        sub: "Emita NFS-e diretamente pelo portal, integrado à prefeitura. (Em breve)" },
];

function AssinaturaContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const success  = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const intervalParam = searchParams.get("interval");
  const planParam     = searchParams.get("plan");

  const [profile, setProfile]                 = useState<Profile | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<null | "pro" | "premium">(null);
  const [portalLoading, setPortalLoading]     = useState(false);
  const [interval, setInterval]               = useState<Interval>(intervalParam === "annual" ? "annual" : "monthly");
  const [phone, setPhone]                     = useState("");
  const [savingPhone, setSavingPhone]         = useState(false);

  useEffect(() => {
    loadProfile();
    // Auto-checkout se vier do cadastro com plano e intervalo selecionados
    if (planParam === "pro" || planParam === "premium") {
      handleCheckout(planParam as "pro" | "premium");
    }
    if (canceled) toast.error("Assinatura cancelada. Você pode tentar novamente a qualquer hora.");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canceled]);

  async function loadProfile() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("profiles")
        .select("plano, subscription_status, stripe_subscription_id")
        .eq("id", user.id)
        .single();
      if (error) console.error("[Assinatura] loadProfile error:", error);
      setProfile(data ?? null);
    } catch (err) {
      console.error("[Assinatura] loadProfile unexpected:", err);
      toast.error("Erro ao carregar dados. Recarregue a página.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(plan: "pro" | "premium") {
    const precos = { pro: { monthly: 24.90, annual: 239 }, premium: { monthly: 49.90, annual: 479 } };
    const valor = interval === "annual" ? precos[plan].annual : precos[plan].monthly;
    track("checkout_started", { plano: plan, interval });
    if (typeof window !== "undefined" && (window as any).gtag)
      (window as any).gtag("event", "begin_checkout", { currency: "BRL", value: valor });
    if (typeof window !== "undefined" && (window as any).fbq)
      (window as any).fbq("track", "InitiateCheckout", { currency: "BRL", value: valor });

    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, plan }),
      });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      track("checkout_redirected", { interval, plan });
      window.location.href = url;
    } catch {
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      window.location.href = url;
    } catch {
      toast.error("Erro ao abrir portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  function formatPhone(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2)  return d;
    if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    return d;
  }

  async function handleSavePhone(skip = false) {
    setSavingPhone(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !skip) {
        const digits = phone.replace(/\D/g, "");
        await supabase.from("profiles").update({ whatsapp_phone: digits }).eq("id", user.id);
      }
      if (typeof window !== "undefined" && (window as any).gtag)
        (window as any).gtag("event", "purchase", { currency: "BRL", value: profile?.plano === "premium" ? 49.90 : 24.90, transaction_id: Date.now().toString() });
      if (typeof window !== "undefined" && (window as any).fbq)
        (window as any).fbq("track", "Purchase", { currency: "BRL", value: profile?.plano === "premium" ? 49.90 : 24.90 });
      router.push("/dashboard");
    } finally {
      setSavingPhone(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const plano     = profile?.plano ?? "free";
  const isPro     = plano === "pro";
  const isPremium = plano === "premium";
  const isPastDue = profile?.subscription_status === "past_due";

  // ── Tela de sucesso pós-pagamento ─────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className={`card border-2 text-center py-10 px-6 space-y-6 ${isPremium ? "border-purple-300 bg-purple-50" : "border-brand-200 bg-brand-50"}`}>
          {/* Ícone */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${isPremium ? "bg-purple-100" : "bg-brand-100"}`}>
            <ShieldCheck className={`w-10 h-10 ${isPremium ? "text-purple-600" : "text-brand-600"}`} />
          </div>

          {/* Título */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isPremium ? "text-purple-500" : "text-brand-500"}`}>
              {isPremium ? "Plano Premium ativado 🚀" : "Plano Pro ativado ✨"}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {isPremium ? "Bem-vindo ao Premium!" : "Seu MEI está protegido!"}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isPremium
                ? "Você tem acesso a alertas, previsão, DAS integrado e em breve emissão de NF."
                : "Alertas automáticos e previsão anual estão ativos."}
            </p>
          </div>

          {/* Celular — apenas Premium */}
          {isPremium && (
            <div className="text-left space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-500" />
                  Celular para alertas via WhatsApp
                </span>
              </label>
              <input
                type="tel"
                className="input"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                inputMode="numeric"
                maxLength={15}
              />
              <p className="text-xs text-gray-400">
                Você receberá alertas quando se aproximar do limite anual de R$ 81.000.
              </p>
            </div>
          )}

          {/* Botão principal */}
          <button
            onClick={() => handleSavePhone(isPremium && phone.replace(/\D/g, "").length < 10)}
            disabled={savingPhone || (isPremium && phone.replace(/\D/g, "").length > 0 && phone.replace(/\D/g, "").length < 10)}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition ${
              isPremium ? "bg-purple-600 hover:bg-purple-700" : "bg-brand-600 hover:bg-brand-700"
            } disabled:opacity-50`}
          >
            {savingPhone
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              : isPremium && phone.replace(/\D/g, "").length >= 10
              ? <><CheckCircle className="w-4 h-4" /> Salvar e ir ao dashboard</>
              : "Ir ao dashboard →"}
          </button>

          {/* Pular (só Premium) */}
          {isPremium && (
            <button
              onClick={() => handleSavePhone(true)}
              className="text-xs text-gray-400 hover:text-gray-600 transition underline"
            >
              Pular por agora
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Tela do assinante ativo ───────────────────────────────────────────────
  if (isPro || isPremium) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className={`card border-2 text-center py-10 ${isPremium ? "border-purple-300 bg-purple-50" : "border-brand-200 bg-brand-50"}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPremium ? "bg-purple-100" : "bg-brand-100"}`}>
            <ShieldCheck className={`w-8 h-8 ${isPremium ? "text-purple-600" : "text-brand-600"}`} />
          </div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isPremium ? "text-purple-500" : "text-brand-500"}`}>
            {isPremium ? "Plano Premium ativo" : "Plano Pro ativo"}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {isPremium ? "Proteção completa ativa ⭐" : "Seu MEI está protegido 🎉"}
          </h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
            {isPremium
              ? "Alertas, previsão, DAS e WhatsApp ativos. Você tem o máximo de controle."
              : "Você recebe alertas automáticos e sabe exatamente quanto ainda pode faturar."}
          </p>
          {isPastDue && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              Pagamento com problema — atualize seu cartão
            </div>
          )}
          <p className={`text-xs mt-4 ${isPremium ? "text-purple-500" : "text-brand-500"}`}>
            {profile?.subscription_status === "active" ? "✅ Ativo e em dia" : `Status: ${profile?.subscription_status}`}
          </p>
        </div>

        {/* Pro pode fazer upgrade para Premium */}
        {isPro && (
          <div className="card border border-purple-200 bg-purple-50 p-5 space-y-3">
            <p className="font-semibold text-purple-800 text-sm">Quer ainda mais controle?</p>
            <p className="text-xs text-purple-700">
              Com o Premium você também recebe alertas via WhatsApp, emite DAS integrado e terá emissão de Nota Fiscal diretamente pelo portal.
            </p>
            <button
              onClick={() => handleCheckout("premium")}
              disabled={checkoutLoading !== null}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              {checkoutLoading === "premium"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                : <><Sparkles className="w-4 h-4" /> Fazer upgrade para Premium — R$ 49,90/mês</>}
            </button>
          </div>
        )}

        <button
          onClick={handlePortal}
          disabled={portalLoading}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Gerenciar cobrança e cartão
        </button>
        <p className="text-center text-xs text-gray-400">Cancele quando quiser — sem burocracia, sem multa.</p>
      </div>
    );
  }

  // ── Preços ────────────────────────────────────────────────────────────────
  const proMensal       = 24.90;
  const proAnual        = 239.00;
  const premiumMensal   = 49.90;
  const premiumAnual    = 479.00;
  const proEconomia     = Math.round((1 - (proAnual / 12) / proMensal) * 100);
  const premiumEconomia = Math.round((1 - (premiumAnual / 12) / premiumMensal) * 100);

  const proExibido      = interval === "annual" ? proAnual / 12 : proMensal;
  const premiumExibido  = interval === "annual" ? premiumAnual / 12 : premiumMensal;

  // ── Tela de conversão ─────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* ── Hero ── */}
      <div className="text-center space-y-3 pt-2">
        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Risco real para o seu negócio
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          Quem ultrapassa o limite<br className="hidden sm:block" /> pode perder o MEI
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
          Passar de R$&nbsp;81.000 por ano sem perceber pode gerar multas, cobranças retroativas e até o cancelamento do seu MEI.
        </p>
      </div>

      {/* ── Prova social ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">📊</span>
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-bold">Mais de 60% dos MEIs não monitoram o faturamento</span>
          {" "}e só percebem o problema quando já é tarde.
        </p>
      </div>

      {/* ── Toggle mensal / anual ── */}
      <div className="flex flex-col items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${interval === "monthly" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${interval === "annual" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            Anual
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{proEconomia}%
            </span>
          </button>
        </div>
        {interval === "annual" && (
          <p className="text-xs text-green-600 font-semibold">
            Pro: economize R$ {(proMensal * 12 - proAnual).toFixed(0)} · Premium: economize R$ {(premiumMensal * 12 - premiumAnual).toFixed(0)} por ano
          </p>
        )}
      </div>

      {/* ── 3 Cards de planos ── */}
      <div className="grid sm:grid-cols-3 gap-4">

        {/* Gratuito */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="h-4 mb-1" aria-hidden />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Gratuito</p>
          <p className="text-2xl font-extrabold text-gray-700 mb-0.5">R$&nbsp;0</p>
          <p className="text-xs text-transparent select-none mb-3 h-3">—</p>
          <ul className="space-y-2 flex-1 text-xs">
            {[
              { ok: true,  text: "5 notas por mês" },
              { ok: true,  text: "Dashboard básico" },
              { ok: false, text: "Alertas de limite" },
              { ok: false, text: "Previsão anual" },
              { ok: false, text: "Exportar relatório" },
              { ok: false, text: "Alertas WhatsApp" },
              { ok: false, text: "Emissão de DAS" },
              { ok: false, text: "Emissão de NF" },
            ].map(({ ok, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                {ok ? <CheckCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    : <XCircle    className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                <span className={ok ? "text-gray-600" : "text-gray-400 line-through"}>{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 w-full py-3 rounded-xl border border-gray-300 bg-white text-center text-sm font-semibold text-gray-400">
            Plano atual
          </div>
        </div>

        {/* Pro */}
        <div className="flex flex-col rounded-2xl border-2 border-brand-500 bg-white relative shadow-lg shadow-brand-100 p-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            ⭐ Mais popular
          </div>
          <div className="h-4 mb-1" aria-hidden />
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Pro</p>
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-2xl font-extrabold text-gray-900">R$&nbsp;{proExibido.toFixed(2).replace(".", ",")}</span>
            <span className="text-gray-400 text-xs">/mês</span>
          </div>
          <p className="text-xs text-brand-500 font-medium mb-3 h-3">
            {interval === "annual" ? `R$ ${proAnual.toFixed(0)} cobrado por ano` : "Menos de R$ 0,85/dia"}
          </p>
          <ul className="space-y-2 flex-1 text-xs">
            {[
              { ok: true,  text: "30 notas por mês" },
              { ok: true,  text: "Dashboard completo" },
              { ok: true,  text: "Alertas de limite" },
              { ok: true,  text: "Previsão anual" },
              { ok: true,  text: "Exportar relatório" },
              { ok: false, text: "Alertas WhatsApp" },
              { ok: false, text: "Emissão de DAS" },
              { ok: false, text: "Emissão de NF" },
            ].map(({ ok, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                {ok ? <CheckCircle className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                    : <XCircle    className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />}
                <span className={ok ? "text-gray-700" : "text-gray-400 line-through"}>{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <button
              onClick={() => handleCheckout("pro")}
              disabled={checkoutLoading !== null}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              {checkoutLoading === "pro"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                : <><ShieldCheck className="w-4 h-4" /> Assinar Pro</>}
            </button>
            <p className="text-xs text-center mt-1.5 text-gray-400">Cancele quando quiser</p>
          </div>
        </div>

        {/* Premium */}
        <div className="flex flex-col rounded-2xl border-2 border-purple-400 bg-white relative shadow-lg shadow-purple-100 p-5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            🚀 Completo
          </div>
          <div className="h-4 mb-1" aria-hidden />
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest mb-2">Premium</p>
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-2xl font-extrabold text-gray-900">R$&nbsp;{premiumExibido.toFixed(2).replace(".", ",")}</span>
            <span className="text-gray-400 text-xs">/mês</span>
          </div>
          <p className="text-xs text-purple-500 font-medium mb-3 h-3">
            {interval === "annual" ? `R$ ${premiumAnual.toFixed(0)} cobrado por ano · -${premiumEconomia}%` : "Menos de R$ 1,70/dia"}
          </p>
          <ul className="space-y-2 flex-1 text-xs">
            {[
              "Notas ilimitadas",
              "Dashboard completo",
              "Alertas de limite",
              "Previsão anual",
              "Exportar relatório",
              "Alertas via WhatsApp",
              "Emissão de DAS integrada",
              "Emissão de NF (em breve)",
            ].map((text) => (
              <li key={text} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                <span className="text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <button
              onClick={() => handleCheckout("premium")}
              disabled={checkoutLoading !== null}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition"
            >
              {checkoutLoading === "premium"
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                : <><Sparkles className="w-4 h-4" /> Assinar Premium</>}
            </button>
            <p className="text-xs text-center mt-1.5 text-gray-400">Cancele quando quiser</p>
          </div>
        </div>
      </div>

      {/* ── Selos de confiança ── */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <span className="text-xs text-gray-400 flex items-center gap-1.5"><Lock className="w-3 h-3" /> Pagamento seguro via Stripe</span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> Cancele quando quiser</span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Seus dados protegidos</span>
      </div>

      {/* ── FAQ accordion ── */}
      <FaqAccordion />

      {/* ── CTA final ── */}
      <div className="grid sm:grid-cols-2 gap-4 pb-6">
        <div className="text-center space-y-2">
          <button
            onClick={() => handleCheckout("pro")}
            disabled={checkoutLoading !== null}
            className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
          >
            {checkoutLoading === "pro"
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
              : <><ShieldCheck className="w-5 h-5" /> Assinar Pro — R$ {proExibido.toFixed(2).replace(".", ",")}/mês</>}
          </button>
          <p className="text-xs text-gray-400">{interval === "annual" ? `R$ ${proAnual} cobrado por ano` : "Cancele quando quiser"}</p>
        </div>
        <div className="text-center space-y-2">
          <button
            onClick={() => handleCheckout("premium")}
            disabled={checkoutLoading !== null}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-base font-bold flex items-center justify-center gap-2 transition"
          >
            {checkoutLoading === "premium"
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
              : <><Sparkles className="w-5 h-5" /> Assinar Premium — R$ {premiumExibido.toFixed(2).replace(".", ",")}/mês</>}
          </button>
          <p className="text-xs text-gray-400">{interval === "annual" ? `R$ ${premiumAnual} cobrado por ano` : "Cancele quando quiser"}</p>
        </div>
      </div>

    </div>
  );
}

const FAQ_ITEMS = [
  { q: "Posso cancelar a qualquer momento?",   a: "Sim. Sem multa, sem burocracia. Você cancela em um clique e mantém o acesso até o fim do período pago." },
  { q: "Como funciona a cobrança?",             a: "Todo mês (ou uma vez por ano) é cobrado no cartão via Stripe. Você recebe o comprovante no e-mail." },
  { q: "Vale a pena para quem fatura pouco?",  a: "Principalmente para quem fatura pouco — é quando o crescimento pega de surpresa. Saber quanto falta para o limite evita o susto no fim do ano." },
  { q: "Meus dados ficam seguros?",             a: "Sim. Banco de dados com criptografia e isolamento total. Só você acessa seus registros." },
  { q: "Posso mudar de plano depois?",          a: "Sim. Você pode fazer upgrade de Pro para Premium a qualquer momento. O valor é proporcional ao período restante." },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="card space-y-1">
      <h3 className="font-bold text-gray-900 mb-3">Perguntas frequentes</h3>
      {FAQ_ITEMS.map(({ q, a }, i) => (
        <div key={q} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-800">{q}</span>
            <span className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-gray-500 border-t border-gray-50 pt-3">
              {a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AssinaturaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderFallback className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    }>
      <AssinaturaContent />
    </Suspense>
  );
}
