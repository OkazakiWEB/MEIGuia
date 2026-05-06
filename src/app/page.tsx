"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

/* ─── Gauge SVG ─── */
function GaugeCard() {
  const fillRef = useRef<SVGCircleElement>(null);
  const pctRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const total = 81_000;
    const used  = 67_400;
    const pct   = used / total;
    const C     = 534;

    const t = setTimeout(() => {
      if (fillRef.current) {
        fillRef.current.style.strokeDashoffset = String(C * (1 - pct));
      }
      let n = 0;
      const target = Math.round(pct * 100);
      const step = setInterval(() => {
        n = Math.min(n + 1, target);
        if (pctRef.current) pctRef.current.textContent = `${n}%`;
        if (n >= target) clearInterval(step);
      }, 22);
    }, 500);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.gaugeCard}>
      <div className={styles.gaugeCardHeader}>
        <span>Controle de Limite</span>
        <span className={styles.gaugeCardYear}>2025</span>
      </div>

      <div className={styles.gaugeWrap}>
        <svg className={styles.gaugeSvg} viewBox="0 0 200 200" aria-label="83% do limite utilizado">
          <circle cx="100" cy="100" r="85" className={styles.gaugeTrack}/>
          <circle cx="100" cy="100" r="85" ref={fillRef} className={styles.gaugeFill}/>
        </svg>
        <div className={styles.gaugeLabel}>
          <span ref={pctRef} className={styles.gaugePct}>0%</span>
          <span className={styles.gaugeCaption}>do limite</span>
        </div>
      </div>

      <div className={styles.gaugeAmounts}>
        <div>
          <p className={styles.gaugeAmountMain}>R$ 67.400</p>
          <p className={styles.gaugeAmountSub}>faturado</p>
        </div>
        <div className={styles.gaugeAmountRight}>
          <p className={styles.gaugeAmountMain}>R$ 81.000</p>
          <p className={styles.gaugeAmountSub}>limite</p>
        </div>
      </div>

      <div className={styles.gaugeAlerta}>
        <span>⚠️</span>
        <span>Atenção! Você pode faturar apenas mais <strong>R$ 13.600</strong> este ano.</span>
      </div>

      <div className={styles.gaugeStatus}>
        <span className={styles.gaugeStatusIcon}>!</span>
        Alerta enviado via WhatsApp agora mesmo
      </div>
    </div>
  );
}

