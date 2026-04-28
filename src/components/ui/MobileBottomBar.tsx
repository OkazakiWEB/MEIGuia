"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function MobileBottomBar() {
  const pathname = usePathname();
  const isNotaPage = pathname === "/notas/nova" || pathname.includes("/editar");

  if (isNotaPage) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-100 p-3 z-40 safe-area-pb">
      <Link
        href="/notas/nova"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm transition-colors"
      >
        <Plus className="w-5 h-5" />
        Registrar nota
      </Link>
    </div>
  );
}
