"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { ExternalLink, CheckCircle, Clock, AlertTriangle, Copy, Settings } from "lucide-react";
import type { DasGuia } from "@/types/database";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

type AtividadeMei = "comercio" | "industria" | "servicos" | "misto";

interface Props {
  userId: string;
  cnpj: string | null;
  guias: DasGuia[];
  anoAtual: number;
  atividadeMei: AtividadeMei;
  faturamentoMesAtual: number;
  valorDasEstimado: number;
}

function formatCnpj(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

const DAS_URL = "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao";

function abrirDas(cnpj: string) {
  navigator.clipboard.writeText(formatCnpj(cnpj)).catch(() => {});
  toast("📋 CNPJ copiado! Abrindo portal em 2 segundos...", { duration: 2000 });
  setTimeout(() => {
    window.open(DAS_URL, "_blank", "noopener,noreferrer");
  }, 2000);
}

function calcStatus(mes: number, ano: number, pago: boolean): "pago" | "atrasado" | "pendente" | "futuro" {
  if (pago) return "pago";
  const hoje = new Date();
  const vencimento = new Date(ano, mes - 1, 20);
  if (hoje > vencimento) return "atrasado";
  if (mes > hoje.getMonth() + 1) return "futuro";
  return "pendente";
}

function ModalPagamento({
  mesNome, valorSugerido, onConfirm, onCancel, loading,
}: {
  mesNome: string;
  valorSugerido: number;
  onConfirm: (dataPag: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const hoje = new Date().toISOString().split("T")[0];
  const [dataPag, setDataPag] = useState(hoje);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Confirmar pagamento</h2>
            <p className="text-xs text-gray-500">
              DAS de {mesNome} · R$ {valorSugerido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Data do pagamento</label>
          <input
            type="date"
            className="input"
            value={dataPag}
            onChange={(e) => setDataPag(e.target.value)}
            max={hoje}
            autoFocus
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1 text-sm">Cancelar</button>
          <button
            onClick={() => onConfirm(dataPag)}
            disabled={loading || !dataPag}
            className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin">⏳</span> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DasPageClient({ userId, cnpj, guias, anoAtual, atividadeMei, faturamentoMesAtual, valorDasEstimado }: Props) {
  const [lista, setLista] = useState<DasGuia[]>(guias);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modal, setModal]         = useState<{ mes: number; mesRef: string; guia: DasGuia | null } | null>(null);
  const [desfazerId, setDesfazerIt] = useState<string | null>(null);
  const [cnpjCopiado, setCnpjCopiado] = useState(false);

  const mesAtual = new Date().getMonth() + 1;

  // Monta os 12 meses fundindo com guias do banco
  const meses = Array.from({ length: 12 }, (_, i) => {
    const mes    = i + 1;
    const mesRef = `${anoAtual}-${String(mes).padStart(2, "0")}-01`;
    const guia   = lista.find((g) => g.mes_referencia.startsWith(`${anoAtual}-${String(mes).padStart(2, "0")}`));
    const status = calcStatus(mes, anoAtual, guia?.status === "pago");
    return { mes, mesRef, guia, status };
  });

  async function confirmarPagamento(dataPag: string) {
    if (!modal) return;
    const { mes, mesRef, guia } = modal;
    setLoadingId(mesRef);
    const supabase = createClient();

    if (guia) {
      const { error } = await supabase
        .from("das_guias")
        .update({ status: "pago", data_pagamento: dataPag })
        .eq("id", guia.id);
      if (error) { toast.error("Erro ao atualizar."); setLoadingId(null); setModal(null); return; }
      setLista((prev) => prev.map((g) => g.id === guia.id ? { ...g, status: "pago", data_pagamento: dataPag } : g));
    } else {
      const { data, error } = await supabase
        .from("das_guias")
        .insert({
          user_id: userId,
          mes_referencia: mesRef,
          faturamento_mes: mes === mesAtual ? faturamentoMesAtual : 0,
          valor_das: valorDasEstimado,
          status: "pago",
          data_pagamento: dataPag,
        })
        .select()
        .single();
      if (error) { toast.error("Erro ao registrar."); setLoadingId(null); setModal(null); return; }
      setLista((prev) => [...prev, data as DasGuia]);
    }

    toast.success(`DAS de ${MESES[mes - 1]} marcado como pago!`);
    setLoadingId(null);
    setModal(null);
  }

  async function desmarcarPago(id: string) {
    setLoadingId(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("das_guias")
      .update({ status: "pendente", data_pagamento: null })
      .eq("id", id);
    if (error) { toast.error("Erro ao atualizar."); setLoadingId(null); return; }
    setLista((prev) => prev.map((g) => g.id === id ? { ...g, status: "pendente", data_pagamento: null } : g));
    toast.success("Registro atualizado.");
    setLoadingId(null);
    setDesfazerIt(null);
  }

  function copiarCnpj() {
    if (!cnpj) return;
    navigator.clipboard.writeText(formatCnpj(cnpj));
    setCnpjCopiado(true);
    setTimeout(() => setCnpjCopiado(false), 2000);
  }

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
            Para usar o painel DAS você precisa informar seu CNPJ no perfil.
          </p>
          <Link href="/perfil" className="btn-primary inline-flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Ir para Perfil
          </Link>
        </div>
      </div>
    );
  }

  const pagoCount     = meses.filter((m) => m.status === "pago").length;
  const atrasadoCount = meses.filter((m) => m.status === "atrasado").length;
  const totalPagoAno  = lista
    .filter((g) => g.status === "pago")
    .reduce((sum, g) => sum + Number(g.valor_das), 0);

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

      {/* ── DAS estimado do mês ── */}
      <div className="card bg-petroleo-50 border border-petroleo-200">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-petroleo-500 font-medium uppercase tracking-wide mb-1">DAS estimado — mês atual</p>
            <p className="text-3xl font-bold text-petroleo-900">
              R$ {valorDasEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-petroleo-400 mt-1">
              Base INSS R$75,90 + encargo{" "}
              {atividadeMei === "misto" ? "Comércio+Serviços" :
               atividadeMei === "comercio" ? "Comércio" :
               atividadeMei === "industria" ? "Indústria" : "Serviços"}
              {" "}· faturamento registrado: R$ {faturamentoMesAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Link href="/perfil" className="text-xs text-petroleo-500 hover:text-petroleo-700 underline flex-shrink-0">
            Alterar atividade
          </Link>
        </div>
        <p className="text-[11px] text-petroleo-400 mt-3 border-t border-petroleo-200 pt-3">
          ⚠️ Valor estimado com base na tabela MEI 2025. O valor oficial é gerado pelo portal da Receita Federal.
        </p>
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

      {/* ── Timeline visual ── */}
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
        {meses.map(({ mes, mesRef, guia, status }) => {
          if (status === "futuro") return null;
          const isMesAtual   = mes === mesAtual;
          const vencimento   = `20/${String(mes).padStart(2, "0")}/${anoAtual}`;
          const diasRestantes = Math.ceil(
            (new Date(anoAtual, mes - 1, 20).getTime() - Date.now()) / 86400000
          );

          return (
            <div key={mes} className={`card transition-shadow ${isMesAtual ? "ring-2 ring-petroleo-400" : ""}`}>
              <div className="flex items-center gap-4">
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
                    {status === "pago" && guia?.data_pagamento
                      ? `Pago em ${new Date(guia.data_pagamento + "T00:00:00").toLocaleDateString("pt-BR")} · R$ ${Number(guia.valor_das).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : status === "atrasado"
                      ? `Venceu em ${vencimento}`
                      : diasRestantes > 0
                      ? `Vence em ${vencimento} · ${diasRestantes} dias`
                      : `Vence hoje — ${vencimento}`}
                  </p>
                  {guia && guia.faturamento_mes > 0 && (
                    <p className="text-xs text-gray-300 mt-0.5">
                      Faturamento: R$ {Number(guia.faturamento_mes).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

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
                      onClick={() => setModal({ mes, mesRef, guia: guia ?? null })}
                      disabled={loadingId === mesRef}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 font-medium transition-colors disabled:opacity-50"
                    >
                      {loadingId === mesRef ? "..." : "Paguei"}
                    </button>
                  ) : (
                    desfazerId === guia?.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Tem certeza?</span>
                        <button
                          onClick={() => guia && desmarcarPago(guia.id)}
                          disabled={loadingId === guia?.id}
                          className="text-xs text-red-600 font-medium px-2 py-1 hover:underline"
                        >Sim</button>
                        <button
                          onClick={() => setDesfazerIt(null)}
                          className="text-xs text-gray-400 px-2 py-1 hover:underline"
                        >Não</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => guia && setDesfazerIt(guia.id)}
                        disabled={loadingId === guia?.id}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5"
                      >
                        {loadingId === guia?.id ? "..." : "Desfazer"}
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

      {modal && (
        <ModalPagamento
          mesNome={MESES[modal.mes - 1]}
          valorSugerido={valorDasEstimado}
          loading={loadingId === modal.mesRef}
          onConfirm={confirmarPagamento}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
