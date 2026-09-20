import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TRANSLATIONS } from '@/lib/translations';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MapPin, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, dismissOnboarding, language, setRole } = useAppStore();
  const [step, setStep] = useState(0);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const slides = [
    {
      title: t.findWorkNearYou,
      description: t.onboardingDesc1,
      icon: MapPin,
      color: 'bg-emerald-500',
      badge: 'Location & Voice Driven',
      highlight: 'Find jobs within 2-5 km of your locality. Speak naturally in your native language.',
    },
    {
      title: t.findTrustedPeople,
      description: t.onboardingDesc2,
      icon: ShieldCheck,
      color: 'bg-blue-600',
      badge: 'Transparent Two-Sided Trust',
      highlight: 'Certificates are NEVER mandatory. Real on-site experience and completed jobs are honored.',
    },
    {
      title: t.workMadeSimple,
      description: t.onboardingDesc3,
      icon: Zap,
      color: 'bg-amber-500',
      badge: 'Instant One-Tap Workflow',
      highlight: 'Live 7-step tracker: from application to prompt cash payment and mutual ratings.',
    },
  ];

  if (!showOnboarding) return null;

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      dismissOnboarding();
    }
  };

  return (
    <Dialog open={showOnboarding} onOpenChange={(open) => !open && dismissOnboarding()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white text-slate-900 border border-slate-200">
        {/* Top Header Card */}
        <div className="bg-[#123B63] p-6 text-white text-center relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20 shadow-inner">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-blue-100 uppercase tracking-wider mb-2">
            {currentSlide.badge}
          </span>
          <h2 className="text-xl font-extrabold tracking-tight">{currentSlide.title}</h2>
        </div>

        {/* Slide Body */}
        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed text-center">
            {currentSlide.description}
          </p>

          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <span className="p-1 rounded-full bg-blue-100 text-[#123B63] shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span className="font-medium">{currentSlide.highlight}</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 pt-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === step ? 'w-6 bg-[#123B63]' : 'w-2 bg-slate-300'
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={dismissOnboarding}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {t.skip}
            </button>

            <button
              onClick={handleNext}
              className="flex-1 py-3 px-5 bg-[#123B63] hover:bg-[#1E5A8A] text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{step === slides.length - 1 ? t.getStarted : t.next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
