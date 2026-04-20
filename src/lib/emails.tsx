import { Resend } from "resend";

// Instanciado de forma lazy para não falhar no build sem a chave
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

const FROM = "Portal MEIguia <alertas@portalmeiguia.com.br>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.portalmeiguia.com.br";

// ── Layout base compartilhado ─────────────────────────────────────────────────
function baseLayout({
  headerBg = "linear-gradient(135deg,#1A6B8A,#16A085)",
  bannerBg,
  bannerBorder,
  bannerText,
  body,
  ctaHref,
  ctaText,
  ctaColor = "#1A6B8A",
  footer,
}: {
  headerBg?: string;
  bannerBg?: string;
  bannerBorder?: string;
  bannerText?: string;
  body: string;
  ctaHref: string;
  ctaText: string;
  ctaColor?: string;
  footer?: string;
}) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08);max-width:100%;">
        <tr>
          <td style="background:${headerBg};padding:28px 40px;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:300;">Portal</p>
            <p style="margin:4px 0 0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">MEI<span style="font-weight:300;color:rgba(255,255,255,0.8)">guia</span></p>
          </td>
        </tr>
        ${bannerBg ? `<tr><td style="background:${bannerBg};padding:16px 40px;border-bottom:2px solid ${bannerBorder}20;">
          <p style="margin:0;font-size:17px;font-weight:700;color:${bannerBorder};">${bannerText}</p>
        </td></tr>` : ""}
        <tr>
          <td style="padding:32px 40px;">
            ${body}
            <a href="${ctaHref}" style="display:inline-block;background:${ctaColor};color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;margin-top:24px;">${ctaText} →</a>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #E5E7EB;">
            <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.6;">
              ${footer ?? "Você recebe este e-mail por ter uma conta no Portal MEIguia."}<br>
              <a href="${APP_URL}/configuracoes" style="color:#1A6B8A;">Gerenciar notificações</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── E-mail 1 — Boas-vindas (D+1) ─────────────────────────────────────────────
export async function sendWelcomeEmail({ to, nome }: { to: string; nome: string }) {
  const firstName = nome?.split(" ")[0] || "MEI";
  const html = baseLayout({
    ctaHref: `${APP_URL}/notas/nova`,
    ctaText: "Registrar minha primeira nota",
    body: `
      <p style="margin:0 0 16px;color:#374151;font-size:16px;font-weight:600;">Olá, ${firstName}! Bem-vindo ao Portal MEIguia 👋</p>
      <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.7;">
        Sua conta está pronta. Agora você tem um lugar para acompanhar quanto já faturou
        e saber exatamente quanto ainda pode ganhar antes de atingir o limite de <strong>R$ 81.000</strong> do MEI.
      </p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Comece com um passo simples:</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
        <tr><td style="padding:6px 0;color:#4B5563;font-size:14px;">✅&nbsp; Registre uma nota que você emitiu recentemente</td></tr>
        <tr><td style="padding:6px 0;color:#4B5563;font-size:14px;">📊&nbsp; Veja o gráfico do seu faturamento atualizado</td></tr>
        <tr><td style="padding:6px 0;color:#4B5563;font-size:14px;">🔔&nbsp; Ative os alertas para nunca ser pego de surpresa</td></tr>
      </table>
      <p style="margin:16px 0 0;color:#6B7280;font-size:13px;">Leva menos de 1 minuto. Sem planilha, sem complicação.</p>
    `,
  });

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${firstName}, seu MEI está protegido? Veja como saber agora`,
    html,
  });
}

// ── E-mail 2 — Reativação (15 dias sem nota) ─────────────────────────────────
export async function sendInactivityEmail({ to, nome }: { to: string; nome: string }) {
  const firstName = nome?.split(" ")[0] || "MEI";
  const html = baseLayout({
    bannerBg: "#FFFBEB",
    bannerBorder: "#D97706",
    bannerText: "Você não registrou nenhuma nota nos últimos 15 dias",
    ctaHref: `${APP_URL}/notas/nova`,
    ctaText: "Registrar uma nota agora",
    body: `
      <p style="margin:0 0 16px;color:#374151;font-size:15px;">Olá, <strong>${firstName}</strong>!</p>
      <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.7;">
        Faz 15 dias que você não registra nenhuma nota no Portal MEIguia.
      </p>
      <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.7;">
        Se você emitiu notas nesse período e não registrou, <strong>seu painel está desatualizado</strong>
        — e você pode estar mais perto do limite de R$ 81.000 do que imagina.
      </p>
      <div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 16px;">
        <p style="margin:0;color:#92400E;font-size:14px;line-height:1.6;">
          <strong>Não acompanhar o faturamento é a principal causa de MEIs que perdem o enquadramento sem perceber.</strong>
        </p>
      </div>
      <p style="margin:0;color:#6B7280;font-size:13px;">Leva menos de 30 segundos para registrar uma nota.</p>
    `,
  });

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${firstName}, seu painel está desatualizado — você pode estar perto do limite`,
    html,
  });
}

