"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, CheckCircle, Zap } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** "warning" = perto do limite (8-9 notas); "limit" = limite atingido (10) */
  reason: "warning" | "limit";
  notasMes: number;
}

export function UpgradeModal({ open, onClose, reason, notasMes }: UpgradeModalProps) {
  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header colorido */}
        <div className="bg-gradient-to-br from-brand-500 to-vinho-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {reason === "limit" ? (
                <Zap className="w-5 h-5 text-amber-300" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              {reason === "limit" ? (
                <>
                  <p className="font-bold text-lg">Limite atingido!</p>
                  <p className="text-sm text-white/80">Você usou todas as {notasMes} notas gratuitas</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-lg">Quase lá!</p>
                  <p className="text-sm text-white/80">Você usou {notasMes}/10 notas este mês</p>
                </>
              )}
            </div>
          </div>

          {/* Mini progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-3">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((notasMes / 10) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-5">
            {reason === "limit"
              ? "Para continuar emitindo notas fiscais este mês, faça upgrade para o Plano Pro."
              : "Faltam poucas notas para o limite mensal. Faça upgrade agora e continue sem interrupções."}
          </p>

          <ul className="space-y-2 mb-6">
            {[
              "Notas fiscais ilimitadas",
              "Previsão de faturamento anual",
              "Exportação Excel e CSV",
              "Suporte prioritário",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-agua-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/assinatura"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
          >
            <Sparkles className="w-5 h-5" />
            Assinar Pro — menos de R$ 0,50/dia
          </Link>

          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3 py-1.5"
          >
            Continuar no plano gratuito
          </button>
        </div>
      </div>
    </div>
  );
}
