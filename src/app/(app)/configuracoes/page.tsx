"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Settings, User, LogOut, Trash2, AlertTriangle, Loader2,
  Camera, CreditCard, CheckCircle, XCircle, Sparkles,
} from "lucide-react";
import { ContadorAccess } from "@/components/ui/ContadorAccess";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [userId, setUserId]               = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl]         = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isPro, setIsPro]                 = useState(false);
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
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, plano, subscription_status, avatar_url")
        .eq("id", user.id)
        .single<{ full_name: string | null; email: string | null; plano: string | null; subscription_status: string | null; avatar_url: string | null }>();

      setFullName(profile?.full_name || "");
      setEmail(profile?.email || user.email || "");
      setIsPro(profile?.plano === "pro");
      setSubscriptionStatus(profile?.subscription_status || null);
      setAvatarUrl(profile?.avatar_url || null);
      setLoadingProfile(false);
    }
    load();
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 2MB."); return; }
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida."); return; }

    setUploadingAvatar(true);
    const supabase = createClient();
    const ext  = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) { toast.error("Erro ao enviar imagem."); setUploadingAvatar(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: urlWithBust }).eq("id", userId);
    setAvatarUrl(urlWithBust);
    toast.success("Foto atualizada!");
    setUploadingAvatar(false);
  }

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    if (error) toast.error("Erro ao atualizar nome.");
    else toast.success("Nome atualizado!");
    setLoading(false);
  }

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
        body: JSON.stringify({ interval: "monthly" }),
      });
      const { url, error } = await res.json();
      if (error) { toast.error(error); return; }
      window.location.href = url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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

  const initials = fullName?.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Configurações
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie sua conta</p>
      </div>

      {/* ── Perfil ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Perfil
        </h2>
        {loadingProfile ? (
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto de perfil"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-petroleo-600 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                >
                  {uploadingAvatar
                    ? <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                    : <Camera className="w-3 h-3 text-gray-600" />
                  }
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Foto de perfil</p>
                <p className="text-xs text-gray-400">JPG, PNG ou WebP — máx. 2MB</p>
              </div>
            </div>

            {/* Nome e e-mail */}
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="label">Nome completo</label>
                <input
                  type="text"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input
                  type="email"
                  className="input bg-gray-50 cursor-not-allowed"
                  value={email}
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado aqui.</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Salvar alterações"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Assinatura ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Assinatura
        </h2>
        {loadingProfile ? (
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ) : isPro ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Plano Pro ativo</p>
                <p className="text-xs text-green-600">
                  {subscriptionStatus === "active" ? "Renovação automática ativa" :
                   subscriptionStatus === "past_due" ? "Pagamento pendente — verifique seu cartão" :
                   "Cancelamento agendado — acesso até o fim do período"}
                </p>
              </div>
            </div>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
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
                <p className="text-xs text-gray-500">Limite de 10 notas por mês</p>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {checkoutLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Sparkles className="w-4 h-4" />
              }
              Assinar Pro — R$ 19,90/mês
            </button>
          </div>
        )}
      </div>

      {/* ── Modo Contador ── */}
      <ContadorAccess isPro={isPro} />

      {/* ── Sessão ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Sessão</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Encerrar sessão
        </button>
      </div>

      {/* ── Zona de perigo ── */}
      <div className="card border border-red-100">
        <h2 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Zona de perigo
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
                <li>Sua assinatura Pro (se ativa)</li>
                <li>Seu acesso à plataforma</li>
              </ul>
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">
                Digite <span className="font-mono font-bold text-red-600">EXCLUIR</span> para confirmar:
              </label>
              <input
                type="text"
                className="input mt-2"
                placeholder="EXCLUIR"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)} disabled={deleting} className="btn-secondary flex-1">
                Cancelar
              </button>
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
