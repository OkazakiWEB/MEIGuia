"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { LogoInline } from "@/components/ui/Logo";

/* ─── FAQ data ─── */
const faqs = [
  {
    q: 'Como funciona o "radar" do CNPJ?',
    a: "O MEIGuia acompanha seu faturamento, prazos de DAS, declarações anuais e pendências. Sempre que algo exige atenção — ou está prestes a exigir — você recebe um alerta no WhatsApp.",
  },
  {
    q: "Preciso trocar de contador?",
    a: "Não. O MEIGuia funciona sozinho ou complementando seu contador atual. Se preferir, assumimos a contabilidade integralmente e geramos resumos mensais automáticos.",
  },
  {
    q: "E se meu CNPJ já estiver pendente?",
    a: "Fazemos diagnóstico gratuito em 24h, apresentamos o que resolver em ordem de prioridade e executamos a regularização — incluindo parcelamento de DAS atrasado e declarações retroativas.",
  },
  {
    q: "Vocês pagam o DAS automaticamente?",
    a: "Sim, se você autorizar. O MEIGuia gera o DAS, avisa com antecedência e executa o pagamento via Pix no vencimento. Pode desativar a qualquer momento.",
  },
  {
    q: "Como sei que vocês são confiáveis?",
    a: "Temos contador registrado no CRC, mais de 12 mil CNPJs sob monitoramento e parceria com bancos e órgãos reguladores. Pode pedir nosso certificado técnico a qualquer momento.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Seguimos a LGPD à risca. Dados criptografados, nunca vendidos, e você pode solicitar exclusão completa a qualquer momento.",
  },
];

/* ─── Depoimentos ─── */
const depoRow1 = [
  { text: "Descobri que meu CNPJ estava pendente só na hora de tirar um financiamento. Com o MEIGuia nunca mais tive surpresa.", name: "Mariana Ribeiro", role: "Confeiteira · BH", initials: "MR", bg: "#d4572a", dark: false },
  { text: "O WhatsApp avisou que ia estourar o limite em agosto. Reorganizei e entrei em dezembro dentro do MEI. Vale cada centavo.", name: "João Ferreira", role: "Designer · Florianópolis", initials: "JF", bg: "#00d47e", dark: true, avatarColor: "#0a2540" },
  { text: "Deixei 8 meses de DAS atrasar. O MEIGuia parcelou tudo, regularizou em 3 semanas. Hoje pago um por mês, zero estresse.", name: "Camila Souza", role: "Cabeleireira · Salvador", initials: "CS", bg: "#0a2540", dark: false },
  { text: "Não é um app bonito com números. É um time que responde de verdade. Minha contadora não tem paciência; o MEIGuia tem.", name: "Pedro Lima", role: "Marceneiro · Curitiba", initials: "PL", bg: "#c89868", dark: false },
];

const depoRow2 = [
  { text: "Sou MEI há 6 anos e só agora entendo o que é 'limite'. O MEIGuia me educou sem parecer aula chata.", name: "Amanda Nogueira", role: "Fotógrafa · Recife", initials: "AN", bg: "#13365e", dark: false },
  { text: "Tinha pavor de contador. Hoje resolvo tudo no WhatsApp e durmo tranquilo. Parece bobo, mas mudou minha rotina.", name: "Ricardo Gouveia", role: "Personal Trainer · SP", initials: "RG", bg: "#2b4a3e", dark: false },
  { text: "Preço justo, atendimento rápido e sem frescura de contabilidade tradicional. Recomendei pra 4 amigas já.", name: "Tatiane Alves", role: "Manicure · Goiânia", initials: "TA", bg: "#00d47e", dark: true, avatarColor: "#0a2540" },
  { text: "Fiz a regularização em 18 dias. Estava sem dormir achando que ia perder o CNPJ. Salvou meu negócio.", name: "Lucas Campos", role: "Eletricista · Fortaleza", initials: "LC", bg: "#d4572a", dark: false },
];

