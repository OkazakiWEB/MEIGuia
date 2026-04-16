import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotaForm } from "../NotaForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NovaNota() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar limite free antes de renderizar o formulário
  const { data: profile } = await supabase
    .from("profiles")
    .select("plano")
    .eq("id", user.id)
    .single();

  const isPro = profile?.plano === "pro";

  if (!isPro) {
    const { data: qtdMes } = await supabase.rpc("get_notas_mes_atual", {
      p_user_id: user.id,
    });
    if ((qtdMes ?? 0) >= 20) {
      redirect("/notas?limit=true");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/notas" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar para notas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova nota fiscal</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registre uma nota emitida para controlar seu faturamento.
        </p>
      </div>
      <div className="card">
        <NotaForm userId={user.id} isPro={isPro} />
      </div>
    </div>
  );
}
