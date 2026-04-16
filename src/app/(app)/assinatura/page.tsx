"use client";

import { Suspense, useEffect, useState } from "react";
import { Loader2 as LoaderFallback } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Sparkles, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Profile {
  plano: string;
  subscription_status: string | null;
  stripe_subscription_id: string | null;
}

const proFeatures = [
  "Notas fiscais ilimitadas",
  "Dashboard completo com todos os indicadores",
  "Previsão inteligente de faturamento anual",
  "Sugestão de faturamento mensal seguro",
  "Alertas de risco em tempo real",
  "Exportação em Excel e CSV",
  "Histórico de anos anteriores",
  "Suporte prioritário por e-mail",
];

function AssinaturaContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const upgrade = searchParams.get("upgrade");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    loadProfile();

    if (success) toast.success("🎉 Assinatura Pro ativada com sucesso!");
    if (canceled) toast.error("Assinatura cancelada. Você pode tentar novamente.");
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

  const isPro = profile?.plano === "pro";
  const isPastDue = profile?.subscription_status === "past_due";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Assinatura
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie seu plano MEI Control</p>
      </div>

      {/* Status atual */}
      <div className={`card border-2 ${isPro ? "border-brand-200 bg-brand-50" : "border-gray-200"}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-gray-500">Plano atual</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {isPro ? "✨ Plano Pro" : "Plano Gratuito"}
            </p>
            {isPro && (
              <p className="text-sm text-brand-600 mt-1">
                Status: {profile?.subscription_status === "active" ? "✅ Ativo" : profile?.subscription_status}
              </p>
            )}
            {isPastDue && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Pagamento pendente — atualize seu cartão
              </p>
            )}
          </div>
          {isPro ? (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="btn-secondary flex items-center gap-2"
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Gerenciar assinatura
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="btn-primary flex items-center gap-2"
            >
              {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Assinar Pro — menos de R$ 0,50/dia
            </button>
          )}
        </div>
      </div>

      {/* Card de upgrade (se free) */}
      {!isPro && (
        <div className="card border-2 border-brand-100 relative overflow-hidden">
          {/* Badge */}
          <div className="absolute top-4 right-4 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            PRO
          </div>

          <div className="mb-2 flex items-baseline gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900">Plano Pro</h2>
            <span className="text-2xl font-extrabold text-brand-600">R$ 14,90<span className="text-base font-normal text-gray-500">/mês</span></span>
            <span className="text-xs text-gray-400 italic">menos de R$ 0,50 por dia</span>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Desbloqueie todas as funcionalidades e controle seu MEI sem limites.
          </p>

          <ul className="grid sm:grid-cols-2 gap-3 mb-8">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="btn-primary w-full text-base py-3 flex items-center justify-center gap-2"
          >
            {checkoutLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Aguarde...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Assinar Pro agora — R$ 14,90/mês</>
            )}
          </button>

          <div className="flex items-center gap-6 mt-4 justify-center">
            <span className="text-xs text-gray-400 flex items-center gap-1">🔒 Pagamento seguro via Stripe</span>
            <span className="text-xs text-gray-400">🔄 Cancele quando quiser</span>
            <span className="text-xs text-gray-400">💳 Aceita todos os cartões</span>
          </div>
        </div>
      )}

      {/* Comparação de planos */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Comparação de planos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Funcionalidade</th>
                <th className="text-center py-2 text-gray-500 font-medium">Gratuito</th>
                <th className="text-center py-2 text-brand-600 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["Notas fiscais", "20/mês", "Ilimitadas"],
                ["Dashboard", "Básico", "Completo"],
                ["Alertas de limite", "✅", "✅"],
                ["Previsão de faturamento", "❌", "✅"],
                ["Sugestão mensal", "❌", "✅"],
                ["Exportação Excel/CSV", "❌", "✅"],
                ["Suporte", "Comunidade", "Prioritário"],
              ].map(([feature, free, pro]) => (
                <tr key={feature}>
                  <td className="py-2.5 text-gray-700">{feature}</td>
                  <td className="py-2.5 text-center text-gray-500">{free}</td>
                  <td className="py-2.5 text-center text-brand-700 font-medium">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Perguntas frequentes</h3>
        <div className="space-y-4">
          {[
            {
              q: "Posso cancelar quando quiser?",
              a: "Sim! Cancele a qualquer momento pelo portal do cliente Stripe. Você mantém o acesso Pro até o fim do período pago.",
            },
            {
              q: "Como funciona a cobrança?",
              a: "A cobrança é mensal e automática via cartão de crédito. Você recebe um e-mail com a fatura a cada renovação.",
            },
            {
              q: "Meus dados ficam seguros?",
              a: "Sim. Usamos Supabase com criptografia e Row Level Security. Apenas você acessa seus dados.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="font-medium text-gray-900 text-sm">{q}</p>
              <p className="text-gray-500 text-sm mt-1">{a}</p>
            </div>
          ))}
        </div>
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
