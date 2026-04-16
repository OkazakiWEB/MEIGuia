import { getAlertLevel, getAlertMessage, type AlertLevel } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertaBannerProps {
  totalFaturado: number;
  percentual: number;
}

const alertConfig: Record<AlertLevel, { bg: string; border: string; text: string; icon: React.ElementType }> = {
  safe:     { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800",  icon: CheckCircle },
  warning:  { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", icon: Info },
  danger:   { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", icon: AlertTriangle },
  exceeded: { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    icon: XCircle },
};

export function AlertaBanner({ totalFaturado, percentual }: AlertaBannerProps) {
  const level = getAlertLevel(percentual);
  const message = getAlertMessage(percentual, totalFaturado);
  const { bg, border, text, icon: Icon } = alertConfig[level];

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border", bg, border)}>
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", text)} />
      <p className={cn("text-sm font-medium", text)}>{message}</p>
    </div>
  );
}
