"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { LIMITE_MEI } from "@/lib/constants";
const ANO_ATUAL   = new Date().getFullYear();
const MES_ATUAL   = new Date().getMonth() + 1; // 1-12
const MESES_NOMES = [
  "janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro",
];

const SUGESTOES = [0, 10000, 20000, 30000, 40000, 60000];

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function getStatus(pct: number) {
  if (pct === 0)    return { label: "Sem dados",     cor: "text-gray-500",   barCor: "bg-gray-300",   bg: "bg-gray-50   border-gray-200"   };
  if (pct <= 40)    return { label: "Seguro",         cor: "text-brand-600",  barCor: "bg-brand-500",  bg: "bg-brand-50  border-brand-200"  };
  if (pct <= 69)    return { label: "Atenção",        cor: "text-yellow-600", barCor: "bg-yellow-400", bg: "bg-yellow-50 border-yellow-200" };
  if (pct <= 84)    return { label: "Risco moderado", cor: "text-orange-600", barCor: "bg-orange-400", bg: "bg-orange-50 border-orange-200" };
  if (pct < 100)    return { label: "Risco alto",     cor: "text-red-600",    barCor: "bg-red-500",    bg: "bg-red-50    border-red-200"    };
  return             { label: "Limite ultrapassado!", cor: "text-red-700",    barCor: "bg-red-600",    bg: "bg-red-50    border-red-300"    };
}

function getMensagem(pct: number, restante: number, porMes: number) {
  if (pct === 0) return "Digite quanto você já faturou este ano para ver sua situação.";
  if (pct <= 40) return `Tudo certo! Você ainda pode faturar ${fmtBRL(restante)} — ou seja, até ${fmtBRL(porMes)}/mês pelo resto do ano.`;
  if (pct <= 69) return `Você já passou da metade. Ainda dá — mas fique de olho. Limite seguro: ${fmtBRL(porMes)}/mês.`;
  if (pct <= 84) return `Cuidado! Com ${fmtBRL(porMes)}/mês você chega exato no limite. Não contrate serviços novos sem calcular.`;
  if (pct < 100) return `Atenção máxima! Você está a ${fmtBRL(restante)} do limite. Consulte um contador antes de emitir novas notas.`;
  return `Você ultrapassou o limite de R$ 81.000. Procure um contador imediatamente para regularizar sua situação.`;
}

