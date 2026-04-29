"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  User, Camera, Loader2, Phone, Bell, Calendar, Lock,
  Eye, EyeOff,
} from "lucide-react";

export default function PerfilPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId]               = useState<string | null>(null);
  const [userEmail, setUserEmail]         = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [plano, setPlano]                 = useState("free");

  // Dados pessoais
  const [fullName, setFullName]           = useState("");
  const [cnpj, setCnpj]                   = useState("");
  const [avatarUrl, setAvatarUrl]         = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingData, setSavingData]       = useState(false);

  // WhatsApp
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [savingPhone, setSavingPhone]     = useState(false);

  // Notificações
  const [notifEmail, setNotifEmail]       = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [savingNotif, setSavingNotif]     = useState(false);

  // Ano de referência
  const [anoRef, setAnoRef]               = useState(new Date().getFullYear());
  const [savingAno, setSavingAno]         = useState(false);

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function formatPhone(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2)  return d;
    if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  }

  function formatCnpj(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 14);
    return d
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setUserEmail(user.email || "");

      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, email, plano, avatar_url, cnpj, whatsapp_phone, notif_email, notif_whatsapp, ano_referencia")
        .eq("id", user.id)
        .single();

      if (p) {
        setFullName(p.full_name || "");
        setUserEmail(p.email || user.email || "");
        setPlano(p.plano ?? "free");
        setAvatarUrl(p.avatar_url || null);
        setCnpj(p.cnpj ? formatCnpj(p.cnpj) : "");
        setWhatsappPhone(p.whatsapp_phone ? formatPhone(p.whatsapp_phone) : "");
        setNotifEmail(p.notif_email ?? true);
        setNotifWhatsapp(p.notif_whatsapp ?? true);
        setAnoRef(p.ano_referencia ?? new Date().getFullYear());
      }
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
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error("Erro ao enviar imagem."); setUploadingAvatar(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    setAvatarUrl(url);
    toast.success("Foto atualizada!");
    setUploadingAvatar(false);
  }

  // Salva nome + CNPJ juntos
  async function handleSaveData(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const cnpjDigits = cnpj.replace(/\D/g, "");
    if (cnpjDigits.length > 0 && cnpjDigits.length !== 14) {
      toast.error("CNPJ inválido. Verifique o número informado.");
      return;
    }
    setSavingData(true);
    const supabase = createClient();
    const update = cnpjDigits.length === 14
      ? { full_name: fullName, cnpj: cnpjDigits }
      : { full_name: fullName };
    const { error } = await supabase.from("profiles").update(update).eq("id", userId);
    if (error) toast.error("Erro ao salvar. Tente novamente.");
    else toast.success("Dados atualizados com sucesso!");
    setSavingData(false);
  }

  async function handleSavePhone() {
    if (!userId) return;
    const digits = whatsappPhone.replace(/\D/g, "");
    if (digits.length < 10) { toast.error("Informe um celular válido com DDD."); return; }
    setSavingPhone(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ whatsapp_phone: digits }).eq("id", userId);
    if (error) toast.error("Erro ao salvar. Tente novamente.");
    else toast.success("Celular atualizado com sucesso!");
    setSavingPhone(false);
  }

  async function handleSaveNotif() {
    if (!userId) return;
    setSavingNotif(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ notif_email: notifEmail, notif_whatsapp: notifWhatsapp })
      .eq("id", userId);
    if (error) toast.error("Erro ao salvar. Tente novamente.");
    else toast.success("Preferências atualizadas com sucesso!");
    setSavingNotif(false);
  }

  async function handleSaveAno() {
    if (!userId) return;
    setSavingAno(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ ano_referencia: anoRef }).eq("id", userId);
    if (error) toast.error("Erro ao salvar. Tente novamente.");
    else toast.success("Ano de referência atualizado!");
    setSavingAno(false);
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) { toast.error("Informe sua senha atual."); return; }
    if (newPassword.length < 8) { toast.error("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (newPassword !== confirmPassword) { toast.error("As senhas não coincidem."); return; }

    setSavingPassword(true);
    const supabase = createClient();

    // Verificar senha atual fazendo re-autenticação
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      toast.error("Senha atual incorreta.");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("Erro ao atualizar senha. Tente novamente.");
    else {
      toast.success("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  const isPremium = plano === "premium";
  const initials  = fullName?.trim().split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const anoAtual  = new Date().getFullYear();

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[1,2,3,4].map(i => <div key={i} className="card h-32 animate-pulse bg-gray-100" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6" /> Perfil
        </h1>
        <p className="text-gray-500 text-sm mt-1">Seus dados pessoais e preferências</p>
      </div>

      {/* ── Dados pessoais ── */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <User className="w-4 h-4" /> Dados pessoais
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
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
              {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin text-gray-500" /> : <Camera className="w-3 h-3 text-gray-600" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Foto de perfil</p>
            <p className="text-xs text-gray-400">JPG, PNG ou WebP — máx. 2MB</p>
          </div>
        </div>

        {/* Formulário unificado: nome + e-mail + CNPJ → 1 botão */}
        <form onSubmit={handleSaveData} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input
              type="text" className="input" value={fullName}
              onChange={(e) => setFullName(e.target.value)} required
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input bg-gray-50 cursor-not-allowed" value={userEmail} disabled />
            <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado aqui.</p>
          </div>
          <div>
            <label className="label">CNPJ do MEI</label>
            <input
              type="text" className="input" placeholder="00.000.000/0001-00"
              value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              inputMode="numeric" maxLength={18}
            />
            <p className="text-xs text-gray-400 mt-1">Necessário para gerar sua Guia DAS.</p>
          </div>
          <button type="submit" disabled={savingData} className="btn-primary flex items-center gap-2">
            {savingData ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Salvar alterações"}
          </button>
        </form>
      </div>

      {/* ── WhatsApp — apenas Premium ── */}
      {isPremium && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-purple-500" /> WhatsApp
          </h2>
          <div>
            <label className="label">Celular para alertas</label>
            <div className="flex gap-2">
              <input
                type="tel" className="input" placeholder="(11) 99999-9999"
                value={whatsappPhone} onChange={(e) => setWhatsappPhone(formatPhone(e.target.value))}
                inputMode="numeric" maxLength={15}
              />
              <button type="button" onClick={handleSavePhone} disabled={savingPhone}
                className="btn-secondary text-sm whitespace-nowrap flex items-center gap-1.5">
                {savingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Salvar
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Alertas quando se aproximar do limite anual de R$ 81.000.
            </p>
          </div>
        </div>
      )}

      {/* ── Notificações ── */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Preferências de notificação
        </h2>
        <div className="space-y-4">
          {/* E-mail */}
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-700">Alertas por e-mail</p>
              <p className="text-xs text-gray-400 mt-0.5">Aviso quando atingir 70%, 90% e 100% do limite anual</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifEmail}
              onClick={() => setNotifEmail(!notifEmail)}
              className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none ${notifEmail ? "bg-brand-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifEmail ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </label>

          {/* WhatsApp — só Premium */}
          {isPremium && (
            <label className="flex items-start justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Alertas por WhatsApp</p>
                <p className="text-xs text-gray-400 mt-0.5">Mensagem no celular cadastrado acima</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifWhatsapp}
                onClick={() => setNotifWhatsapp(!notifWhatsapp)}
                className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors focus:outline-none ${notifWhatsapp ? "bg-purple-500" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifWhatsapp ? "translate-x-5" : "translate-x-1"}`} />
              </button>
            </label>
          )}
        </div>
        <button onClick={handleSaveNotif} disabled={savingNotif} className="btn-secondary text-sm flex items-center gap-2">
          {savingNotif ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : "Salvar preferências"}
        </button>
      </div>

      {/* ── Ano de referência ── */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Ano de referência
        </h2>
        <div>
          <label className="label">Ano fiscal acompanhado</label>
          <div className="flex gap-2">
            <select className="input" value={anoRef} onChange={(e) => setAnoRef(Number(e.target.value))}>
              {[anoAtual - 1, anoAtual, anoAtual + 1].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button type="button" onClick={handleSaveAno} disabled={savingAno}
              className="btn-secondary text-sm whitespace-nowrap flex items-center gap-1.5">
              {savingAno ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Salvar
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">O dashboard exibe o faturamento do ano selecionado.</p>
        </div>
      </div>

      {/* ── Alterar senha ── */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Alterar senha
        </h2>
        <form onSubmit={handleSavePassword} className="space-y-4">
          {/* Senha atual */}
          <div>
            <label className="label">Senha atual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className="input pr-10"
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Nova senha */}
          <div>
            <label className="label">Nova senha</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="input pr-10"
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Confirmar senha */}
          <div>
            <label className="label">Confirmar nova senha</label>
            <input
              type={showNew ? "text" : "password"}
              className="input"
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={savingPassword || (!!confirmPassword && newPassword !== confirmPassword)}
            className="btn-primary flex items-center gap-2"
          >
            {savingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : "Atualizar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
