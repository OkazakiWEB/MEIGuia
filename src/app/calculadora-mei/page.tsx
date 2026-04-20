import type { Metadata } from "next";
import { CalculadoraMEI } from "./CalculadoraMEI";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Calculadora de Limite MEI 2025 — Quanto Posso Faturar?",
  description:
    "Descubra quanto você ainda pode faturar como MEI em 2025. Calcule sua situação em relação ao limite de R$ 81.000 e evite perder o enquadramento.",
  keywords: [
    "limite MEI", "quanto posso faturar MEI", "calculadora MEI",
    "limite faturamento MEI 2025", "MEI R$ 81.000", "ultrapassar limite MEI",
    "controle faturamento MEI", "calculadora microempreendedor",
  ],
  openGraph: {
    title: "Calculadora de Limite MEI 2025 — Descubra Quanto Ainda Pode Faturar",
    description:
      "Calcule agora quanto você já usou do limite de R$ 81.000 do MEI e veja quanto ainda pode ganhar este ano sem risco.",
    type: "website",
    url: "https://www.portalmeiguia.com.br/calculadora-mei",
  },
  alternates: {
    canonical: "https://www.portalmeiguia.com.br/calculadora-mei",
  },
};

// ── Schema.org para rich results ─────────────────────────────────────────────
const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculadora de Limite MEI",
  url: "https://www.portalmeiguia.com.br/calculadora-mei",
  description: "Calcule quanto você ainda pode faturar como MEI em 2025 sem ultrapassar o limite de R$ 81.000.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
};

