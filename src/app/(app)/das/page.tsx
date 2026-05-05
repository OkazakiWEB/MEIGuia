import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DasPageClient } from "./DasPageClient";

export const metadata = { title: "Guias DAS — MEIGuia" };

export default async function DasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;
  const mesStr   = String(mesAtual).padStart(2, "0");

  const [{ data: profile }, { data: pagamentos }, { data: notasMes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("cnpj, full_name, plano, atividade_mei")
      .eq("id", user.id)
      .single(),
    supabase
      .from("das_pagamentos")
      .select("*")
      .eq("user_id", user.id)
      .gte("competencia", `${anoAtual}-01-01`)
      .lte("competencia", `${anoAtual}-12-31`)
      .order("competencia", { ascending: true }),
    supabase
      .from("notas_fiscais")
      .select("valor")
      .eq("user_id", user.id)
      .gte("data", `${anoAtual}-${mesStr}-01`)
      .lte("data", `${anoAtual}-${mesStr}-31`),
  ]);

  if (profile?.plano !== "premium") redirect("/assinatura?upgrade=premium");

  const faturamentoMesAtual = (notasMes ?? []).reduce((sum, n) => sum + Number(n.valor), 0);

  return (
    <DasPageClient
      userId={user.id}
      cnpj={profile?.cnpj ?? null}
      pagamentos={(pagamentos ?? []) as import("@/types/database").DasPagamento[]}
      anoAtual={anoAtual}
      atividadeMei={(profile?.atividade_mei as "comercio" | "industria" | "servicos" | "misto") ?? "servicos"}
      faturamentoMesAtual={faturamentoMesAtual}
    />
  );
}