// ── E-mail 3 — Resumo mensal ──────────────────────────────────────────────────
export async function sendMonthlyResumoEmail({
  to,
  nome,
  mes,
  totalMes,
  totalAno,
  percentualAno,
  restante,
}: {
  to: string;
  nome: string;
  mes: string;          // ex: "março"
  totalMes: number;
  totalAno: number;
  percentualAno: number;
  restante: number;
}) {
  const firstName = nome?.split(" ")[0] || "MEI";
  const barColor =
    percentualAno >= 90 ? "#DC2626" :
    percentualAno >= 70 ? "#EA580C" :
    percentualAno >= 40 ? "#D97706" : "#1A6B8A";

  const statusTexto =
    percentualAno >= 90 ? "⚠️ Atenção: você está muito próximo do limite." :
    percentualAno >= 70 ? "Fique de olho — você já passou de 70% do limite." :
                          "Tudo dentro do controle. Continue assim!";

  const html = baseLayout({
    ctaHref: `${APP_URL}/dashboard`,
    ctaText: "Ver meu dashboard completo",
    body: `
      <p style="margin:0 0 16px;color:#374151;font-size:15px;">Olá, <strong>${firstName}</strong>!</p>
      <p style="margin:0 0 20px;color:#4B5563;font-size:15px;line-height:1.7;">
        Aqui está o resumo do seu faturamento em <strong>${mes}</strong>:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:12px;overflow:hidden;margin:0 0 20px;">
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Faturado em ${mes}</p>
            <p style="margin:4px 0 0;color:#111827;font-size:22px;font-weight:700;">${formatBRL(totalMes)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Total acumulado no ano</p>
            <p style="margin:4px 0 0;color:#111827;font-size:22px;font-weight:700;">${formatBRL(totalAno)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0;color:#6B7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Ainda disponível</p>
            <p style="margin:4px 0 0;color:#059669;font-size:22px;font-weight:700;">${formatBRL(restante)}</p>
          </td>
        </tr>
      </table>
      <div style="background:#E5E7EB;border-radius:8px;height:10px;margin:0 0 6px;overflow:hidden;">
        <div style="background:${barColor};height:10px;width:${Math.min(percentualAno, 100).toFixed(0)}%;border-radius:8px;"></div>
      </div>
      <p style="margin:0 0 20px;color:#6B7280;font-size:13px;">${percentualAno.toFixed(1)}% do limite anual utilizado</p>
      <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${statusTexto}</p>
    `,
  });

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Seu resumo de ${mes}: você usou ${percentualAno.toFixed(0)}% do limite do MEI`,
    html,
  });
}

// ── E-mail 4 — Alerta de fim de mês ──────────────────────────────────────────
export async function sendEndOfMonthAlertEmail({
  to,
  nome,
  totalAno,
  percentualAno,
  restante,
  diasRestantesAno,
}: {
  to: string;
  nome: string;
  totalAno: number;
  percentualAno: number;
  restante: number;
  diasRestantesAno: number;
}) {
  const firstName = nome?.split(" ")[0] || "MEI";
  const urgente = percentualAno >= 70;

  const html = baseLayout({
    bannerBg: urgente ? "#FFF7ED" : "#EFF6FF",
    bannerBorder: urgente ? "#EA580C" : "#3B82F6",
    bannerText: urgente
      ? `Você já usou ${percentualAno.toFixed(0)}% do limite — confira antes de virar o mês`
      : `Fim de mês chegando — veja como está seu faturamento`,
    ctaHref: `${APP_URL}/dashboard`,
    ctaText: "Ver meu dashboard",
    ctaColor: urgente ? "#EA580C" : "#1A6B8A",
    body: `
      <p style="margin:0 0 16px;color:#374151;font-size:15px;">Olá, <strong>${firstName}</strong>!</p>
      <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.7;">
        O mês está acabando. Antes de virar, vale conferir se todas as suas notas estão registradas.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:12px;padding:16px 20px;margin:0 0 20px;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">
            <table width="100%"><tr>
              <td style="color:#6B7280;font-size:14px;">Faturado até agora</td>
              <td align="right" style="color:#111827;font-size:14px;font-weight:700;">${formatBRL(totalAno)}</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #E5E7EB;">
            <table width="100%"><tr>
              <td style="color:#6B7280;font-size:14px;">Ainda disponível este ano</td>
              <td align="right" style="color:#059669;font-size:14px;font-weight:700;">${formatBRL(restante)}</td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <table width="100%"><tr>
              <td style="color:#6B7280;font-size:14px;">Dias restantes no ano</td>
              <td align="right" style="color:#111827;font-size:14px;font-weight:700;">${diasRestantesAno} dias</td>
            </tr></table>
          </td>
        </tr>
      </table>
      ${urgente ? `
      <div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 16px;">
        <p style="margin:0;color:#92400E;font-size:14px;line-height:1.6;">
          Com <strong>${percentualAno.toFixed(0)}%</strong> utilizado, qualquer nota nova reduz bastante sua margem.
          Calcule com cuidado quanto ainda pode cobrar até dezembro.
        </p>
      </div>` : `
      <p style="margin:0 0 16px;color:#4B5563;font-size:14px;line-height:1.7;">
        Aproveite para registrar qualquer nota que ainda não entrou no painel. Assim você começa o próximo mês com os dados certos.
      </p>`}
    `,
  });

  return getResend().emails.send({
    from: FROM,
    to,
    subject: urgente
      ? `⚠️ Fim de mês: você usou ${percentualAno.toFixed(0)}% do limite — confira agora`
      : `Fim de mês chegando, ${firstName} — seus dados estão atualizados?`,
    html,
  });
}

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
