"use client";

import { useEffect, useState } from "react";
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

  // Anima de 0 → percentual real ao montar (efeito de "crescendo")
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // Pequeno delay para o browser pintar o estado inicial (largura 0) antes de animar
    const t = setTimeout(() => setBarWidth(Math.min(percentual, 100)), 120);
    return () => clearTimeout(t);
  }, [percentual]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-2 gap-2">
        <div>
          <p className="text-sm text-gray-500">Faturamento {new Date().getFullYear()}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 break-all">{formatCurrency(totalFaturado)}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-500">Limite MEI</p>
          <p className="text-sm sm:text-lg font-semibold text-gray-700">{formatCurrency(MEI_LIMITE)}</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-5 mb-2 overflow-hidden">
        <div
          className={cn("h-5 rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Percentual e restante */}
      <div className="flex justify-between text-xs sm:text-sm gap-2">
        <span className="font-bold text-gray-700 flex-shrink-0">{percentual.toFixed(1)}% utilizado</span>
        <span className="text-gray-500 text-right">
          {totalFaturado > MEI_LIMITE
            ? `Excedido em ${formatCurrency(totalFaturado - MEI_LIMITE)}`
            : `Restam ${formatCurrency(restante)}`}
        </span>
      </div>
    </div>
  );
}
