"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Settings, Trash2, AlertTriangle, Loader2,
  CreditCard, CheckCircle, XCircle, Sparkles,
} from "lucide-react";
import { ContadorAccess } from "@/components/ui/ContadorAccess";

export default function ConfiguracoesPage() {
  const router = useRouter();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [plano, setPlano]                 = useState<string>("free");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [deleteModal, setDeleteModal]     = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("plano, subscription_status")
        .eq("id", user.id)
        .single();
      setPlano(profile?.plano ?? "free");
      setSubscriptionStatus(profile?.subscription_status || null);
      setLoadingProfile(false);
    }
    load();
  }, []);

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      window.location.href = url;
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: "monthly", plan: "pro" }),
      });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      window.location.href = url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "EXCLUIR") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erro ao excluir conta."); setDeleting(false); return; }
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Conta excluída. Até mais!");
      router.push("/");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
      setDeleting(false);
    }
  }

  const isPro     = plano === "pro" || plano === "premium";
  const isPremium = plano === "premium";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" /> Configurações
        </h1>
        <p className="text-gray-500 text-sm mt-1">Assinatura, acesso e conta</p>
      </div>

      {/* ── Assinatura ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Assinatura
        </h2>
        {loadingProfile ? (
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ) : isPremium ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-purple-800">Plano Premium ativo ⭐</p>
                <p className="text-xs text-purple-600">
                  {subscriptionStatus === "active" ? "Renovação automática ativa" :
                   subscriptionStatus === "past_due" ? "Pagamento pendente — verifique seu cartão" :
                   "Cancelamento agendado — acesso até o fim do período"}
                </p>
              </div>
            </div>
            <button onClick={handlePortal} disabled={portalLoading} className="btn-secondary flex items-center gap-2 text-sm">
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Gerenciar assinatura
            </button>
          </div>
        ) : isPro ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Plano Pro ativo ✨</p>
                <p className="text-xs text-green-600">
                  {subscriptionStatus === "active" ? "Renovação automática ativa" :
                   subscriptionStatus === "past_due" ? "Pagamento pendente — verifique seu cartão" :
                   "Cancelamento agendado — acesso até o fim do período"}
                </p>
              </div>
            </div>
            <button onClick={handlePortal} disabled={portalLoading} className="btn-secondary flex items-center gap-2 text-sm">
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Gerenciar assinatura
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-700">Plano Gratuito</p>
                <p className="text-xs text-gray-500">Limite de 5 notas por mês</p>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={checkoutLoading} className="btn-primary flex items-center gap-2 text-sm">
              {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Ver planos
            </button>
          </div>
        )}
      </div>

      {/* ── Modo Contador ── */}
      <ContadorAccess isPro={isPro} />

      {/* ── Zona de perigo ── */}
      <div className="card border border-red-100">
        <h2 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Zona de perigo
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          A exclusão da conta é permanente e irreversível. Remove todos os seus dados,
          notas fiscais e cancela sua assinatura automaticamente.
        </p>
        <button
          onClick={() => { setDeleteModal(true); setDeleteConfirmText(""); }}
          className="text-sm font-medium text-red-600 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
        >
          Excluir minha conta
        </button>
      </div>

      {/* ── Modal exclusão ── */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Excluir conta</h2>
                <p className="text-xs text-gray-500">Esta ação é permanente e irreversível.</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700 space-y-1">
              <p className="font-semibold">O que será excluído:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs">
                <li>Todas as suas notas fiscais</li>
                <li>Seu perfil e dados pessoais</li>
                <li>Sua assinatura (se ativa)</li>
                <li>Seu acesso à plataforma</li>
              </ul>
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Digite <span className="font-mono font-bold text-red-600">EXCLUIR</span> para confirmar:
              </label>
              <input
                type="text" className="input mt-2" placeholder="EXCLUIR"
                value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)} disabled={deleting} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "EXCLUIR" || deleting}
                className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo...</> : "Excluir conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
