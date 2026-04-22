"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { track } from "@vercel/analytics";
import { Loader2, ChevronLeft, HelpCircle } from "lucide-react";
import { LIMITE_MEI } from "@/lib/constants";

interface OnboardingModalProps {
  userId: string;
  userName: string;
}
const ANO_ATUAL  = new Date().getFullYear();
const MES_ATUAL  = new Date().getMonth() + 1; // 1-12

// ── Opções de frequência mensal ───────────────────────────────────────────────
const OPCOES_FREQ = [
  { label: "1 por mês",     valor: 1  },
  { label: "2 a 3 por mês", valor: 2.5},
  { label: "4 a 6 por mês", valor: 5  },
  { label: "Mais de 6",     valor: 8  },
];

// ── Sugestões de valor médio por serviço ─────────────────────────────────────
const SUGESTOES_VALOR = [
  { label: "R$ 300",   valor: 300   },
  { label: "R$ 500",   valor: 500   },
  { label: "R$ 800",   valor: 800   },
  { label: "R$ 1.500", valor: 1500  },
  { label: "R$ 3.000", valor: 3000  },
];

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function barColor(pct: number) {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-orange-500";
  if (pct >= 40) return "bg-yellow-500";
  return "bg-brand-500";
}
function barText(pct: number) {
  if (pct >= 90) return "text-red-600";
  if (pct >= 70) return "text-orange-600";
  return "text-brand-600";
}

