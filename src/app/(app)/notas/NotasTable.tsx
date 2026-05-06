"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, Trash2, AlertTriangle, Loader2, FileCheck } from "lucide-react";
import toast from "react-hot-toast";
import type { NotaFiscal } from "@/types/database";
import { EmitirNFModal } from "@/components/ui/EmitirNFModal";

interface NotasTableProps {
  notas: NotaFiscal[];
  isPro: boolean;
}

export function NotasTable({ notas }: NotasTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalNota, setModalNota]   = useState<NotaFiscal | null>(null);
  const [emitirNota, setEmitirNota] = useState<NotaFiscal | null>(null);

  async function handleDelete(nota: NotaFiscal) {
    setDeletingId(nota.id);
    setModalNota(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      setDeletingId(null);
      return;
    }

    const { error } = await supabase
      .from("notas_fiscais")
      .delete()
      .eq("id", nota.id)
      .eq("user_id", user.id);

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
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Data</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Descrição</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Nº NF</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Valor</th>
              {/* Coluna de ações — largura fixa para não comprimir o restante */}
              <th className="px-2 py-3 w-24 sm:w-28" />
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
                <td className="px-4 py-3 text-gray-900 max-w-[140px] sm:max-w-[200px] truncate">
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
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1 justify-end">
                    {/* Emitir NF */}
                    <button
                      onClick={() => setEmitirNota(nota)}
                      className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-colors"
                      title={nota.numero_nf ? `NF ${nota.numero_nf} — clique para ver` : "Emitir nota fiscal"}
                    >
                      <FileCheck className={`w-4 h-4 ${nota.numero_nf ? "text-green-500" : ""}`} />
                    </button>
                    {/* Editar — área mínima 44x44px */}
                    <Link
                      href={`/notas/${nota.id}/editar`}
                      className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                      title="Editar nota"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {/* Excluir — área mínima 44x44px */}
                    <button
                      onClick={() => setModalNota(nota)}
                      disabled={deletingId === nota.id}
                      className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
                      title="Excluir nota"
                    >
                      {deletingId === nota.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal emissão NF */}
      {emitirNota && (
        <EmitirNFModal
          notaId={emitirNota.id}
          valor={Number(emitirNota.valor)}
          cliente={emitirNota.cliente}
          descricao={emitirNota.descricao}
          numeroNfAtual={emitirNota.numero_nf}
          onClose={() => setEmitirNota(null)}
          onSaved={(num) => {
            setEmitirNota(null);
            router.refresh();
            toast.success(`NF ${num} salva!`);
          }}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {modalNota && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Excluir nota fiscal</h2>
                <p className="text-xs text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-medium">Valor:</span>{" "}
                {formatCurrency(Number(modalNota.valor))}
              </p>
              {modalNota.descricao && (
                <p className="text-gray-600 truncate">
                  <span className="font-medium">Descrição:</span> {modalNota.descricao}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Data:</span> {formatDate(modalNota.data)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalNota(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(modalNota)}
                className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
