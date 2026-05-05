import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendDasLembreteEmail } from "@/lib/emails";
import { sendWhatsApp, mensagemLembreteDas } from "@/lib/whatsapp";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const DAS_ADICIONAL: Record<string, number> = {
  comercio:  1.00,
  industria: 1.00,
  servicos:  5.00,
  misto:     6.00,
};

/**
 * GET /api/cron/lembrete-das
 * Roda no dia 15 de cada mês às 10h UTC.
 * Envia lembrete de DAS por e-mail (todos com CNPJ) e WhatsApp (Premium com celular).
 * Pula quem já marcou o mês como pago.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const agora    = new Date();
  const ano      = agora.getFullYear();
  const mes      = agora.getMonth() + 1;
  const mesNome  = MESES[agora.getMonth()];
  const mesRef   = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const vencimento = `20/${String(mes).padStart(2, "0")}/${ano}`;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, cnpj, plano, atividade_mei, whatsapp_phone, notif_email, notif_whatsapp")
    .not("cnpj", "is", null)
    .not("email", "is", null);

  if (!profiles?.length) return NextResponse.json({ ok: true, enviados: 0 });

  // Quem já pagou este mês
  const { data: pagos } = await supabase
    .from("das_guias")
    .select("user_id")
    .eq("mes_referencia", mesRef)
    .eq("status", "pago");

  const userIdsPagos = new Set((pagos ?? []).map((p) => p.user_id));

  let emailsEnviados = 0;
  let whatsEnviados  = 0;
  const erros: string[] = [];

  for (const p of profiles) {
    if (!p.cnpj || !p.email) continue;
    if (userIdsPagos.has(p.id)) continue;

    const atividade = p.atividade_mei ?? "servicos";
    const valorDas  = 75.90 + (DAS_ADICIONAL[atividade] ?? 5.00);
    const nome      = p.full_name ?? "MEI";

    // E-mail (respeita preferência notif_email, padrão true)
    if (p.notif_email !== false) {
      try {
        await sendDasLembreteEmail({
          to: p.email,
          nome,
          mes: mesNome,
          ano,
          cnpj: p.cnpj,
          jaFoiPago: false,
        });
        emailsEnviados++;
      } catch (err) {
        erros.push(`email user=${p.id}: ${String(err)}`);
        console.error("[Cron/LembreteDas] Email falhou:", err);
      }
    }

    // WhatsApp — apenas Premium com celular e preferência ativa
    if (p.plano === "premium" && p.whatsapp_phone && p.notif_whatsapp !== false) {
      try {
        const msg = mensagemLembreteDas(nome, mesNome, valorDas, vencimento);
        await sendWhatsApp(p.whatsapp_phone, msg);
        whatsEnviados++;
        console.log(`[Cron/LembreteDas] WhatsApp enviado: user=${p.id}`);
      } catch (err) {
        erros.push(`whatsapp user=${p.id}: ${String(err)}`);
        console.error("[Cron/LembreteDas] WhatsApp falhou:", err);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    emailsEnviados,
    whatsEnviados,
    erros: erros.length ? erros : undefined,
  });
}