// ── Componente de pré-visualização do dashboard ───────────────────────────────
function DashboardPreview({ valor }: { valor: number }) {
  const pct  = Math.min((valor / LIMITE_MEI) * 100, 100);
  const disp = Math.max(LIMITE_MEI - valor, 0);
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Seu dashboard ficará assim</p>
      <div className="flex justify-between text-sm font-semibold">
        <span className="text-gray-800">{fmtBRL(valor)}</span>
        <span className="text-gray-400">de {fmtBRL(LIMITE_MEI)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full transition-all duration-700 ease-out ${barColor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className={`font-bold ${barText(pct)}`}>{pct.toFixed(0)}% do limite usado</span>
        <span className="text-gray-400">{fmtBRL(disp)} disponível</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function OnboardingModal({ userId, userName }: OnboardingModalProps) {
  const router = useRouter();
  const firstName = userName?.split(" ")[0] || "você";

  // step: "entrada" | "direto" | "freq" | "valor" | "estimativa" | "confirmacao"
  const [step, setStep]           = useState<string>("entrada");
  const [saving, setSaving]       = useState(false);

  // Fluxo direto
  const [valorDireto, setValorDireto]     = useState("");
  const [selDireto, setSelDireto]         = useState<number | null>(null);

  // Fluxo assistido
  const [freqSel, setFreqSel]             = useState<number | null>(null);
  const [valorMedioSel, setValorMedioSel] = useState<number | null>(null);
  const [valorMedioInput, setValorMedioInput] = useState("");
  const [mostrarInputValor, setMostrarInputValor] = useState(false);

  // ── Valor final calculado ─────────────────────────────────────────────────
  function getValorFinal(): number {
    if (step === "direto" || step === "confirmacao" && selDireto !== null) {
      if (selDireto !== null) return selDireto;
      return parseFloat(valorDireto.replace(/\./g, "").replace(",", ".")) || 0;
    }
    // Fluxo assistido
    const vm = valorMedioSel !== null
      ? valorMedioSel
      : parseFloat(valorMedioInput.replace(/\./g, "").replace(",", ".")) || 0;
    if (!freqSel || !vm) return 0;
    return Math.round(freqSel * vm * MES_ATUAL);
  }

  // ── Salvar e ir para dashboard ────────────────────────────────────────────
  async function handleConfirmar() {
    setSaving(true);
    const supabase = createClient();
    const valor = getValorFinal();

    if (valor > 0) {
      await supabase.from("notas_fiscais").insert({
        user_id: userId,
        valor,
        data: `${ANO_ATUAL}-01-01`,
        descricao: "Faturamento acumulado antes do cadastro",
        cliente: null,
        numero_nf: null,
      });
    }

    await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
    track("onboarding_completed", { faturamento_inicial: valor, fluxo: step });
    router.push("/dashboard");
    router.refresh();
  }

  // ── Progresso visual ──────────────────────────────────────────────────────
  const STEPS_ASSISTIDO = ["entrada", "freq", "valor", "estimativa"];
  const stepIdx = STEPS_ASSISTIDO.indexOf(step);
  const totalSteps = 3; // freq → valor → estimativa
  const currentStepNum = stepIdx > 0 ? stepIdx : 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-petroleo-600 to-petroleo-800 px-6 pt-6 pb-5 text-white">
          <div className="flex items-center gap-3 mb-1">
            {(step !== "entrada" && step !== "direto") && (
              <button
                onClick={() => {
                  if (step === "freq")       setStep("entrada");
                  if (step === "valor")      setStep("freq");
                  if (step === "estimativa") setStep("valor");
                }}
                className="text-petroleo-300 hover:text-white transition -ml-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <p className="text-xs text-petroleo-300">Olá, {firstName}! 👋</p>
              <p className="text-sm font-bold">
                {step === "entrada"    && "Vamos configurar seu dashboard"}
                {step === "direto"     && "Qual foi o total até agora?"}
                {step === "freq"       && "Passo 1 de 3"}
                {step === "valor"      && "Passo 2 de 3"}
                {step === "estimativa" && "Passo 3 de 3 — sua estimativa"}
              </p>
            </div>
          </div>

          {/* Barra de progresso nos passos assistidos */}
          {["freq", "valor", "estimativa"].includes(step) && (
            <div className="flex gap-1 mt-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`flex-1 h-1 rounded-full transition-all ${n <= currentStepNum ? "bg-white" : "bg-petroleo-600"}`} />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 pt-5 pb-6">

          {/* ── PASSO: ENTRADA ────────────────────────────────────────────── */}
          {step === "entrada" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center mb-4">
                Para configurar seu painel, precisamos saber quanto você já faturou em {ANO_ATUAL}.
              </p>
              <button
                onClick={() => setStep("direto")}
                className="w-full text-left border-2 border-gray-200 hover:border-brand-400 rounded-xl p-4 transition group"
              >
                <p className="font-semibold text-gray-800 group-hover:text-brand-700">✅ Sei o valor — vou digitar</p>
                <p className="text-xs text-gray-400 mt-0.5">Você lembra mais ou menos quanto faturou este ano</p>
              </button>
              <button
                onClick={() => setStep("freq")}
                className="w-full text-left border-2 border-gray-200 hover:border-brand-400 rounded-xl p-4 transition group"
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800 group-hover:text-brand-700">Não tenho certeza — me ajuda a estimar</p>
                    <p className="text-xs text-gray-400 mt-0.5">Responda 2 perguntas simples e calculamos para você</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setSelDireto(0);
                  handleConfirmar();
                }}
                className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition"
              >
                Ainda não faturei nada em {ANO_ATUAL} →
              </button>
            </div>
          )}

          {/* ── PASSO: DIRETO ─────────────────────────────────────────────── */}
          {step === "direto" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Não precisa ser exato — um valor aproximado já ajuda muito.</p>
              <div className="grid grid-cols-2 gap-2">
                {[10000, 20000, 30000, 40000, 60000, 70000].map((v) => (
                  <button
                    key={v}
                    onClick={() => { setSelDireto(v); setValorDireto(""); }}
                    className={`py-3 px-3 min-h-[44px] rounded-xl text-sm font-semibold border-2 transition-all ${
                      selDireto === v
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
                    }`}
                  >
                    {fmtBRL(v)}
                  </button>
                ))}
              </div>
              <div>
                <label className="label text-xs">Ou digite o valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input
                    type="text" inputMode="decimal"
                    className="input pl-9"
                    placeholder="Outro valor"
                    value={valorDireto}
                    onChange={(e) => { setValorDireto(e.target.value); setSelDireto(null); }}
                  />
                </div>
              </div>
              {(selDireto !== null || valorDireto) && (
                <>
                  <DashboardPreview valor={getValorFinal()} />
                  <button
                    onClick={handleConfirmar}
                    disabled={saving}
                    className="btn-primary w-full py-3.5 font-bold flex items-center justify-center gap-2"
                  >
                    {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Configurando...</> : "Ver meu dashboard →"}
                  </button>
                </>
              )}
              <p className="text-xs text-gray-400 text-center">
                Você pode corrigir esse valor depois registrando suas notas.
              </p>
            </div>
          )}

          {/* ── PASSO: FREQUÊNCIA ─────────────────────────────────────────── */}
          {step === "freq" && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Em média, quantos serviços você faz por mês?</p>
                <p className="text-xs text-gray-400">Pode ser uma entrega, uma consulta, uma obra — qualquer coisa que você cobra.</p>
              </div>
              <div className="space-y-2">
                {OPCOES_FREQ.map(({ label, valor }) => (
                  <button
                    key={label}
                    onClick={() => setFreqSel(valor)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                      freqSel === valor
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 hover:border-brand-300 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { if (freqSel) setStep("valor"); }}
                disabled={!freqSel}
                className="btn-primary w-full py-3 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próximo →
              </button>
            </div>
          )}

          {/* ── PASSO: VALOR MÉDIO ────────────────────────────────────────── */}
          {step === "valor" && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-800 mb-1">Quanto você costuma cobrar por serviço?</p>
                <p className="text-xs text-gray-400">Valor médio, não precisa ser exato. Se variar muito, use um valor no meio.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUGESTOES_VALOR.map(({ label, valor }) => (
                  <button
                    key={label}
                    onClick={() => { setValorMedioSel(valor); setValorMedioInput(""); setMostrarInputValor(false); }}
                    className={`py-3 px-3 min-h-[44px] rounded-xl text-sm font-semibold border-2 transition-all ${
                      valorMedioSel === valor
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 hover:border-brand-300 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => { setValorMedioSel(null); setMostrarInputValor(true); }}
                  className={`py-3 px-3 min-h-[44px] rounded-xl text-sm font-semibold border-2 transition-all ${
                    mostrarInputValor ? "border-brand-500 bg-brand-50 text-brand-700" : "border-dashed border-gray-300 text-gray-500 hover:border-brand-300"
                  }`}
                >
                  Outro valor
                </button>
              </div>
              {mostrarInputValor && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input
                    type="text" inputMode="decimal" autoFocus
                    className="input pl-9"
                    placeholder="Ex: 1.200"
                    value={valorMedioInput}
                    onChange={(e) => setValorMedioInput(e.target.value)}
                  />
                </div>
              )}
              <button
                onClick={() => { if (valorMedioSel || valorMedioInput) setStep("estimativa"); }}
                disabled={!valorMedioSel && !valorMedioInput}
                className="btn-primary w-full py-3 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Calcular minha estimativa →
              </button>
            </div>
          )}

          {/* ── PASSO: ESTIMATIVA ─────────────────────────────────────────── */}
          {step === "estimativa" && (() => {
            const vm   = valorMedioSel ?? (parseFloat(valorMedioInput.replace(/\./g, "").replace(",", ".")) || 0);
            const freq = freqSel ?? 1;
            const totalEstimado = Math.round(freq * vm * MES_ATUAL);
            const pct  = Math.min((totalEstimado / LIMITE_MEI) * 100, 100);
            const disp = Math.max(LIMITE_MEI - totalEstimado, 0);

            const freqLabel = OPCOES_FREQ.find(o => o.valor === freq)?.label ?? `${freq} serviços`;

            const status =
              pct >= 90 ? { cor: "text-red-600", bg: "bg-red-50 border-red-200", msg: "Atenção: você está muito perto do limite. Cuidado com os próximos serviços." } :
              pct >= 70 ? { cor: "text-orange-600", bg: "bg-orange-50 border-orange-200", msg: "Você já passou de 70% do limite. Vale ficar de olho." } :
              pct >= 40 ? { cor: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", msg: "Você está na metade do caminho. Tudo sob controle." } :
                          { cor: "text-brand-600", bg: "bg-brand-50 border-brand-200", msg: "Boa! Você ainda tem bastante espaço para faturar este ano." };

            return (
              <div className="space-y-4">
                {/* Cálculo explicado */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Como chegamos nisso</p>
                  <div className="flex justify-between text-gray-600">
                    <span>{freqLabel} × {fmtBRL(vm)}</span>
                    <span className="text-gray-400">por mês</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>× {MES_ATUAL} meses em {ANO_ATUAL}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-800">
                    <span>Estimativa total</span>
                    <span className="text-brand-600">{fmtBRL(totalEstimado)}</span>
                  </div>
                </div>

                {/* Barra + status */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-800">{fmtBRL(totalEstimado)}</span>
                    <span className="text-gray-400">de {fmtBRL(LIMITE_MEI)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full transition-all duration-700 ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={`font-bold ${barText(pct)}`}>{pct.toFixed(0)}% do limite</span>
                    <span className="text-gray-400">{fmtBRL(disp)} disponível</span>
                  </div>
                </div>

                {/* Mensagem de status */}
                <div className={`rounded-xl border px-4 py-3 text-sm ${status.bg}`}>
                  <p className={`font-semibold ${status.cor}`}>{status.msg}</p>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Esse é um número estimado. Conforme você registrar suas notas, ele ficará mais preciso.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleConfirmar}
                    disabled={saving}
                    className="btn-primary w-full py-3.5 font-bold flex items-center justify-center gap-2"
                  >
                    {saving
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Configurando...</>
                      : "Usar essa estimativa e ver dashboard →"}
                  </button>
                  <button
                    onClick={() => setStep("valor")}
                    className="w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 transition"
                  >
                    ← Corrigir os valores
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
