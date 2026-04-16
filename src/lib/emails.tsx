import { Resend } from "resend";

// Instanciado de forma lazy para não falhar no build sem a chave
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

const FROM = "Portal MEIguia <alertas@portalmeiguia.com.br>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.portalmeiguia.com.br";

interface AlertEmailParams {
  to: string;
  nome: string;
  percentual: number;     // 70, 90 ou 100+
  totalFaturado: number;
  limiteRestante: number;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getAlertContent(percentual: number, total: number, restante: number) {
  if (percentual >= 100) {
    return {
      subject: "🚨 LIMITE MEI ULTRAPASSADO — Ação necessária",
      headline: "Você ultrapassou o limite anual do MEI",
      body: `Seu faturamento chegou a <strong>${formatBRL(total)}</strong>, ultrapassando o limite de R$ 81.000 do MEI.<br><br>
        <strong>O que fazer agora:</strong><br>
        • Pare de emitir notas até o fim do ano fiscal<br>
        • Consulte um contador sobre a conversão para ME/EPP<br>
        • Regularize sua situação para evitar multas`,
      ctaText: "Ver meu faturamento",
      color: "#DC2626",
      bgColor: "#FEF2F2",
    };
  }
  if (percentual >= 90) {
    return {
      subject: `⚠️ ${percentual.toFixed(0)}% do limite MEI atingido — Restam ${formatBRL(restante)}`,
      headline: `Você atingiu ${percentual.toFixed(0)}% do limite anual`,
      body: `Seu faturamento está em <strong>${formatBRL(total)}</strong>.<br>
        Restam apenas <strong>${formatBRL(restante)}</strong> antes de atingir o limite de R$ 81.000.<br><br>
        Gerencie com cuidado as notas dos próximos meses para não ser surpreendido.`,
      ctaText: "Ver previsão de faturamento",
      color: "#EA580C",
      bgColor: "#FFF7ED",
    };
  }
  return {
    subject: `📊 Metade do caminho: você usou ${percentual.toFixed(0)}% do limite MEI`,
    headline: `Você atingiu ${percentual.toFixed(0)}% do seu limite anual`,
    body: `Seu faturamento acumulado é de <strong>${formatBRL(total)}</strong>.<br>
      Você ainda tem <strong>${formatBRL(restante)}</strong> disponíveis até o limite de R$ 81.000.<br><br>
      Continue monitorando para evitar surpresas no final do ano.`,
    ctaText: "Ver meu dashboard",
    color: "#D97706",
    bgColor: "#FFFBEB",
  };
}

export async function sendLimitAlertEmail(params: AlertEmailParams) {
  const { to, nome, percentual, totalFaturado, limiteRestante } = params;
  const content = getAlertContent(percentual, totalFaturado, limiteRestante);
  const primeiroNome = nome?.split(" ")[0] || "MEI";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08);max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1A6B8A,#16A085);padding:32px 40px;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:300;">Portal</p>
            <p style="margin:4px 0 0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">MEI<span style="font-weight:300;color:rgba(255,255,255,0.8)">guia</span></p>
          </td>
        </tr>

        <!-- Alert banner -->
        <tr>
          <td style="background:${content.bgColor};padding:20px 40px;border-bottom:2px solid ${content.color}20;">
            <p style="margin:0;font-size:18px;font-weight:700;color:${content.color};">${content.headline}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#374151;font-size:15px;">Olá, <strong>${primeiroNome}</strong>!</p>
            <p style="margin:0 0 24px;color:#4B5563;font-size:15px;line-height:1.6;">${content.body}</p>

            <!-- Barra de progresso -->
            <div style="background:#E5E7EB;border-radius:8px;height:12px;margin:0 0 8px;overflow:hidden;">
              <div style="background:${content.color};height:12px;width:${Math.min(percentual, 100).toFixed(0)}%;border-radius:8px;"></div>
            </div>
            <p style="margin:0 0 28px;color:#6B7280;font-size:13px;">${percentual.toFixed(1)}% utilizado — ${formatBRL(totalFaturado)} de R$ 81.000</p>

            <!-- CTA -->
            <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1A6B8A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">${content.ctaText} →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:24px 40px;border-top:1px solid #E5E7EB;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.6;">
              Você está recebendo este e-mail porque tem uma conta no Portal MEIguia.<br>
              <a href="${APP_URL}/configuracoes" style="color:#1A6B8A;">Gerenciar notificações</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: content.subject,
    html,
  });
}
