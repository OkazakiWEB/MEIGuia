"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import type { NotaFiscal } from "@/types/database";

interface NotasTableProps {
  notas: NotaFiscal[];
  isPro: boolean;
}

export function NotasTable({ notas, isPro }: NotasTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setConfirmId(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("notas_fiscais")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir nota.");
    } else {
      toast.success("Nota excluída.");
      router.refresh();
    }
    setDeletingId(null);
  }

  if (notas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium">Nenhuma nota neste período</p>
        <p className="text-sm mt-1">
          <Link href="/notas/nova" className="text-brand-600 hover:underline">
            Emitir primeira nota →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Data</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Descrição</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Cliente</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Nº NF</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">Valor</th>
            <th className="px-4 py-3 w-24" />
          </tr>
        </thead>
        <tbody>
          {notas.map((nota) => (
            <tr
              key={nota.id}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {formatDate(nota.data)}
              </td>
              <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate">
                {nota.descricao || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600 hidden md:table-cell max-w-[160px] truncate">
                {nota.cliente || "—"}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                {nota.numero_nf || "—"}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                {formatCurrency(Number(nota.valor))}
              </td>
              <td className="px-4 py-3">
                {confirmId === nota.id ? (
                  /* Confirmação inline — sem confirm() nativo */
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleDelete(nota.id)}
                      disabled={deletingId === nota.id}
                      className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Confirmar exclusão"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/notas/${nota.id}/editar`}
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Editar nota"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setConfirmId(nota.id)}
                      disabled={deletingId === nota.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Excluir nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
