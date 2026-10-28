'use client';

import React, { useEffect, useState } from 'react';
import { FileSignature, Printer, X } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useT } from '@/lib/i18n';
import type { ChitAgreement, ChitGroup } from '@/lib/types';
import { NomineeForm } from '@/components/NomineeForm';

type Terms = ChitAgreement['terms'];
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
// Same comparison the database uses for the typed signature
const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase();

export const termsForGroup = (group: ChitGroup): Terms => ({
  groupCode: group.groupCode, groupName: group.groupName, totalValue: group.totalValue,
  durationMonths: group.durationMonths, monthlyContribution: group.monthlyContribution,
  totalMembers: group.totalMembers, foremanCommissionPercent: group.foremanCommissionPercent,
  minBidPercent: group.minBidPercent, maxBidPercent: group.maxBidPercent, startDate: group.startDate, seatNumber: 0,
});

export const AgreementTerms: React.FC<{ terms: Terms }> = ({ terms }) => {
  const { t } = useT();
  return (
  <div className="space-y-3 text-xs text-gray-700">
    <div className="grid grid-cols-2 gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
      {[
        [t('Scheme'), `${terms.groupName} (${terms.groupCode})`],
        [t('Chit value'), money(terms.totalValue)],
        [t('Monthly subscription'), money(terms.monthlyContribution)],
        [t('Duration'), t('{count} months', { count: terms.durationMonths })],
        [t('Members'), String(terms.totalMembers)],
        [t('Seat'), terms.seatNumber ? `#${terms.seatNumber}` : t('Assigned on joining')],
        [t('Foreman commission'), t('{percent}% of chit value', { percent: terms.foremanCommissionPercent })],
        [t('Bid discount range'), `${terms.minBidPercent}% – ${terms.maxBidPercent}%`],
        [t('Start date'), terms.startDate || t('To be announced')],
      ].map(([label, value]) => (
        <div key={label}>
          <span className="text-[10px] text-gray-400 block">{label}</span>
          <span className="font-semibold text-gray-900">{value}</span>
        </div>
      ))}
    </div>
    <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
      <li>{t('I will pay the monthly subscription of {amount} by each due date for all {months} months. Late payments attract the penalty set out in the scheme bye-laws.', { amount: money(terms.monthlyContribution), months: terms.durationMonths })}</li>
      <li>{t('An auction is held every month. The member offering the highest discount, within the {min}%–{max}% range, wins that month’s prize. The discount, after the foreman’s commission, is shared among members as a dividend.', { min: terms.minBidPercent, max: terms.maxBidPercent })}</li>
      <li>{t('The foreman’s commission is {percent}% of the chit value, as permitted under the Chit Funds Act, 1982.', { percent: terms.foremanCommissionPercent })}</li>
      <li>{t("If I win a prize, it is paid only to my verified bank account, after I provide the guarantor or security the foreman requires. I will keep paying the subscription until the scheme ends.")}</li>
      <li>{t("My registered nominee will receive the amounts due to me if I die.")}</li>
      <li>{t("Default, withdrawal and dispute resolution are governed by the Chit Funds Act, 1982 and the scheme bye-laws.")}</li>
    </ol>
  </div>
  );
};

const useEscape = (onClose: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
};

const Dialog: React.FC<{ title: string; onClose: () => void; className?: string; children: React.ReactNode }> = ({ title, onClose, className = '', children }) => {
  const { t } = useT();
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`bg-white rounded-[24px] p-6 sm:p-7 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl text-left ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#123d33]" />{title}
          </h3>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="print-hidden w-8 h-8 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Joining a group: add a nominee if there is none, then sign the agreement by typing the registered name
export const JoinGroupDialog: React.FC<{ group: ChitGroup; onClose: () => void; onJoined: () => void }> = ({ group, onClose, onJoined }) => {
  const { customerUser, nominees, joinChitGroup } = useApp();
  const { t } = useT();
  const [signedName, setSignedName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  if (!customerUser) return null;
  const hasNominee = nominees.some((n) => n.userId === customerUser.id);
  const nameMatches = normalizeName(signedName) === normalizeName(customerUser.fullName);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameMatches || !agreed) return;
    setIsJoining(true);
    const ok = await joinChitGroup(group.id, signedName);
    setIsJoining(false);
    if (ok) onJoined();
  };

  return (
    <Dialog title={t("Chit Agreement")} onClose={onClose}>
      {!hasNominee ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-600">
            {t("Step 1 of 2: add a nominee before joining. Under the Chit Funds Act, your nominee receives the amounts due to you if you die.")}
          </p>
          <NomineeForm />
        </div>
      ) : (
        <form onSubmit={handleSign} className="space-y-4">
          <p className="text-xs text-gray-600">{t("Read the terms for this scheme, then sign by typing your full name.")}</p>
          <AgreementTerms terms={termsForGroup(group)} />
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label htmlFor="agreement-signature" className="block text-[11px] font-bold text-gray-700">
              {t("Type your full name to sign:")} <span className="text-gray-900">{customerUser.fullName}</span>
            </label>
            <input
              id="agreement-signature"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              placeholder={customerUser.fullName}
              autoComplete="off"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#123d33] focus:ring-1 focus:ring-[#123d33] text-sm italic font-serif text-gray-900"
              required
            />
            {signedName && !nameMatches && (
              <p className="text-[11px] text-rose-600">{t("The name must match your registered name exactly.")}</p>
            )}
            <label className="flex items-start space-x-2 text-[11px] text-gray-600 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded text-[#123d33] cursor-pointer" required />
              <span>{t("I have read and agree to this chit agreement. My typed name is my electronic signature.")}</span>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 cursor-pointer">{t("Cancel")}</button>
            <button type="submit" disabled={isJoining || !nameMatches || !agreed} className="px-5 py-2.5 rounded-xl bg-[#123d33] hover:bg-[#0c2922] text-white font-bold text-xs cursor-pointer disabled:opacity-50">
              {isJoining ? t('Signing...') : t('Sign & Join Scheme')}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
};

export const AgreementViewer: React.FC<{ agreement: ChitAgreement; onClose: () => void }> = ({ agreement, onClose }) => {
  const { t } = useT();
  return (
  <Dialog title={t("Signed Chit Agreement")} onClose={onClose} className="agreement-print">
    <AgreementTerms terms={agreement.terms} />
    <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-0.5">
      <p>{t("Signed electronically by")} <span className="font-serif italic text-sm text-gray-900">{agreement.signedName}</span></p>
      <p>on {agreement.signedAt} • Agreement {agreement.version} • Ref {agreement.id.slice(0, 8).toUpperCase()}</p>
    </div>
    <div className="print-hidden flex justify-end">
      <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-[#123d33] hover:bg-[#0c2922] text-white font-bold text-xs cursor-pointer flex items-center gap-1.5">
        <Printer className="w-3.5 h-3.5" />{t("Print / Save as PDF")}
      </button>
    </div>
  </Dialog>
  );
};
