import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { NotaForm } from "../../NotaForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarNota({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: nota }, { data: profile }] = await Promise.all([
    supabase.from("notas_fiscais").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("plano").eq("id", user.id).single(),
  ]);

  if (!nota) notFound();
  const isPro = profile?.plano === "pro";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/notas" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar para notas
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar nota fiscal</h1>
      </div>
      <div className="card">
        <NotaForm userId={user.id} isPro={isPro} nota={nota} />
      </div>
    </div>
  );
}
