import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * GET /api/notas/export?format=xlsx|csv&ano=2024
 * Exporta as notas fiscais. Disponível apenas para usuários Pro.
 */
export async function GET(request: NextRequest) {
  const rl = checkRateLimit(getClientIp(request), { limit: 20, windowMs: 60_000, prefix: "export" });
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas requisições. Aguarde um momento." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plano")
    .eq("id", user.id)
    .single();

  if (profile?.plano !== "pro") {
    return NextResponse.json(
      { error: "Funcionalidade exclusiva do plano Pro" },
      { status: 403 }
    );
  }

  const { searchParams } = request.nextUrl;
  const rawFormat = searchParams.get("format") || "xlsx";
  const format = ["xlsx", "csv"].includes(rawFormat) ? rawFormat : "xlsx";
  const rawAno = parseInt(searchParams.get("ano") || "", 10);
  const anoAtual = new Date().getFullYear();
  const ano = rawAno >= 2020 && rawAno <= anoAtual + 1 ? String(rawAno) : String(anoAtual);

  const { data: notas, error } = await supabase
    .from("notas_fiscais")
    .select("*")
    .eq("user_id", user.id)
    .gte("data", `${ano}-01-01`)
    .lte("data", `${ano}-12-31`)
    .order("data", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar notas" }, { status: 500 });
  }

  const rows = notas || [];
  const total = rows.reduce((sum, n) => sum + Number(n.valor), 0);

  // ── CSV simples (sem dependência pesada) ───────────────────────────────────
  if (format === "csv") {
    const header = ["#", "Número NF", "Data", "Cliente", "Descrição", "Valor (R$)"].join(";");
    const lines = rows.map((n, i) =>
      [i + 1, n.numero_nf || "-", n.data, n.cliente || "-", n.descricao || "-", Number(n.valor).toFixed(2).replace(".", ",")].join(";")
    );
    lines.push(["", "", "", "TOTAL", "", total.toFixed(2).replace(".", ",")].join(";"));
    const csv = "\uFEFF" + [header, ...lines].join("\n"); // BOM para Excel reconhecer UTF-8

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="notas-fiscais-${ano}.csv"`,
      },
    });
  }

  // ── XLSX com ExcelJS ───────────────────────────────────────────────────────
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MEI Control";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Notas ${ano}`);

  // Cabeçalho com estilo
  sheet.columns = [
    { header: "#",           key: "num",      width: 6  },
    { header: "Número NF",   key: "numero_nf",width: 14 },
    { header: "Data",        key: "data",     width: 14 },
    { header: "Cliente",     key: "cliente",  width: 28 },
    { header: "Descrição",   key: "descricao",width: 36 },
    { header: "Valor (R$)",  key: "valor",    width: 16 },
  ];

  // Estilizar cabeçalho
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Dados
  rows.forEach((n, i) => {
    sheet.addRow({
      num:      i + 1,
      numero_nf: n.numero_nf || "-",
      data:     n.data,
      cliente:  n.cliente || "-",
      descricao: n.descricao || "-",
      valor:    Number(n.valor),
    });
  });

  // Linha de total
  const totalRow = sheet.addRow({
    num: "",
    numero_nf: "",
    data: "",
    cliente: "TOTAL",
    descricao: "",
    valor: total,
  });
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
  });

  // Formatar coluna de valor como moeda
  sheet.getColumn("valor").numFmt = '"R$"#,##0.00';

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="notas-fiscais-${ano}.xlsx"`,
    },
  });
}
