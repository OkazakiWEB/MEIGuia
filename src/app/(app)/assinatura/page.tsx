"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader2 as LoaderFallback } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, ShieldCheck, CreditCard, AlertCircle,
  CheckCircle, XCircle, Bell, TrendingUp, Sparkles,
  FileDown, Lock, RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { track } from "@vercel/analytics";

interface Profile {
  plano: string;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
}

type Interval = "monthly" | "annual";

// ── Features reescritas como proteção, não como funcionalidades ────────────
const PRO_FEATURES = [
  {
    icon: Bell,
    headline: "Aviso antes de você se meter em problema",
    sub: "Você recebe um alerta automático quando estiver perto do limite — antes de ser tarde demais.",
  },
  {
    icon: TrendingUp,
    headline: "Saiba exatamente quanto ainda pode ganhar",
    sub: "Sem chute. Você vê em tempo real quanto falta para atingir o limite de R$ 81.000.",
  },
  {
    icon: Sparkles,
    headline: "Descubra quanto pode cobrar por mês com segurança",
    sub: "O sistema calcula um teto mensal para você faturar sem risco de ultrapassar no fim do ano.",
  },
  {
    icon: CheckCircle,
    headline: "Registre quantas notas quiser",
    sub: "Sem limite de notas por mês. Fature à vontade sem travar o sistema.",
  },
  {
    icon: FileDown,
    headline: "Leve seus dados para o contador em segundos",
    sub: "Exporte tudo em planilha — sem precisar ficar procurando nota por nota.",
  },
  {
    icon: ShieldCheck,
    headline: "Histórico completo de todos os anos",
    sub: "Seus dados ficam guardados com segurança — nunca perde nada.",
  },
];

