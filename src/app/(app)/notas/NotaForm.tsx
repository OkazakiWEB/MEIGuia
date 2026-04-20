"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { NotaFiscal } from "@/types/database";

interface NotaFormProps {
  userId: string;
  isPro: boolean;
  nota?: NotaFiscal; // Se passado, é modo edição
}

export function NotaForm({ userId, isPro, nota }: NotaFormProps) {
  const router = useRouter();
  const isEditing = !!nota;

  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; notasMes: number; reason: "warning" | "limit" }>({
    open: false, notasMes: 0, reason: "warning",
  });

  const [form, setForm] = useState({
    valor: nota ? String(nota.valor) : "",
    data: nota?.data || new Date().toISOString().split("T")[0],
    descricao: nota?.descricao || "",
    numero_nf: nota?.numero_nf || "",
    cliente: nota?.cliente || "",
  });
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(isEditing && !!(nota?.descricao || nota?.cliente || nota?.numero_nf));

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Normaliza separadores: "1.234,56" → "1234.56", "1,500.00" → "1500.00"
    const rawValor = form.valor.trim().replace(/\./g, "").replace(",", ".");
    const valor = parseFloat(rawValor);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Informe um valor válido (ex: 1500,00).");
      return;
    }
    if (valor > 81_000) {
      toast.error("Uma única nota não pode ultrapassar R$ 81.000.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (isEditing) {
      const { error } = await supabase
        .from("notas_fiscais")
        .update({
          valor,
          data: form.data,
          descricao: form.descricao || null,
          numero_nf: form.numero_nf || null,
          cliente: form.cliente || null,
        })
        .eq("id", nota.id);

      if (error) {
        toast.error("Erro ao atualizar nota.");
      } else {
        toast.success("Nota atualizada!");
        router.push("/notas");
        router.refresh();
      }
    } else {
      const { error } = await supabase.from("notas_fiscais").insert({
        user_id: userId,
        valor,
        data: form.data,
        descricao: form.descricao || null,
        numero_nf: form.numero_nf || null,
        cliente: form.cliente || null,
      });

      if (error) {
        // Erro do trigger server-side de limite do plano gratuito
        if (error.message?.includes("NOTAS_LIMIT_EXCEEDED")) {
          const { data: qtd } = await supabase.rpc("get_notas_mes_atual", { p_user_id: userId });
          setUpgradeModal({ open: true, notasMes: qtd ?? 20, reason: "limit" });
        } else {
          toast.error("Erro ao criar nota.");
        }
      } else {
        // Buscar novo total para o toast contextual
        const { data: novoTotal } = await supabase.rpc("get_faturamento_anual", { p_user_id: userId });
        const totalAtual = Number(novoTotal ?? 0);
        const pct = Math.round((totalAtual / 81_000) * 100);

        const impacto =
          pct <= 40 ? `Você usou ${pct}% do limite — ainda tem muito espaço 👍` :
          pct <= 69 ? `Você usou ${pct}% do limite anual` :
          pct <= 84 ? `Você usou ${pct}% do limite — fique de olho no dashboard` :
          pct <= 94 ? `⚠️ Você usou ${pct}% do limite — cuidado com novos serviços` :
                      `🚨 Você usou ${pct}% do limite — veja suas opções no dashboard`;

        toast.success(
          `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} registrado!\n${impacto}`,
          { duration: 3500 }
        );

        // Verificar se está se aproximando do limite de notas (free)
        if (!isPro) {
          const { data: qtd } = await supabase.rpc("get_notas_mes_atual", { p_user_id: userId });
          if ((qtd ?? 0) >= 8) {
            setLoading(false);
            setUpgradeModal({ open: true, notasMes: qtd ?? 8, reason: "warning" });
            return;
          }
        }
        router.push("/dashboard");
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <>
    <UpgradeModal
      open={upgradeModal.open}
      reason={upgradeModal.reason}
      notasMes={upgradeModal.notasMes}
      onClose={() => {
        setUpgradeModal((s) => ({ ...s, open: false }));
        router.push("/notas");
        router.refresh();
      }}
    />
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Valor */}
      <div>
        <label className="label text-sm font-semibold text-gray-700">Quanto você recebeu? *</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm pointer-events-none">R$</span>
          <input
            name="valor"
            type="text"
            inputMode="decimal"
            className="input pl-9"
            placeholder="0,00"
            value={form.valor}
            onChange={handleChange}
            required
            autoFocus={!isEditing}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Digite o valor que você vai receber ou já recebeu por esse serviço.</p>
      </div>

      {/* Data */}
      <div>
        <label className="label text-sm font-semibold text-gray-700">Quando foi? *</label>
        <input
          name="data"
          type="date"
          className="input"
          value={form.data}
          onChange={handleChange}
          required
          max={new Date().toISOString().split("T")[0]}
        />
        <p className="text-xs text-gray-400 mt-1">Data em que o serviço foi feito ou a nota foi emitida.</p>
      </div>

      {/* Detalhes opcionais */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium text-gray-600"
        >
          <span>+ Adicionar detalhes <span className="text-gray-400 font-normal">(descrição, cliente, nº da nota)</span></span>
          {showDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showDetails && (
          <div className="px-4 py-4 space-y-4 bg-white">
            {/* Descrição */}
            <div>
              <label className="label text-sm">Para que foi esse serviço? <span className="text-gray-400 font-normal">(opcional)</span></label>
              <textarea
                name="descricao"
                className="input resize-none"
                rows={2}
                placeholder="Ex: Criação de logo, consultoria jurídica, pintura de apartamento..."
                value={form.descricao}
                onChange={handleChange}
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="label text-sm">Nome do cliente <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input
                name="cliente"
                type="text"
                className="input"
                placeholder="Ex: João da Silva ou Empresa ABC"
                value={form.cliente}
                onChange={handleChange}
              />
            </div>

            {/* Número NF */}
            <div>
              <label className="label text-sm">Número da nota <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input
                name="numero_nf"
                type="text"
                className="input"
                placeholder="Ex: 00123"
                value={form.numero_nf}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-400 mt-1">Você encontra esse número no aplicativo da prefeitura onde emitiu a nota.</p>
            </div>
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base font-semibold">
          {loading
            ? (isEditing ? "Salvando..." : "Registrando...")
            : (isEditing ? "Salvar alterações" : "Registrar recebimento")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary sm:w-auto"
        >
          Cancelar
        </button>
      </div>
    </form>
    </>
  );
}
