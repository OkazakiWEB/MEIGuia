import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EmitirNFPageClient } from "./EmitirNFPageClient";

export const metadata = { title: "Emitir NF — MEIGuia" };

export default async function EmitirNFPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plano, cnpj, full_name, municipio_nome, municipio_uf")
    .eq("id", user.id)
    .single();

  if (profile?.plano !== "premium") redirect("/assinatura?upgrade=premium");

  return (
    <EmitirNFPageClient
      cnpj={profile?.cnpj ?? null}
      municipioNome={profile?.municipio_nome ?? null}
      nomeEmitente={profile?.full_name ?? null}
    />
  );
}
