import type { Metadata } from "next";
import { Montserrat, Raleway, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Fontes self-hosted via next/font — sem @import bloqueante
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300"],
  variable: "--font-raleway",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal MEIguia — Controle de Faturamento para MEI",
  description:
    "Controle suas notas fiscais, monitore o limite de R$ 81.000 e nunca mais ultrapasse o faturamento anual do MEI.",
  keywords: ["MEI", "microempreendedor", "notas fiscais", "faturamento", "controle", "MEIguia"],
  openGraph: {
    title: "Portal MEIguia",
    description: "Controle de faturamento inteligente para Microempreendedores",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${raleway.variable} ${inter.variable}`}>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "8px", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
