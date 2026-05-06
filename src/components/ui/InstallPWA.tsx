"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function InstallPWA() {
  const [prompt, setPrompt]       = useState<any>(null);
  const [show, setShow]           = useState(false);
  const [isIOS, setIsIOS]         = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Já instalado — não mostrar
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) { setIsStandalone(true); return; }

    // Já dispensado pelo usuário
    if (localStorage.getItem("pwa-dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    if (ios) {
      setIsIOS(true);
      // Mostra após 4s para não interromper o carregamento
      setTimeout(() => setShow(true), 4000);
      return;
    }

    // Android/Chrome — o evento pode já ter sido capturado pelo script inline
    function trySetPrompt() {
      const p = (window as any).__pwaPrompt;
      if (p) {
        setPrompt(p);
        setTimeout(() => setShow(true), 4000);
      }
    }

    trySetPrompt(); // já está disponível?

    // Ou ainda vai disparar
    window.addEventListener("pwa-prompt-ready", trySetPrompt);
    return () => window.removeEventListener("pwa-prompt-ready", trySetPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem("pwa-dismissed", "1");
    setShow(false);
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      (window as any).__pwaPrompt = null;
      setShow(false);
    }
  }

  if (!show || isStandalone) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-slide-up">
        <button onClick={dismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-petroleo-100 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-petroleo-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Instalar MEIguia</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Toque em{" "}
              <span className="inline-flex items-center gap-0.5 font-semibold text-gray-700">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Compartilhar
              </span>{" "}
              e depois em{" "}
              <strong className="text-gray-700">Adicionar a Tela de Inicio</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-slide-up">
      <button onClick={dismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-petroleo-100 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-petroleo-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Instalar MEIguia</p>
          <p className="text-xs text-gray-500 mt-0.5">Acesse mais rapido direto da tela inicial.</p>
          <button
            onClick={install}
            className="mt-2.5 bg-petroleo-700 hover:bg-petroleo-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Instalar agora
          </button>
        </div>
      </div>
    </div>
  );
}
