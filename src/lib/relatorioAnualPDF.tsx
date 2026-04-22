import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

// ── Tipos ────────────────────────────────────────────────────────────────────
export interface NotaPDF {
  data: string;
  descricao: string | null;
  cliente: string | null;
  numero_nf: string | null;
  valor: number;
}

export interface RelatorioData {
  nomeUsuario: string;
  email: string;
  ano: number;
  geradoEm: string;      // "20 de abril de 2025 às 14:32"
  totalAno: number;
  limiteAnual: number;   // 81000
  percentualUsado: number;
  notas: NotaPDF[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

function fmtBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 2,
  }).format(v);
}

function fmtDataLonga(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function getStatusLimite(pct: number): { texto: string; cor: string } {
  if (pct >= 100) return { texto: "LIMITE ULTRAPASSADO",    cor: "#DC2626" };
  if (pct >= 90)  return { texto: "ATENÇÃO — MUITO PRÓXIMO", cor: "#EA580C" };
  if (pct >= 70)  return { texto: "ATENÇÃO — ACIMA DE 70%",  cor: "#D97706" };
  return              { texto: "DENTRO DO LIMITE",           cor: "#059669" };
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const C = {
  petroleo:  "#1A6B8A",
  petroleo2: "#155A75",
  agua:      "#38BDF8",
  gray900:   "#111827",
  gray700:   "#374151",
  gray500:   "#6B7280",
  gray300:   "#D1D5DB",
  gray100:   "#F3F4F6",
  white:     "#FFFFFF",
  green:     "#059669",
  red:       "#DC2626",
  orange:    "#EA580C",
  amber:     "#D97706",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.white,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },

  // ── Capa ──
  coverBg: {
    backgroundColor: C.petroleo,
    paddingHorizontal: 48,
    paddingTop: 52,
    paddingBottom: 44,
  },
  coverEyebrow: {
    fontSize: 8,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  coverLogo: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    marginBottom: 2,
  },
  coverLogoSub: {
    fontSize: 28,
    fontFamily: "Helvetica",
    color: "rgba(255,255,255,0.55)",
  },
  coverDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    marginVertical: 24,
  },
  coverTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    marginBottom: 6,
  },
  coverSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.5,
  },
  coverMeta: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    marginTop: 28,
  },

  // ── Layout geral ──
  body: {
    paddingHorizontal: 48,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.petroleo,
    marginTop: 28,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: C.petroleo,
  },
  paragraph: {
    fontSize: 9.5,
    color: C.gray700,
    lineHeight: 1.6,
    marginBottom: 6,
  },

  // ── Cards de resumo ──
  cardRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: C.gray100,
    borderRadius: 6,
    padding: 12,
  },
  cardLabel: {
    fontSize: 8,
    color: C.gray500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: C.gray900,
  },
  cardSub: {
    fontSize: 8,
    color: C.gray500,
    marginTop: 2,
  },

  // ── Barra de progresso ──
  barBg: {
    height: 10,
    backgroundColor: C.gray300,
    borderRadius: 5,
    marginBottom: 6,
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
  barRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  barLabel: {
    fontSize: 9,
    color: C.gray700,
    fontFamily: "Helvetica-Bold",
  },
  barSub: {
    fontSize: 9,
    color: C.gray500,
  },

  // ── Badge de status ──
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },

  // ── Tabela mensal ──
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.petroleo,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.gray300,
  },
  tableRowAlt: {
    backgroundColor: C.gray100,
  },
  thMes:   { flex: 2.5, fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  thQtd:   { flex: 1,   fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, textAlign: "center" },
  thTotal: { flex: 2,   fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, textAlign: "right" },
  thAcum:  { flex: 2,   fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, textAlign: "right" },
  tdMes:   { flex: 2.5, fontSize: 9, color: C.gray700 },
  tdQtd:   { flex: 1,   fontSize: 9, color: C.gray500, textAlign: "center" },
  tdTotal: { flex: 2,   fontSize: 9, color: C.gray900, fontFamily: "Helvetica-Bold", textAlign: "right" },
  tdAcum:  { flex: 2,   fontSize: 9, color: C.gray500, textAlign: "right" },

  // ── Tabela de notas ──
  nfHeader: {
    flexDirection: "row",
    backgroundColor: C.gray900,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  nfRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.gray300,
  },
  thData:    { width: 42,  fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  thDesc:    { flex: 3,    fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  thCliente: { flex: 2,    fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  thNF:      { width: 44,  fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, textAlign: "center" },
  thValor:   { width: 60,  fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white, textAlign: "right" },
  tdData:    { width: 42,  fontSize: 8, color: C.gray500 },
  tdDesc:    { flex: 3,    fontSize: 8, color: C.gray700 },
  tdCliente: { flex: 2,    fontSize: 8, color: C.gray500 },
  tdNF:      { width: 44,  fontSize: 8, color: C.gray500, textAlign: "center" },
  tdValor:   { width: 60,  fontSize: 9, fontFamily: "Helvetica-Bold", color: C.gray900, textAlign: "right" },

  // ── Rodapé ──
  footer: {
    position: "absolute",
    bottom: 18,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.gray300,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: C.gray500,
  },

  // ── Aviso contador ──
  avisoBox: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3,
    borderLeftColor: C.petroleo,
    borderRadius: 4,
    padding: 10,
    marginTop: 10,
  },
  avisoTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.petroleo,
    marginBottom: 3,
  },
  avisoText: {
    fontSize: 8.5,
    color: C.gray700,
    lineHeight: 1.5,
  },
});

