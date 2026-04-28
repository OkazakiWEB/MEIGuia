"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { ExternalLink, CheckCircle, Clock, AlertTriangle, Copy, Settings } from "lucide-react";
import type { DasPagamento } from "@/types/database";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

interface Props {
  userId: string;
  cnpj: string | null;
  pagamentos: DasPagamento[];
  anoAtual: number;
}

function formatCnpj(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

const DAS_URL = "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao";

function abrirDas(cnpj: string) {
  navigator.clipboard.writeText(formatCnpj(cnpj)).catch(() => {});
  window.open(DAS_URL, "_blank", "noopener,noreferrer");
  toast("CNPJ copiado! Cole no campo do portal Gov.br.", {
    icon: "📋",
    duration: 5000,
  });
}

function calcStatus(mes: number, ano: number, pago: boolean): "pago" | "atrasado" | "pendente" | "futuro" {
  if (pago) return "pago";
  const hoje = new Date();
  const vencimento = new Date(ano, mes - 1, 20); // dia 20 do mês
  if (hoje > vencimento) return "atrasado";
  const mesAtual = hoje.getMonth() + 1;
  if (mes > mesAtual) return "futuro";
  return "pendente";
}

// Modal de confirmação de pagamento
function ModalPagamento({
  mesNome, onConfirm, onCancel, loading,
}: {
  mesNome: string;
  onConfirm: (valor: number | null) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [centavos, setCentavos] = useState(0);
  const valorDisplay = centavos > 0
    ? (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";

  function handleValor(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setCentavos(digits ? Math.min(parseInt(digits, 10), 9999999) : 0);
  }

  function handleConfirm() {
    onConfirm(centavos > 0 ? centavos / 100 : null);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Confirmar pagamento</h2>
            <p className="text-xs text-gray-500">DAS de {mesNome}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Valor pago <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">R$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={valorDisplay}
              onChange={handleValor}
              className="input pl-9"
              autoComplete="off"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Informe quanto pagou para manter o histórico completo. Você pode deixar em branco.
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1 text-sm">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin">⏳</span> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DasPageClient({ userId, cnpj, pagamentos, anoAtual }: Props) {
  const [lista, setLista] = useState<DasPagamento[]>(pagamentos);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ mes: number; competencia: string } | null>(null);
  const [confirmarDesfazer, setConfirmarDesfazer] = useState<string | null>(null); // id do registro

  // Monta os 12 meses com dados do banco ou defaults
  const meses = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const competencia = `${anoAtual}-${String(mes).padStart(2, "0")}-01`;
    const registro = lista.find((p) => p.competencia.startsWith(`${anoAtual}-${String(mes).padStart(2, "0")}`));
    const status = calcStatus(mes, anoAtual, registro?.status === "pago");
    return { mes, competencia, registro, status };
  });

  const mesAtual = new Date().getMonth() + 1;

  async function confirmarPagamento(valorPago: number | null) {
    if (!modal || !cnpj) return;
    const { mes, competencia } = modal;
    setLoadingId(competencia);
    const supabase = createClient();
    const hoje = new Date().toISOString().split("T")[0];
    const vencimento = `${anoAtual}-${String(mes).padStart(2, "0")}-20`;
    const existente = lista.find((p) => p.competencia.startsWith(competencia.slice(0, 7)));

    if (existente) {
      const { error } = await supabase
        .from("das_pagamentos")
        .update({ status: "pago", pago_em: hoje, valor_pago: valorPago })
        .eq("id", existente.id);
      if (error) { toast.error("Erro ao atualizar."); setLoadingId(null); setModal(null); return; }
      setLista((prev) => prev.map((p) => p.id === existente.id
        ? { ...p, status: "pago", pago_em: hoje, valor_pago: valorPago } : p));
    } else {
      const { data, error } = await supabase
        .from("das_pagamentos")
        .insert({ user_id: userId, competencia, vencimento, status: "pago", pago_em: hoje, valor_pago: valorPago })
        .select()
        .single();
      if (error) { toast.error("Erro ao registrar."); setLoadingId(null); setModal(null); return; }
      setLista((prev) => [...prev, data as DasPagamento]);
    }

    toast.success("DAS marcado como pago!");
    setLoadingId(null);
    setModal(null);
  }

  async function desmarcarPago(id: string) {
    setLoadingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("das_pagamentos")
      .update({ status: "pendente", pago_em: null, valor_pago: null })
      .eq("id", id);
    if (error) { toast.error("Erro ao atualizar."); setLoadingId(null); return; }
    setLista((prev) => prev.map((p) => p.id === id ? { ...p, status: "pendente", pago_em: null, valor_pago: null } : p));
    toast.success("Registro atualizado.");
    setLoadingId(null);
  }

  const [cnpjCopiado, setCnpjCopiado] = useState(false);

  function copiarCnpj() {
    if (!cnpj) return;
    navigator.clipboard.writeText(formatCnpj(cnpj));
    setCnpjCopiado(true);
    setTimeout(() => setCnpjCopiado(false), 2000);
  }

  // ── Sem CNPJ cadastrado ──
  if (!cnpj) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-gray-700" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Guias DAS</h1>
            <p className="text-gray-500 text-sm">Controle mensal do seu Documento de Arrecadação</p>
          </div>
        </div>

        <div className="card border-2 border-dashed border-amber-200 bg-amber-50 text-center py-12 px-6">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">CNPJ não cadastrado</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Para usar o painel DAS você precisa informar seu CNPJ nas configurações.
          </p>
          <Link href="/configuracoes" className="btn-primary inline-flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ir para Configurações
          </Link>
        </div>
      </div>
    );
  }

  const pagoCount     = meses.filter((m) => m.status === "pago").length;
  const atrasadoCount = meses.filter((m) => m.status === "atrasado").length;
  const totalPagoAno  = lista
    .filter((p) => p.status === "pago" && p.valor_pago)
    .reduce((sum, p) => sum + Number(p.valor_pago), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── Cabeçalho ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Guias DAS</h1>
          <p className="text-gray-500 text-sm mt-1">Ano fiscal {anoAtual}</p>
        </div>
        <button
          onClick={() => abrirDas(cnpj)}
          className="btn-primary flex items-center gap-2 text-sm flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Gerar DAS</span>
          <span className="sm:hidden">DAS</span>
        </button>
      </div>

      {/* ── Card CNPJ ── */}
      <div className="card flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">CNPJ do MEI</p>
          <p className="text-lg font-mono font-semibold text-gray-900">{formatCnpj(cnpj)}</p>
        </div>
        <button
          onClick={copiarCnpj}
          className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-2 transition-colors ${
            cnpjCopiado
              ? "bg-green-50 border-green-200 text-green-700"
              : "text-gray-500 hover:text-gray-800 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Copy className="w-4 h-4" />
          {cnpjCopiado ? "Copiado ✓" : "Copiar"}
        </button>
      </div>

      {/* ── Resumo do ano ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{pagoCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pagos</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-500">{atrasadoCount}</p>
          <p className="text-xs text-gray-500 mt-1">Atrasados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{12 - pagoCount - atrasadoCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pendentes</p>
        </div>
        <div className="card text-center">
          <p className="text-lg font-bold text-gray-800">
            {totalPagoAno > 0
              ? `R$ ${totalPagoAno.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total pago {anoAtual}</p>
        </div>
      </div>

      {/* ── Timeline visual de 12 meses ── */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 mb-4">Visão geral {anoAtual}</p>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {meses.map(({ mes, status }) => (
            <div key={mes} className="flex flex-col items-center gap-1">
              <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold
                ${status === "pago"     ? "bg-green-100 text-green-700" :
                  status === "atrasado" ? "bg-red-100 text-red-600" :
                  status === "pendente" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-400"}`}>
                {status === "pago" ? "✓" : status === "atrasado" ? "!" : mes}
              </div>
              <span className="text-[10px] text-gray-400">{MESES_CURTOS[mes - 1]}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 inline-block"/>Pago</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block"/>Atrasado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 inline-block"/>Pendente</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block"/>Futuro</span>
        </div>
      </div>

      {/* ── Lista de meses ── */}
      <div className="space-y-3">
        {meses.map(({ mes, competencia, registro, status }) => {
          const isMesAtual = mes === mesAtual;
          const vencimento = `20/${String(mes).padStart(2, "0")}/${anoAtual}`;
          const diasRestantes = Math.ceil(
            (new Date(anoAtual, mes - 1, 20).getTime() - Date.now()) / 86400000
          );

          if (status === "futuro") return null;

          return (
            <div
              key={mes}
              className={`card transition-shadow ${isMesAtual ? "ring-2 ring-petroleo-400" : ""}`}
            >
              <div className="flex items-center gap-4">
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${status === "pago"     ? "bg-green-100" :
                    status === "atrasado" ? "bg-red-100" :
                    "bg-amber-100"}`}>
                  {status === "pago"
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : status === "atrasado"
                    ? <AlertTriangle className="w-5 h-5 text-red-500" />
                    : <Clock className="w-5 h-5 text-amber-500" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{MESES[mes - 1]} {anoAtual}</p>
                    {isMesAtual && (
                      <span className="text-[11px] bg-petroleo-100 text-petroleo-700 font-semibold px-2 py-0.5 rounded-full">
                        Mês atual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {status === "pago" && registro?.pago_em
                      ? `Pago em ${new Date(registro.pago_em + "T00:00:00").toLocaleDateString("pt-BR")}${registro.valor_pago ? ` · R$ ${Number(registro.valor_pago).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}`
                      : status === "atrasado"
                      ? `Venceu em ${vencimento}`
                      : diasRestantes > 0
                      ? `Vence em ${vencimento} · ${diasRestantes} dias`
                      : `Vence hoje — ${vencimento}`}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {status !== "pago" && (
                    <button
                      onClick={() => abrirDas(cnpj)}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Gerar DAS
                    </button>
                  )}
                  {status !== "pago" ? (
                    <button
                      onClick={() => setModal({ mes, competencia })}
                      disabled={loadingId === competencia}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 font-medium transition-colors disabled:opacity-50"
                    >
                      {loadingId === competencia ? "..." : "Paguei"}
                    </button>
                  ) : (
                    confirmarDesfazer === registro?.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Tem certeza?</span>
                        <button
                          onClick={() => { registro && desmarcarPago(registro.id); setConfirmarDesfazer(null); }}
                          disabled={loadingId === registro?.id}
                          className="text-xs text-red-600 font-medium px-2 py-1 hover:underline"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmarDesfazer(null)}
                          className="text-xs text-gray-400 px-2 py-1 hover:underline"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => registro && setConfirmarDesfazer(registro.id)}
                        disabled={loadingId === registro?.id}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5"
                      >
                        {loadingId === registro?.id ? "..." : "Desfazer"}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Aviso legal ── */}
      <p className="text-xs text-gray-400 text-center pb-4">
        O MEIGuia não emite o DAS — o documento é gerado no portal oficial da Receita Federal.
        Mantenha seus pagamentos em dia para não perder os benefícios do MEI.
      </p>

      {/* ── Modal de pagamento ── */}
      {modal && (
        <ModalPagamento
          mesNome={MESES[modal.mes - 1]}
          loading={loadingId === modal.competencia}
          onConfirm={confirmarPagamento}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