function AssinaturaContent() {
  const searchParams = useSearchParams();
  const success  = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const [profile, setProfile]                 = useState<Profile | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading]     = useState(false);
  const [interval, setInterval]               = useState<Interval>("monthly");

  useEffect(() => {
    loadProfile();
    if (success) {
      toast.success("🎉 Plano Pro ativado! Seu MEI está protegido.");
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "purchase", { currency: "BRL", value: 19.90, transaction_id: Date.now().toString() });
      }
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Purchase", { currency: "BRL", value: 19.90 });
      }
    }
    if (canceled) toast.error("Assinatura cancelada. Você pode tentar novamente a qualquer hora.");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, canceled]);

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

  async function handleCheckout() {
    track("checkout_started", { plano: "pro", interval });
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "begin_checkout", {
        currency: "BRL",
        value: interval === "annual" ? 191.90 : 19.90,
      });
    }
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        currency: "BRL",
        value: interval === "annual" ? 191.90 : 19.90,
      });
    }
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      track("checkout_redirected", { interval });
      window.location.href = url;
    } catch {
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const isPro     = profile?.plano === "pro";
  const isPastDue = profile?.subscription_status === "past_due";

  // ── Tela do assinante Pro ─────────────────────────────────────────────────
  if (isPro) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="card border-2 border-brand-200 bg-brand-50 text-center py-10">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-brand-600" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">Plano Pro ativo</p>
          <h1 className="text-2xl font-bold text-gray-900">Seu MEI está protegido 🎉</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
            Você recebe alertas automáticos e sabe exatamente quanto ainda pode faturar.
          </p>
          {isPastDue && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm font-semibold">
              <AlertCircle className="w-4 h-4" />
              Pagamento com problema — atualize seu cartão
            </div>
          )}
          <p className="text-xs text-brand-500 mt-4">
            {profile?.subscription_status === "active" ? "✅ Ativo e em dia" : `Status: ${profile?.subscription_status}`}
          </p>
        </div>

        <button
          onClick={handlePortal}
          disabled={portalLoading}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Gerenciar cobrança e cartão
        </button>

        <p className="text-center text-xs text-gray-400">
          Cancele quando quiser — sem burocracia, sem multa.
        </p>
      </div>
    );
  }

  // ── Preços ────────────────────────────────────────────────────────────────
  const precoMensal      = 19.90;
  const precoAnualTotal  = 319.90;                        // cobrado uma vez por ano
  const precoAnualMes    = precoAnualTotal / 12;          // ~26,66/mês
  const economiaPct      = Math.round((1 - precoAnualMes / precoMensal) * 100);
  const precoExibido     = interval === "annual" ? precoAnualMes : precoMensal;

  // ── Tela de conversão ─────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* ── Hero ── */}
      <div className="text-center space-y-3 pt-2">
        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Risco real para o seu negócio
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          Quem ultrapassa o limite<br className="hidden sm:block" /> pode perder o MEI
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto">
          Passar de R$&nbsp;81.000 por ano sem perceber pode gerar multas, cobranças retroativas
          e até o cancelamento do seu MEI.
        </p>
      </div>

      {/* ── Prova social ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">📊</span>
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-bold">Mais de 60% dos MEIs não monitoram o faturamento</span>
          {" "}e só percebem o problema quando já é tarde. O Portal MEIguia foi criado para evitar exatamente isso.
        </p>
      </div>

      {/* ── Toggle mensal / anual ── */}
      <div className="flex flex-col items-center gap-2">
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              interval === "monthly"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              interval === "annual"
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Anual
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{economiaPct}%
            </span>
          </button>
        </div>
        {interval === "annual" && (
          <p className="text-xs text-green-600 font-semibold">
            Você economiza R$ {((precoMensal * 12) - precoAnualTotal).toFixed(0).replace(".", ",")} por ano
          </p>
        )}
      </div>

      {/* ── Cards dos planos ── */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* Gratuito */}
        <div className="flex flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div className="h-5 mb-1" aria-hidden />

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Gratuito</p>
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-3xl font-extrabold text-gray-700">R$&nbsp;0</span>
          </div>
          <p className="text-xs text-transparent select-none mb-4 h-4">—</p>

          <ul className="space-y-2.5 flex-1">
            {[
              { ok: true,  text: "Até 10 registros por mês" },
              { ok: true,  text: "Veja quanto você já faturou" },
              { ok: false, text: "Aviso antes de ultrapassar o limite" },
              { ok: false, text: "Quanto ainda posso ganhar este ano?" },
              { ok: false, text: "Quanto posso cobrar por mês com segurança?" },
              { ok: false, text: "Exportar para o contador" },
            ].map(({ ok, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                {ok
                  ? <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  : <XCircle    className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />}
                <span className={ok ? "text-gray-600" : "text-gray-400 line-through"}>{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <div className="w-full py-3.5 rounded-xl border border-gray-300 bg-white text-center text-sm font-semibold text-gray-400">
              Plano atual
            </div>
            <p className="text-xs text-center mt-2 h-4 text-transparent select-none">—</p>
          </div>
        </div>

        {/* Pro */}
        <div className="flex flex-col rounded-2xl border-2 border-brand-500 bg-white relative shadow-lg shadow-brand-100 p-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
            ⭐ Mais escolhido por MEIs ativos
          </div>
          <div className="h-5 mb-1" aria-hidden />

          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3">Pro — Proteção total</p>
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-3xl font-extrabold text-gray-900">R$&nbsp;{precoExibido.toFixed(2).replace(".", ",")}</span>
            <span className="text-gray-400 text-sm">/mês</span>
          </div>
          <p className="text-xs text-brand-500 font-medium mb-4 h-4">
            {interval === "annual"
              ? `Cobrado R$ ${precoAnualTotal.toFixed(2).replace(".", ",")} por ano`
              : "Menos de R$ 0,70 por dia"}
          </p>

          <ul className="space-y-2.5 flex-1">
            {[
              "Aviso antes de ultrapassar o limite",
              "Quanto ainda posso ganhar este ano?",
              "Quanto posso cobrar por mês com segurança?",
              "Registros ilimitados — sem travar",
              "Exportar para o contador em segundos",
              "Histórico completo sempre disponível",
            ].map((text) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
            >
              {checkoutLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
                : <><ShieldCheck className="w-5 h-5" /> Proteger meu MEI agora</>}
            </button>
            <p className="text-xs text-center mt-2 h-4 text-gray-400">
              Cancele quando quiser · Sem fidelidade
            </p>
          </div>
        </div>
      </div>

      {/* ── Selos de confiança ── */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <span className="text-xs text-gray-400 flex items-center gap-1.5"><Lock className="w-3 h-3" /> Pagamento seguro via Stripe</span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> Cancele quando quiser</span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Seus dados protegidos</span>
      </div>

      {/* ── Bloco de risco ── */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">
        <p className="font-bold text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          O que pode acontecer se você ultrapassar o limite sem perceber:
        </p>
        <ul className="space-y-2">
          {[
            { emoji: "❌", text: "Você perde o MEI e vira Microempresa — com muito mais imposto" },
            { emoji: "💸", text: "Receita Federal pode cobrar INSS, ISS e ICMS retroativos" },
            { emoji: "📋", text: "Obrigação imediata de contratar contador (mais gasto)" },
            { emoji: "⚠️",  text: "Multas e pendências que aparecem na hora de fazer empréstimo ou financiamento" },
          ].map(({ emoji, text }) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-red-700">
              <span className="flex-shrink-0">{emoji}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <div className="bg-red-100 rounded-xl p-3">
          <p className="text-xs text-red-700 font-semibold text-center">
            O plano Pro custa menos de R$&nbsp;0,50 por dia.
            O problema que ele evita pode custar muito mais.
          </p>
        </div>
      </div>

      {/* ── Features detalhadas ── */}
      <div className="card space-y-5">
        <h3 className="font-bold text-gray-900">O que você ganha com o Pro</h3>
        <div className="space-y-4">
          {PRO_FEATURES.map(({ icon: Icon, headline, sub }) => (
            <div key={headline} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{headline}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-900 text-sm">Perguntas frequentes</h3>
        {[
          {
            q: "Posso cancelar a qualquer momento?",
            a: "Sim. Sem multa, sem burocracia. Você cancela em um clique e mantém o acesso Pro até o fim do período pago.",
          },
          {
            q: "Como funciona a cobrança?",
            a: "Todo mês (ou uma vez por ano, se preferir) é cobrado no cartão de crédito via Stripe. Você recebe o comprovante direto no e-mail.",
          },
          {
            q: "Vale a pena para quem ainda fatura pouco?",
            a: "Principalmente para quem fatura pouco — é quando o crescimento pega de surpresa. Saber exatamente quanto falta para o limite evita o susto no final do ano.",
          },
          {
            q: "Meus dados ficam seguros?",
            a: "Sim. Usamos banco de dados com criptografia e isolamento total. Só você acessa seus registros.",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
            <p className="font-semibold text-gray-900 text-sm">{q}</p>
            <p className="text-gray-500 text-sm mt-1">{a}</p>
          </div>
        ))}
      </div>

      {/* ── CTA final ── */}
      <div className="text-center space-y-3 pb-6">
        <p className="text-sm text-gray-500 font-medium">Ainda na dúvida?</p>
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="btn-primary px-8 py-4 text-base font-bold flex items-center justify-center gap-2 mx-auto"
        >
          {checkoutLoading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
            : <><ShieldCheck className="w-5 h-5" /> Proteger meu MEI por R$ {precoExibido.toFixed(2).replace(".", ",")}/mês</>}
        </button>
        <p className="text-xs text-gray-400">
          {interval === "annual"
            ? `R$ ${precoAnualTotal.toFixed(2).replace(".", ",")} cobrado uma vez por ano · Cancele quando quiser`
            : "R$ 19,90/mês · Cancele quando quiser · Sem fidelidade"}
        </p>
      </div>

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
