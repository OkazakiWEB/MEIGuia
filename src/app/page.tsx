import Link from "next/link";
import { CheckCircle, TrendingUp, Shield, Bell, Download, BarChart3 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const features = [
  { icon: BarChart3,  title: "Dashboard completo",       desc: "Visualize seu faturamento em tempo real com gráficos claros e intuitivos." },
  { icon: Bell,       title: "Alertas inteligentes",     desc: "Receba avisos em 50%, 80% e 100% do limite. Nunca seja pego de surpresa." },
  { icon: TrendingUp, title: "Previsão de faturamento",  desc: "Saiba quanto você pode faturar por mês para não ultrapassar o limite." },
  { icon: Shield,     title: "Dados seguros",            desc: "Seus dados são protegidos com criptografia e controle de acesso rigoroso." },
  { icon: Download,   title: "Exportação fácil",         desc: "Exporte suas notas em Excel ou CSV com um clique. (Plano Pro)" },
  { icon: CheckCircle,title: "Simples de usar",          desc: "Interface pensada para quem não é contador. Zero burocracia." },
];

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    highlight: false,
    cta: "Começar grátis",
    href: "/cadastro",
    items: [
      "Até 20 notas por mês",
      "Dashboard básico",
      "Alertas de limite",
      "Histórico de notas",
    ],
    missing: ["Previsão de faturamento", "Exportação Excel/CSV", "Suporte prioritário"],
  },
  {
    name: "Pro",
    price: "R$ 14,90",
    period: "/mês",
    highlight: true,
    cta: "Assinar Pro",
    href: "/cadastro?plan=pro",
    items: [
      "Notas ilimitadas",
      "Dashboard completo",
      "Alertas inteligentes",
      "Previsão de faturamento",
      "Sugestão de faturamento mensal",
      "Exportação Excel e CSV",
      "Suporte prioritário",
    ],
    missing: [],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo href="/" />
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary text-sm py-2 px-4">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-petroleo-50 to-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-petroleo-100/30 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-block bg-agua-50 text-agua-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-agua-200">
            🎯 Para Microempreendedores Individuais
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Nunca mais ultrapasse o{" "}
            <span className="text-petroleo-600">limite de R$ 81.000</span>{" "}
            do MEI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Controle suas notas fiscais, acompanhe o faturamento em tempo real e
            receba alertas antes de chegar no limite. Simples, rápido e seguro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="btn-primary text-base px-8 py-3 rounded-xl">
              Começar grátis agora
            </Link>
            <Link href="#planos" className="btn-secondary text-base px-8 py-3 rounded-xl">
              Ver planos
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Sem cartão de crédito · Plano gratuito para sempre
          </p>
        </div>
      </section>

      {/* ── Barra de limite visual ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-xl mx-auto card shadow-md">
          <p className="text-sm font-medium text-gray-500 mb-2">Exemplo — Faturamento anual MEI</p>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-gray-800">R$ 64.800 faturados</span>
            <span className="text-gray-500">Limite: R$ 81.000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
            <div
              className="bg-orange-500 h-4 rounded-full transition-all"
              style={{ width: "80%" }}
            />
          </div>
          <p className="text-sm text-orange-600 font-semibold">
            🔴 80% do limite atingido — restam R$ 16.200
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tudo que você precisa para controlar seu MEI
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-petroleo-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-petroleo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Planos simples e transparentes
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Comece grátis. Evolua quando precisar.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border-2 flex flex-col ${
                  plan.highlight
                    ? "border-petroleo-500 bg-petroleo-50 shadow-xl"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-agua-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 mb-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-agua-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                  {plan.missing.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-400 line-through">
                      <span className="w-4 h-4 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={plan.highlight ? "btn-primary text-center" : "btn-secondary text-center"}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 px-4 bg-petroleo-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para ter controle total do seu MEI?
          </h2>
          <p className="text-petroleo-200 mb-8">
            Cadastre-se gratuitamente em menos de 1 minuto.
          </p>
          <Link
            href="/cadastro"
            className="bg-agua-400 hover:bg-agua-300 text-white font-bold px-8 py-3 rounded-xl transition-colors text-base"
          >
            Criar conta gratuita
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 bg-petroleo-900 text-center text-petroleo-300 text-sm">
        <div className="mb-3">
          <Logo href="/" size="text-xl" className="inline-flex" />
        </div>
        <p>© {new Date().getFullYear()} Portal MEIguia. Feito com ❤️ para empreendedores brasileiros.</p>
      </footer>
    </div>
  );
}
