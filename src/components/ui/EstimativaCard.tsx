"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { X, Clock, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";

interface EstimativaCardProps {
  estimativa: number;
  notasReais: number;
  total: number;
}

export function EstimativaCard({ estimativa, notasReais, total }: EstimativaCardProps) {
  const [dispensado, setDispensado] = useState(false);

  if (dispensado) return null;

  return (
    <div className="rounded-xl border border-brand-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-brand-50 border-b border-brand-100">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-gray-800">Como esse valor foi calculado</p>
        </div>
        <button
          onClick={() => setDispensado(true)}
          className="text-gray-400 hover:text-gray-600 transition p-1 -mr-1 rounded"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Linha: estimativa */}
        <div className="flex items-start gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
          <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Você informou no cadastro</p>
            <p className="text-xs text-gray-400 mt-0.5">Valor que você nos disse quando criou a conta</p>
          </div>
          <p className="text-sm font-bold text-gray-600 flex-shrink-0">{formatCurrency(estimativa)}</p>
        </div>

        {/* Linha: notas reais */}
        <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5">
          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notasReais > 0 ? "text-brand-500" : "text-gray-300"}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700">Notas que você registrou</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {notasReais > 0 ? "Valores confirmados por você" : "Nenhuma nota adicionada ainda"}
            </p>
          </div>
          <p className={`text-sm font-bold flex-shrink-0 ${notasReais > 0 ? "text-brand-600" : "text-gray-400"}`}>
            {formatCurrency(notasReais)}
          </p>
        </div>

        {/* Divisor + total */}
        <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
          <p className="text-sm text-gray-500">Total considerado até agora</p>
          <p className="text-sm font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>

        {/* CTA ou mensagem de progresso */}
        {notasReais === 0 ? (
          <div className="pt-1 space-y-2">
            <Link
              href="/notas/nova"
              className="btn-primary w-full text-sm py-2.5 text-center block font-semibold"
            >
              Registrar minha primeira nota →
            </Link>
            <p className="text-xs text-gray-400 text-center">
              Você também pode{" "}
              <Link href="/notas" className="underline hover:text-gray-600">
                corrigir a estimativa
              </Link>{" "}
              se o valor estiver errado.
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center pt-1">
            Continue registrando suas notas — este aviso desaparece quando seus dados estiverem completos.
          </p>
        )}
      </div>
    </div>
  );
}
