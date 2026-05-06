"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Trash2, Plus, Users, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Token {
  id: string;
  token: string;
  label: string;
  created_at: string;
  expires_at: string | null;
  last_accessed_at: string | null;
  revoked: boolean;
}

const APP_URL = typeof window !== "undefined" ? window.location.origin : "https://www.portalmeiguia.com.br";

export function ContadorAccess({ isPro }: { isPro: boolean }) {
  const [tokens, setTokens]       = useState<Token[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [label, setLabel]         = useState("");
  const [copied, setCopied]       = useState<string | null>(null);
  const [revoking, setRevoking]   = useState<string | null>(null);

  useEffect(() => { fetchTokens(); }, []);

  async function fetchTokens() {
    const res = await fetch("/api/contador/token");
    const json = await res.json();
    if (!json.error) setTokens(json.tokens.filter((t: Token) => !t.revoked));
    setLoading(false);
  }

  async function criarToken() {
    if (!label.trim()) { toast.error("Dê um nome para identificar o acesso."); return; }
    setCreating(true);
    try {
      const res  = await fetch("/api/contador/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      });
      const json = await res.json();
      if (json.error) { toast.error(json.error); return; }
      setTokens(prev => [json.token, ...prev]);
      setLabel("");
      toast.success("Link de acesso criado!");
    } finally {
      setCreating(false);
    }
  }

  async function revogarToken(id: string, tokenLabel: string) {
    if (!confirm(`Revogar acesso "${tokenLabel}"? O contador perderá o acesso imediatamente.`)) return;
    setRevoking(id);
    try {
      const res  = await fetch("/api/contador/token", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.error) { toast.error(json.error); return; }
      setTokens(prev => prev.filter(t => t.id !== id));
      toast.success("Acesso revogado.");
    } finally {
      setRevoking(null);
    }
  }

  function copiarLink(token: string) {
    const url = `${APP_URL}/contador/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(null), 2000);
  }

  function fmtDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  // ── Teaser para free ──────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Modo Contador</h3>
            <p className="text-xs text-gray-400">Compartilhe o faturamento com seu contador</p>
          </div>
          <span className="ml-auto text-xs bg-brand-100 text-brand-700 font-bold px-2.5 py-1 rounded-full">PRO</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Com o Modo Contador você gera um link seguro e envia para seu contador.
          Ele acessa todos os dados de faturamento em tempo real — sem senha, sem papelada.
        </p>
        <Link href="/assinatura" className="btn-primary w-full text-sm py-2.5 text-center block font-semibold">
          Assinar Pro para liberar →
        </Link>
      </div>
    );
  }

  return (
    <div className="card space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-brand-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Modo Contador</h3>
          <p className="text-xs text-gray-400">Links de acesso somente leitura</p>
        </div>
      </div>

      {/* Explicação */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed">
          O contador <strong>só visualiza</strong> — não pode editar, excluir nem criar nada.
          Você pode revogar o acesso a qualquer momento.
        </p>
      </div>

      {/* Criar novo token */}
      <div>
        <label className="label text-sm">Criar novo acesso</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="Ex: Contador João Silva"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") criarToken(); }}
            maxLength={60}
          />
          <button
            onClick={criarToken}
            disabled={creating || !label.trim()}
            className="btn-primary px-4 flex items-center gap-1.5 disabled:opacity-40"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">Criar</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Use um nome para identificar com quem você compartilhou.
        </p>
      </div>

      {/* Lista de tokens ativos */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-xl">
          Nenhum link ativo. Crie um acima para compartilhar com seu contador.
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Acessos ativos</p>
          {tokens.map(t => (
            <div key={t.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{t.label}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">Criado {fmtDate(t.created_at)}</span>
                  {t.last_accessed_at && (
                    <span className="text-xs text-green-600 font-medium">
                      · Acessado {fmtDate(t.last_accessed_at)}
                    </span>
                  )}
                  {!t.last_accessed_at && (
                    <span className="text-xs text-gray-300">· Nunca acessado</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => copiarLink(t.token)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition flex-shrink-0"
                title="Copiar link"
              >
                {copied === t.token
                  ? <Check className="w-4 h-4 text-green-500" />
                  : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
              <button
                onClick={() => revogarToken(t.id, t.label)}
                disabled={revoking === t.id}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-red-100 bg-white hover:bg-red-50 transition flex-shrink-0"
                title="Revogar acesso"
              >
                {revoking === t.id
                  ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  : <Trash2 className="w-4 h-4 text-red-400" />}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
