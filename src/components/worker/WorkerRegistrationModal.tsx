import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ALL_SKILLS, EXPERIENCE_LEVELS } from '@/data/seedData';
import { Check, ShieldAlert, Award, ArrowRight, ArrowLeft } from 'lucide-react';

interface WorkerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkerRegistrationModal: React.FC<WorkerRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { registerWorker } = useAppStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [stateName, setStateName] = useState('Telangana');
  const [district, setDistrict] = useState('Hyderabad');
  const [locality, setLocality] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [primarySkill, setPrimarySkill] = useState('');
  const [experience, setExperience] = useState('Learned through practical experience');
  const [expectedDailyWage, setExpectedDailyWage] = useState(800);
  const [hasCertificate, setHasCertificate] = useState<'yes' | 'no' | null>(null);
  const [certificateName, setCertificateName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      const updated = selectedSkills.filter((s) => s !== skill);
      setSelectedSkills(updated);
      if (primarySkill === skill) {
        setPrimarySkill(updated[0] || '');
      }
    } else {
      const updated = [...selectedSkills, skill];
      setSelectedSkills(updated);
      if (!primarySkill) {
        setPrimarySkill(skill);
      }
    }
  };

  const handleFinish = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill');
      return;
    }

    registerWorker({
      name,
      phone,
      state: stateName,
      district,
      locality: locality || 'Main Market Area',
      skills: selectedSkills,
      primarySkill: primarySkill || selectedSkills[0],
      experienceLevel: experience,
      expectedDailyWage,
      bio: `${experience}. Ready for immediate work in ${district}.`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white text-slate-900 border border-slate-200 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#123B63] p-5 text-white">
          <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
            <span>WORKER REGISTRATION</span>
            <span>Step {step} of 4</span>
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {step === 1 && 'Basic Information & Location'}
            {step === 2 && 'Select Your Skills & Trade'}
            {step === 3 && 'Experience & Daily Wage'}
            {step === 4 && 'Skill Evidence (Optional)'}
          </DialogTitle>
          <DialogDescription className="text-xs text-blue-100 mt-0.5">
            {step === 1 && 'Tell employers your name and locality so they can contact you nearby.'}
            {step === 2 && 'Choose the skills you can perform. Select one or more.'}
            {step === 3 && 'How you learned your craft and your fair daily expected wage.'}
            {step === 4 && 'Certificates are NEVER required. Practical work is honored.'}
          </DialogDescription>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Info & Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (पूरा नाम / పూర్తి పేరు)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B63]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (फ़ोन नंबर)</label>
                <input
                  type="tel"
                  placeholder="+91 98490 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B63]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State (राज्य)</label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#123B63]"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District / City (ज़िला)</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#123B63]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Landmark (इलाका / బస్తీ)</label>
                <input
                  type="text"
                  placeholder="e.g. Kukatpally, Near Metro Station"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B63]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Tap all skills you can do. Tap again to unselect.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                {ALL_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between min-h-[44px] ${
                        isSelected
                          ? 'bg-blue-50 border-[#123B63] text-[#123B63] shadow-sm ring-1 ring-[#123B63]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{skill}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#123B63]" />}
                    </button>
                  );
                })}
              </div>

              {selectedSkills.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Your Main / Primary Trade:
                  </label>
                  <select
                    value={primarySkill}
                    onChange={(e) => setPrimarySkill(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    {selectedSkills.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Experience & Wage */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  How did you gain your experience? (अनुभव)
                </label>
                <div className="space-y-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between min-h-[44px] ${
                        experience === lvl
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm ring-1 ring-emerald-500 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lvl}</span>
                      {experience === lvl && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Daily Wage: <span className="text-[#123B63] text-sm font-extrabold">₹{expectedDailyWage} / day</span>
                </label>
                <input
                  type="range"
                  min="400"
                  max="2000"
                  step="50"
                  value={expectedDailyWage}
                  onChange={(e) => setExpectedDailyWage(Number(e.target.value))}
                  className="w-full accent-[#123B63] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹400 (Helper)</span>
                  <span>₹800 (Skilled)</span>
                  <span>₹2000 (Master)</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Non-Mandatory Certificate */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Highlight Box Guaranteeing No Discrimination */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-emerald-100 rounded-full text-emerald-700 shrink-0">
                    <Award className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm">
                      Certificates are NEVER Mandatory
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      On Work Bridge, practical experience on real work sites carries equal weight to formal diplomas. You will receive honest customer reviews and verified work history badges.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setHasCertificate('no')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    hasCertificate === 'no'
                      ? 'bg-blue-50 border-[#123B63] text-[#123B63] ring-2 ring-[#123B63] font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-bold mb-1">I Don't Have a Certificate</div>
                  <div className="text-[11px] text-slate-500">I learned through practical site work</div>
                </button>

                <button
                  type="button"
                  onClick={() => setHasCertificate('yes')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    hasCertificate === 'yes'
                      ? 'bg-blue-50 border-[#123B63] text-[#123B63] ring-2 ring-[#123B63] font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-bold mb-1">I Have a Certificate</div>
                  <div className="text-[11px] text-slate-500">ITI / PMKVY / Govt Trade Board</div>
                </button>
              </div>

              {hasCertificate === 'yes' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Certificate / Course Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ITI Wireman NCVT Certificate"
                      value={certificateName}
                      onChange={(e) => setCertificateName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Issuing Authority
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Govt of Telangana Skill Mission"
                      value={certIssuer}
                      onChange={(e) => setCertIssuer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  alert('Please enter your name');
                  return;
                }
                if (step === 2 && selectedSkills.length === 0) {
                  alert('Please choose at least one skill');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2.5 bg-[#123B63] hover:bg-[#1E5A8A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Complete Profile & Start</span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
