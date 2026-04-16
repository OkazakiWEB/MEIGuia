import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

interface ProGateProps {
  feature: string;
  children: React.ReactNode;
  isPro: boolean;
}

/**
 * Wrapper que bloqueia conteúdo premium para usuários free.
 * Exibe CTA de upgrade no lugar do conteúdo.
 */
export function ProGate({ feature, children, isPro }: ProGateProps) {
  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      {/* Conteúdo borrado */}
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>

      {/* Overlay de upgrade */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
        <div className="text-center px-6 py-4">
          <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-brand-600" />
          </div>
          <p className="font-semibold text-gray-900 mb-1">{feature}</p>
          <p className="text-sm text-gray-500 mb-4">Disponível no plano Pro</p>
          <Link
            href="/assinatura"
            className="inline-flex items-center gap-2 btn-primary text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Fazer upgrade
          </Link>
        </div>
      </div>
    </div>
  );
}
