import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotasTable } from "./NotasTable";
import { Plus, Download, FileText } from "lucide-react";

export default async function NotasPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const ano = Number(params.ano) || new Date().getFullYear();
  const page = Number(params.page) || 1;
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const [{ data: profile }, { data: notas, count }, { data: qtdMes }] = await Promise.all([
    supabase.from("profiles").select("plano").eq("id", user.id).single(),
    supabase
      .from("notas_fiscais")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .gte("data", `${ano}-01-01`)
      .lte("data", `${ano}-12-31`)
      .order("data", { ascending: false })
      .range(from, to),
    supabase.rpc("get_notas_mes_atual", { p_user_id: user.id }),
  ]);

  const isPro = profile?.plano === "pro";
  const totalPages = Math.ceil((count || 0) / perPage);
  const atLimite = !isPro && (qtdMes ?? 0) >= 20;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Notas Fiscais
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {count || 0} nota{(count || 0) !== 1 ? "s" : ""} em {ano}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Export — só pro */}
          {isPro && (
            <>
              <a
                href={`/api/notas/export?format=xlsx&ano=${ano}`}
                className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5 min-h-[40px]"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </a>
              <a
                href={`/api/notas/export?format=csv&ano=${ano}`}
                className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5 min-h-[40px]"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </a>
            </>
          )}
          {!isPro && (
            <Link href="/assinatura" className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5 text-gray-400 min-h-[40px]">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Link>
          )}
          <Link
            href="/notas/nova"
            className={atLimite
              ? "btn-secondary text-sm py-2 px-4 opacity-60 pointer-events-none flex items-center gap-1.5 min-h-[40px]"
              : "btn-primary text-sm py-2 px-4 flex items-center gap-1.5 min-h-[40px]"}
          >
            <Plus className="w-4 h-4" />
            Nova nota
          </Link>
        </div>
      </div>

      {/* Aviso limite free */}
      {atLimite && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-800">
            Limite de 20 notas/mês atingido no plano Gratuito.{" "}
            <Link href="/assinatura" className="underline">Faça upgrade para o Pro →</Link>
          </p>
        </div>
      )}

      {/* Filtro por ano */}
      <div className="flex gap-2">
        {[ano - 1, ano, ano + 1].filter(y => y <= new Date().getFullYear()).map((y) => (
          <Link
            key={y}
            href={`/notas?ano=${y}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              y === ano
                ? "bg-brand-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      <div className="card p-0 overflow-hidden">
        <NotasTable notas={notas || []} isPro={isPro} />
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/notas?ano=${ano}&page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
