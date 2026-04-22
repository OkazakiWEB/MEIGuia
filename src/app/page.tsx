import Link from "next/link";
import { CheckCircle, XCircle, TrendingUp, Shield, Bell, Download, BarChart3, Star } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const features = [
  {
    icon: Bell,
    title: "Alertas antes de ultrapassar",
    desc: "Receba e-mails automáticos aos 70%, 90% e 100% do limite. Nunca mais seja pego de surpresa.",
  },
  {
    icon: BarChart3,
    title: "Faturamento em tempo real",
    desc: "Veja exatamente quanto já faturou e quanto ainda pode faturar no ano, sem precisar calcular.",
  },
  {
    icon: TrendingUp,
    title: "Previsão inteligente",
    desc: "Saiba com antecedência se você está no caminho de ultrapassar o limite e quanto pode faturar por mês.",
  },
  {
    icon: Shield,
    title: "Seus dados protegidos",
    desc: "Criptografia e controle de acesso rigoroso. Só você acessa suas informações.",
  },
  {
    icon: Download,
    title: "Exportação para o contador",
    desc: "Exporte suas notas em Excel ou CSV com um clique. Facilita a vida na hora de declarar.",
  },
  {
    icon: CheckCircle,
    title: "Simples para qualquer MEI",
    desc: "Interface pensada para quem não é contador. Sem burocracia, sem complicação.",
  },
];

const planos = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    highlight: false,
    cta: "Começar grátis",
    href: "/cadastro",
    items: ["Até 10 notas por mês", "Dashboard de faturamento", "Alertas de limite"],
    missing: ["Previsão de faturamento", "Exportação Excel/CSV", "Notas ilimitadas", "Modo Contador compartilhado"],
  },
  {
    name: "Pro",
    price: "R$ 19,90",
    period: "/mês",
    highlight: true,
    badge: "⭐ Mais escolhido",
    cta: "Proteger meu MEI agora",
    href: "/cadastro?plan=pro",
    items: [
      "Notas ilimitadas — sem travar",
      "Previsão de faturamento anual",
      "Sugestão de quanto faturar por mês",
      "Alertas automáticos 70% / 90% / 100%",
      "Exportação Excel e CSV",
      "Modo Contador — link só leitura para seu contador",
      "Dashboard completo",
    ],
    missing: [],
  },
];

const depoimentos = [
  {
    nome: "Carla Mendes",
    cidade: "São Paulo, SP",
    texto: "Eu não sabia que estava quase no limite. O MEIguia me avisou na hora certa e evitei uma dor de cabeça enorme com a Receita.",
    estrelas: 5,
  },
  {
    nome: "Ricardo Alves",
    cidade: "Belo Horizonte, MG",
    texto: "Antes eu anotava no caderno e sempre esquecia. Agora registro em segundos e meu contador acessa direto. Muito mais organizado.",
    estrelas: 5,
  },
  {
    nome: "Fernanda Costa",
    cidade: "Curitiba, PR",
    texto: "Simples demais. Entrei, cadastrei minhas notas e em 2 minutos já sabia exatamente onde estava. Vale muito pelo preço.",
    estrelas: 5,
  },
];

