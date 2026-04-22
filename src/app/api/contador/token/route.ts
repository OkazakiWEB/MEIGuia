import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * POST /api/contador/token
 * Cria um novo token de acesso para contador.
 * Body: { label?: string; expires_days?: number }
 *
 * DELETE /api/contador/token
 * Revoga um token.
 * Body: { id: string }
 */

// ── Criar token ───────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const label: string = body.label?.trim() || "Meu contador";
  const expiresDays: number | null = body.expires_days ?? null;

  const expires_at = expiresDays
    ? new Date(Date.now() + expiresDays * 86_400_000).toISOString()
    : null;

  const { data, error } = await supabase
    .from("contador_tokens")
    .insert({ user_id: user.id, label, expires_at })
    .select("id, token, label, created_at, expires_at")
    .single();

  if (error) {
    console.error("[Contador/Token] Erro ao criar:", error);
    return NextResponse.json({ error: "Erro ao criar token." }, { status: 500 });
  }

  return NextResponse.json({ token: data });
}

// ── Revogar token ─────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  // Usa admin para contornar RLS — a autenticação do dono já foi verificada acima
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error, data } = await admin
    .from("contador_tokens")
    .update({ revoked: true })
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) return NextResponse.json({ error: "Erro ao revogar token." }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "Token não encontrado." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

// ── Listar tokens do usuário ──────────────────────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("contador_tokens")
    .select("id, token, label, created_at, expires_at, last_accessed_at, revoked")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Erro ao listar tokens." }, { status: 500 });

  return NextResponse.json({ tokens: data });
}

// ── Lookup público por token (usado pela view do contador) ────────────────────
export async function PATCH(request: NextRequest) {
  // Rate limiting apertado: endpoint público que expõe dados financeiros
  const rl = await checkRateLimit(getClientIp(request), { limit: 20, windowMs: 60 * 60 * 1000, prefix: "contador-lookup" });
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde antes de tentar novamente." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.token) return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tokenRow, error } = await admin
    .from("contador_tokens")
    .select("id, user_id, label, revoked, expires_at")
    .eq("token", body.token)
    .single();

  if (error || !tokenRow) return NextResponse.json({ error: "Token inválido." }, { status: 404 });
  if (tokenRow.revoked)   return NextResponse.json({ error: "Token revogado." }, { status: 403 });
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expirado." }, { status: 403 });
  }

  // Atualizar last_accessed_at
  await admin
    .from("contador_tokens")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", tokenRow.id);

  // Buscar dados do usuário
  const [
    { data: profile },
    { data: notas },
    { data: totalRpc },
  ] = await Promise.all([
    admin.from("profiles").select("full_name, email").eq("id", tokenRow.user_id).single(),
    admin.from("notas_fiscais")
      .select("id, data, descricao, cliente, numero_nf, valor")
      .eq("user_id", tokenRow.user_id)
      .gte("data", `${new Date().getFullYear()}-01-01`)
      .lte("data", `${new Date().getFullYear()}-12-31`)
      .order("data", { ascending: false }),
    admin.rpc("get_faturamento_anual", { p_user_id: tokenRow.user_id }),
  ]);

  return NextResponse.json({
    nomeUsuario: profile?.full_name || "MEI",
    email: profile?.email || "",
    totalAno: Number(totalRpc ?? 0),
    notas: notas || [],
  });
}
