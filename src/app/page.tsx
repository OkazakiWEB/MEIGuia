import Link from "next/link";
import { Bell, BarChart3, TrendingUp, Download, CheckCircle, Star, Users, ArrowRight } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Logo } from "@/components/ui/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal MEIguia — O controle inteligente para MEIs no Brasil",
  description: "MEIguia ajuda microempreendedores individuais a controlar o faturamento, evitar ultrapassar o limite de R$ 81.000 e manter o CNPJ seguro.",
};

const beneficios = [
  { icon: Bell, title: "Alertas automáticos", desc: "Notificações por e-mail aos 70%, 90% e 100% do limite anual. Você nunca é pego de surpresa." },
  { icon: BarChart3, title: "Controle de faturamento", desc: "Dashboard em tempo real com tudo que você precisa saber sobre seu MEI — sem planilha." },
  { icon: Users, title: "Integração com contador", desc: "Gere um link seguro para seu contador acessar seus dados sem precisar de senha." },
  { icon: TrendingUp, title: "Previsão inteligente", desc: "Saiba quanto ainda pode faturar por mês sem risco de ultrapassar o limite no fim do ano." },
  { icon: Download, title: "Exportação fácil", desc: "Exporte notas em Excel ou CSV com um clique. Declaração sem estresse." },
  { icon: CheckCircle, title: "Simples e rápido", desc: "Registro de nota em menos de 30 segundos. Interface pensada para quem não é contador." },
];

