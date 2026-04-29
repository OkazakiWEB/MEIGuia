import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { sendLimitAlertEmail } from "@/lib/emails";
import { LIMITE_MEI } from "@/lib/constants";
import { sendWhatsApp, mensagemAlerta70, mensagemAlerta90, mensagemAlerta100 } from "@/lib/whatsapp";

/**
 * GET /api/cron/alertas
 * Executado automaticamente pelo Vercel Cron todos os dias às 09:00 BRT.
 * Verifica usuários que cruzaram limiares de 70%, 90% e 100% do limite MEI
 * e envia e-mail de alerta (apenas uma vez por limiar por ano).
 *
 * Protegido por CRON_SECRET para evitar chamadas não autorizadas.
 */
export async function GET(request: NextRequest) {
  // Verificar autorização (Vercel define Authorization: Bearer <CRON_SECRET>)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const anoAtual = new Date().getFullYear();

  try {
    // Buscar todos os usuários com e-mail confirmado
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, plano, whatsapp_phone, last_alert_sent, last_alert_year")
      .not("email", "is", null);

    if (error) throw error;
    if (!profiles?.length) return NextResponse.json({ processed: 0 });

    // Buscar faturamento de todos os usuários de uma vez (batch — evita N queries em loop)
    const { data: faturamentos } = await supabase
      .from("notas_fiscais")
      .select("user_id, valor")
      .gte("data", `${anoAtual}-01-01`)
      .lte("data", `${anoAtual}-12-31`);

    const totalPorUser = new Map<string, number>();
    for (const row of faturamentos ?? []) {
      totalPorUser.set(row.user_id, (totalPorUser.get(row.user_id) ?? 0) + Number(row.valor));
    }

    let emailsEnviados = 0;
    const erros: string[] = [];

    for (const profile of profiles) {
      try {
        const total = totalPorUser.get(profile.id) ?? 0;
        if (!total || total <= 0) continue;

        const percentual = (total / LIMITE_MEI) * 100;
        const limiteRestante = Math.max(LIMITE_MEI - total, 0);

        // Determinar qual alerta deve ser enviado
        const targetLevel =
          percentual >= 100 ? "100" :
          percentual >= 90  ? "90"  :
          percentual >= 70  ? "70"  : null;

        if (!targetLevel) continue;

        // Não enviar se já foi enviado este nível neste ano
        const jaEnviado =
          profile.last_alert_sent === targetLevel &&
          profile.last_alert_year === anoAtual;

        // Não "regredir" alerta (ex: se já enviou 90%, não enviar 70% de novo)
        const nivelAnterior = profile.last_alert_year === anoAtual
          ? Number(profile.last_alert_sent ?? 0)
          : 0;

        if (jaEnviado || Number(targetLevel) <= nivelAnterior) continue;

        const nome = profile.full_name ?? "MEI";

        // Enviar e-mail (todos os planos)
        await sendLimitAlertEmail({
          to: profile.email!,
          nome,
          percentual,
          totalFaturado: total,
          limiteRestante,
        });

        // Enviar WhatsApp (apenas Premium com celular cadastrado)
        if (profile.plano === "premium" && profile.whatsapp_phone) {
          try {
            const msg =
              targetLevel === "100" ? mensagemAlerta100(nome, total) :
              targetLevel === "90"  ? mensagemAlerta90(nome, total, limiteRestante) :
                                      mensagemAlerta70(nome, total, limiteRestante);
            await sendWhatsApp(profile.whatsapp_phone, msg);
            console.log(`[Cron/Alertas] WhatsApp enviado: user=${profile.id} level=${targetLevel}%`);
          } catch (waErr) {
            console.error(`[Cron/Alertas] WhatsApp falhou user=${profile.id}:`, waErr);
          }
        }

        // Registrar envio para não repetir
        await supabase
          .from("profiles")
          .update({ last_alert_sent: targetLevel, last_alert_year: anoAtual })
          .eq("id", profile.id);

        emailsEnviados++;
        console.log(`[Cron/Alertas] Email enviado: user=${profile.id} level=${targetLevel}% total=${total}`);
      } catch (err) {
        const msg = `user=${profile.id}: ${String(err)}`;
        erros.push(msg);
        console.error(`[Cron/Alertas] Erro ao processar ${msg}`);
      }
    }

    return NextResponse.json({
      ok: true,
      processados: profiles.length,
      emailsEnviados,
      erros: erros.length ? erros : undefined,
    });
  } catch (err) {
    console.error("[Cron/Alertas] Erro geral:", err);
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
