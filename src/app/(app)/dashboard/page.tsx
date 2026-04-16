import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FaturamentoProgress } from "@/components/ui/FaturamentoProgress";
import { AlertaBanner } from "@/components/ui/AlertaBanner";
import { GraficoMensalLazy as GraficoMensal } from "@/components/charts/GraficoMensalLazy";
import { ProGate } from "@/components/ui/ProGate";
import Link from "next/link";
import {
  formatCurrency, calcPercentual, calcPrevisaoAnual, calcSugestaoMensal,
} from "@/lib/utils";
import { TrendingUp, FileText, Calendar, Plus, Sparkles } from "lucide-react";
import type { NotaFiscal } from "@/types/database";

// Nomes abreviados dos meses em pt-BR
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Buscar perfil, notas do ano e contagem do mês em paralelo
  const anoAtual = new Date().getFullYear();
  const [{ data: profile }, { data: notas }, { data: notasMesCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("notas_fiscais")
      .select("*")
      .eq("user_id", user.id)
      .gte("data", `${anoAtual}-01-01`)
      .lte("data", `${anoAtual}-12-31`)
      .order("data", { ascending: false }),
    supabase.rpc("get_notas_mes_atual", { p_user_id: user.id }),
  ]);

  const isPro = profile?.plano === "pro";

  // Calcular totais
  const totalAno = (notas || []).reduce((sum, n) => sum + Number(n.valor), 0);
  const percentual = calcPercentual(totalAno);

  // Contar notas do mês atual
  const mesAtual = new Date().getMonth(); // 0-indexed
  const notasMes = (notas || []).filter((n) => {
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

  // Previsões (apenas Pro)
  const previsaoAnual = calcPrevisaoAnual(totalAno);
  const sugestaoMensal = calcSugestaoMensal(totalAno);

  const qtdNotasMes = notasMesCount ?? 0;

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

      {/* ── Cards de métricas ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Notas este mês"
          value={String(notasMes.length)}
          sublabel={!isPro && qtdNotasMes >= 6 ? `⚠️ ${qtdNotasMes}/10 usadas` : undefined}
          icon={<FileText className="w-5 h-5 text-brand-600" />}
        />
        <MetricCard
          label="Faturado este mês"
          value={formatCurrency(totalMes)}
          icon={<Calendar className="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          label="Total no ano"
          value={formatCurrency(totalAno)}
          icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
        />
        <MetricCard
          label="Disponível"
          value={formatCurrency(Math.max(81_000 - totalAno, 0))}
          icon={<span className="text-xl">💰</span>}
        />
      </div>

      {/* ── Aviso limite free ── */}
      {!isPro && qtdNotasMes >= 8 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Você usou {qtdNotasMes}/10 notas gratuitas este mês
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Faça upgrade para o Pro e emita notas ilimitadas.{" "}
              <Link href="/assinatura" className="underline font-semibold">Proteger meu MEI →</Link>
            </p>
          </div>
        </div>
      )}

      {/* ── Empty state para usuário sem notas ── */}
      {totalAno === 0 && (
        <div className="card text-center py-10 border-dashed border-2 border-gray-200 bg-gray-50/50">
          <p className="text-4xl mb-3">📋</p>
          <h2 className="font-semibold text-gray-700 mb-1">Nenhuma nota registrada ainda</h2>
          <p className="text-sm text-gray-400 mb-5">
            Registre sua primeira nota e comece a acompanhar seu faturamento.
          </p>
          <Link href="/notas/nova" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Registrar primeira nota
          </Link>
        </div>
      )}

      {/* ── Gráfico mensal ── */}
      {totalAno > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Faturamento mensal</h2>
          <GraficoMensal
            data={dadosMensais}
            limiteSeguro={isPro ? sugestaoMensal : undefined}
          />
        </div>
      )}

      {/* ── Previsões Pro ── */}
      <ProGate feature="Previsão de Faturamento" isPro={isPro}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card border-brand-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Previsão anual (baseada na média)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(previsaoAnual)}</p>
                {previsaoAnual > 81_000 && (
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
      </ProGate>

      {/* ── Histórico: últimas notas ── */}
      <RecentNotes notas={(notas || []).slice(0, 5)} />
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
      <p className="text-base sm:text-xl font-bold text-gray-900 truncate">{value}</p>
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
            <div>
              <p className="text-sm font-medium text-gray-900">{nota.descricao || "Sem descrição"}</p>
              <p className="text-xs text-gray-400">
                {nota.cliente && `${nota.cliente} • `}
                {new Date(nota.data + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
            </div>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(Number(nota.valor))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
