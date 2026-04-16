import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** href de destino. Default: "/" */
  href?: string;
  /** Tamanho base da fonte. Default: "text-2xl" */
  size?: string;
  /** Classes extras no container */
  className?: string;
}

/**
 * Logotipo "Portal MEIguia" com hierarquia tipográfica completa.
 *
 * Anatomia:
 *   "Portal"  → Raleway ExtraLight, Azul Petróleo suave  → sofisticação
 *   "MEI"     → Montserrat ExtraBold, Azul Petróleo escuro → autoridade
 *   "guia"    → Montserrat Light, Verde Água              → suporte / direção
 */
export function Logo({ href = "/", size = "text-2xl", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex flex-col leading-none select-none", className)}
      aria-label="Portal MEIguia — página inicial"
    >
      {/* "Portal" — linha superior, discreta */}
      <span
        className="font-portal font-extralight tracking-[0.22em] uppercase text-petroleo-400"
        style={{ fontSize: "0.48em" }}
      >
        Portal
      </span>

      {/* "MEIguia" — linha principal */}
      <span className={cn("flex items-baseline gap-[0.03em]", size)}>
        <span className="font-logo font-extrabold tracking-tight text-petroleo-700">
          MEI
        </span>
        <span className="font-logo font-light text-agua-500">
          guia
        </span>
      </span>
    </Link>
  );
}

/**
 * Versão inline (horizontal) do logotipo para navbar compacta.
 */
export function LogoInline({ href = "/", className }: Omit<LogoProps, "size">) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-baseline gap-0 select-none", className)}
      aria-label="Portal MEIguia — página inicial"
    >
      <span
        className="font-portal font-extralight tracking-[0.18em] uppercase text-petroleo-400 mr-1.5 self-center"
        style={{ fontSize: "0.65rem" }}
      >
        Portal
      </span>
      <span className="font-logo font-extrabold tracking-tight text-petroleo-700 text-xl leading-none">
        MEI
      </span>
      <span className="font-logo font-light text-agua-500 text-xl leading-none">
        guia
      </span>
    </Link>
  );
}
