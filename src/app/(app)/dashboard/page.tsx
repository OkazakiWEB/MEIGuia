import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FaturamentoProgress } from "@/components/ui/FaturamentoProgress";
import { AlertaBanner } from "@/components/ui/AlertaBanner";
import { EstimativaCard } from "@/components/ui/EstimativaCard";
import { GraficoMensalLazy as GraficoMensal } from "@/components/charts/GraficoMensalLazy";
import { ProGate } from "@/components/ui/ProGate";
import Link from "next/link";
import {
  formatCurrency, calcPercentual, calcPrevisaoAnual, calcSugestaoMensal,
} from "@/lib/utils";
import { TrendingUp, FileText, Calendar, Plus, Sparkles, AlertTriangle } from "lucide-react";
import { NotasUsageBar } from "@/components/ui/NotasUsageBar";
import type { NotaFiscal } from "@/types/database";
import { LIMITE_MEI } from "@/lib/constants";

const DESCRICAO_ESTIMATIVA = "Faturamento acumulado antes do cadastro";

// Nomes abreviados dos meses em pt-BR
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const anoAtual = new Date().getFullYear();

  // Buscar perfil, total anual via RPC, notas do ano (para gráfico + recentes) e contagem do mês — em paralelo
  const [
    { data: profile },
    { data: totalAnoRpc },
    { data: notas },
    { data: notasMesCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    // RPC calcula o total no banco — mais eficiente que buscar todas as rows e fazer .reduce()
    supabase.rpc("get_faturamento_anual", { p_user_id: user.id }),
    supabase
      .from("notas_fiscais")
      .select("*")
      .eq("user_id", user.id)
      .gte("data", `${anoAtual}-01-01`)
      .lte("data", `${anoAtual}-12-31`)
      .order("data", { ascending: false }),
    supabase.rpc("get_notas_mes_atual", { p_user_id: user.id }),
  ]);

  const plano = profile?.plano ?? "free";
  const isPro = plano === "pro" || plano === "premium";
  const isPremium = plano === "premium";

  // Total anual vem do RPC; fallback para .reduce() se a RPC falhar
  const totalAno = totalAnoRpc != null
    ? Number(totalAnoRpc)
    : (notas || []).reduce((sum, n) => sum + Number(n.valor), 0);

  const percentual = calcPercentual(totalAno);

  // Separar nota de estimativa (onboarding) das notas reais
  const notaEstimativa = (notas || []).find((n) => n.descricao === DESCRICAO_ESTIMATIVA);
  const totalEstimativa = notaEstimativa ? Number(notaEstimativa.valor) : 0;
  const notasReaisLista = (notas || []).filter((n) => n.descricao !== DESCRICAO_ESTIMATIVA);
  const totalNotasReais = notasReaisLista.reduce((sum, n) => sum + Number(n.valor), 0);
  // Mostrar card de breakdown se há estimativa do onboarding
  const temEstimativa = totalEstimativa > 0;

  // Total e contagem do mês atual (apenas notas reais — exclui estimativa)
  const mesAtual = new Date().getMonth();
  const notasMes = notasReaisLista.filter((n) => {
    const m = new Date(n.data + "T00:00:00").getMonth();
    return m === mesAtual;
  });
  const totalMes = notasMes.reduce((sum, n) => sum + Number(n.valor), 0);

  // Dados mensais para o gráfico
  const dadosMensais = MESES.map((mes, idx) => ({
    mes,
    valor: (notas || [])
      .filter((n) => new Date(n.data + "T00:00:00").getMonth() === idx)
      .reduce((sum, n) => sum + Number(n.valor), 0),
  }));

  // Previsões (apenas Pro, e apenas quando há faturamento real)
  const previsaoAnual = calcPrevisaoAnual(totalAno);
  const sugestaoMensal = calcSugestaoMensal(totalAno);
  const mostrarPrevisoes = isPro && totalNotasReais > 0;

  const qtdNotasMes = notasMesCount ?? 0;

  // Previsão de estouro (disponível para todos os usuários)
  const mesesDecorridos = new Date().getMonth() + 1; // 1–12
  const mediaMensal = mesesDecorridos > 0 ? totalAno / mesesDecorridos : 0;
  const previsaoAnualTodos = mediaMensal * 12;
  const mesesParaEstouro = mediaMensal > 0 ? Math.ceil((LIMITE_MEI - totalAno) / mediaMensal) : null;
  const mesEstouro = mesesParaEstouro != null && mesesParaEstouro > 0
    ? new Date(new Date().getFullYear(), new Date().getMonth() + mesesParaEstouro, 1)
        .toLocaleDateString("pt-BR", { month: "long" })
    : null;
  // Mostrar alerta de estouro quando projeção > 85% do limite e há ao menos 2 meses de dados
  const mostrarAlertaEstouro =
    totalNotasReais > 0 &&
    mesesDecorridos >= 2 &&
    previsaoAnualTodos > LIMITE_MEI * 0.85 &&
    totalAno < LIMITE_MEI;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Cabeçalho ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ano fiscal {anoAtual} • {new Date().toLocaleDateString("pt-BR", { month: "long" })}
          </p>
        </div>
        <Link href="/notas/nova" className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova nota</span>
        </Link>
      </div>

      {/* ── Alerta de faturamento ── */}
      <AlertaBanner totalFaturado={totalAno} percentual={percentual} />

      {/* ── Card principal: progresso ── */}
      <div className="card">
        <FaturamentoProgress totalFaturado={totalAno} />
      </div>

      {/* ── Disclaimer de responsabilidade ── */}
      <p className="text-xs text-gray-400 -mt-2 px-1">
        Os valores exibidos refletem apenas as notas registradas aqui. Cadastre todas as notas recebidas para manter o controle correto.
      </p>

      {/* ── Breakdown estimativa vs notas reais ── */}
      {temEstimativa && (
        <EstimativaCard
          estimativa={totalEstimativa}
          notasReais={totalNotasReais}
          total={totalAno}
        />
      )}

      {/* ── Cards de métricas ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Notas registradas"
          value={String(notasReaisLista.length)}
          sublabel={!isPro ? `${qtdNotasMes}/10 este mês` : undefined}
          icon={<FileText className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          label="Registrado este mês"
          value={totalMes > 0 ? formatCurrency(totalMes) : "—"}
          sublabel={totalMes === 0 ? "Nenhuma nota este mês" : undefined}
          icon={<Calendar className="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          label="Total no ano"
          value={formatCurrency(totalAno)}
          sublabel={temEstimativa ? "inclui estimativa" : undefined}
          icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
        />
        <MetricCard
          label="Disponível"
          value={formatCurrency(Math.max(LIMITE_MEI - totalAno, 0))}
          icon={<span className="text-xl">💰</span>}
        />
      </div>

      {/* ── Alerta de previsão de estouro (todos os usuários) ── */}
      {mostrarAlertaEstouro && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-800">
                No seu ritmo atual, você vai ultrapassar o limite MEI
                {mesEstouro ? ` em ${mesEstouro}` : " ainda este ano"}!
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Projeção anual:{" "}
                <span className="font-bold">{formatCurrency(previsaoAnualTodos)}</span>
                {" "}— limite MEI: {formatCurrency(LIMITE_MEI)}.{" "}
                {isPro
                  ? `Reduza para no máximo ${formatCurrency(calcSugestaoMensal(totalAno))}/mês para não estourar.`
                  : "Assine o Pro para ver quanto pode faturar por mês com segurança."}
              </p>
              {!isPro && (
                <a
                  href="/assinatura"
                  className="inline-block mt-2 text-xs font-semibold text-orange-800 underline hover:text-orange-900"
                >
                  Ver plano Pro →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Contador de notas (free e pro têm limite) ── */}
      {!isPremium && (
        <NotasUsageBar
          used={qtdNotasMes}
          limit={plano === "pro" ? 30 : 5}
          plano={plano}
        />
      )}

      {/* ── Empty state: usuário sem notas reais ── */}
      {totalNotasReais === 0 && !temEstimativa && (
        <div className="card border-dashed border-2 border-gray-200 bg-gray-50/50">
          <div className="text-center py-6 sm:py-10">
            <p className="text-4xl mb-3">📋</p>
            <h2 className="font-semibold text-gray-700 mb-1">Nenhuma nota registrada ainda</h2>
            <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
              Registre sua primeira nota e comece a controlar seu faturamento em tempo real.
            </p>
            <Link href="/notas/nova" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Registrar primeira nota
            </Link>
          </div>

          {/* Próximos passos guiados */}
          <div className="border-t border-dashed border-gray-200 pt-5 mt-2 space-y-2">
            <p className="text-xs text-center text-gray-400 mb-3 font-medium uppercase tracking-wide">
              O que você pode fazer agora
            </p>
            {[
              { icon: "📝", text: "Registre um serviço que você prestou recentemente" },
              { icon: "📅", text: "Adicione serviços dos últimos meses para ter o histórico completo" },
              { icon: "🔔", text: "O sistema avisa automaticamente quando você se aproximar do limite" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 text-left">
                <span className="text-base">{item.icon}</span>
                <p className="text-xs text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Gráfico mensal ── */}
      {totalNotasReais > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Faturamento mensal</h2>
          <GraficoMensal
            data={dadosMensais}
            limiteSeguro={isPro ? sugestaoMensal : undefined}
          />
        </div>
      )}

      {/* ── Card de valor Pro para free users com pouco uso (sem ProGate ainda) ── */}
      {plano === "free" && totalNotasReais > 0 && totalNotasReais < 3 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-800">
              Sabia que você pode configurar alertas automáticos de limite?
            </p>
            <p className="text-xs text-brand-700 mt-1">
              Com o Pro, você recebe aviso antes de ultrapassar R$&nbsp;81.000 e vê em tempo real quanto ainda pode faturar no ano.
            </p>
            <a href="/assinatura" className="inline-block mt-2 text-xs font-semibold text-brand-700 underline hover:text-brand-900">
              Conhecer o Pro →
            </a>
          </div>
        </div>
      )}

      {/* ── Previsões Pro — ocultas se não Pro ou se totalAno = 0 ── */}
      {mostrarPrevisoes ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card border-brand-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Previsão anual (baseada na média)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(previsaoAnual)}</p>
                {previsaoAnual > LIMITE_MEI && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                    ⚠️ Risco de ultrapassar o limite!
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="card border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sugestão para os próximos meses</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(sugestaoMensal)}/mês</p>
                <p className="text-xs text-gray-500 mt-1">Para não ultrapassar o limite anual</p>
              </div>
            </div>
          </div>
        </div>
      ) : !isPro && totalNotasReais > 0 ? (
        // Teaser do ProGate apenas quando há dados para mostrar
        <ProGate feature="Previsão de Faturamento" isPro={false}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card border-brand-100 opacity-60">
              <p className="text-sm text-gray-500">Previsão anual</p>
              <p className="text-2xl font-bold text-gray-300">R$ ——</p>
            </div>
            <div className="card border-green-100 opacity-60">
              <p className="text-sm text-gray-500">Sugestão mensal</p>
              <p className="text-2xl font-bold text-gray-300">R$ ——/mês</p>
            </div>
          </div>
        </ProGate>
      ) : null}

      {/* ── Histórico: últimas notas reais ── */}
      <RecentNotes notas={notasReaisLista.slice(0, 5)} />
    </div>
  );
}

// ── Sub-componente de métricas ──────────────────────────────────────────────
function MetricCard({ label, value, sublabel, icon }: {
  label: string; value: string; sublabel?: string; icon: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
        <div className="flex-shrink-0 ml-1">{icon}</div>
      </div>
      <p className="text-sm sm:text-xl font-bold text-gray-900 leading-tight">{value}</p>
      {sublabel && <p className="text-xs text-amber-600 mt-1">{sublabel}</p>}
    </div>
  );
}

// ── Sub-componente de notas recentes ────────────────────────────────────────
function RecentNotes({ notas }: { notas: NotaFiscal[] }) {
  if (!notas.length) return null;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Últimas notas emitidas</h2>
        <Link href="/notas" className="text-sm text-brand-600 hover:underline">
          Ver todas →
        </Link>
      </div>
      <div className="space-y-2">
        {notas.map((nota) => (
          <div key={nota.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="min-w-0 mr-4">
              <p className="text-sm font-medium text-gray-900 truncate">{nota.descricao || "Sem descrição"}</p>
              <p className="text-xs text-gray-400">
                {nota.cliente && `${nota.cliente} • `}
                {new Date(nota.data + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap flex-shrink-0">
              {formatCurrency(Number(nota.valor))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
