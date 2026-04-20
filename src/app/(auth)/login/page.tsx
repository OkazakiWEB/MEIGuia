"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error("E-mail ou senha incorretos."); setLoading(false); return; }
    toast.success("Bem-vindo ao Portal MEIguia!");
    router.push(redirect);
    router.refresh();
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirect}` },
    });
    if (error) toast.error("Erro ao entrar com Google.");
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-2">
          <Logo href="/" size="text-3xl" />
        </div>
        <p className="text-gray-500 mt-3 text-sm">Entre na sua conta</p>
      </div>

      <div className="card shadow-lg">
        <button onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <hr className="flex-1 border-gray-200" /><span className="text-xs text-gray-400">ou</span><hr className="flex-1 border-gray-200" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" placeholder="seu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Senha</label>
              <Link href="/esqueci-senha" className="text-xs text-petroleo-600 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} className="input pr-10"
                placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
              <button type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-petroleo-600 font-semibold hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-petroleo-50 via-white to-agua-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-8"><Logo href="/" size="text-3xl" /></div>
          <div className="card shadow-lg h-80 animate-pulse bg-gray-100" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
