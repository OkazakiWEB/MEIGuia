"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const faqs = [
  {
    q: 'Como funciona o "radar" do CNPJ?',
    a: "O MEIGuia acompanha seu faturamento, prazos de DAS, declarações anuais e pendências cadastrais. Sempre que algo exige sua atenção — ou está prestes a exigir — você recebe um alerta direto no WhatsApp.",
  },
  {
    q: "Preciso trocar de contador?",
    a: "Não. O MEIGuia funciona sozinho ou complementando seu contador atual. Se preferir, a gente assume a contabilidade integralmente. Se preferir manter o seu, a gente gera resumos mensais automáticos que facilitam o trabalho dele.",
  },
  {
    q: "E se eu já estiver com o CNPJ pendente?",
    a: "A gente faz o diagnóstico gratuito em 24h, te apresenta o que precisa ser resolvido em ordem de prioridade, e executa a regularização — incluindo parcelamento de DAS em atraso e declarações retroativas.",
  },
  {
    q: "Vocês pagam o DAS automaticamente?",
    a: "Se você autorizar, sim. O MEIGuia gera o DAS, te avisa com antecedência e, com sua autorização prévia, executa o pagamento via Pix no vencimento. Você pode desativar a qualquer momento.",
  },
  {
    q: "Como sei que vocês são confiáveis?",
    a: "Temos contador tecnicamente responsável registrado no CRC, mais de 12 mil CNPJs ativos sob monitoramento, e parceria direta com bancos e instituições reguladoras. Pode pedir nosso certificado técnico a qualquer momento.",
  },
  {
    q: "E meus dados? Estão seguros?",
    a: "Seguimos a LGPD à risca. Seus dados são criptografados, nunca são vendidos, e você pode solicitar exclusão completa a qualquer momento. Auditoria independente anual disponível sob solicitação.",
  },
];

const depoRow1 = [
  { text: "Eu descobri que meu CNPJ estava pendente só na hora de tirar um financiamento. Troquei pelo MEIGuia e nunca mais tive surpresa. Sério.", name: "Mariana Ribeiro", role: "CONFEITEIRA · BELO HORIZONTE", initials: "MR", bg: "#d4572a", dark: false },
  { text: "O WhatsApp avisou que eu ia estourar o limite em agosto. Reorganizei as notas e entrei em dezembro dentro do MEI. Isso vale cada centavo.", name: "João Ferreira", role: "DESIGNER · FLORIANÓPOLIS", initials: "JF", bg: "#00d47e", dark: true, avatarColor: "#0a2540" },
  { text: "Deixei 8 meses de DAS atrasar durante a pandemia. O MEIGuia parcelou tudo, regularizou em 3 semanas. Hoje pago um por mês, zero estresse.", name: "Camila Souza", role: "CABELEIREIRA · SALVADOR", initials: "CS", bg: "#0a2540", dark: false },
  { text: "Não é um app bonito com números. É um time que responde de verdade. Minha contadora não tem paciência; o MEIGuia tem.", name: "Pedro Lima", role: "MARCENEIRO · CURITIBA", initials: "PL", bg: "#c89868", dark: false },
];