const depoimentos = [
  { nome: "Carla Mendes", cidade: "São Paulo, SP", estrelas: 5, texto: "Eu não sabia que estava quase no limite. O MEIguia me avisou na hora certa e evitei uma dor de cabeça enorme com a Receita." },
  { nome: "Ricardo Alves", cidade: "Belo Horizonte, MG", estrelas: 5, texto: "Antes eu anotava no caderno e sempre esquecia. Agora registro em segundos e meu contador acessa direto. Muito mais organizado." },
  { nome: "Fernanda Costa", cidade: "Curitiba, PR", estrelas: 5, texto: "Simples demais. Entrei, cadastrei minhas notas e em 2 minutos já sabia exatamente onde estava. Vale muito pelo preço." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-petroleo-900 via-petroleo-800 to-petroleo-700 py-20 sm:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #40BCC3 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1A6B8A 0%, transparent 40%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block bg-agua-500/20 text-agua-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-agua-500/30">
            🇧🇷 Feito para microempreendedores brasileiros
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            O controle inteligente<br />
            <span className="text-agua-400">para MEIs no Brasil</span>
          </h1>
          <p className="text-lg sm:text-xl text-petroleo-200 mb-10 max-w-2xl mx-auto">
            Mantenha seu CNPJ seguro, controle o faturamento em tempo real e nunca mais ultrapasse o limite de R$ 81.000 sem perceber.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="bg-agua-500 hover:bg-agua-400 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base inline-flex items-center justify-center gap-2">
              Começar agora — é grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/#como-funciona" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base border border-white/20">
              Ver como funciona
            </Link>
          </div>
          <p className="text-petroleo-400 text-sm mt-5">Sem cartão de crédito · Leva menos de 1 minuto</p>

          {/* Prova social */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {["C","R","F","M","A"].map((l) => (
                <div key={l} className="w-9 h-9 rounded-full bg-petroleo-600 border-2 border-petroleo-800 flex items-center justify-center text-agua-300 text-xs font-bold">{l}</div>
              ))}
            </div>
            <p className="text-petroleo-300 text-sm"><span className="text-white font-bold">+500 MEIs</span> protegidos com o MEIguia</p>
          </div>
        </div>
      </section>

      {/* ── O que é o MEIguia ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-agua-600 uppercase tracking-widest">O que é o MEIguia</span>
              <h2 className="text-3xl font-extrabold text-gray-900 mt-3 mb-5 leading-tight">
                Sua empresa pequena merece um controle profissional
              </h2>
              <p className="text-gray-600 mb-5">
                O MEIguia é uma plataforma criada para microempreendedores que precisam controlar o faturamento de forma simples — sem precisar entender de contabilidade.
              </p>
              <p className="text-gray-600 mb-8">
                Muitos MEIs perdem o enquadramento por ultrapassar o limite de <strong>R$ 81.000 por ano</strong> sem perceber. O MEIguia monitora isso por você e avisa com antecedência.
              </p>
              <Link href="/landing" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold">
                Conhecer os planos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { emoji: "😰", problema: "Medo de ultrapassar o limite sem saber", solucao: "Alertas automáticos por e-mail aos 70%, 90% e 100%" },
                { emoji: "📋", problema: "Notas anotadas no caderno ou planilha", solucao: "Registro em segundos direto no celular" },
                { emoji: "🤷", problema: "Não saber quanto ainda pode faturar", solucao: "Previsão inteligente mês a mês em tempo real" },
              ].map(({ emoji, problema, solucao }) => (
                <div key={problema} className="bg-gray-50 rounded-2xl p-5 flex gap-4">
                  <span className="text-2xl flex-shrink-0">{emoji}</span>
                  <div>
                    <p className="text-sm text-gray-500 line-through mb-1">{problema}</p>
                    <p className="text-sm font-semibold text-petroleo-700">✓ {solucao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-agua-600 uppercase tracking-widest">Funcionalidades</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3">Tudo que seu MEI precisa em um só lugar</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-xl mx-auto">Desenvolvido especialmente para quem não tem tempo (nem paciência) para complicação.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficios.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-petroleo-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-petroleo-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-agua-600 uppercase tracking-widest">Como funciona</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3">3 passos para proteger seu MEI</h2>
            <p className="text-gray-500 mt-3 text-sm">Sem planilha. Sem contador. Sem complicação.</p>
          </div>
          <div className="relative">
            {/* Linha conectora desktop */}
            <div className="hidden sm:block absolute top-6 left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] h-0.5 bg-petroleo-100" />
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { num: "1", title: "Crie sua conta", desc: "Cadastro em menos de 1 minuto. Só e-mail e senha." },
                { num: "2", title: "Registre as notas", desc: "Adicione cada nota emitida. O cálculo é automático." },
                { num: "3", title: "Acompanhe e relaxe", desc: "Receba alertas por e-mail antes de chegar no limite." },
              ].map(({ num, title, desc }) => (
                <div key={num} className="text-center relative">
                  <div className="w-12 h-12 rounded-full bg-petroleo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 relative z-10">{num}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/cadastro" className="btn-primary px-8 py-4 text-base font-bold inline-block rounded-xl">
              Criar conta grátis agora
            </Link>
          </div>
        </div>
      </section>

      {/* ── Prova social ── */}
      <section className="py-20 px-4 bg-petroleo-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-agua-600 uppercase tracking-widest">Depoimentos</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3">MEIs que estão no controle</h2>
          </div>

          {/* Números */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { stat: "+500", desc: "MEIs cadastrados" },
              { stat: "R$ 81k", desc: "Limite monitorado" },
              { stat: "< 30s", desc: "Para registrar uma nota" },
            ].map(({ stat, desc }) => (
              <div key={stat} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-petroleo-700">{stat}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>

          {/* Depoimentos */}
          <div className="grid sm:grid-cols-3 gap-6">
            {depoimentos.map(({ nome, cidade, texto, estrelas }) => (
              <div key={nome} className="bg-white rounded-2xl p-6 shadow-sm border border-petroleo-100 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: estrelas }).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
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

      {/* ── CTA final ── */}
      <section className="py-20 px-4 bg-petroleo-800">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-petroleo-400 text-xs font-bold uppercase tracking-widest">Comece hoje</span>
          <h2 className="text-3xl font-extrabold text-white mt-3 mb-4">
            Seu MEI protegido em menos de 1 minuto
          </h2>
          <p className="text-petroleo-300 mb-8 text-sm">
            Cadastre-se gratuitamente e descubra quanto você ainda pode faturar este ano.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="bg-agua-500 hover:bg-agua-400 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base inline-flex items-center justify-center gap-2">
              Começar gratuitamente <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/landing" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base border border-white/20">
              Ver planos e preços
            </Link>
          </div>
          <p className="text-petroleo-500 text-xs mt-5">Sem cartão de crédito · Garantia 7 dias no plano Pro</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-4 bg-petroleo-900 text-center text-petroleo-300 text-sm">
        <div className="mb-3"><Logo href="/" size="text-xl" className="inline-flex" /></div>
        <p>© {new Date().getFullYear()} Portal MEIguia. Feito para empreendedores brasileiros.</p>
        <div className="flex justify-center gap-6 mt-3 text-xs text-petroleo-400 flex-wrap">
          <Link href="/landing" className="hover:text-petroleo-200">Planos e Preços</Link>
          <Link href="/calculadora-mei" className="hover:text-petroleo-200">Calculadora MEI</Link>
          <Link href="/termos" className="hover:text-petroleo-200">Termos de Uso</Link>
          <a href="mailto:suporte@portalmeiguia.com.br" className="hover:text-petroleo-200">Suporte</a>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 p-3 flex gap-3 shadow-2xl">
        <Link href="/login" className="btn-secondary flex-1 text-center text-sm py-3">Entrar</Link>
        <Link href="/cadastro" className="btn-primary flex-1 text-center text-sm py-3 font-bold">Começar grátis</Link>
      </div>
    </div>
  );
}
