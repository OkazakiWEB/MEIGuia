import Link from "next/link";
import { Zap } from "lucide-react";

interface NotasUsageBarProps {
  used: number;
  limit?: number;
}

const LIMIT = 10;

export function NotasUsageBar({ used, limit = LIMIT }: NotasUsageBarProps) {
  const pct     = Math.min((used / limit) * 100, 100);
  const restam  = Math.max(limit - used, 0);

  // ── Nível de uso ─────────────────────────────────────────────────
  const nivel =
    used === 0         ? "zero"   :
    used <= 4          ? "baixo"  :
    used <= 7          ? "medio"  :
    used < limit       ? "alto"   :
                         "cheio";

  // ── Cor da barra ─────────────────────────────────────────────────
  const barColor =
    nivel === "cheio" ? "bg-red-500"    :
    nivel === "alto"  ? "bg-orange-400" :
    nivel === "medio" ? "bg-yellow-400" :
                        "bg-brand-500";

  // ── Mensagem principal ────────────────────────────────────────────
  const mensagem =
    nivel === "zero"  ? "Você ainda não usou nenhuma nota este mês." :
    nivel === "baixo" ? `Ótimo! Você ainda tem ${restam} registros disponíveis este mês.` :
    nivel === "medio" ? `Você usou mais da metade — ainda restam ${restam} registros este mês.` :
    nivel === "alto"  ? `Atenção: só restam ${restam} registro${restam !== 1 ? "s" : ""} este mês.` :
                        "Você atingiu o limite deste mês no plano Gratuito.";

  // ── CTA (só aparece quando perto do limite ou no limite) ──────────
  const mostrarCta = nivel === "alto" || nivel === "cheio";

  return (
    <div className={`rounded-xl border px-4 py-3 space-y-2.5 ${
      nivel === "cheio" ? "bg-red-50 border-red-200" :
      nivel === "alto"  ? "bg-orange-50 border-orange-200" :
                          "bg-gray-50 border-gray-200"
    }`}>

      {/* Linha superior: contagem + texto */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500 leading-snug">{mensagem}</p>
        <span className={`text-xs font-bold tabular-nums whitespace-nowrap px-2 py-0.5 rounded-full ${
          nivel === "cheio" ? "bg-red-100 text-red-700" :
          nivel === "alto"  ? "bg-orange-100 text-orange-700" :
          nivel === "medio" ? "bg-yellow-100 text-yellow-700" :
                              "bg-brand-100 text-brand-700"
        }`}>
          {used}/{limit}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* CTA contextual */}
      {mostrarCta && (
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-gray-500">
            {nivel === "cheio"
              ? "Assine o Pro e registre notas ilimitadas a partir de agora."
              : "No Pro você registra quantas notas quiser, todo mês."}
          </p>
          <Link
            href="/assinatura"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0"
          >
            <Zap className="w-3 h-3" />
            Ver Pro
          </Link>
        </div>
      )}
    </div>
  );
}
