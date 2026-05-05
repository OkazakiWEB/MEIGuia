"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buscarPortal } from "@/lib/portais-nfse";
import { formatCurrency } from "@/lib/utils";
import {
  FilePlus, ExternalLink, Copy, CheckCircle, Loader2,
  MapPin, FileText, AlertTriangle, Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import type { NotaFiscal } from "@/types/database";

interface Props {
  cnpj: string | null;
  municipioNome: string | null;
  nomeEmitente: string | null;
}

export function EmitirNFPageClient({ cnpj, municipioNome: municipioInicial, nomeEmitente }: Props) {
  const [municipio, setMunicipio]     = useState<string | null>(municipioInicial);
  const [loadingMun, setLoadingMun]   = useState(!municipioInicial && !!cnpj);
  const [cnpjCopiado, setCnpjCopiado] = useState(false);
  const [notas, setNotas]             = useState<NotaFiscal[]>([]);
  const [loadingNotas, setLoadingNotas] = useState(true);
  const [saving, setSaving]           = useState<string | null>(null); // id da nota sendo salva
  const [numeroNf, setNumeroNf]       = useState<Record<string, string>>({});

  const portal = buscarPortal(municipio ?? "");
  const cnpjFmt = cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") ?? "—";

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Busca município se não veio do server
      if (!municipioInicial && cnpj) {
        try {
          const res  = await fetch(`/api/cnpj/${cnpj}`);
          const data = await res.json();
          if (data.municipio) setMunicipio(data.municipio);
        } catch { /* silencioso */ }
        setLoadingMun(false);
      }

      // Busca notas sem número NF do ano atual
      const ano = new Date().getFullYear();
      const { data } = await supabase
        .from("notas_fiscais")
        .select("*")
        .gte("data", `${ano}-01-01`)
        .lte("data", `${ano}-12-31`)
        .order("data", { ascending: false });

      setNotas(data ?? []);
      setLoadingNotas(false);
    }
    load();
  }, []);

  function copiarCnpj() {
    if (!cnpj) return;
    navigator.clipboard.writeText(cnpjFmt);
    setCnpjCopiado(true);
    setTimeout(() => setCnpjCopiado(false), 2000);
  }

  function abrirPortal() {
    copiarCnpj();
    const url = portal.portal
      ? portal.portal
      : `https://www.google.com/search?q=emitir+NFS-e+nota+fiscal+servico+${encodeURIComponent(municipio ?? "prefeitura")}`;
    setTimeout(() => window.open(url, "_blank", "noopener,noreferrer"), 600);
  }

  async function salvarNumero(notaId: string) {
    const num = numeroNf[notaId]?.trim();
    if (!num) { toast.error("Informe o número da NF."); return; }
    setSaving(notaId);
    const supabase = createClient();
    const { error } = await supabase
      .from("notas_fiscais")
      .update({ numero_nf: num })
      .eq("id", notaId);
    if (error) { toast.error("Erro ao salvar."); setSaving(null); return; }
    setNotas((prev) => prev.map((n) => n.id === notaId ? { ...n, numero_nf: num } : n));
    toast.success(`NF ${num} registrada!`);
    setSaving(null);
  }

  const semNF  = notas.filter((n) => !n.numero_nf);
  const comNF  = notas.filter((n) => !!n.numero_nf);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FilePlus className="w-6 h-6" /> Emitir Nota Fiscal
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Emita sua NFS-e no portal da prefeitura e registre o número aqui.
        </p>
      </div>

      {/* Aviso sem CNPJ */}
      {!cnpj && (
        <div className="card border border-amber-200 bg-amber-50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">CNPJ não cadastrado</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Cadastre seu CNPJ no{" "}
              <a href="/perfil" className="underline">Perfil</a>{" "}
              para detectarmos o portal da sua prefeitura automaticamente.
            </p>
          </div>
        </div>
      )}

      {/* Card do portal */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Portal de emissão</p>
            <p className="text-lg font-bold text-gray-900">{portal.sistema}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {loadingMun ? (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Detectando município...
                </span>
              ) : municipio ? (
                <span className="text-sm text-gray-600">{municipio}</span>
              ) : (
                <span className="text-sm text-amber-600">Município não detectado</span>
              )}
            </div>
          </div>

          {/* CNPJ + copiar */}
          {cnpj && (
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Seu CNPJ</p>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gray-900 text-sm">{cnpjFmt}</span>
                <button
                  onClick={copiarCnpj}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                    cnpjCopiado
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {cnpjCopiado
                    ? <><CheckCircle className="w-3 h-3" /> Copiado</>
                    : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Passos */}
        <ol className="space-y-2">
          {portal.instrucoes.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-600">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-petroleo-100 text-petroleo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <button
          onClick={abrirPortal}
          disabled={!cnpj}
          className="flex items-center justify-center gap-2 w-full bg-petroleo-700 hover:bg-petroleo-800 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir {portal.sistema}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Seu CNPJ é copiado automaticamente ao abrir o portal.
        </p>
      </div>

      {/* Notas pendentes de número */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-gray-900">
            Notas sem número registrado
            {semNF.length > 0 && (
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {semNF.length}
              </span>
            )}
          </h2>
        </div>

        {loadingNotas ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : semNF.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-sm">Todas as notas do ano já têm número registrado!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {semNF.map((nota) => (
              <div key={nota.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(Number(nota.valor))}
                      {nota.cliente && <span className="text-gray-500 font-normal"> · {nota.cliente}</span>}
                    </p>
                    {nota.descricao && (
                      <p className="text-xs text-gray-400 truncate">{nota.descricao}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(nota.data + "T00:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1 text-sm py-1.5"
                    placeholder="Número da NF (ex: 00123)"
                    value={numeroNf[nota.id] ?? ""}
                    onChange={(e) => setNumeroNf((prev) => ({ ...prev, [nota.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && salvarNumero(nota.id)}
                  />
                  <button
                    onClick={() => salvarNumero(nota.id)}
                    disabled={saving === nota.id || !numeroNf[nota.id]?.trim()}
                    className="btn-primary text-sm px-4 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {saving === nota.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <CheckCircle className="w-3.5 h-3.5" />}
                    Salvar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas já emitidas */}
      {comNF.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-500" />
            <h2 className="font-semibold text-gray-900">
              Notas emitidas este ano
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {comNF.length}
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            {comNF.map((nota) => (
              <div key={nota.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(Number(nota.valor))}
                    {nota.cliente && <span className="text-gray-500 font-normal"> · {nota.cliente}</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(nota.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex-shrink-0">
                  <CheckCircle className="w-3 h-3" /> NF {nota.numero_nf}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        {nomeEmitente && `Emitente: ${nomeEmitente} · `}
        A emissão oficial é feita no portal da prefeitura. O MEIguia guia o processo e registra os números.
      </p>
    </div>
  );
}