/* ─── Benefícios ─── */
const beneficios = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    title: "Alertas automáticos",
    desc: "Receba avisos por WhatsApp e e-mail aos 70%, 90% e 100% do limite. Nunca seja pego de surpresa.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: "CNPJ sempre em dia",
    desc: "DAS gerado e pago automaticamente. Declarações no prazo. Zero pendências e multas.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: "Controle em tempo real",
    desc: "Dashboard com seu faturamento atual, projeção do ano e quanto ainda pode faturar sem risco.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Contador humano",
    desc: "Dúvidas resolvidas por contador real no WhatsApp. Resposta em até 2h úteis, sem robô.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
      </svg>
    ),
    title: "Exportação facilitada",
    desc: "Notas em Excel ou CSV com um clique. Declaração anual sem estresse.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    title: "30 segundos por nota",
    desc: "Interface criada para quem não é contador. Registre uma nota fiscal em menos de 30 segundos.",
  },
];

/* ─── Problemas ─── */
const problemas = [
  {
    emoji: "😰",
    title: "Medo de estourar o limite",
    desc: "Muitos MEIs perdem o enquadramento por ultrapassar R$ 81.000 no ano sem perceber. A Receita não avisa.",
    fix: "MEIGuia monitora e avisa antes com antecedência.",
  },
  {
    emoji: "📋",
    title: "DAS em atraso, CNPJ sujo",
    desc: "Esquecer o boleto mensal trava crédito, financiamento e licitação. Uma dívida vira bola de neve.",
    fix: "DAS gerado e pago automaticamente todo mês.",
  },
  {
    emoji: "😵",
    title: "Contador que não explica nada",
    desc: "Linguagem técnica, demora para responder e você fica sem entender o que está acontecendo com seu negócio.",
    fix: "Contador humano via WhatsApp, resposta em 2h.",
  },
];

/* ─── Passos ─── */
const passos = [
  { n: "01", title: "Crie sua conta grátis", desc: "Menos de 1 minuto. Só e-mail e senha. Sem burocracia." },
  { n: "02", title: "Registre suas notas", desc: "Adicione cada nota emitida em 30 segundos. O cálculo é automático." },
  { n: "03", title: "Relaxe e receba alertas", desc: "A gente monitora. Você foca no seu negócio e recebe avisos quando precisar agir." },
];

/* ─── Marquee items ─── */
const marqueeItems = [
  "DAS em dia", "Zero pendências", "Alertas inteligentes",
  "Limite controlado", "Contador humano", "CNPJ protegido",
  "DAS em dia", "Zero pendências", "Alertas inteligentes",
  "Limite controlado", "Contador humano", "CNPJ protegido",
];

