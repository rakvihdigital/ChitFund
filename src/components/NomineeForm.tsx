'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { msg, useT } from '@/lib/i18n';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 text-xs font-medium';

// Stored in English; shown in the visitor's language
const RELATIONSHIPS = [msg('Spouse'), msg('Son'), msg('Daughter'), msg('Father'), msg('Mother'), msg('Brother'), msg('Sister'), msg('Other')];

// Statutory nominee who receives the member's dues if the member dies
export const NomineeForm: React.FC<{ onSaved?: () => void }> = ({ onSaved }) => {
  const { addNominee } = useApp();
  const { t } = useT();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await addNominee({ name, relationship, phone, idProofNumber });
    setIsSaving(false);
    if (ok) onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="nominee-name" className="block text-[11px] font-bold text-gray-700 mb-1">{t("Nominee Full Name")}</label>
          <input id="nominee-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder={t("e.g. Lakshmi Kumar")} required />
        </div>
        <div>
          <label htmlFor="nominee-relationship" className="block text-[11px] font-bold text-gray-700 mb-1">{t("Relationship")}</label>
          <select id="nominee-relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} className={inputClass} required>
            <option value="">{t("Select")}</option>
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>{t(r)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nominee-phone" className="block text-[11px] font-bold text-gray-700 mb-1">{t("Mobile Number")}</label>
          <input id="nominee-phone" type="tel" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} className={inputClass} placeholder="9876543210" required />
        </div>
        <div>
          <label htmlFor="nominee-id" className="block text-[11px] font-bold text-gray-700 mb-1">{t("ID Proof Number (optional)")}</label>
          <input id="nominee-id" value={idProofNumber} onChange={(e) => setIdProofNumber(e.target.value.toUpperCase())} className={inputClass} placeholder={t("PAN / Voter ID")} />
        </div>
      </div>
      <button type="submit" disabled={isSaving} className="bg-[#123d33] hover:bg-[#0c2922] text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer disabled:opacity-60">
        {isSaving ? t('Saving...') : t('Save Nominee')}
      </button>
    </form>
  );
};
