import type { Metadata } from "next";
import { Montserrat, Raleway, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";

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
    "Evite ultrapassar o limite de R$ 81.000 do MEI. Controle suas notas fiscais, receba alertas automáticos e veja seu faturamento em tempo real.",
  keywords: ["MEI", "microempreendedor", "notas fiscais", "faturamento", "controle", "limite MEI", "MEIguia"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MEIguia",
  },
  openGraph: {
    title: "Portal MEIguia — Nunca mais ultrapasse o limite do MEI",
    description: "Controle de faturamento com alertas automáticos para Microempreendedores Individuais.",
    type: "website",
    url: "https://www.portalmeiguia.com.br",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${raleway.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#1A6B8A" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0ZL0SXD3SQ" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0ZL0SXD3SQ');
            `,
          }}
        />

        {/* Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '17841433024684253');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{display:"none"}}
            src="https://www.facebook.com/tr?id=17841433024684253&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`,
          }}
        />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "8px", fontSize: "14px" },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