const depoRow2 = [
  { text: "Sou MEI há 6 anos e só agora entendo o que é 'limite'. O MEIGuia me educou sem parecer aula chata.", name: "Amanda Nogueira", role: "FOTÓGRAFA · RECIFE", initials: "AN", bg: "#13365e", dark: false },
  { text: "Tinha um pavor do contador. Hoje resolvo tudo no WhatsApp e durmo tranquilo. Parece bobo, mas mudou minha rotina.", name: "Ricardo Gouveia", role: "PERSONAL TRAINER · SÃO PAULO", initials: "RG", bg: "#2b4a3e", dark: false },
  { text: "Preço justo, atendimento rápido e sem aquela frescura de contabilidade tradicional. Recomendei pra 4 amigas já.", name: "Tatiane Alves", role: "MANICURE · GOIÂNIA", initials: "TA", bg: "#00d47e", dark: true, avatarColor: "#0a2540" },
  { text: "Fiz a regularização em 18 dias. Estava sem dormir achando que ia perder o CNPJ. Salvou meu negócio.", name: "Lucas Campos", role: "ELETRICISTA · FORTALEZA", initials: "LC", bg: "#d4572a", dark: false },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [clock, setClock] = useState("");
  const [amount, setAmount] = useState(58420);
  const [pct, setPct] = useState(72);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString("pt-BR"));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (fillRef.current) fillRef.current.style.width = "72%";
    }, 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let base = 58420;
    const id = setInterval(() => {
      base += Math.floor(Math.random() * 30);
      setAmount(base);
      const p = Math.min(99, (base / 81000) * 100);
      setPct(Math.round(p));
      if (fillRef.current) fillRef.current.style.width = p + "%";
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll("[data-reveal], [data-reveal-stagger]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = parseInt(el.dataset.count ?? "0", 10);
          const dur = 1800;
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased).toLocaleString("pt-BR");
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => counterIO.observe(el));
    return () => counterIO.disconnect();
  }, []);

  const marqueeItems = [
    "Proteção do CNPJ", "Tranquilidade mensal", "Zero pendências",
    "Alertas inteligentes", "Regularização rápida", "Contador humano",
    "Proteção do CNPJ", "Tranquilidade mensal", "Zero pendências",
    "Alertas inteligentes", "Regularização rápida", "Contador humano",
  ];

  return (
    <div className={styles.page}>
      <div className={styles.grain} aria-hidden />

      {/* NAV */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark} />
          MEIGuia
        </Link>
        <div className={styles.navLinks}>
          <a href="#sobre">Sobre</a>
          <a href="#diferenciais">Diferenciais</a>
          <a href="#servicos">Serviços</a>
          <a href="#depoimentos">Clientes</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className={styles.navCta}>
          <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>Entrar</Link>
          <Link href="/cadastro" className={`${styles.btn} ${styles.btnPrimary}`}>
            Começar agora <span className={styles.btnArrow}>→</span>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrid} />

        <div className={styles.heroLeft}>
          <div className={styles.heroTag} data-reveal>
            <span className={styles.heroTagDot} />
            <span>RADAR DO CNPJ · MONITORAMENTO ATIVO</span>
          </div>
          <h1 className={styles.heroTitle} data-reveal>
            Seu CNPJ<br />
            <em>protegido</em> antes<br />
            do <span className={styles.strokeUnder}>problema</span><br />
            acontecer.
          </h1>
          <p className={styles.lead} data-reveal>
            O MEIGuia acompanha seu faturamento em tempo real e te avisa <em>antes</em> de estourar o limite, esquecer um DAS ou cair em pendência. Não é controle — é tranquilidade.
          </p>
          <div className={styles.heroActions} data-reveal>
            <Link href="/cadastro" className={`${styles.btn} ${styles.btnGreen}`}>
              Proteger meu CNPJ <span className={styles.btnArrow}>→</span>
            </Link>
            <a href="#servicos" className={styles.btnText}>
              Ver como funciona <span className={styles.btnArrow}>→</span>
            </a>
          </div>

          <div className={styles.heroStats} data-reveal-stagger>
            <div>
              <span className={styles.statNum} data-count="12400">0</span>
              <span className={styles.statLabel}>MEIs protegidos</span>
            </div>
            <div>
              <span className={styles.statNum}>
                R$ <span data-count="81">0</span>mi
              </span>
              <span className={styles.statLabel}>Faturamento monitorado</span>
            </div>
            <div>
              <span className={styles.statNum}>
                <span data-count="99">0</span>,7%
              </span>
              <span className={styles.statLabel}>Zero pendências</span>
            </div>
          </div>
        </div>

        {/* RADAR CARD */}
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
              <div className={styles.rcTitle}>
                <span className={styles.rcLive} />
                Faturamento 2026
              </div>
              <div className={styles.rcTime}>{clock}</div>
            </div>

            <div className={styles.rcAmount}>
              <span className={styles.currency}>R$</span>
              {amount.toLocaleString("pt-BR")}
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
              <span>R$ 0</span>
              <span>R$ 40.500</span>
              <span>R$ 81.000</span>
            </div>

            <div className={styles.rcAlerts}>
              <div className={`${styles.rcAlert} ${styles.rcAlertOk}`}>
                <div className={styles.rcAlertIcon}>✓</div>
                <div className={styles.rcAlertText}>
                  <b>DAS de abril quitado.</b><br />
                  Próximo vencimento em 20 dias.
                </div>
                <div className={styles.rcAlertTime}>agora</div>
              </div>
              <div className={`${styles.rcAlert} ${styles.rcAlertWarn}`}>
                <div className={styles.rcAlertIcon}>!</div>
                <div className={styles.rcAlertText}>
                  <b>Atenção:</b> no ritmo atual, você atinge o limite em novembro. Vamos planejar?
                </div>
                <div className={styles.rcAlertTime}>2min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          {marqueeItems.map((item, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span>
                {item === "Tranquilidade mensal" || item === "Regularização rápida"
                  ? <><em>{item.split(" ")[0]}</em>{" " + item.split(" ").slice(1).join(" ")}</>
                  : item}
              </span>
              <span className={styles.marqueeDot} />
            </span>
          ))}
        </div>
      </div>

      {/* SOBRE */}
      <section id="sobre" className={`${styles.section} ${styles.sectionPaper}`}>
        <div className={styles.sectionInner}>
          <div data-reveal>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDash} />
              <span>01 / Sobre</span>
            </div>
            <h2 className={styles.sectionTitle}>
              A gente cuida do <em>chato</em>.<br />
              Você cuida do que ama.
            </h2>
            <p className={styles.sectionLead}>
              MEIGuia nasceu porque a maioria dos microempreendedores descobre os problemas tarde demais — quando o CNPJ já está pendente, o DAS já está em atraso, e o limite já estourou.
            </p>
          </div>

          <div className={styles.sobreGrid}>
            <div className={styles.sobreImg} data-reveal>
              <div className={styles.sobreImgPlaceholder}>
                <span className={styles.sobreImgLabel}>foto · empreendedora em sua loja</span>
              </div>
              <div className={styles.sobreImgTag}>
                cliente desde 2024 · <em>zero pendências</em>
              </div>
            </div>

            <div className={styles.sobreContent} data-reveal>
              <h3>Não é mais um app de <em>controle</em>. É um radar.</h3>
              <p>
                A gente não inventou mais um dashboard com gráfico bonito pra você ficar conferindo toda semana. O MEIGuia roda sozinho no background, olhando seu faturamento, seus prazos e sua documentação, e só te chama quando precisa.
              </p>
              <p>
                É o oposto do seu contador tradicional: linguagem simples, comunicação pelo WhatsApp, e um time humano por trás que entende que você não abriu um MEI pra virar especialista em Simples Nacional.
              </p>
              <div className={styles.sobreValues}>
                {[
                  ["— 01", "Antecipar problemas, não relatá-los."],
                  ["— 02", "Linguagem de gente. Sem jargão contábil."],
                  ["— 03", "Automatizar o que cansa. Humanizar o resto."],
                  ["— 04", "Um único foco: manter seu CNPJ limpo."],
                ].map(([num, text]) => (
                  <div key={num} className={styles.sobreValue}>
                    <div className={styles.sobreValueNum}>{num}</div>
                    <div className={styles.sobreValueText}>{text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" className={styles.diferenciais}>
        <div className={styles.sectionInner}>
          <div data-reveal>
            <div className={`${styles.sectionEyebrow} ${styles.sectionEyebrowLight}`}>
              <span className={`${styles.sectionEyebrowDash} ${styles.sectionEyebrowDashLight}`} />
              <span>02 / Diferenciais</span>
            </div>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
              O que faz o MEIGuia<br />
              ser <em>diferente</em>.
            </h2>
            <p className={`${styles.sectionLead} ${styles.sectionLeadLight}`}>
              Enquanto a concorrência mostra números, o MEIGuia evita problema. Enquanto outros falam "controle", a gente entrega tranquilidade.
            </p>
          </div>

          <div className={styles.difGrid} data-reveal-stagger>
            {[
              { n: "01", label: "PROTEÇÃO", icon: <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/>, icon2: <path d="M9 12l2 2 4-4"/>, title: "Proteção do CNPJ em tempo real", desc: "Monitoramento contínuo do seu faturamento, prazos e documentação. A gente atua antes do problema estourar.", hl: "→ risco detectado em segundos" },
              { n: "02", label: "SIMPLICIDADE", icon: <><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></>, title: "Simples de usar. Absurdamente.", desc: "Um onboarding que leva menos de 1 minuto. Sem termos técnicos, sem formulários intermináveis, sem jargão contábil.", hl: "→ 58 segundos em média" },
              { n: "03", label: "AUTOMAÇÃO", icon: <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>, title: "Automação que desaparece", desc: "Você não calcula. Não acompanha. Não precisa lembrar. O sistema faz — e só aparece quando realmente precisa de você.", hl: "→ 0 decisões manuais" },
              { n: "04", label: "WHATSAPP", icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>, title: "Comunicação que corre atrás", desc: "A gente não espera você entrar no app. Avisos no WhatsApp, alertas por e-mail, lembretes humanos. Você é o foco.", hl: "→ proativo, nunca passivo" },
              { n: "05", label: "FOCO", icon: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>, title: "Um problema. Uma solução.", desc: "A gente não tenta fazer DRE, fluxo de caixa, gestão completa. Resolvemos uma coisa: seu CNPJ não dá problema.", hl: "→ zero distração" },
              { n: "06", label: "HUMANO", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>, title: "Contador humano quando importa", desc: "Quando a regularização precisa de gente, a gente aparece. Consultoria direta com contador responsável, sem robô no meio.", hl: "→ resposta em até 2h" },
            ].map(({ n, label, icon, title, desc, hl }) => (
              <div key={n} className={styles.difCard}>
                <div className={styles.difNum}>{n}<span className={styles.difNumDash} />{label}</div>
                <div className={styles.difIcon}>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="var(--green)" strokeWidth="1.5">{icon}</svg>
                </div>
                <h4>{title}</h4>
                <p>{desc}</p>
                <div className={styles.difCardHighlight}>{hl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className={`${styles.section} ${styles.sectionPaper}`}>
        <div className={styles.sectionInner}>
          <div data-reveal>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDash} />
              <span>03 / Serviços</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Três serviços.<br />
              Um <em>CNPJ</em> tranquilo.
            </h2>
            <p className={styles.sectionLead}>
              Foco extremo. A gente entrega três coisas — e entrega bem. Nada de pacote cheio de feature que você nunca vai usar.
            </p>
          </div>

          <div className={styles.servGrid} data-reveal-stagger>
            {/* Card 1 - Featured */}
            <div className={`${styles.servCard} ${styles.servCardFeatured}`}>
              <div className={styles.servNumber}>SERVIÇO 01 / FLAGSHIP</div>
              <div className={styles.servVisual}>
                <div className={styles.vizDas}>
                  {[20, 45, 35, 70, 55, 85, 95].map((h, i) => (
                    <span key={i} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <h3 className={styles.servTitle}>Emissão de DAS mensal</h3>
              <p className={styles.servDesc}>
                DAS gerado, lembrado e, se quiser, pago automaticamente. Nunca mais um atraso, uma multa, ou um CNPJ pendente por esquecimento.
              </p>
              <div className={styles.servFeatures}>
                {["Geração automática todo mês", "Aviso 5 dias antes do vencimento", "Pagamento via Pix em 1 clique", "Histórico completo de pagamentos"].map((f) => (
                  <div key={f} className={styles.servFeature}>
                    <span className={styles.servFeatureCheck}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div className={styles.servCard}>
              <div className={styles.servNumber}>SERVIÇO 02</div>
              <div className={styles.servVisual}>
                <div className={styles.vizConsult}>
                  <span>consultor online</span>
                </div>
              </div>
              <h3 className={styles.servTitle}>Consultoria contábil humana</h3>
              <p className={styles.servDesc}>
                Dúvida sobre limite, emissão de nota, mudança de atividade? Fala com gente de verdade — contador responsável, sem robô de atendimento.
              </p>
              <div className={styles.servFeatures}>
                {["Atendimento por WhatsApp", "Resposta em até 2h úteis", "Contador técnico responsável", "Linguagem simples, sem jargão"].map((f) => (
                  <div key={f} className={styles.servFeature}>
                    <span className={styles.servFeatureCheck}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 */}
            <div className={styles.servCard}>
              <div className={styles.servNumber}>SERVIÇO 03</div>
              <div className={styles.servVisual}>
                <div className={styles.vizRegu}>
                  {["done","done","warn","done","done","done"].map((s, i) => (
                    <div key={i} className={s === "done" ? styles.vizReguDone : styles.vizReguWarn} />
                  ))}
                </div>
              </div>
              <h3 className={styles.servTitle}>Regularização de pendências</h3>
              <p className={styles.servDesc}>
                CNPJ pendente? DAS em atraso? Declaração esquecida? A gente mapeia tudo, resolve em ordem e te devolve um CNPJ limpo — rápido.
              </p>
              <div className={styles.servFeatures}>
                {["Diagnóstico gratuito em 24h", "Parcelamento de DAS em atraso", "Declarações retroativas", "Acompanhamento até zerar"].map((f) => (
                  <div key={f} className={styles.servFeature}>
                    <span className={styles.servFeatureCheck}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className={styles.depoSection}>
        <div className={`${styles.sectionInner} ${styles.depoInner}`} data-reveal>
          <div className={styles.depoHead}>
            <div>
              <div className={styles.sectionEyebrow}>
                <span className={styles.sectionEyebrowDash} />
                <span>04 / Quem usa</span>
              </div>
              <h2 className={styles.sectionTitle}>
                <em>12 mil</em> CNPJs<br />
                dormindo tranquilos.
              </h2>
            </div>
            <div className={styles.depoHeadRight}>
              Empreendedores de todo o Brasil que trocaram a ansiedade do boleto pelo silêncio do "tá tudo em dia".
            </div>
          </div>
        </div>

        <DepoRow cards={depoRow1} />
        <DepoRow cards={depoRow2} reverse />
      </section>

      {/* FAQ */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.sectionInner}>
          <div data-reveal>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDash} />
              <span>05 / Dúvidas frequentes</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Respostas diretas,<br />
              sem <em>enrolação</em>.
            </h2>
          </div>

          <div className={styles.faqGrid}>
            <div className={styles.faqAside} data-reveal>
              <div className={styles.faqAsideCard}>
                <h4>Não achou sua dúvida aqui?</h4>
                <p>Chama a gente no WhatsApp. Contador responde em até 2h úteis, em português — não em contabilês.</p>
                <Link href="/cadastro" className={`${styles.btn} ${styles.btnGreen}`}>
                  Falar agora <span className={styles.btnArrow}>→</span>
                </Link>
              </div>
            </div>

            <div className={styles.faqList} data-reveal>
              {faqs.map((item, i) => (
                <div key={i} className={`${styles.faqItem} ${faqOpen === i ? styles.faqItemOpen : ""}`}>
                  <button
                    className={styles.faqQ}
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
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

      {/* CTA */}
      <section id="cta" className={styles.ctaSection}>
        <div className={styles.ctaWatermark} aria-hidden>MEIGuia</div>
        <div className={styles.ctaWrap} data-reveal>
          <h2>Seu CNPJ<br />merece <em>dormir</em>.</h2>
          <p>Em menos de 1 minuto a gente começa a cuidar do seu CNPJ. Primeira consulta sem compromisso.</p>
          <div className={styles.ctaActions}>
            <Link href="/cadastro" className={`${styles.btn} ${styles.btnPrimary}`}>
              Começar agora <span className={styles.btnArrow}>→</span>
            </Link>
            <Link href="/login" className={`${styles.btn} ${styles.btnGhost} ${styles.btnGhostLight}`}>
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* WORDMARK */}
      <div className={styles.wordmark}>
        <div className={styles.wordmarkText}>MEI<em>Guia</em>®</div>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.sectionInner}>
          <div className={styles.footGrid}>
            <div className={styles.footBrand}>
              <Link href="/" className={styles.logo} style={{ color: "var(--cream)" }}>
                <span className={styles.logoMark} style={{ background: "var(--cream)" }} />
                MEIGuia
              </Link>
              <p className={styles.footTag}>
                Proteção inteligente do seu CNPJ. Radar ativo, contador humano, zero surpresas.
              </p>
            </div>
            <div className={styles.footCol}>
              <h5>Produto</h5>
              <ul>
                <li><a href="#servicos">Emissão de DAS</a></li>
                <li><a href="#servicos">Consultoria</a></li>
                <li><a href="#servicos">Regularização</a></li>
                <li><a href="#diferenciais">Diferenciais</a></li>
              </ul>
            </div>
            <div className={styles.footCol}>
              <h5>Empresa</h5>
              <ul>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#depoimentos">Clientes</a></li>
                <li><Link href="/landing">Planos</Link></li>
                <li><Link href="/calculadora-mei">Calculadora MEI</Link></li>
              </ul>
            </div>
            <div className={styles.footCol}>
              <h5>Contato</h5>
              <ul>
                <li><a href="https://wa.me/5511999999999">WhatsApp</a></li>
                <li><a href="mailto:suporte@portalmeiguia.com.br">E-mail</a></li>
                <li><Link href="/termos">Termos de Uso</Link></li>
                <li><a href="#">LGPD / Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footBottom}>
            <div>© {new Date().getFullYear()} MEIGuia · Todos os direitos reservados</div>
            <div>CRC ativo · LGPD compliant · Parceiro Sebrae</div>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className={styles.mobileCta}>
        <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`} style={{ flex: 1, justifyContent: "center" }}>Entrar</Link>
        <Link href="/cadastro" className={`${styles.btn} ${styles.btnGreen}`} style={{ flex: 1, justifyContent: "center" }}>Começar grátis</Link>
      </div>
    </div>
  );
}

function DepoRow({ cards, reverse }: { cards: typeof depoRow1; reverse?: boolean }) {
  const doubled = [...cards, ...cards];
  return (
    <div className={`${styles.depoRow} ${reverse ? styles.depoRowReverse : ""}`}>
      {doubled.map((c, i) => (
        <div key={i} className={`${styles.depoCard} ${c.dark ? styles.depoCardDark : ""}`}>
          <div className={styles.depoStars}>★★★★★</div>
          <p className={styles.depoText}>&ldquo;{c.text}&rdquo;</p>
          <div className={styles.depoAuthor}>
            <div
              className={styles.depoAvatar}
              style={{ background: c.bg, color: c.avatarColor ?? "var(--cream)" }}
            >
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
