"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Settings, User, LogOut, Trash2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single<{ full_name: string | null; email: string | null }>();

      setFullName(profile?.full_name || "");
      setEmail(profile?.email || user.email || "");
      setLoadingProfile(false);
    }
    load();
  }, []);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (error) toast.error("Erro ao atualizar nome.");
    else toast.success("Nome atualizado!");
    setLoading(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Configurações
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie sua conta</p>
      </div>

      {/* Perfil */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Perfil
        </h2>
        {loadingProfile ? (
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
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
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        )}
      </div>

      {/* Sessão */}
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

      {/* Zona de perigo */}
      <div className="card border-red-100">
        <h2 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Zona de perigo
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          A exclusão da conta é permanente e remove todos os seus dados.
          Para excluir sua conta, entre em contato com o suporte.
        </p>
        <a
          href="mailto:suporte@meicontrol.com.br?subject=Solicitar exclusão de conta"
          className="text-sm text-red-600 underline"
        >
          Solicitar exclusão de conta
        </a>
      </div>
    </div>
  );
}
