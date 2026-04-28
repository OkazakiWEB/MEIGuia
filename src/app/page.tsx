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
    const used  = 50_220;
    const pct   = used / total; // ~0.62
    const C     = 534;          // 2π×85

    const t = setTimeout(() => {
      if (fillRef.current) {
        fillRef.current.style.strokeDashoffset = String(C * (1 - pct));
      }
      let n = 0;
      const step = setInterval(() => {
        n = Math.min(n + 2, Math.round(pct * 100));
        if (pctRef.current) pctRef.current.textContent = `${n}%`;
        if (n >= Math.round(pct * 100)) clearInterval(step);
      }, 28);
    }, 400);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.gaugeCard}>
      <div className={styles.gaugeCardHeader}>
        <span className={styles.gaugeCardYear}>Limite 2025</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>

      <div className={styles.gaugeWrap}>
        <svg className={styles.gaugeSvg} viewBox="0 0 200 200" aria-label="62% do limite utilizado">
          <circle cx="100" cy="100" r="85" className={styles.gaugeTrack}/>
          <circle cx="100" cy="100" r="85" ref={fillRef} className={styles.gaugeFill}/>
        </svg>
        <div className={styles.gaugeLabel}>
          <span ref={pctRef} className={styles.gaugePct}>0%</span>
          <span className={styles.gaugeCaption}>utilizado</span>
        </div>
      </div>

      <div className={styles.gaugeAmounts}>
        <div>
          <p className={styles.gaugeAmountMain}>R$ 50.220</p>
          <p className={styles.gaugeAmountSub}>faturado em 2025</p>
        </div>
        <div style={{textAlign:"right"}}>
          <p className={styles.gaugeAmountMain}>R$ 81.000</p>
          <p className={styles.gaugeAmountSub}>limite anual</p>
        </div>
      </div>

      <div className={styles.gaugeStatus}>
        <span className={styles.gaugeStatusIcon}>✓</span>
        Dentro do limite — você pode faturar mais R$ 30.780
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
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="white"/>
          </svg>
        </span>
        <span className={styles.navLogoText}>MEIGuia</span>
      </Link>

      <div className={styles.navLinks}>
        <a href="#funcionalidades">Funcionalidades</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#depoimentos">Depoimentos</a>
        <Link href="/calculadora-mei">Calculadora</Link>
      </div>

      <div className={styles.navCta}>
        <Link href="/login" className={styles.btnGhost}>Entrar</Link>
        <Link href="/cadastro" className={styles.btnPrimary}>Começar grátis</Link>
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
    }, { threshold: 0.12 });
    els.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(28px)";
      (el as HTMLElement).style.transition = "opacity .55s ease, transform .55s ease";
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

/* ─── Icons ─── */
const IcoAlert  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoFolder = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const IcoClock  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoChart  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoShield = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoBell   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoFile   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcoCheck  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>;
const IcoUser   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoStar   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoRocket = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l-.55-.55"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;

