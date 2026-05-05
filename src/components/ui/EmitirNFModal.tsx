"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buscarPortal } from "@/lib/portais-nfse";
import { ExternalLink, Copy, CheckCircle, Loader2, X, MapPin } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  notaId: string;
  valor: number;
  cliente?: string | null;
  descricao?: string | null;
  numeroNfAtual?: string | null;
  onClose: () => void;
  onSaved: (numeroNf: string) => void;
}

export function EmitirNFModal({ notaId, valor, cliente, descricao, numeroNfAtual, onClose, onSaved }: Props) {
  const [municipio, setMunicipio]   = useState<string | null>(null);
  const [cnpj, setCnpj]             = useState<string | null>(null);
  const [loadingMun, setLoadingMun] = useState(true);
  const [numeroNf, setNumeroNf]     = useState(numeroNfAtual ?? "");
  const [saving, setSaving]         = useState(false);
  const [cnpjCopiado, setCnpjCopiado] = useState(false);
  const [portalAberto, setPortalAberto] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("cnpj, municipio_nome")
        .eq("id", user.id)
        .single();

      setCnpj(profile?.cnpj ?? null);

      if (profile?.municipio_nome) {
        setMunicipio(profile.municipio_nome);
        setLoadingMun(false);
        return;
      }

      // Busca município via API se não estiver salvo
      if (profile?.cnpj) {
        try {
          const res  = await fetch(`/api/cnpj/${profile.cnpj}`);
          const data = await res.json();
          if (data.municipio) setMunicipio(data.municipio);
        } catch { /* silencioso */ }
      }
      setLoadingMun(false);
    }
    load();
  }, []);

  const portal = buscarPortal(municipio ?? "");

  function copiarCnpj() {
    if (!cnpj) return;
    const fmt = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    navigator.clipboard.writeText(fmt);
    setCnpjCopiado(true);
    setTimeout(() => setCnpjCopiado(false), 2000);
  }

  function abrirPortal() {
    copiarCnpj();
    const url = portal.portal
      ? portal.portal
      : `https://www.google.com/search?q=emitir+NFS-e+nota+fiscal+servico+${encodeURIComponent(municipio ?? "prefeitura")}`;
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
      setPortalAberto(true);
    }, 800);
  }

  async function handleSalvarNumero() {
    if (!numeroNf.trim()) { toast.error("Informe o número da nota."); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("notas_fiscais")
      .update({ numero_nf: numeroNf.trim() })
      .eq("id", notaId);
    if (error) { toast.error("Erro ao salvar."); setSaving(false); return; }
    toast.success("Número da NF salvo!");
    onSaved(numeroNf.trim());
    onClose();
  }

  const valorFmt = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const cnpjFmt  = cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") ?? "—";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-bold text-gray-900">Emitir Nota Fiscal</h2>
            <p className="text-xs text-gray-500 mt-0.5">{valorFmt}{cliente ? ` · ${cliente}` : ""}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Município detectado */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {loadingMun ? (
              <span className="text-gray-400 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detectando município...
              </span>
            ) : municipio ? (
              <span className="text-gray-700">
                <strong>{municipio}</strong>
                {portal.sistema !== "Portal Gov.br / Prefeitura local" && (
                  <span className="text-gray-400"> · {portal.sistema}</span>
                )}
              </span>
            ) : (
              <span className="text-amber-600">Município não detectado — configure seu CNPJ no perfil</span>
            )}
          </div>

          {/* Passos */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Como emitir:</p>
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
          </div>

          {/* Dados da nota para consulta */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-3">Dados para preencher no portal</p>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor</span>
              <span className="font-semibold text-gray-900">{valorFmt}</span>
            </div>
            {cliente && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tomador</span>
                <span className="font-medium text-gray-900">{cliente}</span>
              </div>
            )}
            {descricao && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 flex-shrink-0">Serviço</span>
                <span className="font-medium text-gray-900 text-right">{descricao}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-gray-200">
              <span className="text-gray-500">Seu CNPJ</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-gray-900">{cnpjFmt}</span>
                <button
                  onClick={copiarCnpj}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                    cnpjCopiado
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {cnpjCopiado ? <><CheckCircle className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
            </div>
          </div>

          {/* Botão abrir portal */}
          <button
            onClick={abrirPortal}
            className="w-full flex items-center justify-center gap-2 bg-petroleo-700 hover:bg-petroleo-800 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {portalAberto ? "Abrir portal novamente" : `Abrir ${portal.sistema}`}
          </button>

          {/* Após emitir — salvar número */}
          {portalAberto && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Emitiu a nota? Salve o número aqui:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Ex: 00123"
                  value={numeroNf}
                  onChange={(e) => setNumeroNf(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleSalvarNumero}
                  disabled={saving || !numeroNf.trim()}
                  className="btn-primary text-sm whitespace-nowrap flex items-center gap-1.5 disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Salvar
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Você encontra o número no portal da prefeitura após a emissão.
              </p>
            </div>
          )}

          {/* Pular */}
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            {numeroNfAtual ? "Fechar" : "Pular por agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
