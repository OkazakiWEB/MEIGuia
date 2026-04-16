"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import toast from "react-hot-toast";
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valor = parseFloat(form.valor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      toast.error("Informe um valor válido.");
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
        toast.success("Nota criada com sucesso!");
        // Verificar se está se aproximando do limite (8 ou 9 notas)
        if (!isPro) {
          const { data: qtd } = await supabase.rpc("get_notas_mes_atual", { p_user_id: userId });
          if ((qtd ?? 0) >= 8) {
            setUpgradeModal({ open: true, notasMes: qtd ?? 8, reason: "warning" });
            return; // não redireciona imediatamente — usuário verá o modal
          }
        }
        router.push("/notas");
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
      {/* Valor e Data */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Valor (R$) *</label>
          <input
            name="valor"
            type="text"
            inputMode="decimal"
            className="input"
            placeholder="Ex: 1500,00"
            value={form.valor}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label">Data de emissão *</label>
          <input
            name="data"
            type="date"
            className="input"
            value={form.data}
            onChange={handleChange}
            required
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className="label">Descrição / Serviço</label>
        <textarea
          name="descricao"
          className="input resize-none"
          rows={3}
          placeholder="Ex: Desenvolvimento de website, consultoria, etc."
          value={form.descricao}
          onChange={handleChange}
        />
      </div>

      {/* Cliente e Número NF */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nome do cliente</label>
          <input
            name="cliente"
            type="text"
            className="input"
            placeholder="Ex: Empresa ABC Ltda"
            value={form.cliente}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="label">Número da NF (opcional)</label>
          <input
            name="numero_nf"
            type="text"
            className="input"
            placeholder="Ex: 00123"
            value={form.numero_nf}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? (isEditing ? "Salvando..." : "Criando...") : (isEditing ? "Salvar alterações" : "Criar nota fiscal")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
    </>
  );
}