/* ─── Page ─── */
export default function HomePage() {
  useReveal();

  return (
    <div className={styles.page}>
      <Nav />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroLeft} data-reveal>
          <div className={styles.heroBadge}>
            <span>✦</span> Gestão financeira para MEI
          </div>

          <h1 className={styles.heroH1}>
            Seu MEI sob controle.<br />
            <em>Sem</em> surpresas.
          </h1>

          <p className={styles.heroSub}>
            Monitore seu limite de faturamento, emita notas fiscais e receba
            alertas antes de ultrapassar o teto do MEI — tudo em minutos por dia.
          </p>

          <div className={styles.heroActions}>
            <Link href="/cadastro" className={styles.btnPrimaryLg}>
              Começar grátis
              <span className={styles.btnArrow}>→</span>
            </Link>
            <Link href="/landing" className={styles.btnOutlineLg}>
              Ver como funciona
            </Link>
          </div>

          <p className={styles.heroDisclaimer}>
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>

        <div className={styles.heroRight} data-reveal>
          <GaugeCard />
        </div>
      </section>

      {/* PROBLEMA */}
      <section className={styles.sectionAlt} id="problema">
        <div className={styles.inner}>
          <p className={styles.eyebrow} data-reveal>O problema</p>
          <h2 className={styles.sectionH2} data-reveal>
            Gerir um MEI não deveria ser tão complicado
          </h2>

          <div className={styles.problemaGrid}>
            {[
              { icon: <IcoAlert />,  title: "Estouro do limite",        desc: "Ultrapassar R$ 81.000 sem perceber pode tirar sua condição de MEI e gerar dívidas com o fisco." },
              { icon: <IcoFolder />, title: "Desorganização financeira", desc: "Receitas e despesas misturadas em cadernos e planilhas — sem visão clara do que entra e sai." },
              { icon: <IcoClock />,  title: "Burocracia e tempo perdido",desc: "Declarações, notas fiscais e obrigações mensais tomam horas que deveriam ser dedicadas ao negócio." },
            ].map((c, i) => (
              <div key={i} className={styles.problemaCard} data-reveal>
                <div className={styles.problemaIconWrap}>{c.icon}</div>
                <h3 className={styles.problemaTitle}>{c.title}</h3>
                <p className={styles.problemaDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className={styles.section} id="funcionalidades">
        <div className={styles.inner}>
          <p className={styles.eyebrow} data-reveal>A solução</p>
          <h2 className={styles.sectionH2} data-reveal>
            Tudo que o MEI precisa em um só lugar
          </h2>

          <div className={styles.solucaoGrid}>
            {[
              { icon: <IcoChart />,  title: "Controle de limite",    desc: "Gauge visual do seu faturamento em tempo real. Saiba exatamente quanto ainda pode faturar." },
              { icon: <IcoBell />,   title: "Alertas inteligentes",   desc: "Notificações por e-mail quando você se aproxima do limite ou tem obrigações pendentes." },
              { icon: <IcoFile />,   title: "Notas fiscais fáceis",   desc: "Emita e gerencie suas NFS-e sem precisar acessar o portal da prefeitura." },
              { icon: <IcoShield />, title: "Conformidade garantida", desc: "Acompanhe suas obrigações fiscais mensais e anuais sem esquecer nenhum prazo." },
              { icon: <IcoCheck />,  title: "Relatórios prontos",     desc: "Relatórios mensais e anuais para compartilhar com seu contador em um clique." },
            ].map((c, i) => (
              <div key={i} className={styles.solucaoCard} data-reveal>
                <div className={styles.solucaoIconWrap}>{c.icon}</div>
                <h3 className={styles.solucaoCardTitle}>{c.title}</h3>
                <p className={styles.solucaoCardDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className={styles.sectionAlt} id="como-funciona">
        <div className={styles.inner}>
          <p className={styles.eyebrow} data-reveal style={{textAlign:"center"}}>Como funciona</p>
          <h2 className={styles.sectionH2Center} data-reveal>
            Comece em menos de 5 minutos
          </h2>

          <div className={styles.passosWrap}>
            {[
              { icon: <IcoUser />,  title: "Crie sua conta",   desc: "Cadastro rápido com e-mail ou Google. Nenhuma informação de cartão necessária." },
              { icon: <IcoChart />, title: "Conecte seu CNPJ", desc: "Informe seu CNPJ e o MEIGuia importa seus dados fiscais automaticamente." },
              { icon: <IcoBell />,  title: "Receba alertas",   desc: "Configure seus limites e notificações. Pronto — seu MEI está sendo monitorado." },
            ].map((c, i) => (
              <div key={i} className={styles.passoItem} data-reveal>
                <div className={styles.passoNumCircle}>{i + 1}</div>
                <div className={styles.passoIconWrap}>{c.icon}</div>
                <h3 className={styles.passoTitle}>{c.title}</h3>
                <p className={styles.passoDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className={styles.section} id="depoimentos">
        <div className={styles.inner}>
          <p className={styles.eyebrow} data-reveal style={{textAlign:"center"}}>Depoimentos</p>
          <h2 className={styles.sectionH2Center} data-reveal>
            MEIs que pararam de se preocupar
          </h2>

          <div className={styles.depoGrid}>
            {[
              { name: "Ana Carvalho",  role: "Designer freelancer", text: "Finalmente sei exatamente quanto posso faturar sem medo de estouro. O gauge é simples e direto ao ponto.", initials: "AC" },
              { name: "Carlos Mendes", role: "Consultor de TI",     text: "Recebi um alerta quando estava chegando a 80% do limite. Me poupou de uma dor de cabeça enorme com a Receita.", initials: "CM" },
              { name: "Patrícia Lima", role: "Fotógrafa",            text: "Meu contador adora os relatórios que envio. Economizo tempo e dinheiro todo mês.", initials: "PL" },
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
              { icon: <IcoUser />,   num: "500+",    label: "MEIs protegidos" },
              { icon: <IcoBell />,   num: "2.000+",  label: "Alertas enviados" },
              { icon: <IcoShield />, num: "R$ 20M+", label: "Faturamento monitorado" },
            ].map((s, i) => (
              <div key={i} className={styles.statCell}>
                <div className={styles.statCellIconWrap}>{s.icon}</div>
                <p className={styles.statCellNum}>{s.num}</p>
                <p className={styles.statCellLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.ctaBanner} data-reveal>
            <div className={styles.ctaBannerLeft}>
              <div className={styles.ctaBannerIconWrap}><IcoRocket /></div>
              <div>
                <h2 className={styles.ctaBannerTitle}>Pronto para ter seu MEI sob controle?</h2>
                <p className={styles.ctaBannerSub}>
                  Junte-se a mais de 500 MEIs que não se preocupam mais com limite.
                </p>
              </div>
            </div>
            <div className={styles.ctaBannerRight}>
              <Link href="/cadastro" className={styles.btnPrimaryLg}>
                Criar conta grátis
                <span className={styles.btnArrow}>→</span>
              </Link>
              <p className={styles.ctaBannerNote}>Sem cartão · Plano gratuito disponível</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" className={styles.footerLogo}>
            <span className={styles.footerLogoMark}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z" fill="white"/>
              </svg>
            </span>
            <span className={styles.footerLogoText}>MEIGuia</span>
          </Link>

          <nav className={styles.footerLinks} aria-label="Footer">
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

      {/* MOBILE STICKY CTA */}
      <div className={styles.mobileCta}>
        <Link href="/cadastro" className={styles.btnPrimaryLg} style={{width:"100%", justifyContent:"center"}}>
          Começar grátis
        </Link>
      </div>
    </div>
  );
}
