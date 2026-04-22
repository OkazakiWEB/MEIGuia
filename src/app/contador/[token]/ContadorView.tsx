"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { ShieldCheck, TrendingUp, FileText, Calendar, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { LIMITE_MEI } from "@/lib/constants";
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

interface Nota {
  id: string;
  data: string;
  descricao: string | null;
  cliente: string | null;
  numero_nf: string | null;
  valor: number;
}

interface DadosContador {
  nomeUsuario: string;
  email: string;
  totalAno: number;
  notas: Nota[];
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}

function fmtData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function barColor(pct: number) {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-orange-400";
  if (pct >= 40) return "bg-yellow-400";
  return "bg-brand-500";
}

export function ContadorView({ token }: { token: string }) {
  const [dados, setDados]   = useState<DadosContador | null>(null);
  const [erro, setErro]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [barW, setBarW]     = useState(0);

  const ano = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/contador/token", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.error) { setErro(json.error); return; }
        setDados(json);
        const pct = Math.min((Number(json.totalAno) / LIMITE_MEI) * 100, 100);
        setTimeout(() => setBarW(pct), 120);
      })
      .catch(() => setErro("Erro ao carregar dados. Tente novamente."))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // ── Erro / token inválido ────────────────────────────────────────────────
  if (erro || !dados) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full card text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h1 className="text-lg font-bold text-gray-800">Link inválido ou expirado</h1>
          <p className="text-sm text-gray-500">
            {erro === "Token revogado." && "O MEI revogou o acesso deste link."}
            {erro === "Token expirado."  && "Este link de acesso expirou."}
            {(!erro || erro === "Token inválido.") && "Este link não existe ou foi removido."}
          </p>
          <p className="text-xs text-gray-400">
            Peça ao MEI para gerar um novo link de acesso no Portal MEIguia.
          </p>
          <Link href="/" className="text-sm text-brand-600 hover:underline">
            Conheça o Portal MEIguia →
          </Link>
        </div>
      </div>
    );
  }

  // ── Dados ─────────────────────────────────────────────────────────────────
  const notasReais   = dados.notas.filter(n => n.descricao !== "Faturamento acumulado antes do cadastro");
  const total        = dados.totalAno;
  const pct          = Math.min((total / LIMITE_MEI) * 100, 100);
  const restante     = Math.max(LIMITE_MEI - total, 0);
  const mesAtual     = new Date().getMonth();

  // Agrupamento mensal
  const porMes = MESES.map((mes, idx) => {
    const m = String(idx + 1).padStart(2, "0");
    const notasMes = notasReais.filter(n => n.data.startsWith(`${ano}-${m}`));
    return { mes, qtd: notasMes.length, total: notasMes.reduce((s, n) => s + Number(n.valor), 0) };
  });

  const totalMes = porMes[mesAtual]?.total ?? 0;
  const statusCor = pct >= 90 ? "text-red-600" : pct >= 70 ? "text-orange-600" : "text-brand-600";
  const statusLabel = pct >= 90 ? "⚠️ Atenção — próximo do limite" : pct >= 70 ? "Acima de 70%" : "Dentro do limite";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo href="/" size="text-xl" />
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-petroleo-50 text-petroleo-600 border border-petroleo-200 px-2.5 py-1 rounded-full font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Modo Contador — somente leitura
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Identidade do MEI ── */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Microempreendedor Individual</p>
              <h1 className="text-xl font-bold text-gray-900">{dados.nomeUsuario}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{dados.email}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Ano fiscal</p>
              <p className="text-2xl font-extrabold text-gray-900">{ano}</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-5">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-400">Total faturado em {ano}</p>
                <p className="text-2xl font-extrabold text-gray-900">{fmtBRL(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Limite MEI</p>
                <p className="text-base font-bold text-gray-600">{fmtBRL(LIMITE_MEI)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-700 ease-out ${barColor(pct)}`}
                style={{ width: `${barW}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className={`font-bold ${statusCor}`}>{pct.toFixed(1)}% — {statusLabel}</span>
              <span className="text-gray-400">Restam {fmtBRL(restante)}</span>
            </div>
          </div>
        </div>

        {/* ── Cards de métricas ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total no ano",      value: fmtBRL(total),            icon: <TrendingUp className="w-5 h-5 text-brand-600" /> },
            { label: "Faturado este mês", value: fmtBRL(totalMes),         icon: <Calendar className="w-5 h-5 text-green-600" /> },
            { label: "Notas emitidas",    value: String(notasReais.length), icon: <FileText className="w-5 h-5 text-petroleo-600" /> },
            { label: "Saldo disponível",  value: fmtBRL(restante),         icon: <span className="text-xl">💰</span> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {icon}
              </div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Faturamento mensal ── */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Faturamento por mês — {ano}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Mês</th>
                  <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Notas</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Faturado</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let acum = 0;
                  return porMes.map((m, i) => {
                    acum += m.total;
                    const isAtual = i === mesAtual;
                    return (
                      <tr key={m.mes} className={`border-b border-gray-50 ${isAtual ? "bg-brand-50" : i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                        <td className={`py-2.5 font-medium ${isAtual ? "text-brand-700" : "text-gray-700"}`}>
                          {m.mes} {isAtual && <span className="text-xs text-brand-500 ml-1">(atual)</span>}
                        </td>
                        <td className="py-2.5 text-center text-gray-400">{m.qtd > 0 ? m.qtd : "—"}</td>
                        <td className={`py-2.5 text-right font-semibold ${m.total > 0 ? "text-gray-900" : "text-gray-300"}`}>
                          {m.total > 0 ? fmtBRL(m.total) : "—"}
                        </td>
                        <td className="py-2.5 text-right text-gray-400 text-xs">
                          {acum > 0 ? fmtBRL(acum) : "—"}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              <tfoot>
                <tr className="bg-gray-900 rounded">
                  <td className="py-2.5 px-2 font-bold text-white rounded-l">Total {ano}</td>
                  <td className="py-2.5 text-center text-gray-300 font-semibold">{notasReais.length}</td>
                  <td className="py-2.5 text-right font-bold text-white">{fmtBRL(total)}</td>
                  <td className="py-2.5 text-right text-gray-400 rounded-r">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── Lista de notas ── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Notas emitidas em {ano}</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{notasReais.length} notas</span>
          </div>
          {notasReais.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma nota registrada neste período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Data</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Descrição</th>
                    <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                    <th className="text-center py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Nº NF</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {notasReais.map((n, i) => (
                    <tr key={n.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-2.5 text-gray-500 text-xs whitespace-nowrap">{fmtData(n.data)}</td>
                      <td className="py-2.5 text-gray-700 max-w-[180px] truncate">{n.descricao || <span className="text-gray-300">—</span>}</td>
                      <td className="py-2.5 text-gray-500 text-xs max-w-[120px] truncate">{n.cliente || <span className="text-gray-300">—</span>}</td>
                      <td className="py-2.5 text-center text-gray-400 text-xs">{n.numero_nf || "—"}</td>
                      <td className="py-2.5 text-right font-bold text-gray-900">{fmtBRL(Number(n.valor))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={4} className="py-2.5 font-bold text-gray-700 text-sm">Total</td>
                    <td className="py-2.5 text-right font-extrabold text-gray-900">{fmtBRL(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ── Aviso read-only ── */}
        <div className="flex items-center gap-3 text-xs text-gray-400 bg-gray-100 rounded-xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 text-gray-300" />
          <span>
            Acesso somente leitura. Dados fornecidos pelo próprio MEI via Portal MEIguia — refletem apenas o que foi registrado na plataforma.
            Recomende ao cliente que mantenha os lançamentos atualizados. Gerado em {new Date().toLocaleDateString("pt-BR")}.
          </span>
        </div>

      </main>
    </div>
  );
}
