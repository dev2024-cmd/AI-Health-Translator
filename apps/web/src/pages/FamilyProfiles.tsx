import React, { useState } from 'react';
import { Users, Plus, Phone, Globe, Shield, Heart, Trash2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@ai-health/shared';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  phone: string;
  language: string;
  phoneType: 'smartphone' | 'feature';
}

const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'pat-1',
    name: 'Sita Ramulu',
    relation: 'Father (నాన్నగారు)',
    age: 64,
    phone: '+91 96666 66666',
    language: 'te',
    phoneType: 'feature',
  },
  {
    id: 'pat-2',
    name: 'Ramesh Patel',
    relation: 'Grandfather (తాతయ్య)',
    age: 68,
    phone: '+91 98888 11111',
    language: 'hi',
    phoneType: 'feature',
  },
  {
    id: 'pat-3',
    name: 'Lakshmi Devi',
    relation: 'Mother (అమ్మ)',
    age: 61,
    phone: '+91 96555 44332',
    language: 'te',
    phoneType: 'smartphone',
  },
];

export const FamilyProfiles: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('te');
  const [phoneType, setPhoneType] = useState<'smartphone' | 'feature'>('feature');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: FamilyMember = {
      id: 'pat-' + Date.now(),
      name: name.trim(),
      relation: relation || 'Dependent',
      age: Number(age) || 50,
      phone: phone.startsWith('+91') ? phone : '+91 ' + phone,
      language,
      phoneType,
    };

    setMembers([...members, newMember]);
    setName('');
    setRelation('');
    setAge('');
    setPhone('');
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Family Profiles (కుటుంబ సభ్యులు)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage elderly dependents, 2G button-phone voice alerts, and assigned regional health workers.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAddMember}
          className="p-6 rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4"
        >
          <h3 className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
            New Dependent Member
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Kamala Devi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Relation</label>
              <input
                type="text"
                placeholder="e.g. Grandmother / Mother"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Age</label>
              <input
                type="number"
                placeholder="e.g. 72"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number (2G or Smart)</label>
              <input
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Preferred Voice Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Phone Type</label>
              <select
                value={phoneType}
                onChange={(e) => setPhoneType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm outline-none focus:border-emerald-500"
              >
                <option value="feature">2G Button Phone (IVR + SMS)</option>
                <option value="smartphone">Smartphone (App + Audio)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md"
            >
              Save Member
            </button>
          </div>
        </form>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 flex items-center justify-center font-black text-lg">
                    {member.name[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{member.name}</h3>
                    <span className="text-xs font-bold text-emerald-600">{member.relation}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(member.id)}
                  title="Remove Member"
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">Age:</span>
                  <span>{member.age} years old</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.phone}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600">
                    {member.phoneType === 'feature' ? '2G Button Phone' : 'Smartphone'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Voice Language: {member.language.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> DPDP Consented
              </span>
              <span className="text-slate-400">ANM: Sunita Rao (South)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
