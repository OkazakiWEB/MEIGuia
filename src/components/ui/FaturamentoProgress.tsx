import { formatCurrency, getAlertLevel, getProgressColor, calcPercentual } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FaturamentoProgressProps {
  totalFaturado: number;
}

const MEI_LIMITE = 81_000;

export function FaturamentoProgress({ totalFaturado }: FaturamentoProgressProps) {
  const percentual = calcPercentual(totalFaturado);
  const level = getAlertLevel(percentual);
  const barColor = getProgressColor(level);
  const restante = Math.max(MEI_LIMITE - totalFaturado, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-2 gap-2">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">Faturamento {new Date().getFullYear()}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(totalFaturado)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-500">Limite MEI</p>
          <p className="text-base sm:text-lg font-semibold text-gray-700">{formatCurrency(MEI_LIMITE)}</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-5 mb-2 overflow-hidden">
        <div
          className={cn("h-5 rounded-full transition-all duration-700", barColor)}
          style={{ width: `${Math.min(percentual, 100)}%` }}
        />
      </div>

      {/* Percentual e restante */}
      <div className="flex justify-between text-xs sm:text-sm gap-2">
        <span className="font-bold text-gray-700 flex-shrink-0">{percentual.toFixed(1)}% utilizado</span>
        <span className="text-gray-500 truncate text-right">
          {totalFaturado > MEI_LIMITE
            ? `Excedido em ${formatCurrency(totalFaturado - MEI_LIMITE)}`
            : `Restam ${formatCurrency(restante)}`}
        </span>
      </div>
    </div>
  );
}
