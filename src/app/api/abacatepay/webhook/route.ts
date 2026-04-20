import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

/**
 * POST /api/abacatepay/webhook
 * Recebe notificações de pagamento PIX da Abacatepay.
 * Quando o pagamento é confirmado, ativa o plano Pro por 30 dias.
 *
 * Protegido por ABACATEPAY_WEBHOOK_SECRET (token enviado no header).
 */
export async function POST(request: NextRequest) {
  // Verificar token de segurança do webhook
  const webhookToken = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (webhookToken) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${webhookToken}`) {
      console.warn("[AbacatePay Webhook] Token inválido");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  console.log("[AbacatePay Webhook] Evento recebido:", JSON.stringify(payload, null, 2));

  // Abacatepay envia status PAID/EXPIRED/PENDING
  // Estrutura: { event: "billing.paid", data: { billing: { status, metadata, ... } } }
  const event = payload.event as string | undefined;
  const billing = (payload?.data as Record<string, unknown>)?.billing as Record<string, unknown> | undefined;
  const status = billing?.status as string | undefined;
  const metadata = billing?.metadata as Record<string, string> | undefined;
  const userId = metadata?.supabase_user_id;

  if (!userId) {
    console.warn("[AbacatePay Webhook] supabase_user_id ausente no metadata");
    return NextResponse.json({ ok: true }); // não falhar — só ignorar
  }

  // Processar apenas pagamentos confirmados
  const isPaid = event === "billing.paid" || status === "PAID";
  if (!isPaid) {
    console.log(`[AbacatePay Webhook] Evento ignorado: event=${event} status=${status}`);
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Ativar plano Pro por 30 dias
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { error } = await supabase
    .from("profiles")
    .update({
      plano: "pro",
      subscription_status: "active",
      pro_expires_at: expiresAt.toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[AbacatePay Webhook] Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  console.log(`[AbacatePay Webhook] Plano Pro ativado: user=${userId} até=${expiresAt.toISOString()}`);
  return NextResponse.json({ ok: true });
}
