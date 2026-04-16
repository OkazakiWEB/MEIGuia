"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";
import { ArrowLeft, Mail } from "lucide-react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/nova-senha`,
    });

    if (error) {
      toast.error("Erro ao enviar e-mail. Verifique o endereço informado.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-petroleo-50 via-white to-agua-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Logo href="/" size="text-3xl" />
          </div>
          <p className="text-gray-500 mt-3 text-sm">Recuperar acesso à conta</p>
        </div>

        <div className="card shadow-lg">
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">E-mail enviado!</h2>
              <p className="text-sm text-gray-500">
                Enviamos um link de redefinição para <strong>{email}</strong>.
                Verifique sua caixa de entrada e pasta de spam.
              </p>
              <p className="text-xs text-gray-400">O link expira em 1 hora.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-petroleo-600 hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Esqueceu sua senha?</h2>
              <p className="text-sm text-gray-500 mb-6">
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">E-mail cadastrado</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Lembrou a senha?{" "}
            <Link href="/login" className="text-petroleo-600 font-semibold hover:underline">
              Voltar ao login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
