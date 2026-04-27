import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DasPageClient } from "./DasPageClient";

export const metadata = { title: "Guias DAS — MEIGuia" };

export default async function DasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const anoAtual = new Date().getFullYear();

  const [{ data: profile }, { data: pagamentos }] = await Promise.all([
    supabase.from("profiles").select("cnpj, full_name").eq("id", user.id).single(),
    supabase
      .from("das_pagamentos")
      .select("*")
      .eq("user_id", user.id)
      .gte("competencia", `${anoAtual}-01-01`)
      .lte("competencia", `${anoAtual}-12-31`)
      .order("competencia", { ascending: true }),
  ]);

  return (
    <DasPageClient
      userId={user.id}
      cnpj={profile?.cnpj ?? null}
      pagamentos={(pagamentos ?? []) as import("@/types/database").DasPagamento[]}
      anoAtual={anoAtual}
    />
  );
}
