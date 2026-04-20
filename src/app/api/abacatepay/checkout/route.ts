import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ABACATEPAY_API = "https://api.abacatepay.com/v1";
const PRO_PRICE_CENTAVOS = 1490; // R$ 14,90

/**
 * POST /api/abacatepay/checkout
 * Cria uma cobrança PIX via Abacatepay para assinar o plano Pro (30 dias).
 * Body: { cpf: string, phone: string }
 */
export async function POST(request: NextRequest) {
  if (!process.env.ABACATEPAY_API_KEY) {
    console.error("[AbacatePay] ABACATEPAY_API_KEY não configurada");
    return NextResponse.json(
      { error: "Pagamento PIX temporariamente indisponível." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plano, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.plano === "pro") {
    return NextResponse.json({ error: "Você já tem o plano Pro" }, { status: 400 });
  }

  let cpf = "";
  let phone = "";
  try {
    const body = await request.json();
    cpf = String(body.cpf || "").replace(/\D/g, "");
    phone = String(body.phone || "").replace(/\D/g, "");
  } catch {
    // body inválido
  }

  if (!cpf) {
    return NextResponse.json({ error: "CPF é obrigatório." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ error: "Celular é obrigatório." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const payload = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          externalId: `pro-${user.id}`,
          name: "Portal MEIguia — Plano Pro",
          description: "Acesso ao plano Pro por 30 dias",
          quantity: 1,
          price: PRO_PRICE_CENTAVOS,
        },
      ],
      returnUrl: `${appUrl}/assinatura?pix_canceled=true`,
      completionUrl: `${appUrl}/assinatura?pix_success=true`,
      customer: {
        name: profile?.full_name || "Cliente MEIguia",
        email: user.email!,
        cellphone: phone,
        taxId: cpf,
      },
      metadata: {
        supabase_user_id: user.id,
      },
    };

    const res = await fetch(`${ABACATEPAY_API}/billing/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      console.error("[AbacatePay] Erro na API:", data);
      return NextResponse.json(
        { error: data.error || "Erro ao gerar cobrança PIX. Tente novamente." },
        { status: 500 }
      );
    }

    const checkoutUrl = data?.data?.url ?? data?.url;
    if (!checkoutUrl) {
      console.error("[AbacatePay] URL não retornada:", data);
      return NextResponse.json(
        { error: "Erro ao gerar link PIX. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[AbacatePay] Erro ao criar cobrança:", msg);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento PIX. Verifique sua conexão." },
      { status: 500 }
    );
  }
}
