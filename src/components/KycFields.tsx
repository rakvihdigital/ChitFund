'use client';

import React from 'react';
import { CreditCard, IdCard, ShieldCheck } from 'lucide-react';
import type { KycFileType, KycSubmission } from '@/lib/types';
import { msg, useT } from '@/lib/i18n';

export const emptyKyc: KycSubmission = {
  pan: '',
  aadhaar: '',
  files: { PAN_CARD: null, AADHAAR_FRONT: null, AADHAAR_BACK: null, PHOTOGRAPH: null, BANK_PROOF: null },
};

const inputClass = 'w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-gray-900 font-medium';
const fileClass = 'w-full text-[11px] text-gray-600 border border-gray-300 rounded-lg bg-white file:mr-2 file:py-2 file:px-3 file:border-0 file:border-r file:border-gray-300 file:bg-gray-50 file:text-[11px] file:font-bold file:text-gray-700 cursor-pointer';

const DOCUMENT_TYPES = 'application/pdf,image/jpeg,image/png';
const uploads: { type: KycFileType; label: string; accept: string }[] = [
  { type: 'PAN_CARD', label: msg('PAN Card'), accept: DOCUMENT_TYPES },
  { type: 'PHOTOGRAPH', label: msg('Your Photo / Selfie (JPG/PNG)'), accept: 'image/jpeg,image/png' },
  { type: 'AADHAAR_FRONT', label: msg('Aadhaar Card — Front'), accept: DOCUMENT_TYPES },
  { type: 'AADHAAR_BACK', label: msg('Aadhaar Card — Back'), accept: DOCUMENT_TYPES },
  { type: 'BANK_PROOF', label: msg('Cancelled Cheque'), accept: DOCUMENT_TYPES },
];

// PAN, Aadhaar, photo, cancelled cheque and their documents, collected at registration for admin approval
export const KycFields: React.FC<{ id: string; value: KycSubmission; onChange: (value: KycSubmission) => void }> = ({ id, value, onChange }) => {
  const { t } = useT();
  return (
  <div className="space-y-3 pt-1">
    <div className="flex items-start space-x-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
      <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
      <span>{t("KYC details are required. An admin verifies them before your account can sign in.")}</span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor={`${id}-pan`} className="block text-[11px] font-bold text-gray-700 mb-1">{t("PAN Number")}</label>
        <div className="relative">
          <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id={`${id}-pan`}
            type="text"
            value={value.pan}
            onChange={(e) => onChange({ ...value, pan: e.target.value.toUpperCase() })}
            placeholder={t("ABCDE1234F")}
            maxLength={10}
            autoCapitalize="characters"
            className={`${inputClass} uppercase`}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-aadhaar`} className="block text-[11px] font-bold text-gray-700 mb-1">{t("Aadhaar Number")}</label>
        <div className="relative">
          <IdCard className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id={`${id}-aadhaar`}
            type="text"
            inputMode="numeric"
            value={value.aadhaar}
            onChange={(e) => onChange({ ...value, aadhaar: e.target.value.replace(/[^\d ]/g, '') })}
            placeholder="1234 5678 9012"
            maxLength={14}
            className={inputClass}
            required
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {uploads.map(({ type, label, accept }) => (
        <div key={type}>
          <label htmlFor={`${id}-${type}`} className="block text-[11px] font-bold text-gray-700 mb-1">{t(label)}</label>
          <input
            id={`${id}-${type}`}
            type="file"
            accept={accept}
            onChange={(e) => onChange({ ...value, files: { ...value.files, [type]: e.target.files?.[0] ?? null } })}
            className={fileClass}
            required
          />
        </div>
      ))}
    </div>
  </div>
  );
};
