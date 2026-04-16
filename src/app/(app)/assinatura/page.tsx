"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader2 as LoaderFallback } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle, XCircle, Sparkles, CreditCard,
  AlertCircle, Loader2, ShieldCheck, TrendingUp, Bell, FileDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface Profile {
  plano: string;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
}

// ── Recursos do plano Pro orientados à dor ─────────────────────────────────
const proFeatures = [
  { icon: Bell,        text: "Alertas automáticos antes de ultrapassar o limite" },
  { icon: TrendingUp,  text: "Saiba exatamente quanto ainda pode faturar no ano" },
  { icon: TrendingUp,  text: "Previsão de quanto faturar por mês com segurança" },
  { icon: CheckCircle, text: "Notas fiscais ilimitadas — sem travar no mês" },
  { icon: FileDown,    text: "Exportação em Excel/CSV para sua contabilidade" },
  { icon: ShieldCheck, text: "Histórico de anos anteriores sempre disponível" },
];

function AssinaturaContent() {
  const searchParams = useSearchParams();
  const success  = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const [profile, setProfile]               = useState<Profile | null>(null);
  const [loading, setLoading]               = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading]   = useState(false);

  useEffect(() => {
    loadProfile();
    if (success)  toast.success("🎉 Plano Pro ativado! Seu MEI está protegido.");
    if (canceled) toast.error("Assinatura cancelada. Você pode tentar novamente.");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, canceled]);

  async function loadProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("plano, subscription_status, stripe_subscription_id")
      .eq("id", user.id)
      .single();
    setProfile(data);
    setLoading(false);
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      window.location.href = url;
    } catch {
      toast.error("Erro ao iniciar checkout.");
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

  const isPro      = profile?.plano === "pro";
  const isPastDue  = profile?.subscription_status === "past_due";

  // ── Tela do assinante Pro ─────────────────────────────────────────────────
  if (isPro) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="card border-2 border-brand-200 bg-brand-50 text-center py-8">
          <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-brand-600" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">Plano Pro ativo</p>
          <h1 className="text-2xl font-bold text-gray-900">Seu MEI está protegido 🎉</h1>
          <p className="text-gray-500 text-sm mt-2">
            Você tem acesso completo a todos os recursos de controle e previsão.
          </p>
          {isPastDue && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Pagamento pendente — atualize seu cartão
            </div>
          )}
          <p className="text-xs text-brand-500 mt-3">
            Status: {profile?.subscription_status === "active" ? "✅ Ativo" : profile?.subscription_status}
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
          Cancele quando quiser — sem multa, sem burocracia.
        </p>
      </div>
    );
  }

  // ── Tela de conversão (plano Free) ────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Hero: pergunta que gera dor ── */}
      <div className="text-center space-y-2 pt-2">
        <p className="inline-block bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          ⚠️ Você sabe quanto ainda pode faturar este ano?
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          Ultrapassar o limite do MEI<br className="hidden sm:block" /> pode custar muito caro
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
          Quem passa de R$&nbsp;81.000 sem perceber pode perder o MEI, pagar impostos retroativos
          e ter problemas com a Receita Federal.
        </p>
      </div>

      {/* ── Stat de prova social / urgência ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">📊</span>
        <p className="text-sm text-amber-800">
          <span className="font-bold">Mais de 60% dos MEIs não controlam o faturamento corretamente</span>
          {" "}e só descobrem o problema quando já ultrapassaram o limite.
        </p>
      </div>

      {/* ── Cards dos planos ── */}
      <div className="grid sm:grid-cols-2 gap-4 items-start">

        {/* Plano Gratuito — propositalmente fraco */}
        <div className="card border border-gray-200 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Gratuito</p>
          <p className="text-2xl font-bold text-gray-700">R$ 0</p>
          <p className="text-xs text-gray-400 mb-4">para sempre</p>

          <ul className="space-y-2.5 mb-6">
            {[
              { ok: true,  text: "Até 10 notas por mês" },
              { ok: true,  text: "Dashboard básico de faturamento" },
              { ok: false, text: "Alertas antes de ultrapassar o limite" },
              { ok: false, text: "Saiba quanto ainda pode faturar" },
              { ok: false, text: "Previsão e sugestão mensal" },
              { ok: false, text: "Exportação para contabilidade" },
            ].map(({ ok, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                {ok
                  ? <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  : <XCircle    className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />}
                <span className={ok ? "text-gray-600" : "text-gray-400 line-through"}>{text}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-400 text-center">Plano atual</p>
        </div>

        {/* Plano Pro — hero visual */}
        <div className="card border-2 border-brand-500 bg-white relative shadow-lg shadow-brand-100">
          {/* Badge destaque */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
            ⭐ Mais escolhido por MEIs ativos
          </div>

          <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-3 mt-2">Pro</p>
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-3xl font-extrabold text-gray-900">R$&nbsp;14,90</span>
            <span className="text-gray-400 text-sm">/mês</span>
          </div>
          <p className="text-xs text-brand-500 font-medium mb-4">Menos de R$&nbsp;0,50 por dia</p>

          <ul className="space-y-2.5 mb-6">
            {proFeatures.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <Icon className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
          >
            {checkoutLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
            ) : (
              <><ShieldCheck className="w-5 h-5" /> Proteger meu MEI agora</>
            )}
          </button>
        </div>
      </div>

      {/* ── Selos de confiança ── */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">🔒 Pagamento 100% seguro (Stripe)</span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5">🔄 Cancele quando quiser</span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5">📅 Sem fidelidade</span>
        <span className="text-xs text-gray-400 flex items-center gap-1.5">🛡️ Seus dados protegidos</span>
      </div>

      {/* ── O que acontece se eu não controlar? (bloco de risco) ── */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 space-y-3">
        <p className="font-semibold text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          O que pode acontecer se você ultrapassar sem perceber:
        </p>
        <ul className="space-y-1.5">
          {[
            "Perda do enquadramento como MEI",
            "Cobrança retroativa de impostos (INSS, ISS, ICMS)",
            "Obrigatoriedade de contratar contador imediatamente",
            "Multas e pendências na Receita Federal",
          ].map((r) => (
            <li key={r} className="flex items-start gap-2 text-sm text-red-700">
              <span className="text-red-400 mt-0.5 flex-shrink-0">→</span>
              {r}
            </li>
          ))}
        </ul>
        <p className="text-xs text-red-500 font-medium">
          O plano Pro custa menos de R$&nbsp;0,50 por dia. O problema que ele evita pode custar muito mais.
        </p>
      </div>

      {/* ── Comparação visual compacta ── */}
      <div className="card overflow-x-auto">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Comparação detalhada</h3>
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-gray-400 font-medium text-xs">Recurso</th>
              <th className="text-center py-2 text-gray-400 font-medium text-xs">Gratuito</th>
              <th className="text-center py-2 text-brand-600 font-bold text-xs">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              ["Notas por mês",                    "10",  "Ilimitadas"],
              ["Alerta antes de ultrapassar limite","❌",  "✅"],
              ["Quanto ainda pode faturar",         "❌",  "✅"],
              ["Previsão e sugestão mensal",        "❌",  "✅"],
              ["Exportação Excel/CSV",              "❌",  "✅"],
              ["Histórico de anos anteriores",      "❌",  "✅"],
            ].map(([feat, free, pro]) => (
              <tr key={feat}>
                <td className="py-2.5 text-gray-700">{feat}</td>
                <td className="py-2.5 text-center text-gray-400">{free}</td>
                <td className="py-2.5 text-center text-brand-700 font-semibold">{pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FAQ ── */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm">Dúvidas frequentes</h3>
        {[
          {
            q: "Posso cancelar quando quiser?",
            a: "Sim, a qualquer momento, sem multa. Você mantém acesso Pro até o fim do mês pago.",
          },
          {
            q: "Como é feita a cobrança?",
            a: "Mensal e automática via cartão de crédito, processada pelo Stripe. Você recebe o comprovante por e-mail.",
          },
          {
            q: "Meus dados ficam seguros?",
            a: "Sim. Utilizamos Supabase com criptografia e isolamento de dados — ninguém além de você acessa suas informações.",
          },
          {
            q: "Vale a pena para quem fatura pouco?",
            a: "Principalmente para quem fatura pouco, porque é quando o crescimento mais surpreende. Saber o limite restante evita susto no final do ano.",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
            <p className="font-medium text-gray-900 text-sm">{q}</p>
            <p className="text-gray-500 text-sm mt-1">{a}</p>
          </div>
        ))}
      </div>

      {/* ── CTA final ── */}
      <div className="text-center space-y-3 pb-4">
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="btn-primary px-8 py-4 text-base font-bold flex items-center justify-center gap-2 mx-auto"
        >
          {checkoutLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Quero controle total do meu MEI</>
          )}
        </button>
        <p className="text-xs text-gray-400">
          R$&nbsp;14,90/mês • Cancele quando quiser • Sem fidelidade
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
