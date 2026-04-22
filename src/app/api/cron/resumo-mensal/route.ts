import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendMonthlyResumoEmail } from "@/lib/emails";
import { LIMITE_MEI } from "@/lib/constants";
const MESES_PT = [
  "janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro",
];

/**
 * GET /api/cron/resumo-mensal
 * Roda no dia 1 de cada mês. Envia resumo do mês anterior para todos os usuários
 * que tiveram ao menos 1 nota no período.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const agora      = new Date();
  const mesPrev    = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const anoRef     = mesPrev.getFullYear();
  const mesIdx     = mesPrev.getMonth();  // 0-based
  const mesNome    = MESES_PT[mesIdx];
  const primeiroDia = `${anoRef}-${String(mesIdx + 1).padStart(2, "0")}-01`;
  const ultimoDia   = new Date(anoRef, mesIdx + 1, 0).toISOString().split("T")[0];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .not("email", "is", null);

  if (!profiles?.length) return NextResponse.json({ ok: true, enviados: 0 });

  // Buscar todas as notas do mês anterior e do ano — em paralelo
  const [{ data: notasMes }, { data: notasAno }] = await Promise.all([
    supabase.from("notas_fiscais").select("user_id, valor")
      .gte("data", primeiroDia).lte("data", ultimoDia),
    supabase.from("notas_fiscais").select("user_id, valor")
      .gte("data", `${anoRef}-01-01`).lte("data", `${anoRef}-12-31`),
  ]);

  const totalMesPorUser = new Map<string, number>();
  for (const n of notasMes ?? []) {
    totalMesPorUser.set(n.user_id, (totalMesPorUser.get(n.user_id) ?? 0) + Number(n.valor));
  }
  const totalAnoPorUser = new Map<string, number>();
  for (const n of notasAno ?? []) {
    totalAnoPorUser.set(n.user_id, (totalAnoPorUser.get(n.user_id) ?? 0) + Number(n.valor));
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const p of profiles) {
    const totalMes = totalMesPorUser.get(p.id) ?? 0;
    if (totalMes === 0) continue; // Não envia para quem não teve movimento no mês

    try {
      const totalAno = totalAnoPorUser.get(p.id) ?? 0;
      const percentualAno = (totalAno / LIMITE_MEI) * 100;
      const restante = Math.max(LIMITE_MEI - totalAno, 0);

      await sendMonthlyResumoEmail({
        to: p.email!,
        nome: p.full_name ?? "MEI",
        mes: mesNome,
        totalMes,
        totalAno,
        percentualAno,
        restante,
      });
      enviados++;
    } catch (err) {
      erros.push(`user=${p.id}: ${String(err)}`);
      console.error("[Cron/ResumoMensal]", err);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros: erros.length ? erros : undefined });
}
