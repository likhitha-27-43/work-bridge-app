import * as React from "react";
import { useAppStore } from "@/store/useAppStore";
import { Header } from "@/components/layout/Header";
import { SplashScreen } from "@/components/splash/SplashScreen";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { WorkerHome } from "@/components/worker/WorkerHome";
import { EmployerHome } from "@/components/employer/EmployerHome";
import { AdminPortal } from "@/components/admin/AdminPortal";
import { fetchBuildVersion } from "@/lib/api";

export default function App() {
  const { role, showSplash, showOnboarding, dismissSplash, dismissOnboarding } = useAppStore();

  // Live reload poll
  React.useEffect(() => {
    if (import.meta.hot) return;
    let initial: number | null = null;
    let cancelled = false;
    const tick = async () => {
      try {
        const { build, ready } = await fetchBuildVersion();
        if (cancelled || !ready) return;
        if (initial === null) initial = build;
        else if (build !== initial) window.location.reload();
      } catch {
        // ignore transient errors
      }
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Interactive Splash Screen */}
      {showSplash && <SplashScreen onFinish={dismissSplash} />}

      {/* Guided Onboarding + Language + Role + Login/Create Account Modal */}
      <OnboardingFlow open={showOnboarding} onClose={dismissOnboarding} />

      <Header />

      <main className="flex-1 pb-16">
        {role === "worker" && <WorkerHome />}
        {role === "employer" && <EmployerHome />}
        {role === "admin" && <AdminPortal />}
      </main>

      {/* Persistent Mobile Civic Footer */}
      <footer className="bg-[#0E2A47] text-blue-200 text-xs py-4 px-4 border-t border-blue-900 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-white">
            WORK BRIDGE • Local Work. Trusted People. Simple Access.
          </div>
          <div className="text-[11px] text-blue-300">
            Citizen Employment Network • 13 Indian Languages • Non-Mandatory Certification Policy
          </div>
        </div>
      </footer>
    </div>
  );
}
