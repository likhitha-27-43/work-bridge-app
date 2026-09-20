import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0E2A47] text-white flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag */}
      <div className="pt-8 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-medium border border-white/10 backdrop-blur">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>India Citizen Employment Network</span>
        </span>
      </div>

      {/* Center Hero / Emblem */}
      <div className="text-center max-w-sm px-4 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#1E5A8A] via-[#123B63] to-emerald-600 flex items-center justify-center shadow-2xl border-2 border-white/20 transform hover:scale-105 transition-transform">
            <span className="text-4xl font-black text-white tracking-wider">WB</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#0E2A47] flex items-center justify-center text-[10px] font-bold text-white shadow">
            IN
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white mb-2">
          WORK BRIDGE
        </h1>
        
        <p className="text-emerald-400 font-semibold text-sm tracking-wide uppercase mb-3">
          Local Work. Trusted People. Simple Access.
        </p>

        <p className="text-xs text-blue-200/80 leading-relaxed max-w-xs">
          Daily-wage & skilled work platform designed for practical experience. 
          Certificates are never mandatory.
        </p>
      </div>

      {/* Bottom Progress & Skip */}
      <div className="w-full max-w-xs pb-8 flex flex-col items-center gap-4">
        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full transition-all duration-200 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>Continue / ప్రారంభించండి</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