/* ─── Nav ─── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`${styles.nav}${scrolled ? " " + styles.navScrolled : ""}`}>
      <Link href="/" className={styles.navLogo}>
        <span className={styles.navLogoMark}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </span>
        <span className={styles.navLogoText}>MEIGuia</span>
      </Link>

      <div className={styles.navLinks}>
        <a href="#beneficios">Beneficios</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#depoimentos">Depoimentos</a>
        <a href="#planos">Planos</a>
      </div>

      <div className={styles.navCta}>
        <Link href="/login" className={styles.btnGhost}>Entrar</Link>
        <Link href="/cadastro" className={styles.btnPrimary}>
          Comecar gratis
          <span className={styles.btnArrow}>→</span>
        </Link>
      </div>
    </nav>
  );
}

/* ─── Scroll reveal ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = "1";
          (e.target as HTMLElement).style.transform = "translateY(0)";
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10 });
    els.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(32px)";
      (el as HTMLElement).style.transition = "opacity .6s ease, transform .6s ease";
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

/* ─── Icons ─── */
const IcoStar  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoCheck = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ─── Page ─── */
export default function HomePage() {
  useReveal();

  return (
    <div className={styles.page}>
      <Nav />

      {/* ═══ HERO ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroLeft} data-reveal>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgePulse} />
            Exclusivo para MEI — 100% gratuito para comecar
          </div>

          <h1 className={styles.heroH1}>
            Nao deixe seu MEI<br />
            virar uma <em>dor de cabeca</em>
          </h1>

          <p className={styles.heroSub}>
            O MEIGuia monitora seu faturamento e te avisa antes de voce
            ultrapassar o limite de <strong>R$ 81 mil</strong> — evitando multas
            e impostos retroativos.
          </p>

          <div className={styles.heroActions}>
            <Link href="/cadastro" className={styles.btnPrimaryLg}>
              Comecar gratis agora
              <span className={styles.btnArrow}>→</span>
            </Link>
            <a href="#como-funciona" className={styles.btnOutlineLg}>
              Ver como funciona
            </a>
          </div>

          <p className={styles.heroDisclaimer}>
            Leva menos de 1 minuto · Sem cartao de credito
          </p>
        </div>

        <div className={styles.heroRight} data-reveal>
          <GaugeCard />
        </div>
      </section>

      {/* ═══ DOR ═══ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="problema">
        <div className={styles.inner}>
          <span className={styles.eyebrow} data-reveal>O problema</span>
          <h2 className={styles.sectionH2} data-reveal>
            Voce nao sabe quanto<br />ja faturou este ano?
          </h2>
          <p className={`${styles.sectionSub}`} data-reveal>
            Mais de 70% dos MEIs nao controlam o faturamento e so descobrem
            o problema quando ja e tarde demais.
          </p>

          <div className={styles.dorGrid}>
            {[
              { emoji: "😰", title: "Sem controle do faturamento", desc: "Voce nao sabe quanto ja recebeu este ano e nem quanto ainda pode faturar. Uma unica nota pode te fazer ultrapassar o limite." },
              { emoji: "😓", title: "Esqueceu de pagar o DAS?", desc: "Multas, juros e restricoes no CNPJ. O DAS vence todo mes e o esquecimento e mais comum do que parece." },
              { emoji: "😱", title: "Medo de multas da Receita", desc: "Ultrapassar o limite do MEI sem perceber pode gerar cobrancas retroativas e ate perda da categoria." },
            ].map((c, i) => (
              <div key={i} className={styles.dorCard} data-reveal>
                <span className={styles.dorEmoji}>{c.emoji}</span>
                <h3 className={styles.dorTitle}>{c.title}</h3>
                <p className={styles.dorDesc}>{c.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.dorAlerta} data-reveal>
            <span className={styles.dorAlertaEmoji}>⚡</span>
            <p className={styles.dorAlertaText}>
              <strong>Atencao:</strong> Se voce ultrapassar R$ 81.000 de faturamento no ano,
              pode ser obrigado a pagar impostos como empresa normal — com cobranca{" "}
              <strong>retroativa ao mes em que estorou o limite</strong>.
              A diferenca pode ser de milhares de reais.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ BENEFÍCIOS ═══ */}
      <section className={styles.section} id="beneficios">
        <div className={styles.inner}>
          <span className={styles.eyebrow} data-reveal>A solucao</span>
          <h2 className={styles.sectionH2} data-reveal>
            Tudo que voce precisa<br />em um unico lugar
          </h2>
          <p className={`${styles.sectionSub}`} data-reveal>
            Simples, direto e feito para quem nao e contador.
          </p>

          <div className={styles.benfGrid}>
            {[
              { emoji: "📊", title: "Controle simples",     desc: "Veja em tempo real quanto voce ja faturou e quanto ainda pode faturar este ano." },
              { emoji: "⚠️",  title: "Evite multas",        desc: "Seja avisado antes de ultrapassar o limite e evite consequencias com a Receita Federal." },
              { emoji: "🔔", title: "Alertas automaticos", desc: "Notificacoes por e-mail e WhatsApp quando se aproximar do limite ou vencer o DAS." },
              { emoji: "💰", title: "Seguranca financeira", desc: "Previsao de faturamento para planejar seus proximos meses sem sustos." },
              { emoji: "📅", title: "Organizacao do DAS",   desc: "Lembrete mensal do DAS com calculo automatico do valor com base no seu tipo de atividade." },
            ].map((c, i) => (
              <div key={i} className={styles.benfCard} data-reveal>
                <span className={styles.benfEmoji}>{c.emoji}</span>
                <h3 className={styles.benfTitle}>{c.title}</h3>
                <p className={styles.benfDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SIMULAÇÃO DE RISCO ═══ */}
      <div className={styles.riscoBg} data-reveal>
        <div className={styles.riscoInner}>
          <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Simulacao de risco</span>
          <h2 className={styles.riscoH2}>
            O que acontece se voce ultrapassar o limite?
          </h2>
          <p className={styles.riscoSub}>
            Veja o impacto real de faturar R$ 90.000 sendo MEI:
          </p>

          <div className={styles.riscoCard}>
            <div className={styles.riscoCol}>
              <span className={styles.riscoLabel}>Faturamento no ano</span>
              <span className={styles.riscoVal}>R$ 90.000</span>
            </div>
            <div className={styles.riscoDivider} />
            <div className={`${styles.riscoCol} ${styles.riscoColRight}`}>
              <span className={styles.riscoLabel}>Excesso sobre o limite</span>
              <span className={`${styles.riscoVal} ${styles.riscoValNeg}`}>R$ 9.000</span>
            </div>
          </div>

          <div className={styles.riscoFooter}>
            Sobre esse excesso, voce pode ser cobrado com <strong>aliquotas de 4% a 15,5%</strong> — retroativamente
            a partir do mes em que ultrapassou. Isso significa uma conta inesperada de{" "}
            <strong>R$ 360 a R$ 1.395 ou mais</strong>, dependendo da sua atividade.
          </div>

          <div className={styles.riscoCta}>
            <Link href="/cadastro" className={styles.btnPrimaryLg}>
              Quero me proteger gratis
              <span className={styles.btnArrow}>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="como-funciona">
        <div className={styles.inner}>
          <span className={styles.eyebrow} data-reveal style={{textAlign:"center", display:"block"}}>Como funciona</span>
          <h2 className={`${styles.sectionH2} ${styles.sectionH2Center}`} data-reveal>
            Comece em menos de 1 minuto
          </h2>
          <p className={`${styles.sectionSub} ${styles.sectionSubCenter}`} data-reveal>
            Sem burocracia, sem termos tecnicos. So voce, seu MEI e a tranquilidade de estar protegido.
          </p>

          <div className={styles.passosWrap}>
            {[
              { num: "1", title: "Crie sua conta gratis",   desc: "Cadastro rapido com e-mail ou Google. Nenhuma informacao de cartao necessaria." },
              { num: "2", title: "Informe seu CNPJ",         desc: "O MEIGuia detecta automaticamente sua atividade, municipio e limite de faturamento." },
              { num: "3", title: "Receba alertas",           desc: "A partir daqui, voce e notificado por e-mail ou WhatsApp. Pronto — seu MEI esta protegido." },
            ].map((c, i) => (
              <div key={i} className={styles.passoItem} data-reveal>
                <div className={styles.passoNum}>{c.num}</div>
                <h3 className={styles.passoTitle}>{c.title}</h3>
                <p className={styles.passoDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEPOIMENTOS ═══ */}
      <section className={styles.section} id="depoimentos">
        <div className={styles.inner}>
          <span className={styles.eyebrow} data-reveal style={{textAlign:"center", display:"block"}}>Depoimentos</span>
          <h2 className={`${styles.sectionH2} ${styles.sectionH2Center}`} data-reveal>
            MEIs que pararam de se preocupar
          </h2>

          <div className={styles.depoGrid}>
            {[
              { name: "Ana Carvalho",  role: "Designer freelancer", initials: "AC",
                text: "Hoje eu sei exatamente quanto posso faturar. Recebi um alerta no WhatsApp quando estava chegando a 80% do limite. Me poupou de uma dor de cabeca enorme." },
              { name: "Carlos Mendes", role: "Consultor de TI",     initials: "CM",
                text: "Simples e direto ao ponto. Antes eu usava planilha e sempre me perdia. Agora o MEIGuia faz tudo e eu so olho o painel uma vez por semana." },
              { name: "Patricia Lima", role: "Fotografa",            initials: "PL",
                text: "Nunca mais esqueci o DAS. O lembrete chega automatico todo mes com o valor certinho. Economizo tempo e evito multas." },
            ].map((d, i) => (
              <div key={i} className={styles.depoCard} data-reveal>
                <div className={styles.depoStars}>
                  {Array.from({length:5}).map((_,j) => <IcoStar key={j}/>)}
                </div>
                <p className={styles.depoText}>&ldquo;{d.text}&rdquo;</p>
                <div className={styles.depoAuthor}>
                  <div className={styles.depoAvatar}>{d.initials}</div>
                  <div>
                    <p className={styles.depoName}>{d.name}</p>
                    <p className={styles.depoRole}>{d.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.statsRow} data-reveal>
            {[
              { num: "500+",    label: "MEIs protegidos" },
              { num: "2.000+",  label: "Alertas enviados" },
              { num: "R$ 20M+", label: "Faturamento monitorado" },
            ].map((s, i) => (
              <div key={i} className={styles.statCell}>
                <p className={styles.statNum}>{s.num}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLANOS ═══ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="planos">
        <div className={styles.inner}>
          <span className={styles.eyebrow} data-reveal style={{textAlign:"center", display:"block"}}>Planos</span>
          <h2 className={`${styles.sectionH2} ${styles.sectionH2Center}`} data-reveal>
            Comece gratis, evolua quando precisar
          </h2>
          <p className={`${styles.sectionSub} ${styles.sectionSubCenter}`} data-reveal>
            Sem cartao de credito para comecar. Cancele quando quiser.
          </p>

          <div className={styles.planosGrid}>
            {/* Gratuito */}
            <div className={styles.planoCard} data-reveal>
              <div>
                <p className={styles.planoNome}>Gratuito</p>
                <div className={styles.planoPreco}>
                  <span className={styles.planoMoeda}>R$</span>
                  <span className={styles.planoValor}>0</span>
                </div>
                <p className={styles.planoDescricao}>Para comecar a controlar sem gastar nada.</p>
              </div>
              <div className={styles.planoSep} />
              <div className={styles.planoFeatures}>
                {[
                  [true,  "Ate 5 notas por mes"],
                  [true,  "Gauge de limite de faturamento"],
                  [true,  "Alertas por e-mail"],
                  [false, "Alertas por WhatsApp"],
                  [false, "Previsao de faturamento"],
                  [false, "Guias DAS automaticas"],
                  [false, "Emissao de nota fiscal"],
                ].map(([ok, txt], i) => (
                  <div key={i} className={styles.planoFeatureItem}>
                    <span className={ok ? styles.planoCheck : styles.planoX}>
                      {ok ? <IcoCheck /> : <IcoX />}
                    </span>
                    {txt as string}
                  </div>
                ))}
              </div>
              <Link href="/cadastro" className={styles.planoBtnOutline}>
                Comecar gratis
              </Link>
            </div>

            {/* Pro — destaque */}
            <div className={`${styles.planoCard} ${styles.planoCardDestaque}`} data-reveal>
              <span className={styles.planoDestaqueBadge}>Mais popular</span>
              <div>
                <p className={styles.planoNome}>Pro</p>
                <div className={styles.planoPreco}>
                  <span className={styles.planoMoeda}>R$</span>
                  <span className={styles.planoValor}>24</span>
                  <span className={styles.planoPeriodo}>,90/mes</span>
                </div>
                <p className={styles.planoDescricao}>Para quem quer controle completo e tranquilidade.</p>
              </div>
              <div className={styles.planoSep} />
              <div className={styles.planoFeatures}>
                {[
                  [true, "Notas ilimitadas"],
                  [true, "Gauge de limite de faturamento"],
                  [true, "Alertas por e-mail"],
                  [true, "Alertas por WhatsApp"],
                  [true, "Previsao de faturamento"],
                  [true, "Guias DAS automaticas"],
                  [false,"Emissao de nota fiscal"],
                ].map(([ok, txt], i) => (
                  <div key={i} className={styles.planoFeatureItem}>
                    <span className={ok ? styles.planoCheck : styles.planoX}>
                      {ok ? <IcoCheck /> : <IcoX />}
                    </span>
                    {txt as string}
                  </div>
                ))}
              </div>
              <Link href="/cadastro?plano=pro" className={styles.planoBtnPrimary}>
                Testar gratis por 7 dias
                <span className={styles.btnArrow}>→</span>
              </Link>
            </div>

            {/* Premium */}
            <div className={styles.planoCard} data-reveal>
              <div>
                <p className={styles.planoNome}>Premium</p>
                <div className={styles.planoPreco}>
                  <span className={styles.planoMoeda}>R$</span>
                  <span className={styles.planoValor}>49</span>
                  <span className={styles.planoPeriodo}>,90/mes</span>
                </div>
                <p className={styles.planoDescricao}>Para MEIs que precisam de tudo, inclusive NF.</p>
              </div>
              <div className={styles.planoSep} />
              <div className={styles.planoFeatures}>
                {[
                  [true, "Tudo do Pro"],
                  [true, "Emissao de nota fiscal (NFS-e)"],
                  [true, "Suporte prioritario"],
                  [true, "Relatorios para contador"],
                  [true, "Historico completo"],
                ].map(([ok, txt], i) => (
                  <div key={i} className={styles.planoFeatureItem}>
                    <span className={ok ? styles.planoCheck : styles.planoX}>
                      {ok ? <IcoCheck /> : <IcoX />}
                    </span>
                    {txt as string}
                  </div>
                ))}
              </div>
              <Link href="/cadastro?plano=premium" className={styles.planoBtnOutline}>
                Comecar com Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DIFERENCIAIS ═══ */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <span className={styles.eyebrow} data-reveal>Por que o MEIGuia?</span>
          <h2 className={styles.sectionH2} data-reveal>
            Feito exclusivamente para MEI
          </h2>
          <p className={`${styles.sectionSub}`} data-reveal>
            Sem planilhas complicadas, sem termos juridicos. So o que voce precisa saber.
          </p>

          <div className={styles.diferenciaisGrid}>
            {[
              { emoji: "💬", title: "Alertas via WhatsApp",      desc: "Receba notificacoes diretamente no seu WhatsApp quando se aproximar do limite ou vencer o DAS. Simples como uma mensagem de amigo." },
              { emoji: "🎯", title: "Foco exclusivo em MEI",      desc: "Desenvolvido especificamente para Microempreendedores Individuais. Nao e um sistema generico adaptado — foi feito para voce." },
              { emoji: "⚡", title: "Simplicidade extrema",       desc: "Interface limpa, sem burocracia. Qualquer pessoa consegue usar sem treinamento ou conhecimento tecnico." },
              { emoji: "🔒", title: "Seus dados protegidos",      desc: "Criptografia de ponta a ponta. Seus dados financeiros ficam seguros e so voce tem acesso." },
              { emoji: "🤖", title: "Tudo automatico",            desc: "Cadastre seu CNPJ uma vez e pronto. O sistema detecta sua atividade, calcula o DAS e monitora seu limite sozinho." },
              { emoji: "📱", title: "Funciona no celular",        desc: "Use no computador, celular ou tablet. Instalavel como app no seu smartphone — sem precisar de loja de aplicativos." },
            ].map((d, i) => (
              <div key={i} className={styles.diferencial} data-reveal>
                <span className={styles.diferencialEmoji}>{d.emoji}</span>
                <div>
                  <h3 className={styles.diferencialTitle}>{d.title}</h3>
                  <p className={styles.diferencialDesc}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className={styles.ctaFinal} data-reveal>
        <span className={styles.ctaFinalBadge}>
          🚀 Mais de 500 MEIs ja estao protegidos
        </span>
        <h2 className={styles.ctaFinalH2}>
          Nao espere dar <em>problema</em><br />
          para se organizar
        </h2>
        <p className={styles.ctaFinalSub}>
          Crie sua conta gratis agora e tenha o controle do seu MEI
          na palma da mao. Sem cartao de credito.
        </p>
        <Link href="/cadastro" className={styles.btnPrimaryLg}>
          Criar conta gratis agora
          <span className={styles.btnArrow}>→</span>
        </Link>
        <p className={styles.ctaFinalNote}>
          Leva menos de 1 minuto · Plano gratuito disponivel · Cancele quando quiser
        </p>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" className={styles.footerLogo}>
            <span className={styles.footerLogoMark}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </span>
            <span className={styles.footerLogoText}>MEIGuia</span>
          </Link>

          <nav className={styles.footerLinks}>
            <Link href="/calculadora-mei">Calculadora MEI</Link>
            <Link href="/login">Entrar</Link>
            <Link href="/cadastro">Cadastro</Link>
            <a href="mailto:contato@portalmeiguia.com.br">Contato</a>
          </nav>

          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} MEIGuia. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Mobile sticky CTA */}
      <div className={styles.mobileCta}>
        <Link href="/cadastro" className={styles.btnPrimaryLg} style={{width:"100%", justifyContent:"center"}}>
          Comecar gratis agora →
        </Link>
      </div>
    </div>
  );
}