/* ════════════════════════════════════════════ */

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [clock, setClock] = useState("");
  const [amount, setAmount] = useState(58420);
  const [pct, setPct] = useState(72);
  const fillRef = useRef<HTMLDivElement>(null);

  /* nav scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* live clock */
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("pt-BR"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* radar fill initial */
  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = "72%";
    }, 600);
    return () => clearTimeout(t);
  }, []);

  /* radar amount tick */
  useEffect(() => {
    let base = 58420;
    const id = setInterval(() => {
      base += Math.floor(Math.random() * 40);
      setAmount(base);
      const p = Math.min(99, (base / 81000) * 100);
      setPct(Math.round(p));
      if (fillRef.current) fillRef.current.style.width = p + "%";
    }, 4000);
    return () => clearInterval(id);
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll("[data-reveal],[data-reveal-stagger]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* number counters */
  useEffect(() => {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = parseInt(el.dataset.count ?? "0", 10);
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / 1800);
            el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString("pt-BR");
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          cio.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));
    return () => cio.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden />

      {/* ══ NAV ══ */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <LogoInline href="/" className={styles.navLogo} />
        <div className={styles.navLinks}>
          <a href="#problema">Por que MEIGuia</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#depoimentos">Clientes</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className={styles.navCta}>
          <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>Entrar</Link>
          <Link href="/landing" className={`${styles.btn} ${styles.btnNavCta}`}>
            Começar grátis <span className={styles.btnArrow}>→</span>
          </Link>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrid} />

        <div className={styles.heroLeft}>
          <div className={styles.heroTag} data-reveal>
            <span className={styles.heroTagDot} />
            <span>Monitoramento ativo do CNPJ</span>
          </div>

          <h1 className={styles.heroTitle} data-reveal>
            Nunca mais estoure<br />
            o limite do MEI<br />
            <em>sem saber.</em>
          </h1>

          <p className={styles.lead} data-reveal>
            O MEIGuia monitora seu faturamento em tempo real, avisa antes de estourar o limite de R$&nbsp;81.000 e mantém seu CNPJ limpo — sem você precisar entender de contabilidade.
          </p>

          <div className={styles.heroActions} data-reveal>
            <Link href="/cadastro" className={`${styles.btn} ${styles.btnGreen} ${styles.btnLg}`}>
              Proteger meu CNPJ <span className={styles.btnArrow}>→</span>
            </Link>
            <a href="#como-funciona" className={styles.btnText}>
              Ver como funciona <span className={styles.btnArrow}>→</span>
            </a>
          </div>

          <p className={styles.heroDisclaimer} data-reveal>
            Grátis para começar · Sem cartão de crédito · Cancele quando quiser
          </p>

          <div className={styles.heroStats} data-reveal-stagger>
            <div>
              <span className={styles.statNum} data-count="12400">0</span>
              <span className={styles.statLabel}>MEIs protegidos</span>
            </div>
            <div>
              <span className={styles.statNum}>R$&nbsp;<span data-count="81">0</span>mi</span>
              <span className={styles.statLabel}>Faturamento monitorado</span>
            </div>
            <div>
              <span className={styles.statNum}><span data-count="99">0</span>,7%</span>
              <span className={styles.statLabel}>Zero pendências</span>
            </div>
          </div>
        </div>

        {/* Radar Card */}
        <div className={styles.radarWrap} data-reveal>
          <div className={styles.radarCard}>
            <div className={`${styles.floatPill} ${styles.floatPill1}`}>
              <span className={styles.floatPillDot} style={{ background: "var(--green)" }} />
              DAS pago automático
            </div>
            <div className={`${styles.floatPill} ${styles.floatPill2}`}>
              <span className={styles.floatPillDot} style={{ background: "var(--amber)" }} />
              Aviso antecipado
            </div>

            <div className={styles.rcHeader}>
              <div className={styles.rcTitle}><span className={styles.rcLive} />Faturamento 2026</div>
              <div className={styles.rcTime}>{clock}</div>
            </div>

            <div className={styles.rcAmount}>
              <span className={styles.currency}>R$</span>{amount.toLocaleString("pt-BR")}
            </div>
            <div className={styles.rcSub}>
              <strong>+ R$ 3.240</strong> esta semana · limite MEI R$ 81.000
            </div>

            <div className={styles.rcMeterLabel}>
              <span>USO DO LIMITE</span>
              <span>{pct}%</span>
            </div>
            <div className={styles.rcMeter}>
              <div className={styles.rcMeterFill} ref={fillRef} />
            </div>
            <div className={styles.rcMeterTicks}>
              <span>R$ 0</span><span>R$ 40.500</span><span>R$ 81.000</span>
            </div>

            <div className={styles.rcAlerts}>
              <div className={`${styles.rcAlert} ${styles.rcAlertOk}`}>
                <div className={styles.rcAlertIcon}>✓</div>
                <div className={styles.rcAlertText}><b>DAS de abril quitado.</b><br />Próximo vencimento em 20 dias.</div>
                <div className={styles.rcAlertTime}>agora</div>
              </div>
              <div className={`${styles.rcAlert} ${styles.rcAlertWarn}`}>
                <div className={styles.rcAlertIcon}>!</div>
                <div className={styles.rcAlertText}><b>Atenção:</b> no ritmo atual, você atinge o limite em novembro.</div>
                <div className={styles.rcAlertTime}>2min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          {marqueeItems.map((item, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span>{item}</span>
              <span className={styles.marqueeDot} />
            </span>
          ))}
        </div>
      </div>

      {/* ══ PROBLEMA ══ */}
      <section id="problema" className={styles.problemaSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader} data-reveal>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDash} />
              <span>O problema</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Ser MEI é simples.<br />
              Mas os <em>riscos</em> são reais.
            </h2>
            <p className={styles.sectionLead}>
              A maioria dos microempreendedores descobre os problemas tarde demais — quando o CNPJ já está sujo e o estrago já foi feito.
            </p>
          </div>

          <div className={styles.problemaGrid} data-reveal-stagger>
            {problemas.map(({ emoji, title, desc, fix }) => (
              <div key={title} className={styles.problemaCard}>
                <div className={styles.problemaEmoji}>{emoji}</div>
                <h3 className={styles.problemaTitle}>{title}</h3>
                <p className={styles.problemaDesc}>{desc}</p>
                <div className={styles.problemaFix}>
                  <span className={styles.problemaFixCheck}>✓</span>
                  {fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SOLUÇÃO ══ */}
      <section className={styles.solucaoSection}>
        <div className={styles.sectionInner}>
          <div className={styles.solucaoGrid}>
            <div className={styles.solucaoLeft} data-reveal>
              <div className={styles.sectionEyebrow}>
                <span className={styles.sectionEyebrowDash} />
                <span>A solução</span>
              </div>
              <h2 className={styles.solucaoTitle}>
                Não é um app de controle.<br />
                É um <em>radar</em>.
              </h2>
              <p className={styles.solucaoDesc}>
                O MEIGuia roda no background, olhando seu faturamento, prazos e documentação, e <strong>só te chama quando precisa</strong>. Linguagem simples, WhatsApp e um time humano — sem você precisar virar especialista em Simples Nacional.
              </p>
              <Link href="/landing" className={`${styles.btn} ${styles.btnGreen} ${styles.btnLg}`}>
                Conhecer os planos <span className={styles.btnArrow}>→</span>
              </Link>
            </div>

            <div className={styles.solucaoRight} data-reveal>
              <ul className={styles.solucaoList}>
                {[
                  { icon: "📡", text: "Monitora limite de faturamento em tempo real" },
                  { icon: "💳", text: "Gera e paga DAS automaticamente todo mês" },
                  { icon: "🔔", text: "Avisa antes de qualquer prazo vencer" },
                  { icon: "💬", text: "Contador humano disponível no WhatsApp" },
                  { icon: "✅", text: "Regulariza CNPJ pendente de ponta a ponta" },
                ].map(({ icon, text }) => (
                  <li key={text} className={styles.solucaoItem}>
                    <span className={styles.solucaoItemIcon}>{icon}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BENEFÍCIOS ══ */}
      <section className={styles.beneficiosSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader} data-reveal>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDash} />
              <span>Funcionalidades</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Tudo que seu MEI precisa.<br />
              <em>Nada que você não vai usar.</em>
            </h2>
          </div>

          <div className={styles.beneficiosGrid} data-reveal-stagger>
            {beneficios.map(({ icon, title, desc }) => (
              <div key={title} className={styles.beneficioCard}>
                <div className={styles.beneficioIcon}>{icon}</div>
                <h3 className={styles.beneficioTitle}>{title}</h3>
                <p className={styles.beneficioDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMO FUNCIONA ══ */}
      <section id="como-funciona" className={styles.passosSection}>
        <div className={styles.sectionInner}>
          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`} data-reveal>
            <div className={styles.sectionEyebrow} style={{ justifyContent: "center" }}>
              <span className={styles.sectionEyebrowDash} />
              <span>Como funciona</span>
              <span className={styles.sectionEyebrowDash} />
            </div>
            <h2 className={styles.sectionTitle} style={{ textAlign: "center", margin: "0 auto 12px" }}>
              Proteja seu CNPJ em <em>3 passos</em>.
            </h2>
            <p className={styles.sectionLead} style={{ textAlign: "center", margin: "0 auto" }}>
              Sem burocracia, sem planilha, sem contador tradicional.
            </p>
          </div>

          <div className={styles.passosCards} data-reveal-stagger>
            {passos.map(({ n, title, desc }) => (
              <div key={n} className={styles.passoCard}>
                <div className={styles.passoCardNum}>{n}</div>
                <h3 className={styles.passoCardTitle}>{title}</h3>
                <p className={styles.passoCardDesc}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }} data-reveal>
            <Link href="/landing" className={`${styles.btn} ${styles.btnGreen} ${styles.btnLg}`}>
              Começar agora <span className={styles.btnArrow}>→</span>
            </Link>
            <p style={{ marginTop: "0.75rem", fontSize: "13px", color: "rgba(10,37,64,.5)" }}>
              Grátis para começar · Sem cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* ══ PROVA SOCIAL ══ */}
      <section id="depoimentos" className={styles.depoSection}>
        {/* Stats bar */}
        <div className={styles.sectionInner}>
          <div className={styles.statsBar} data-reveal-stagger>
            {[
              { num: "+12.000", label: "MEIs protegidos" },
              { num: "R$ 81mi", label: "Faturamento monitorado" },
              { num: "< 30s", label: "Para registrar uma nota" },
              { num: "2h", label: "Resposta do contador" },
            ].map(({ num, label }) => (
              <div key={label} className={styles.statItem}>
                <span className={styles.statItemNum}>{num}</span>
                <span className={styles.statItemLabel}>{label}</span>
              </div>
            ))}
          </div>

          <div className={`${styles.sectionHeader} ${styles.sectionHeaderCenter}`} data-reveal>
            <div className={styles.sectionEyebrow} style={{ justifyContent: "center" }}>
              <span className={styles.sectionEyebrowDash} />
              <span>Depoimentos</span>
              <span className={styles.sectionEyebrowDash} />
            </div>
            <h2 className={styles.sectionTitle} style={{ textAlign: "center", margin: "0 auto" }}>
              <em>12 mil</em> CNPJs dormindo tranquilos.
            </h2>
            <p className={styles.sectionLead} style={{ margin: "0 auto", textAlign: "center" }}>
              Empreendedores de todo o Brasil que trocaram a ansiedade do boleto pelo silêncio do "tá tudo em dia".
            </p>
          </div>
        </div>

        <DepoRow cards={depoRow1} />
        <DepoRow cards={depoRow2} reverse />

        <div className={styles.sectionInner} style={{ marginTop: "3rem" }} data-reveal>
          <div style={{ textAlign: "center" }}>
            <Link href="/cadastro" className={`${styles.btn} ${styles.btnGreen} ${styles.btnLg}`}>
              Quero fazer parte <span className={styles.btnArrow}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.sectionInner}>
          <div data-reveal>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDash} />
              <span>Dúvidas frequentes</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Respostas diretas,<br />sem <em>enrolação</em>.
            </h2>
          </div>

          <div className={styles.faqGrid}>
            <div className={styles.faqAside} data-reveal>
              <div className={styles.faqAsideCard}>
                <h4>Não achou sua dúvida?</h4>
                <p>Fala com a gente no WhatsApp. Contador responde em até 2h úteis.</p>
                <Link href="/cadastro" className={`${styles.btn} ${styles.btnGreen}`}>
                  Falar agora <span className={styles.btnArrow}>→</span>
                </Link>
              </div>

              {/* Indicadores de confiança */}
              <div className={styles.faqTrust}>
                {[
                  { num: "+12.000", label: "CNPJs protegidos" },
                  { num: "CRC ativo", label: "Contador responsável" },
                  { num: "LGPD", label: "Dados protegidos" },
                ].map(({ num, label }) => (
                  <div key={label} className={styles.faqTrustItem}>
                    <span className={styles.faqTrustNum}>{num}</span>
                    <span className={styles.faqTrustLabel}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.faqList} data-reveal>
              {faqs.map((item, i) => (
                <div key={i} className={`${styles.faqItem} ${faqOpen === i ? styles.faqItemOpen : ""}`}>
                  <button className={styles.faqQ} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    {item.q}
                    <span className={styles.faqPlus} />
                  </button>
                  <div className={`${styles.faqA} ${faqOpen === i ? styles.faqAOpen : ""}`}>
                    {item.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section id="cta" className={styles.ctaSection}>
        <div className={styles.ctaWatermark} aria-hidden>MEIGuia</div>
        <div className={styles.ctaWrap} data-reveal>
          <h2>Seu CNPJ<br />merece <em>dormir</em>.</h2>
          <p>Em menos de 1 minuto a gente começa a cuidar do seu CNPJ. Primeira consulta sem compromisso.</p>
          <div className={styles.ctaActions}>
            <Link href="/cadastro" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
              Começar agora <span className={styles.btnArrow}>→</span>
            </Link>
            <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>
              Já tenho conta
            </Link>
          </div>
          <p style={{ marginTop: "1.5rem", fontSize: "13px", color: "rgba(10,37,64,.55)" }}>
            Grátis para começar · Plano Pro a partir de R$ 19,90/mês · Garantia de 7 dias
          </p>
        </div>
      </section>

      {/* ══ WORDMARK ══ */}
      <div className={styles.wordmark}>
        <div className={styles.wordmarkText}>MEI<em>Guia</em>®</div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer className={styles.footer}>
        <div className={styles.sectionInner}>
          <div className={styles.footGrid}>
            <div className={styles.footBrand}>
              <LogoInline href="/" className={styles.footLogo} />
              <p className={styles.footTag}>
                Proteção inteligente do seu CNPJ. Radar ativo, contador humano, zero surpresas.
              </p>
            </div>
            <div className={styles.footCol}>
              <h5>Produto</h5>
              <ul>
                <li><a href="#problema">Por que MEIGuia</a></li>
                <li><a href="#como-funciona">Como funciona</a></li>
                <li><Link href="/landing">Planos e preços</Link></li>
                <li><Link href="/calculadora-mei">Calculadora MEI</Link></li>
              </ul>
            </div>
            <div className={styles.footCol}>
              <h5>Empresa</h5>
              <ul>
                <li><a href="#depoimentos">Clientes</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><Link href="/termos">Termos de Uso</Link></li>
                <li><a href="#">Política de Privacidade</a></li>
              </ul>
            </div>
            <div className={styles.footCol}>
              <h5>Contato</h5>
              <ul>
                <li><a href="https://wa.me/5511999999999" target="_blank" rel="noopener">WhatsApp</a></li>
                <li><a href="mailto:suporte@portalmeiguia.com.br">E-mail de suporte</a></li>
                <li><Link href="/cadastro">Criar conta grátis</Link></li>
              </ul>
            </div>
          </div>
          <div className={styles.footBottom}>
            <div>© {new Date().getFullYear()} MEIGuia · Todos os direitos reservados</div>
            <div>CRC ativo · LGPD compliant</div>
          </div>
        </div>
      </footer>

      {/* ══ MOBILE STICKY CTA ══ */}
      <div className={styles.mobileCta}>
        <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1, justifyContent: "center" }}>
          Entrar
        </Link>
        <Link href="/cadastro" className={`${styles.btn} ${styles.btnGreen}`} style={{ flex: 1, justifyContent: "center" }}>
          Começar grátis
        </Link>
      </div>
    </div>
  );
}

/* ─── DepoRow component ─── */
function DepoRow({ cards, reverse }: { cards: typeof depoRow1; reverse?: boolean }) {
  const doubled = [...cards, ...cards];
  return (
    <div className={`${styles.depoRow} ${reverse ? styles.depoRowReverse : ""}`}>
      {doubled.map((c, i) => (
        <div key={i} className={`${styles.depoCard} ${c.dark ? styles.depoCardDark : ""}`}>
          <div className={styles.depoStars}>★★★★★</div>
          <p className={styles.depoText}>&ldquo;{c.text}&rdquo;</p>
          <div className={styles.depoAuthor}>
            <div className={styles.depoAvatar} style={{ background: c.bg, color: c.avatarColor ?? "var(--cream)" }}>
              {c.initials}
            </div>
            <div>
              <div className={styles.depoName}>{c.name}</div>
              <div className={styles.depoRole}>{c.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