const faqs = [
  {
    q: "O que acontece se eu ultrapassar R$ 81.000 como MEI?",
    a: "Você pode perder o enquadramento como MEI, ser obrigado a se tornar ME (Microempresa) e pagar impostos retroativos. O Portal MEIguia te avisa antes para você se planejar.",
  },
  {
    q: "Precisa ser contador para usar?",
    a: "Não. O sistema foi feito para MEIs que não entendem de contabilidade. Você apenas registra as notas emitidas e o sistema cuida do resto.",
  },
  {
    q: "É seguro colocar meus dados aqui?",
    a: "Sim. Seus dados ficam em servidores com criptografia e só você tem acesso. Não compartilhamos informações com terceiros.",
  },
  {
    q: "Posso cancelar o plano Pro quando quiser?",
    a: "Sim, sem multa e sem burocracia. Você mantém acesso até o final do mês pago.",
  },
  {
    q: "Tem garantia?",
    a: "Sim. Se em 7 dias você não ficar satisfeito, devolvemos 100% do valor — sem perguntas.",
  },
  {
    q: "O que é o Modo Contador?",
    a: "Um link seguro e somente leitura que você gera e envia para o seu contador. Ele acessa os dados em tempo real sem precisar de senha.",
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
            <Link href="/login" className="btn-secondary text-sm py-2 px-4 hidden sm:inline-flex">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary text-sm py-2 px-4">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-petroleo-50 to-white py-16 sm:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-petroleo-100/30 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto text-center">

          {/* Badge urgência */}
          <span className="inline-block bg-red-50 text-red-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-red-200">
            ⚠️ Limite MEI 2026: R$ 81.000 — você sabe quanto já faturou?
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Evite perder o MEI por{" "}
            <span className="text-petroleo-600">ultrapassar o limite</span>{" "}
            sem perceber
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Registre suas notas, veja em tempo real quanto ainda pode faturar
            e receba alertas automáticos antes de chegar no limite.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="btn-primary text-base px-8 py-4 rounded-xl font-bold">
              Verificar meu faturamento agora — grátis
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Sem cartão de crédito · Cadastro em menos de 1 minuto · Cancele quando quiser
          </p>

          {/* Mini prova social sob CTA */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="flex -space-x-2">
              {["C","R","F","M","A"].map((l) => (
                <div key={l} className="w-8 h-8 rounded-full bg-petroleo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">+500 MEIs</span> já controlam o faturamento com o MEIguia
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-10 px-4 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Por que MEIs usam o Portal MEIguia
          </p>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {[
              { stat: "R$ 81k", desc: "Limite MEI que pode te fazer perder o CNPJ se ultrapassado" },
              { stat: "60%+", desc: "Dos MEIs não controlam o faturamento corretamente" },
              { stat: "< 30s", desc: "Para registrar uma nota e ver o dashboard atualizado" },
            ].map(({ stat, desc }) => (
              <div key={stat} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-petroleo-700">{stat}</p>
                <p className="text-xs sm:text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Funciona em 3 passos simples
          </h2>
          <p className="text-center text-gray-500 text-sm mb-10">
            Sem planilha. Sem contador. Sem complicação.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Crie sua conta grátis", desc: "Leva menos de 1 minuto. Só e-mail e senha, sem burocracia." },
              { num: "2", title: "Registre suas notas", desc: "Adicione o valor de cada nota emitida. O sistema calcula tudo automaticamente." },
              { num: "3", title: "Acompanhe e receba alertas", desc: "Veja seu dashboard atualizado e receba e-mails antes de chegar no limite." },
            ].map(({ num, title, desc }) => (
              <div key={num} className="text-center">
                <div className="w-12 h-12 rounded-full bg-petroleo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
                  {num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/cadastro" className="btn-primary px-8 py-3.5 text-base font-bold inline-block rounded-xl">
              Criar conta grátis agora
            </Link>
          </div>
        </div>
      </section>

      {/* ── Preview do dashboard ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            Veja exatamente onde você está
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            Assim que você registrar suas notas, o dashboard fica assim:
          </p>

          <div className="card shadow-lg space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Exemplo — Faturamento 2026</p>

            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold text-gray-800">R$ 64.800 faturados</span>
                <span className="text-gray-500">Limite: R$ 81.000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <div className="bg-orange-500 h-5 rounded-full transition-all" style={{ width: "80%" }} />
              </div>
              <div className="flex justify-between mt-1.5 text-xs">
                <span className="font-bold text-orange-600">⚠️ 80% do limite — atenção!</span>
                <span className="text-gray-500">R$ 16.200 disponível</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: "Faturado no mês", value: "R$ 8.100" },
                { label: "Total no ano", value: "R$ 64.800" },
                { label: "Disponível", value: "R$ 16.200" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <p className="text-xs text-red-700 font-medium">
                Alerta enviado por e-mail — você atingiu 80% do limite anual
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── O que pode acontecer ── */}
      <section className="py-16 px-4 bg-red-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-3">
            O que acontece se você ultrapassar R$ 81.000 sem perceber?
          </h2>
          <p className="text-sm text-red-700 mb-8">Muitos MEIs descobrem o problema tarde demais.</p>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              "Perda do enquadramento como MEI",
              "Pagamento retroativo de impostos",
              "Necessidade imediata de contador",
              "Multas e problemas na Receita Federal",
              "Obrigações fiscais de Microempresa",
              "Estresse e imprevistos financeiros",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-red-100">
                <span className="text-red-500 font-bold text-lg flex-shrink-0">→</span>
                <p className="text-sm text-red-800">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/cadastro" className="btn-primary px-8 py-4 text-base font-bold inline-block rounded-xl">
              Quero evitar isso — criar conta grátis
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Tudo que você precisa para controlar seu MEI
          </h2>
          <p className="text-center text-gray-500 mb-12 text-sm">
            Simples de usar. Sem necessidade de contador.
          </p>
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

      {/* ── Depoimentos ── */}
      <section className="py-20 px-4 bg-petroleo-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            MEIs que evitaram problemas com o limite
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            Veja o que quem usa o MEIguia está falando.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {depoimentos.map(({ nome, cidade, texto, estrelas }) => (
              <div key={nome} className="bg-white rounded-2xl p-6 shadow-sm border border-petroleo-100 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: estrelas }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 flex-1">&ldquo;{texto}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{nome}</p>
                  <p className="text-xs text-gray-400">{cidade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Planos simples e transparentes
          </h2>
          <p className="text-center text-gray-500 mb-12 text-sm">
            Comece grátis. Faça upgrade quando precisar de mais controle.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {planos.map((plano) => (
              <div
                key={plano.name}
                className={`relative rounded-2xl p-8 flex flex-col border-2 ${
                  plano.highlight
                    ? "border-petroleo-500 bg-white shadow-xl"
                    : "border-gray-200 bg-white shadow-sm"
                }`}
              >
                {plano.highlight ? (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-petroleo-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {plano.badge}
                  </span>
                ) : (
                  <span className="block h-0" aria-hidden />
                )}

                <div className="mb-6 pt-1">
                  <h3 className="text-xl font-bold text-gray-900">{plano.name}</h3>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plano.price}</span>
                    <span className="text-gray-500 mb-1">{plano.period}</span>
                  </div>
                  <p className="text-xs font-medium mt-1 h-4">
                    {plano.highlight
                      ? <span className="text-petroleo-600">Menos de R$ 0,70 por dia</span>
                      : <span className="text-transparent select-none">—</span>
                    }
                  </p>
                </div>

                <ul className="space-y-3 flex-1">
                  {plano.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-petroleo-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                  {plano.missing.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                      <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="line-through">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 space-y-2">
                  <Link
                    href={plano.href}
                    className={`block text-center font-bold py-3.5 rounded-xl transition-colors ${
                      plano.highlight ? "btn-primary" : "btn-secondary"
                    }`}
                  >
                    {plano.cta}
                  </Link>
                  <p className="text-xs text-center h-4">
                    {plano.highlight
                      ? <span className="text-gray-400">Garantia 7 dias · Cancele quando quiser</span>
                      : <span className="text-transparent select-none">—</span>
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Garantia */}
          <div className="mt-10 bg-white border border-green-200 rounded-2xl p-6 flex items-start sm:items-center gap-4 max-w-xl mx-auto">
            <span className="text-4xl flex-shrink-0">🛡️</span>
            <div>
              <p className="font-bold text-gray-900">Garantia de 7 dias</p>
              <p className="text-sm text-gray-500 mt-1">
                Se em 7 dias você não ficar satisfeito, devolvemos 100% do valor — sem perguntas, sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Perguntas frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="card">
                <p className="font-semibold text-gray-900 text-sm mb-2">{q}</p>
                <p className="text-gray-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 px-4 bg-petroleo-700">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-petroleo-300 text-sm font-semibold uppercase tracking-widest mb-3">
            Comece hoje
          </p>
          <h2 className="text-3xl font-bold text-white mb-4">
            Quanto você ainda pode faturar este ano?
          </h2>
          <p className="text-petroleo-200 mb-8 text-sm">
            Descubra agora e nunca mais seja pego de surpresa com o limite do MEI.
          </p>
          <Link
            href="/cadastro"
            className="bg-agua-400 hover:bg-agua-300 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base inline-block"
          >
            Verificar meu faturamento — é grátis
          </Link>
          <p className="text-petroleo-400 text-xs mt-4">
            Sem cartão de crédito · Cadastro em menos de 1 minuto · Garantia 7 dias no Pro
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 bg-petroleo-900 text-center text-petroleo-300 text-sm">
        <div className="mb-3">
          <Logo href="/" size="text-xl" className="inline-flex" />
        </div>
        <p>© {new Date().getFullYear()} Portal MEIguia. Feito para empreendedores brasileiros.</p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-petroleo-400">
          <Link href="/termos" className="hover:text-petroleo-200">Termos de Uso</Link>
          <span>·</span>
          <a href="mailto:suporte@portalmeiguia.com.br" className="hover:text-petroleo-200">Suporte</a>
        </div>
      </footer>

      {/* ── Barra CTA sticky mobile ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 p-3 flex gap-3 shadow-2xl">
        <Link href="/login" className="btn-secondary flex-1 text-center text-sm py-3">
          Entrar
        </Link>
        <Link href="/cadastro" className="btn-primary flex-1 text-center text-sm py-3 font-bold">
          Começar grátis
        </Link>
      </div>

    </div>
  );
}
