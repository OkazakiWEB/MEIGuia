"use client";

import dynamic from "next/dynamic";

// Recharts (~180kB) carregado apenas no cliente, fora do bundle inicial
const GraficoMensalDynamic = dynamic(
  () => import("./GraficoMensal").then((m) => m.GraficoMensal),
  {
    ssr: false,
    loading: () => (
      <div className="h-[220px] bg-gray-100 rounded-lg animate-pulse" />
    ),
  }
);

interface DataPoint {
  mes: string;
  valor: number;
}

interface Props {
  data: DataPoint[];
  limiteSeguro?: number;
}

export function GraficoMensalLazy({ data, limiteSeguro }: Props) {
  return <GraficoMensalDynamic data={data} limiteSeguro={limiteSeguro} />;
}
