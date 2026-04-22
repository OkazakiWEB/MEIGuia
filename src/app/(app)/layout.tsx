import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { OnboardingModal } from "@/components/ui/OnboardingModal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: notasMes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.rpc("get_notas_mes_atual", { p_user_id: user.id }),
  ]);

  const showOnboarding = profile && !profile.onboarding_completed;

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Navbar profile={profile} notasMes={notasMes ?? 0} />
      <main className="flex-1 min-w-0 p-3 pb-20 sm:p-4 lg:p-8 overflow-x-hidden">
        {children}
      </main>
      {showOnboarding && (
        <OnboardingModal
          userId={user.id}
          userName={profile?.full_name ?? ""}
        />
      )}
    </div>
  );
}