// ── Componente do documento ──────────────────────────────────────────────────
export function RelatorioAnualPDF({ d }: { d: RelatorioData }) {
  const { nomeUsuario, email, ano, geradoEm, totalAno, limiteAnual, percentualUsado, notas } = d;

  // Excluir nota de estimativa do onboarding da listagem
  const notasReais = notas.filter(n => n.descricao !== "Faturamento acumulado antes do cadastro");
  const restante   = Math.max(limiteAnual - totalAno, 0);
  const status     = getStatusLimite(percentualUsado);
  const pctW       = `${Math.min(percentualUsado, 100).toFixed(1)}%`;
  const barCor     = percentualUsado >= 100 ? C.red : percentualUsado >= 90 ? C.orange : percentualUsado >= 70 ? C.amber : C.green;

  // ── Agrupamento mensal ────────────────────────────────────────────────────
  const porMes = MESES.map((mes, idx) => {
    const mesStr = String(idx + 1).padStart(2, "0");
    const notasMes = notasReais.filter(n => n.data.startsWith(`${ano}-${mesStr}`));
    return {
      mes,
      qtd: notasMes.length,
      total: notasMes.reduce((s, n) => s + n.valor, 0),
    };
  });

  let acumulado = 0;
  const porMesComAcum = porMes.map(m => {
    acumulado += m.total;
    return { ...m, acumulado };
  });

  const mesesComMovimento = porMesComAcum.filter(m => m.qtd > 0);
  const melhorMes = [...porMes].sort((a, b) => b.total - a.total)[0];
  const mediaMensal = mesesComMovimento.length
    ? totalAno / mesesComMovimento.length
    : 0;

  // ── Divisão da lista de notas em páginas de ~35 itens ────────────────────
  const NOTAS_POR_PAGINA = 35;
  const paginasNotas: NotaPDF[][] = [];
  for (let i = 0; i < notasReais.length; i += NOTAS_POR_PAGINA) {
    paginasNotas.push(notasReais.slice(i, i + NOTAS_POR_PAGINA));
  }

  const Footer = ({ pagina, total }: { pagina: number; total: number }) => (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Portal MEIguia · Resumo Anual {ano} · {nomeUsuario}</Text>
      <Text style={s.footerText}>Página {pagina} de {total} · Gerado em {geradoEm}</Text>
    </View>
  );

  const totalPaginas = 2 + paginasNotas.length;

  return (
    <Document
      title={`Resumo MEI ${ano} — ${nomeUsuario}`}
      author="Portal MEIguia"
      subject={`Relatório anual de faturamento MEI ${ano}`}
      creator="Portal MEIguia"
    >

      {/* ══════════════════════════════════════════════════════════════
          PÁGINA 1 — CAPA + RESUMO EXECUTIVO
      ══════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>

        {/* Capa */}
        <View style={s.coverBg}>
          <Text style={s.coverEyebrow}>Portal</Text>
          <Text style={s.coverLogo}>
            MEI<Text style={s.coverLogoSub}>guia</Text>
          </Text>
          <View style={s.coverDivider} />
          <Text style={s.coverTitle}>Resumo Anual MEI {ano}</Text>
          <Text style={s.coverSub}>
            Relatório de faturamento gerado automaticamente{"\n"}
            para conferência e entrega ao contador responsável.
          </Text>
          <Text style={s.coverMeta}>
            Titular: {nomeUsuario} · {email}{"\n"}
            Gerado em: {geradoEm}
          </Text>
        </View>

        <View style={s.body}>

          {/* Resumo executivo */}
          <Text style={s.sectionTitle}>Resumo executivo</Text>

          {/* Badge de status */}
          <View style={[s.statusBadge, { backgroundColor: `${barCor}15` }]}>
            <Text style={[s.statusText, { color: barCor }]}>{status.texto}</Text>
          </View>

          {/* Cards de métricas */}
          <View style={s.cardRow}>
            <View style={s.card}>
              <Text style={s.cardLabel}>Total faturado em {ano}</Text>
              <Text style={[s.cardValue, { color: C.petroleo }]}>{fmtBRL(totalAno)}</Text>
              <Text style={s.cardSub}>{percentualUsado.toFixed(1)}% do limite anual</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardLabel}>Limite MEI {ano}</Text>
              <Text style={s.cardValue}>{fmtBRL(limiteAnual)}</Text>
              <Text style={s.cardSub}>Limite legal vigente</Text>
            </View>
          </View>

          <View style={s.cardRow}>
            <View style={s.card}>
              <Text style={s.cardLabel}>Saldo disponível</Text>
              <Text style={[s.cardValue, { color: restante > 0 ? C.green : C.red }]}>{fmtBRL(restante)}</Text>
              <Text style={s.cardSub}>{restante > 0 ? "Pode ser faturado ainda" : "Limite esgotado"}</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardLabel}>Total de notas emitidas</Text>
              <Text style={s.cardValue}>{notasReais.length}</Text>
              <Text style={s.cardSub}>Em {mesesComMovimento.length} meses com faturamento</Text>
            </View>
          </View>

          <View style={s.cardRow}>
            <View style={s.card}>
              <Text style={s.cardLabel}>Média mensal (meses ativos)</Text>
              <Text style={s.cardValue}>{fmtBRL(mediaMensal)}</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardLabel}>Melhor mês</Text>
              <Text style={s.cardValue}>{fmtBRL(melhorMes.total)}</Text>
              <Text style={s.cardSub}>{melhorMes.mes}</Text>
            </View>
          </View>

          {/* Barra de progresso */}
          <View style={s.barBg}>
            <View style={[s.barFill, { width: pctW, backgroundColor: barCor }]} />
          </View>
          <View style={s.barRow}>
            <Text style={s.barLabel}>{percentualUsado.toFixed(1)}% utilizado</Text>
            <Text style={s.barSub}>Restam {fmtBRL(restante)}</Text>
          </View>

          {/* Aviso para contador */}
          <View style={s.avisoBox}>
            <Text style={s.avisoTitle}>Para o contador</Text>
            <Text style={s.avisoText}>
              Este relatório foi gerado automaticamente pelo Portal MEIguia com base nas notas registradas
              pelo titular. Os valores devem ser conferidos com as notas fiscais emitidas no portal da
              prefeitura. Em caso de divergência, prevalece o documento fiscal oficial.
            </Text>
          </View>

        </View>

        <Footer pagina={1} total={totalPaginas} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════
          PÁGINA 2 — FATURAMENTO MENSAL
      ══════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.body}>

          <Text style={s.sectionTitle}>Faturamento por mês — {ano}</Text>

          {/* Tabela mensal */}
          <View style={s.tableHeader}>
            <Text style={s.thMes}>Mês</Text>
            <Text style={s.thQtd}>Notas</Text>
            <Text style={s.thTotal}>Faturado no mês</Text>
            <Text style={s.thAcum}>Acumulado</Text>
          </View>
          {porMesComAcum.map((m, i) => (
            <View key={m.mes} style={[s.tableRow, i % 2 === 0 ? s.tableRowAlt : {}]}>
              <Text style={s.tdMes}>{m.mes}</Text>
              <Text style={s.tdQtd}>{m.qtd > 0 ? m.qtd : "—"}</Text>
              <Text style={[s.tdTotal, { color: m.total > 0 ? C.gray900 : C.gray300 }]}>
                {m.total > 0 ? fmtBRL(m.total) : "—"}
              </Text>
              <Text style={s.tdAcum}>{m.acumulado > 0 ? fmtBRL(m.acumulado) : "—"}</Text>
            </View>
          ))}

          {/* Linha de total */}
          <View style={[s.tableRow, { backgroundColor: C.petroleo, borderBottomWidth: 0, borderRadius: 4, marginTop: 4 }]}>
            <Text style={[s.tdMes, { fontFamily: "Helvetica-Bold", color: C.white }]}>TOTAL {ano}</Text>
            <Text style={[s.tdQtd, { fontFamily: "Helvetica-Bold", color: C.white }]}>{notasReais.length}</Text>
            <Text style={[s.tdTotal, { color: C.white }]}>{fmtBRL(totalAno)}</Text>
            <Text style={[s.tdAcum, { color: "rgba(255,255,255,0.6)" }]}>—</Text>
          </View>

          {/* Observações */}
          <Text style={[s.sectionTitle, { marginTop: 28 }]}>Observações</Text>
          <Text style={s.paragraph}>
            • O faturamento acima refere-se exclusivamente às notas registradas no Portal MEIguia pelo titular.
          </Text>
          <Text style={s.paragraph}>
            • Notas emitidas fora da plataforma podem não estar refletidas neste relatório.
          </Text>
          <Text style={s.paragraph}>
            • O limite de R$ {limiteAnual.toLocaleString("pt-BR")} é o teto anual estabelecido para o MEI.
            Ultrapassá-lo implica em desenquadramento automático pela Receita Federal.
          </Text>
          {percentualUsado >= 80 && (
            <Text style={[s.paragraph, { color: C.orange, fontFamily: "Helvetica-Bold" }]}>
              Atencao: o titular atingiu {percentualUsado.toFixed(0)}% do limite anual.
              Recomenda-se analise da viabilidade de continuidade como MEI.
            </Text>
          )}

        </View>

        <Footer pagina={2} total={totalPaginas} />
      </Page>

      {/* ══════════════════════════════════════════════════════════════
          PÁGINAS 3+ — LISTA DE NOTAS
      ══════════════════════════════════════════════════════════════ */}
      {paginasNotas.map((pagina, pi) => (
        <Page key={pi} size="A4" style={s.page}>
          <View style={s.body}>

            <Text style={s.sectionTitle}>
              Lista de notas emitidas — {ano}
              {paginasNotas.length > 1 ? `  (parte ${pi + 1} de ${paginasNotas.length})` : ""}
            </Text>

            <View style={s.nfHeader}>
              <Text style={s.thData}>Data</Text>
              <Text style={s.thDesc}>Descrição / Serviço</Text>
              <Text style={s.thCliente}>Cliente</Text>
              <Text style={s.thNF}>Nº NF</Text>
              <Text style={s.thValor}>Valor</Text>
            </View>

            {pagina.map((nota, i) => (
              <View key={i} style={[s.nfRow, i % 2 === 0 ? { backgroundColor: C.gray100 } : {}]}>
                <Text style={s.tdData}>{fmtDataLonga(nota.data)}</Text>
                <Text style={s.tdDesc}>{nota.descricao || "—"}</Text>
                <Text style={s.tdCliente}>{nota.cliente || "—"}</Text>
                <Text style={s.tdNF}>{nota.numero_nf || "—"}</Text>
                <Text style={s.tdValor}>{fmtBRL(nota.valor)}</Text>
              </View>
            ))}

            {/* Total na última página de notas */}
            {pi === paginasNotas.length - 1 && (
              <View style={[s.nfRow, { backgroundColor: C.gray900, borderRadius: 4, marginTop: 4, borderBottomWidth: 0 }]}>
                <Text style={[s.tdData, { color: C.white, fontFamily: "Helvetica-Bold" }]}>TOTAL</Text>
                <Text style={[s.tdDesc, { color: "transparent" }]}>—</Text>
                <Text style={[s.tdCliente, { color: "transparent" }]}>—</Text>
                <Text style={[s.tdNF, { color: "transparent" }]}>—</Text>
                <Text style={[s.tdValor, { color: C.white }]}>{fmtBRL(totalAno)}</Text>
              </View>
            )}

          </View>

          <Footer pagina={3 + pi} total={totalPaginas} />
        </Page>
      ))}

    </Document>
  );
}
