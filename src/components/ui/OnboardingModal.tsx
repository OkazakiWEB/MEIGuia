"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ArrowRight, Target, Bell, TrendingUp, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface OnboardingModalProps {
  userId: string;
  userName: string;
}

const steps = [
  {
    id: 1,
    icon: Target,
    title: "Bem-vindo ao Portal MEIguia!",
    subtitle: "Controle seu faturamento em 3 passos",
    content: (
      <div className="space-y-3">
        {[
          { icon: "📋", text: "Registre suas notas fiscais emitidas" },
          { icon: "📊", text: "Acompanhe seu faturamento em tempo real" },
          { icon: "🔔", text: "Receba alertas antes de atingir o limite" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <span className="text-xl">{icon}</span>
            <p className="text-sm text-gray-700">{text}</p>
          </div>
        ))}
      </div>
    ),
    cta: "Começar",
  },
  {
    id: 2,
    icon: Bell,
    title: "Alertas automáticos",
    subtitle: "Você nunca mais será pego de surpresa",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          O Portal MEIguia te avisa por e-mail quando você atingir:
        </p>
        {[
          { pct: "70%", color: "bg-yellow-100 text-yellow-800 border-yellow-200", msg: "Você usou 70% do limite — hora de planejar" },
          { pct: "90%", color: "bg-orange-100 text-orange-800 border-orange-200", msg: "Atenção: restam apenas 10% do limite" },
          { pct: "100%", color: "bg-red-100 text-red-800 border-red-200", msg: "Limite atingido — não emita mais notas" },
        ].map(({ pct, color, msg }) => (
          <div key={pct} className={`flex items-start gap-3 border rounded-xl p-3 ${color}`}>
            <span className="font-bold text-sm w-10 flex-shrink-0">{pct}</span>
            <p className="text-xs">{msg}</p>
          </div>
        ))}
      </div>
    ),
    cta: "Entendi",
  },
  {
    id: 3,
    icon: TrendingUp,
    title: "Tudo pronto!",
    subtitle: "Sua primeira nota leva menos de 30 segundos",
    content: (
      <div className="space-y-4">
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-brand-700 mb-2">Plano Gratuito — sem cartão</p>
          <ul className="space-y-1.5">
            {[
              "10 notas fiscais por mês",
              "Dashboard com alertas de limite",
              "Acesso imediato",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-brand-600">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-agua-50 border border-agua-100 rounded-xl p-3 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-agua-600 flex-shrink-0" />
          <p className="text-xs text-agua-700">
            <span className="font-semibold">Plano Pro</span> — notas ilimitadas + previsões por menos de R$ 0,50/dia
          </p>
        </div>
      </div>
    ),
    cta: "Criar minha primeira nota",
  },
];

export function OnboardingModal({ userId, userName }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [completing, setCompleting] = useState(false);
  const router = useRouter();

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  async function handleNext() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    // Último passo: marcar onboarding como completo e ir para nova nota
    setCompleting(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);

    toast.success("Bem-vindo ao Portal MEIguia!");
    router.push("/notas/nova");
    router.refresh();
  }

  async function handleSkip() {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-5 pb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 h-2 bg-brand-600"
                  : i < step
                  ? "w-2 h-2 bg-brand-300"
                  : "w-2 h-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-2 text-center">
          <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon className="w-6 h-6 text-brand-600" />
          </div>
          {step === 0 && (
            <p className="text-sm text-gray-500 mb-1">
              Olá, <span className="font-semibold text-gray-700">{userName?.split(" ")[0] || "seja bem-vindo"}</span>! 👋
            </p>
          )}
          <h2 className="text-xl font-bold text-gray-900">{current.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{current.subtitle}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {current.content}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={handleNext}
            disabled={completing}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {completing ? "Aguarde..." : current.cta}
            {!completing && <ArrowRight className="w-4 h-4" />}
          </button>
          {step < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 py-1.5 text-center"
            >
              Pular introdução
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
