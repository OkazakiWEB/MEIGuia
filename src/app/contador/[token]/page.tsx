import type { Metadata } from "next";
import { ContadorView } from "./ContadorView";

export const metadata: Metadata = {
  title: "Modo Contador — Portal MEIguia",
  description: "Acesso compartilhado de faturamento MEI para contador.",
  robots: { index: false, follow: false }, // Não indexar links de contador
};

export default async function ContadorPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ContadorView token={token} />;
}