export function CalculadoraMEI() {
  const [valorInput, setValorInput]     = useState("");
  const [selSugestao, setSelSugestao]   = useState<number | null>(null);
  const [animWidth, setAnimWidth]       = useState(0);
  const [calculou, setCalculou]         = useState(false);

  const valorNumerico = selSugestao !== null
    ? selSugestao
    : (parseFloat(valorInput.replace(/\./g, "").replace(",", ".")) || 0);

  const pct         = Math.min((valorNumerico / LIMITE_MEI) * 100, 100);
  const restante    = Math.max(LIMITE_MEI - valorNumerico, 0);
  const mesesRestam = Math.max(12 - MES_ATUAL + 1, 1);
  const porMes      = Math.floor(restante / mesesRestam);
  const status      = getStatus(pct);
  const mensagem    = getMensagem(pct, restante, porMes);

  // Animar barra ao calcular
  useEffect(() => {
    if (valorNumerico === 0) { setAnimWidth(0); return; }
    setAnimWidth(0);
    const t = setTimeout(() => setAnimWidth(pct), 80);
    return () => clearTimeout(t);
  }, [valorNumerico, pct]);

  function handleCalcular() {
    if (valorNumerico === 0) return;
    setCalculou(true);
    track("calculadora_mei_used", { percentual: Math.round(pct) });
  }

  function handleSugestao(v: number) {
    setSelSugestao(v);
    setValorInput("");
    setCalculou(true);
    track("calculadora_mei_used", { percentual: Math.round((v / LIMITE_MEI) * 100) });
  }

  const mesAtualNome   = MESES_NOMES[MES_ATUAL - 1];
  const mesUltimoNome  = MESES_NOMES[11];

  return (
    <div className="card shadow-md space-y-6">

      {/* ── Título do card ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Calculadora de limite MEI {ANO_ATUAL}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Informe quanto você já faturou de janeiro até {mesAtualNome}.
        </p>
      </div>

      {/* ── Input principal ── */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Quanto você já faturou em {ANO_ATUAL}?
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none">R$</span>
          <input
            type="text"
            inputMode="decimal"
            className="input pl-10 text-lg font-bold text-gray-900 h-14"
            placeholder="0"
            value={valorInput}
            onChange={(e) => { setValorInput(e.target.value); setSelSugestao(null); setCalculou(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleCalcular(); }}
          />
        </div>

        {/* Sugestões rápidas */}
        <div className="flex flex-wrap gap-2">
          {SUGESTOES.filter(v => v > 0).map((v) => (
            <button
              key={v}
              onClick={() => handleSugestao(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selSugestao === v
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {fmtBRL(v)}
            </button>
          ))}
        </div>

        {/* Botão calcular (para quem digita) */}
        {selSugestao === null && (
          <button
            onClick={handleCalcular}
            disabled={valorNumerico === 0}
            className="btn-primary w-full py-3 font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Calcular minha situação →
          </button>
        )}
      </div>

      {/* ── Resultado ── */}
      {calculou && valorNumerico >= 0 && (

        <div className="space-y-5 pt-2 border-t border-gray-100">

          {/* Barra de progresso animada */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{fmtBRL(valorNumerico)}</p>
                <p className="text-xs text-gray-400">faturado até agora</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-600">{fmtBRL(LIMITE_MEI)}</p>
                <p className="text-xs text-gray-400">limite anual</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
              <div
                className={`h-5 rounded-full transition-all duration-700 ease-out ${status.barCor}`}
                style={{ width: `${animWidth}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className={`font-bold ${status.cor}`}>
                {pct.toFixed(1)}% utilizado — {status.label}
              </span>
              <span className="text-gray-400">{pct.toFixed(0)}% de R$ 81.000</span>
            </div>
          </div>

          {/* Cards de resultado */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Ainda disponível</p>
              <p className={`text-lg font-extrabold ${pct < 100 ? "text-brand-600" : "text-red-600"}`}>
                {pct < 100 ? fmtBRL(restante) : "R$ 0"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Limite mensal seguro</p>
              <p className="text-lg font-extrabold text-gray-700">
                {pct < 100 ? fmtBRL(porMes) : "—"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-400 mb-1">Meses restantes ({ANO_ATUAL})</p>
              <p className="text-lg font-extrabold text-gray-700">{mesesRestam}</p>
              <p className="text-xs text-gray-400">até {mesUltimoNome}</p>
            </div>
          </div>

          {/* Mensagem contextual */}
          <div className={`rounded-xl border px-4 py-3 ${status.bg}`}>
            <p className={`text-sm font-medium ${status.cor}`}>{mensagem}</p>
          </div>

          {/* CTA de conversão */}
          <div className="bg-gradient-to-r from-petroleo-600 to-petroleo-700 rounded-xl p-5 text-white space-y-3">
            <p className="font-bold text-base">
              {pct >= 70
                ? "⚠️ Monitore isso de perto — é grátis"
                : "✅ Controle automático, sem planilha"}
            </p>
            <p className="text-petroleo-200 text-sm leading-relaxed">
              {pct >= 70
                ? "Com o Portal MEIguia você recebe alertas automáticos e sabe exatamente quando parar de emitir notas."
                : "Registre suas notas no Portal MEIguia e o sistema avisa automaticamente quando você se aproximar do limite."}
            </p>
            <Link
              href="/cadastro"
              onClick={() => track("calculadora_cta_clicked", { percentual: Math.round(pct) })}
              className="block w-full text-center bg-white text-petroleo-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              Criar conta grátis e monitorar automaticamente →
            </Link>
            <p className="text-xs text-petroleo-400 text-center">
              Sem cartão de crédito · Leva menos de 1 minuto
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center">
            Este cálculo é informativo e considera apenas o valor informado acima. Consulte seu contador para decisões fiscais.
          </p>

        </div>
      )}
    </div>
  );
}
