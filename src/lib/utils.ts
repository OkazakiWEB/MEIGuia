import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Utilitário para combinar classes Tailwind com segurança */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata valor em Real Brasileiro */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Formata data para pt-BR */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

/** Calcula o percentual de uso do limite MEI (pode ultrapassar 100%) */
export function calcPercentual(totalFaturado: number): number {
  return (totalFaturado / 81_000) * 100;
}

/** Retorna o status de alerta com base no percentual */
export type AlertLevel = "safe" | "warning" | "danger" | "exceeded";

export function getAlertLevel(percentual: number): AlertLevel {
  if (percentual >= 100) return "exceeded";
  if (percentual >= 80)  return "danger";
  if (percentual >= 50)  return "warning";
  return "safe";
}

/** Cor correspondente ao nível de alerta */
export function getAlertColor(level: AlertLevel): string {
  const map: Record<AlertLevel, string> = {
    safe:     "text-green-600",
    warning:  "text-yellow-600",
    danger:   "text-orange-600",
    exceeded: "text-red-600",
  };
  return map[level];
}

/** Cor do progress bar */
export function getProgressColor(level: AlertLevel): string {
  const map: Record<AlertLevel, string> = {
    safe:     "bg-green-500",
    warning:  "bg-yellow-500",
    danger:   "bg-orange-500",
    exceeded: "bg-red-500",
  };
  return map[level];
}

/** Mensagem de alerta contextual */
export function getAlertMessage(percentual: number, total: number): string {
  const restante = 81_000 - total;
  if (percentual >= 100) {
    return `⚠️ Limite MEI ultrapassado! Você excedeu R$ 81.000 em ${formatCurrency(total - 81_000)}.`;
  }
  if (percentual >= 80) {
    return `🔴 Atenção! Você usou ${percentual.toFixed(1)}% do limite. Restam apenas ${formatCurrency(restante)}.`;
  }
  if (percentual >= 50) {
    return `🟡 Metade do limite atingida. Restam ${formatCurrency(restante)} para o ano.`;
  }
  return `✅ Faturamento dentro do limite. Você tem ${formatCurrency(restante)} disponíveis.`;
}

/** Previsão de faturamento anual baseada na média mensal */
export function calcPrevisaoAnual(totalAteAgora: number): number {
  const mesAtual = new Date().getMonth() + 1; // 1-12
  if (mesAtual === 0) return 0;
  const mediaMensal = totalAteAgora / mesAtual;
  return mediaMensal * 12;
}

/** Sugestão de quanto pode faturar por mês para não ultrapassar o limite */
export function calcSugestaoMensal(totalAteAgora: number): number {
  const hoje = new Date();
  const mesesRestantes = 12 - hoje.getMonth(); // Meses restantes incluindo o atual
  const limiteRestante = 81_000 - totalAteAgora;
  if (mesesRestantes <= 0 || limiteRestante <= 0) return 0;
  return limiteRestante / mesesRestantes;
}
