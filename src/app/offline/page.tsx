"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-petroleo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-petroleo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M3 3l18 18" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sem conexao com a internet</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Verifique sua conexao e tente novamente. Suas notas ficam salvas no servidor e estao seguras.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-petroleo-700 hover:bg-petroleo-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
