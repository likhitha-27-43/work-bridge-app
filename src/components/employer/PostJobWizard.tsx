import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ALL_SKILLS } from '@/data/seedData';
import { Job } from '@/types';
import { Check, ArrowRight, ArrowLeft, IndianRupee, Sparkles, Building2 } from 'lucide-react';

interface PostJobWizardProps {
  onJobCreated: (job: Job) => void;
  onCancel: () => void;
}

export const PostJobWizard: React.FC<PostJobWizardProps> = ({ onJobCreated, onCancel }) => {
  const { postNewJob, activeEmployerId, employers } = useAppStore();
  const activeEmployer = employers.find((e) => e.id === activeEmployerId) || employers[0];

  const [step, setStep] = useState(1);
  const [skillNeeded, setSkillNeeded] = useState(ALL_SKILLS[0]);
  const [title, setTitle] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [duration, setDuration] = useState('2 Days');
  const [wage, setWage] = useState(850);
  const [wageType, setWageType] = useState<'Daily' | 'Hourly' | 'Fixed'>('Daily');
  const [paymentTiming, setPaymentTiming] = useState('Daily Evening Cash');
  const [startDate, setStartDate] = useState('Tomorrow morning 8:30 AM');
  const [stateName, setStateName] = useState(activeEmployer.state || 'Telangana');
  const [district, setDistrict] = useState(activeEmployer.district || 'Hyderabad');
  const [locality, setLocality] = useState(activeEmployer.locality || 'Kukatpally, Main Market');
  const [description, setDescription] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [perks, setPerks] = useState<string[]>(['Lunch Provided', 'Evening Cash Payment']);

  const availablePerks = [
    'Lunch Provided',
    'Tea & Biscuits',
    'Evening Cash Payment',
    'Tools on Site',
    'Transport Allowance',
    'Shaded Work Area',
  ];

  const togglePerk = (p: string) => {
    if (perks.includes(p)) {
      setPerks(perks.filter((item) => item !== p));
    } else {
      setPerks([...perks, p]);
    }
  };

  const handleFinish = () => {
    const finalTitle = title.trim() || `${skillNeeded.split(' ')[0]} needed for ${duration} work`;
    const finalDesc = description.trim() || `Experienced ${skillNeeded} required at ${locality}. ${duration} engagement with ${paymentTiming}.`;

    const created = postNewJob({
      employerId: activeEmployer.id,
      employerName: activeEmployer.businessName || activeEmployer.name,
      employerPhone: activeEmployer.phone,
      title: finalTitle,
      skillNeeded,
      workersNeeded,
      wage,
      wageType,
      duration,
      startDate,
      state: stateName,
      district,
      locality,
      distanceKm: 2.3,
      description: finalDesc,
      perks,
      status: 'open',
      urgent,
    });

    onJobCreated(created);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
      {/* Wizard Header */}
      <div className="bg-[#123B63] p-6 text-white">
        <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
          <span className="font-bold tracking-wider uppercase">POST WORK WIZARD</span>
          <span>Step {step} of 5</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">
          {step === 1 && 'What Trade / Skill Do You Need?'}
          {step === 2 && 'Number of Workers & Duration'}
          {step === 3 && 'Fair Wage & Payment Method'}
          {step === 4 && 'Work Site Location & Timing'}
          {step === 5 && 'Description & Worker Perks'}
        </h2>
        <p className="text-xs text-blue-100 mt-0.5">
          {step === 1 && 'Pick the required trade and give your work requirement a short title.'}
          {step === 2 && 'How many hands do you need and for how many days or hours?'}
          {step === 3 && 'Prompt and fair wages attract the highest rated nearby craftsmen.'}
          {step === 4 && 'Workers within 2 to 5 km of this locality will be notified.'}
          {step === 5 && 'Add site details and perks like food or tools.'}
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Step 1: Trade & Title */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Required Trade / Skill:
              </label>
              <select
                value={skillNeeded}
                onChange={(e) => setSkillNeeded(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#123B63]"
              >
                {ALL_SKILLS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Title (Short Headline)
              </label>
              <input
                type="text"
                placeholder="e.g. Urgent Plastering & Brick Wall for House"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#123B63]"
              />
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-900 block">Mark as Urgent Work?</span>
                <span className="text-[11px] text-red-700">Notifies nearby available workers immediately</span>
              </div>
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Workers & Duration */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                How many workers do you need?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWorkersNeeded(num)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all min-h-[44px] ${
                      workersNeeded === num
                        ? 'bg-[#123B63] text-white border-[#123B63] shadow'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num} Worker{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Expected Duration:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Immediate (1 Day)', '2 Days', '3 Days', '1 Week', '2 Weeks', '1 Month'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                      duration === d
                        ? 'bg-blue-50 border-[#123B63] text-[#123B63] font-bold ring-1 ring-[#123B63]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Wage & Timing */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Wage Payment Type:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Daily', 'Hourly', 'Fixed'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWageType(type)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                      wageType === type
                        ? 'bg-[#123B63] text-white border-[#123B63] shadow'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type} Rate
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Wage Amount Offered:</span>
                <span className="text-xl font-extrabold text-[#123B63]">
                  ₹{wage} <span className="text-xs font-normal text-slate-500">/{wageType}</span>
                </span>
              </div>
              <input
                type="range"
                min={wageType === 'Hourly' ? 80 : wageType === 'Fixed' ? 2000 : 500}
                max={wageType === 'Hourly' ? 400 : wageType === 'Fixed' ? 25000 : 2000}
                step={wageType === 'Hourly' ? 20 : wageType === 'Fixed' ? 500 : 50}
                value={wage}
                onChange={(e) => setWage(Number(e.target.value))}
                className="w-full accent-[#123B63] h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Timing:
              </label>
              <select
                value={paymentTiming}
                onChange={(e) => setPaymentTiming(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
              >
                <option value="Daily Evening Cash">Daily Evening Cash (Most preferred by workers)</option>
                <option value="UPI / Bank Transfer On Daily Completion">UPI / Bank Transfer On Daily Completion</option>
                <option value="50% Advance + 50% on Final Completion">50% Advance + 50% on Final Completion</option>
                <option value="On Final Project Completion">On Final Project Completion</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Location & Start Date */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date & Time:
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g. Tomorrow 8:00 AM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">District / City</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Locality / Site Landmark
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Kukatpally, Near Pillar 780"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>
          </div>
        )}

        {/* Step 5: Description & Perks */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Detailed Work Description:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Explain the work clearly: tools provided, height work, specific materials..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B63]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Facilities & Perks for Workers:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availablePerks.map((perk) => {
                  const isChecked = perks.includes(perk);
                  return (
                    <button
                      key={perk}
                      type="button"
                      onClick={() => togglePerk(perk)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-colors min-h-[44px] ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{perk}</span>
                      {isChecked && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 min-h-[44px]"
          >
            Cancel
          </button>
        )}

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-5 py-2.5 bg-[#123B63] hover:bg-[#1E5A8A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow min-h-[44px]"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Publish Work Requirement</span>
          </button>
        )}
      </div>
    </div>
  );
};
