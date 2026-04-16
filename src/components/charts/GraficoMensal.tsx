"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface DataPoint {
  mes: string;
  valor: number;
}

interface GraficoMensalProps {
  data: DataPoint[];
  limiteSeguro?: number; // Linha de referência (sugestão mensal)
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-brand-600">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function GraficoMensal({ data, limiteSeguro }: GraficoMensalProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
        {limiteSeguro && (
          <ReferenceLine
            y={limiteSeguro}
            stroke="#f59e0b"
            strokeDasharray="6 3"
            label={{ value: "Meta mensal", fill: "#f59e0b", fontSize: 11, position: "insideTopRight" }}
          />
        )}
        <Bar
          dataKey="valor"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
