import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * DELETE /api/account
 * Remove completamente a conta do usuário (LGPD Art. 18).
 * Exclui: notas fiscais, perfil, assinatura Stripe, usuário Supabase Auth.
 */
export async function DELETE(request: NextRequest) {
  // Rate limiting — máximo 3 tentativas por hora por IP
  const rl = await checkRateLimit(getClientIp(request), { limit: 3, windowMs: 60 * 60_000, prefix: "delete-account" });
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 hora." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Buscar perfil para pegar stripe_customer_id e subscription_id
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id, plano")
      .eq("id", user.id)
      .single();

    // 2. Cancelar assinatura Stripe (se existir)
    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        console.log(`[DeleteAccount] Assinatura cancelada: ${profile.stripe_subscription_id}`);
      } catch (err) {
        // Não falhar se a assinatura já foi cancelada
        console.warn(`[DeleteAccount] Erro ao cancelar assinatura:`, err);
      }
    }

    // 3. Deletar customer no Stripe (se existir)
    if (profile?.stripe_customer_id) {
      try {
        await stripe.customers.del(profile.stripe_customer_id);
        console.log(`[DeleteAccount] Customer Stripe removido: ${profile.stripe_customer_id}`);
      } catch (err) {
        console.warn(`[DeleteAccount] Erro ao remover customer:`, err);
      }
    }

    // 4. Deletar notas fiscais
    const { error: notasError } = await admin
      .from("notas_fiscais")
      .delete()
      .eq("user_id", user.id);
    if (notasError) throw new Error(`Erro ao deletar notas: ${notasError.message}`);

    // 5. Deletar histórico anual
    await admin.from("historico_anual").delete().eq("user_id", user.id);

    // 6. Deletar perfil
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("id", user.id);
    if (profileError) throw new Error(`Erro ao deletar perfil: ${profileError.message}`);

    // 7. Deletar usuário do Supabase Auth (operação irreversível)
    const { error: authError } = await admin.auth.admin.deleteUser(user.id);
    if (authError) throw new Error(`Erro ao deletar usuário auth: ${authError.message}`);

    console.log(`[DeleteAccount] Conta excluída com sucesso: ${user.id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[DeleteAccount] Erro:", msg);
    return NextResponse.json({ error: "Erro ao excluir conta. Tente novamente." }, { status: 500 });
  }
}