export default function CalculadoraMEIPage() {
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-petroleo-50 via-white to-agua-50">

        {/* ── Navbar mínima ── */}
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Logo href="/" size="text-2xl" />
            <Link
              href="/cadastro"
              className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex items-center gap-1.5"
            >
              Criar conta grátis →
            </Link>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-12">

          {/* ── Hero ── */}
          <div className="text-center space-y-4">
            <span className="inline-block bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Calculadora gratuita • 2025
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Quanto você ainda pode<br className="hidden sm:block" />
              <span className="text-brand-600"> faturar como MEI?</span>
            </h1>
            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
              O limite do MEI em 2025 é de <strong className="text-gray-700">R$ 81.000 por ano</strong>.
              Descubra agora quanto você já usou e quanto ainda tem disponível.
            </p>
          </div>

          {/* ── Calculadora (Client Component) ── */}
          <CalculadoraMEI />

          {/* ── Conteúdo SEO ── */}
          <article className="prose prose-gray max-w-none space-y-8">

            <section className="card space-y-4">
              <h2 className="text-xl font-bold text-gray-900 !mt-0">
                O que é o limite de faturamento do MEI?
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                O Microempreendedor Individual (MEI) pode faturar até <strong>R$ 81.000 por ano</strong> —
                o equivalente a R$ 6.750 por mês. Esse valor foi atualizado pela Lei Complementar 194/2022
                e está vigente desde 2023.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Se você ultrapassar esse limite, pode perder o enquadramento como MEI e ser obrigado
                a migrar para Microempresa (ME), com alíquotas de imposto muito mais altas e obrigação
                de contratar um contador.
              </p>
            </section>

            <section className="card space-y-4">
              <h2 className="text-xl font-bold text-gray-900 !mt-0">
                O que acontece se eu ultrapassar o limite do MEI?
              </h2>
              <ul className="space-y-2">
                {[
                  { emoji: "❌", text: "Você perde o enquadramento como MEI automaticamente" },
                  { emoji: "💸", text: "A Receita Federal pode cobrar impostos retroativos (INSS, ISS, ICMS)" },
                  { emoji: "📋", text: "Você passa a ser obrigado a contratar um contador" },
                  { emoji: "⚠️", text: "Pode ter pendências que aparecem na hora de solicitar empréstimos" },
                  { emoji: "🔄", text: "Só pode voltar a ser MEI no ano seguinte, se o faturamento permitir" },
                ].map(({ emoji, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="flex-shrink-0 text-base">{emoji}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card space-y-4">
              <h2 className="text-xl font-bold text-gray-900 !mt-0">
                Como calcular quanto posso faturar por mês?
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Divida o que ainda resta pelo número de meses que faltam no ano.
                Por exemplo: se você já faturou R$ 40.000 e estamos em julho (6 meses restantes):
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 font-mono text-sm text-gray-700">
                <p>R$ 81.000 − R$ 40.000 = <strong>R$ 41.000 restantes</strong></p>
                <p>R$ 41.000 ÷ 6 meses = <strong>R$ 6.833/mês com segurança</strong></p>
              </div>
              <p className="text-gray-500 text-xs">
                A calculadora acima faz esse cálculo automaticamente para você.
              </p>
            </section>

            <section className="card space-y-4">
              <h2 className="text-xl font-bold text-gray-900 !mt-0">
                Perguntas frequentes sobre o limite do MEI
              </h2>
              <div className="space-y-4 divide-y divide-gray-100">
                {[
                  {
                    q: "O limite do MEI vale por ano fiscal ou por mês?",
                    a: "O limite é anual: R$ 81.000 de 1º de janeiro a 31 de dezembro. Não existe limite mensal — mas se você dividir R$ 81.000 por 12, chega a R$ 6.750/mês como referência.",
                  },
                  {
                    q: "O limite do MEI vai aumentar em 2025?",
                    a: "Até o momento, o limite vigente é R$ 81.000/ano, definido pela LC 194/2022. Qualquer atualização depende de nova lei aprovada pelo Congresso.",
                  },
                  {
                    q: "Recebi um pagamento atrasado de ano anterior — entra no limite deste ano?",
                    a: "Sim. O que importa é a data de emissão da nota fiscal ou recebimento, não quando o serviço foi prestado. Consulte seu contador para casos específicos.",
                  },
                  {
                    q: "Como controlar o faturamento MEI de forma fácil?",
                    a: "A maneira mais simples é registrar cada nota assim que emitir e acompanhar o total acumulado. O Portal MEIguia faz isso automaticamente e avisa quando você se aproxima do limite.",
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="pt-4 first:pt-0">
                    <p className="font-semibold text-gray-800 text-sm">{q}</p>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

          </article>

          {/* ── CTA final ── */}
          <div className="bg-gradient-to-br from-petroleo-600 to-petroleo-800 rounded-2xl p-8 text-center text-white space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-petroleo-300">Próximo passo</p>
            <h2 className="text-2xl font-extrabold">
              Controle seu limite do MEI<br />automaticamente — é grátis
            </h2>
            <p className="text-petroleo-200 text-sm max-w-sm mx-auto">
              Registre suas notas, receba alertas antes de ultrapassar o limite
              e saiba exatamente quanto ainda pode faturar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 bg-white text-petroleo-700 font-bold px-6 py-3.5 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Criar conta grátis — sem cartão →
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center text-petroleo-300 hover:text-white text-sm py-3.5 transition"
              >
                Saiba mais sobre o portal
              </Link>
            </div>
            <p className="text-xs text-petroleo-400">
              Mais de 1.000 MEIs já controlam o faturamento com o Portal MEIguia
            </p>
          </div>

        </main>

        {/* ── Footer mínimo ── */}
        <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400 space-y-1">
          <p>© {new Date().getFullYear()} Portal MEIguia · Controle de faturamento para Microempreendedores Individuais</p>
          <p>
            <Link href="/termos" className="hover:text-gray-600 underline">Termos de Uso</Link>
            {" · "}
            <Link href="/cadastro" className="hover:text-gray-600 underline">Criar conta</Link>
            {" · "}
            <Link href="/login" className="hover:text-gray-600 underline">Entrar</Link>
          </p>
        </footer>

      </div>
    </>
  );
}
