import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendEndOfMonthAlertEmail } from "@/lib/emails";
import { LIMITE_MEI } from "@/lib/constants";

/**
 * GET /api/cron/alerta-fim-mes
 * Roda no dia 28 de cada mês. Envia alerta de fim de mês para usuários que
 * têm ao menos 1 nota no ano atual. Tom urgente se >= 70% do limite.
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
  const anoAtual   = agora.getFullYear();
  const fimDoAno   = new Date(anoAtual, 11, 31);
  const diasRestantesAno = Math.ceil((fimDoAno.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .not("email", "is", null);

  if (!profiles?.length) return NextResponse.json({ ok: true, enviados: 0 });

  const { data: notasAno } = await supabase
    .from("notas_fiscais")
    .select("user_id, valor")
    .gte("data", `${anoAtual}-01-01`)
    .lte("data", `${anoAtual}-12-31`);

  const totalAnoPorUser = new Map<string, number>();
  for (const n of notasAno ?? []) {
    totalAnoPorUser.set(n.user_id, (totalAnoPorUser.get(n.user_id) ?? 0) + Number(n.valor));
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const p of profiles) {
    const totalAno = totalAnoPorUser.get(p.id) ?? 0;
    if (totalAno === 0) continue; // Sem movimento no ano, não incomoda

    try {
      const percentualAno = (totalAno / LIMITE_MEI) * 100;
      const restante = Math.max(LIMITE_MEI - totalAno, 0);

      await sendEndOfMonthAlertEmail({
        to: p.email!,
        nome: p.full_name ?? "MEI",
        totalAno,
        percentualAno,
        restante,
        diasRestantesAno,
      });
      enviados++;
    } catch (err) {
      erros.push(`user=${p.id}: ${String(err)}`);
      console.error("[Cron/AlertaFimMes]", err);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros: erros.length ? erros : undefined });
}
