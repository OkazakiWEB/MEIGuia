import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DasPageClient } from "./DasPageClient";
import type { DasGuia } from "@/types/database";

export const metadata = { title: "Guias DAS — MEIGuia" };

type AtividadeMei = "comercio" | "industria" | "servicos" | "misto";

const DAS_ADICIONAL: Record<AtividadeMei, number> = {
  comercio:  1.00,
  industria: 1.00,
  servicos:  5.00,
  misto:     6.00,
};

export default async function DasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hoje     = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const mesStr   = String(mesAtual).padStart(2, "0");
  const mesRef   = `${anoAtual}-${mesStr}-01`;

  const [{ data: profile }, { data: notasMes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("cnpj, full_name, plano, atividade_mei")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notas_fiscais")
      .select("valor")
      .eq("user_id", user.id)
      .gte("data", `${anoAtual}-${mesStr}-01`)
      .lte("data", `${anoAtual}-${mesStr}-31`),
  ]);

  if (profile?.plano !== "premium") redirect("/assinatura?upgrade=premium");

  const atividade = (profile?.atividade_mei as AtividadeMei) ?? "servicos";
  const valorDas  = 75.90 + DAS_ADICIONAL[atividade];
  const faturamento = (notasMes ?? []).reduce((sum, n) => sum + Number(n.valor), 0);

  // Auto-upsert da guia do mês atual
  await supabase
    .from("das_guias")
    .upsert(
      { user_id: user.id, mes_referencia: mesRef, faturamento_mes: faturamento, valor_das: valorDas },
      { onConflict: "user_id,mes_referencia", ignoreDuplicates: false }
    );

  // Buscar histórico do ano
  const { data: guias } = await supabase
    .from("das_guias")
    .select("*")
    .eq("user_id", user.id)
    .gte("mes_referencia", `${anoAtual}-01-01`)
    .lte("mes_referencia", `${anoAtual}-12-31`)
    .order("mes_referencia", { ascending: true });

  return (
    <DasPageClient
      userId={user.id}
      cnpj={profile?.cnpj ?? null}
      guias={(guias ?? []) as DasGuia[]}
      anoAtual={anoAtual}
      atividadeMei={atividade}
      faturamentoMesAtual={faturamento}
      valorDasEstimado={valorDas}
    />
  );
}
