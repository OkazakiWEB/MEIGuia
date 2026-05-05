import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

/**
 * GET /api/cnpj/:cnpj
 * Proxy para BrasilAPI — busca dados do CNPJ e salva município no perfil.
 * Autenticado: apenas o próprio usuário pode buscar.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { cnpj } = await params;
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, {
      headers: { "User-Agent": "MEIguia/1.0" },
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) {
      return NextResponse.json({ error: "CNPJ não encontrado" }, { status: 404 });
    }

    const data = await res.json();
    const municipio = data.municipio as string | undefined;
    const uf        = data.uf as string | undefined;

    // Salva município no perfil para não repetir a busca
    if (municipio) {
      const admin = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await admin
        .from("profiles")
        .update({ municipio_nome: municipio, municipio_uf: uf ?? null })
        .eq("id", user.id);
    }

    return NextResponse.json({
      municipio: municipio ?? null,
      uf: uf ?? null,
      razao_social: data.razao_social ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao consultar CNPJ" }, { status: 500 });
  }
}
