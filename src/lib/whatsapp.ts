const ZAPI_INSTANCE     = process.env.ZAPI_INSTANCE_ID!;
const ZAPI_TOKEN        = process.env.ZAPI_TOKEN!;
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN!;
const ZAPI_BASE         = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  // Normaliza para formato internacional brasileiro (55 + DDD + número)
  const digits = phone.replace(/\D/g, "");
  const e164   = digits.startsWith("55") ? digits : `55${digits}`;

  const res = await fetch(`${ZAPI_BASE}/send-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "client-token": ZAPI_CLIENT_TOKEN,
    },
    body: JSON.stringify({ phone: e164, message }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Z-API error ${res.status}: ${body}`);
  }
}

// ── Mensagens de alerta de limite ────────────────────────────────────────────

export function mensagemAlerta70(nome: string, total: number, restante: number): string {
  return (
    `🟡 *Alerta MEIGuia — 70% do limite atingido*\n\n` +
    `Olá, ${nome}! Você já faturou *R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}* este ano.\n\n` +
    `Ainda restam *R$ ${restante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}* antes de atingir o teto do MEI (R$ 81.000).\n\n` +
    `Acesse o portal para acompanhar sua previsão: https://meiguia.com.br/dashboard`
  );
}

export function mensagemAlerta90(nome: string, total: number, restante: number): string {
  return (
    `🔴 *ATENÇÃO — 90% do limite MEI atingido*\n\n` +
    `${nome}, você faturou *R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}* e está muito próximo do limite anual!\n\n` +
    `Restam apenas *R$ ${restante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}*. Considere pausar novos serviços ou consultar um contador.\n\n` +
    `👉 https://meiguia.com.br/dashboard`
  );
}

export function mensagemAlerta100(nome: string, total: number): string {
  return (
    `🚨 *Limite MEI atingido!*\n\n` +
    `${nome}, você atingiu *R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}* — o limite anual do MEI foi ultrapassado.\n\n` +
    `Procure um contador o quanto antes para regularizar sua situação.\n\n` +
    `📊 Acesse: https://meiguia.com.br/dashboard`
  );
}
