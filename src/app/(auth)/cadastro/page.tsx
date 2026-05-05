"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";
import { track } from "@vercel/analytics";


function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  // Plano selecionado: começa com o que veio na URL (ou "free" por padrão)
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "premium">(
    planParam === "premium" ? "premium" : planParam === "pro" ? "pro" : "free"
  );
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  function formatCnpj(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function validateCnpj(cnpj: string): boolean {
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length !== 14) return false;
    if (/^(\d)\1+$/.test(digits)) return false;
    const calc = (d: string, len: number) => {
      let sum = 0, pos = len - 7;
      for (let i = len; i >= 1; i--) {
        sum += parseInt(d[len - i]) * pos--;
        if (pos < 2) pos = 9;
      }
      return sum % 11 < 2 ? 0 : 11 - (sum % 11);
    };
    return calc(digits, 12) === parseInt(digits[12]) &&
           calc(digits, 13) === parseInt(digits[13]);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("A senha deve ter pelo menos 8 caracteres."); return; }
    const cnpjDigits = cnpj.replace(/\D/g, "");
    if (!validateCnpj(cnpj)) { toast.error("CNPJ inválido. Verifique o número informado."); return; }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").update({ cnpj: cnpjDigits }).eq("id", data.user.id);
    }

    if (data.session) {
      track("signup_completed", { method: "email", plan: selectedPlan });
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "sign_up", { method: "email" });
      }
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "CompleteRegistration", { content_name: selectedPlan });
      }
      toast.success("Conta criada! Bem-vindo ao MEIguia 🎉");
      // Dispara e-mail de boas-vindas imediato em background (não bloqueia o redirect)
      fetch("/api/emails/boas-vindas", { method: "POST" }).catch(() => {});
      router.push(selectedPlan !== "free" ? `/assinatura?upgrade=true&plan=${selectedPlan}&interval=${interval}` : "/dashboard");
      router.refresh();
      return;
    }

    toast.success("Conta criada! Verifique seu e-mail para confirmar antes de entrar.");
    setLoading(false);
  }

  async function handleGoogleSignup() {
    track("signup_started", { method: "google", plan: selectedPlan });
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", { content_name: "google_signup" });
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback${selectedPlan !== "free" ? `?plan=${selectedPlan}` : ""}`,
      },
    });
    if (error) toast.error("Erro ao cadastrar com Google.");
  }

  const isPro = selectedPlan === "pro";
  const isPremium = selectedPlan === "premium";

  return (
    <div className="w-full max-w-lg">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-2">
          <Logo href="/" size="text-3xl" />
        </div>
        <p className="text-gray-500 mt-2 text-sm">Crie sua conta e comece agora</p>
      </div>

      {/* ── Card do formulário ── */}
      <div className="card shadow-lg">
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Cadastrar com Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="label">Nome completo</label>
            <input type="text" className="input" placeholder="João da Silva"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="label">CNPJ do MEI</label>
            <input type="text" className="input" placeholder="00.000.000/0001-00"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              inputMode="numeric" maxLength={18} required />
            <p className="text-xs text-gray-400 mt-1">Usado para gerar sua Guia DAS automaticamente.</p>
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" className="input" placeholder="seu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {password.length > 0 && (() => {
              const forte = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password);
              const media = password.length >= 8;
              const nivel = forte ? "forte" : media ? "média" : "fraca";
              const cor = forte ? "bg-green-500" : media ? "bg-yellow-400" : "bg-red-400";
              const largura = forte ? "w-full" : media ? "w-2/3" : "w-1/3";
              return (
                <div className="mt-1.5 space-y-1">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${cor} ${largura}`} />
                  </div>
                  <p className={`text-xs ${forte ? "text-green-600" : media ? "text-yellow-600" : "text-red-500"}`}>
                    Senha {nivel}{!forte && " — use letras maiúsculas e números para fortalecer"}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* ── Seletor de plano ── */}
          {/* Toggle mensal / anual */}
          <div className="flex items-center justify-center gap-1 pt-2">
            <button
              type="button"
              onClick={() => setInterval("monthly")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                interval === "monthly"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setInterval("annual")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                interval === "annual"
                  ? "bg-gray-800 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Anual
              <span className="ml-1 bg-green-100 text-green-700 text-[9px] font-bold px-1 py-0.5 rounded-full">-20%</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Free */}
            <button
              type="button"
              onClick={() => setSelectedPlan("free")}
              className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                selectedPlan === "free"
                  ? "border-gray-400 bg-white shadow-sm"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              {selectedPlan === "free" && (
                <span className="absolute -top-2.5 left-2 bg-gray-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  SELECIONADO
                </span>
              )}
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Gratuito</p>
              <p className="text-lg font-extrabold text-gray-800">R$ 0</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Para começar</p>
              <ul className="mt-2 space-y-1">
                {["5 notas/mês", "Dashboard básico"].map((f) => (
                  <li key={f} className="flex items-center gap-1 text-[10px] text-gray-500">
                    <CheckCircle className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>

            {/* Pro */}
            <button
              type="button"
              onClick={() => setSelectedPlan("pro")}
              className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                isPro
                  ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-100"
                  : "border-gray-200 bg-white hover:border-brand-300"
              }`}
            >
              <span className="absolute -top-2.5 left-2 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {isPro ? "SELECIONADO" : "⭐ POPULAR"}
              </span>
              <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wide mb-1">Pro</p>
              <p className="text-lg font-extrabold text-gray-900">
                R$&nbsp;{interval === "annual" ? "19,92" : "24,90"}
                <span className="text-[10px] font-normal text-gray-400">/mês</span>
              </p>
              <p className="text-[10px] text-brand-600 font-medium mt-0.5">
                {interval === "annual" ? "R$ 239/ano cobrado hoje" : "30 notas/mês"}
              </p>
              <ul className="mt-2 space-y-1">
                {["Alertas automáticos", "Previsão anual", "Exportar relatório"].map((f) => (
                  <li key={f} className="flex items-center gap-1 text-[10px] text-gray-700">
                    <CheckCircle className={`w-2.5 h-2.5 flex-shrink-0 ${isPro ? "text-brand-500" : "text-gray-400"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>

            {/* Premium */}
            <button
              type="button"
              onClick={() => setSelectedPlan("premium")}
              className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                isPremium
                  ? "border-purple-500 bg-purple-50 shadow-md shadow-purple-100"
                  : "border-gray-200 bg-white hover:border-purple-300"
              }`}
            >
              <span className="absolute -top-2.5 left-2 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                {isPremium ? "SELECIONADO" : "🚀 COMPLETO"}
              </span>
              <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide mb-1">Premium</p>
              <p className="text-lg font-extrabold text-gray-900">
                R$&nbsp;{interval === "annual" ? "39,92" : "49,90"}
                <span className="text-[10px] font-normal text-gray-400">/mês</span>
              </p>
              <p className="text-[10px] text-purple-600 font-medium mt-0.5">
                {interval === "annual" ? "R$ 479/ano cobrado hoje" : "Ilimitado"}
              </p>
              <ul className="mt-2 space-y-1">
                {["WhatsApp alertas", "Emissão de DAS", "NF (em breve)"].map((f) => (
                  <li key={f} className="flex items-center gap-1 text-[10px] text-gray-700">
                    <CheckCircle className={`w-2.5 h-2.5 flex-shrink-0 ${isPremium ? "text-purple-500" : "text-gray-400"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          </div>

          {selectedPlan !== "free" && (
            <p className={`text-xs text-center -mt-1 ${isPremium ? "text-purple-600" : "text-brand-600"}`}>
              Você será direcionado para o pagamento após criar a conta.
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 font-semibold">
            {loading
              ? "Criando conta..."
              : isPremium
              ? "Criar conta e assinar Premium →"
              : isPro
              ? "Criar conta e assinar Pro →"
              : "Criar conta grátis →"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Ao criar uma conta você concorda com nossos{" "}
          <Link href="/termos" className="underline">Termos de Uso</Link>.
        </p>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Já tem conta?{" "}
        <Link href="/login" className="text-petroleo-600 font-semibold hover:underline">Entrar</Link>
      </p>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-petroleo-50 via-white to-agua-50 flex items-center justify-center p-4 py-10">
      <Suspense fallback={
        <div className="w-full max-w-lg text-center">
          <div className="flex justify-center mb-8"><Logo href="/" size="text-3xl" /></div>
          <div className="card shadow-lg h-96 animate-pulse bg-gray-100" />
        </div>
      }>
        <CadastroForm />
      </Suspense>
    </div>
  );
}
