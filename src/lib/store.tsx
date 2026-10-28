'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { msg, useT } from './i18n';
import type {
  UserProfile, CustomerKYC, BankAccount, Nominee, ChitGroup, ChitSubscriber,
  Installment, PaymentRecord, AuctionEvent, PayoutRequest, DigitalDocument,
  NotificationItem, LedgerEntry, SupportTicket, AuditLogEntry, UserRole, ChitAgreement,
  KycSubmission, KycFileType,
} from './types';

type Row = Record<string, unknown>;
type AsyncAction = Promise<boolean>;
// true on success, otherwise the message to show the customer
type AuthResult = true | string;
type PaymentMode = 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER';
type TicketCategory = 'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER';
const str = (value: unknown) => value == null ? '' : String(value);
const num = (value: unknown) => Number(value ?? 0);
const date = (value: unknown) => str(value).slice(0, 10);
const stamp = (value: unknown) => str(value).replace('T', ' ').slice(0, 16);
// Fills {name} placeholders; the template stays the translation key, so the shown message can be translated back
const format = (template: string, vars: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? '');
const AUDIT_LOG_LIMIT = 500;
// Audit details are either { field: { from, to } } for updates or the whole row for creates/deletes
const auditDetails = (value: unknown) => {
  if (!value || typeof value !== 'object') return str(value);
  return Object.entries(value as Row)
    .filter(([key, v]) => v != null && !['id', 'created_at', 'updated_at'].includes(key))
    .map(([key, v]) => {
      const change = v as { from?: unknown; to?: unknown };
      return typeof v === 'object' && 'to' in change ? `${key}: ${str(change.from) || '—'} → ${str(change.to) || '—'}` : `${key}: ${str(v)}`;
    })
    .join('; ');
};
async function loadRows(name: string): Promise<Row[]> {
  const all: Row[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from(name).select('*').order('id').range(offset, offset + 999);
    if (error) {
      // Tables from optional migrations load as empty until those migrations are applied
      if (name === 'admin_users' || name === 'chit_agreements') return [];
      throw new Error(`${name}: ${error.message}`);
    }
    const batch = (data ?? []) as Row[];
    all.push(...batch);
    if (batch.length < 1000) return all;
  }
}

const ANY_DOCUMENT = ['application/pdf', 'image/jpeg', 'image/png'];
const IMAGE_ONLY = ['image/jpeg', 'image/png'];
const KYC_FILES: { type: KycFileType; label: string; accept: string[] }[] = [
  { type: 'PAN_CARD', label: msg('PAN card'), accept: ANY_DOCUMENT },
  { type: 'AADHAAR_FRONT', label: msg('Aadhaar front'), accept: ANY_DOCUMENT },
  { type: 'AADHAAR_BACK', label: msg('Aadhaar back'), accept: ANY_DOCUMENT },
  { type: 'PHOTOGRAPH', label: msg('Photograph'), accept: IMAGE_ONLY },
  { type: 'BANK_PROOF', label: msg('Cancelled cheque'), accept: ANY_DOCUMENT },
];
const fileProblem = (file: File | null, label: string, accept: string[]) => {
  if (!file) return format(msg('Select your {label} file.'), { label });
  if (!accept.includes(file.type)) return format(accept === IMAGE_ONLY ? msg('Your {label} must be a JPG or PNG image.') : msg('Your {label} must be a PDF, JPG or PNG file.'), { label });
  if (file.size > 10 * 1024 * 1024) return format(msg('Your {label} file must be 10 MB or smaller.'), { label });
  return '';
};
const validateKYC = ({ pan, aadhaar, files }: KycSubmission) => {
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase())) return msg('Enter a valid 10-character PAN (e.g. ABCDE1234F).');
  if (aadhaar.replace(/\D/g, '').length !== 12) return msg('Enter your 12-digit Aadhaar number.');
  for (const { type, label, accept } of KYC_FILES) {
    const problem = fileProblem(files[type], label, accept);
    if (problem) return problem;
  }
  return '';
};
// Files go in the private bucket under the owner's folder, which the storage policies require
async function uploadPrivateFile(userId: string, file: File) {
  const path = `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const uploaded = await supabase.storage.from('kyc-documents').upload(path, file, { contentType: file.type });
  if (uploaded.error) throw uploaded.error;
  return path;
}
// Saves the KYC details and documents, replacing any earlier submission, and queues them for approval
async function uploadKYC(userId: string, { pan, aadhaar, files }: KycSubmission) {
  const { data: kyc, error } = await supabase.from('customer_kyc').upsert({ user_id: userId,
    pan_number: pan.trim().toUpperCase(), aadhaar_last4: aadhaar.replace(/\D/g, '').slice(-4), status: 'NOT_SUBMITTED',
    verified_by: null, verified_at: null, submitted_at: null, rejection_reason: null }, { onConflict: 'user_id' }).select('id').single();
  if (error) throw error.code === '23505' ? new Error(msg('This PAN is already registered with another account.')) : error;
  const { data: previous } = await supabase.from('kyc_documents').select('file_path').eq('kyc_id', kyc.id);
  if (previous?.length) {
    await supabase.storage.from('kyc-documents').remove(previous.map(d => str(d.file_path)));
    const removed = await supabase.from('kyc_documents').delete().eq('kyc_id', kyc.id);
    if (removed.error) throw removed.error;
  }
  for (const { type } of KYC_FILES) {
    const file = files[type] as File;
    const document = await supabase.from('kyc_documents').insert({
      kyc_id: kyc.id, document_type: type, file_path: await uploadPrivateFile(userId, file),
      file_name: file.name, mime_type: file.type,
    });
    if (document.error) throw document.error;
  }
  const submitted = await supabase.from('customer_kyc').update({ status: 'PENDING_APPROVAL', submitted_at: new Date().toISOString() }).eq('id', kyc.id);
  if (submitted.error) throw submitted.error;
}
// Customers can only sign in once a KYC officer has approved their registration
const approvalBlock = (kyc: Row | null) => {
  switch (kyc?.status) {
    case 'VERIFIED': return '';
    case 'PENDING_APPROVAL': return msg('Your registration is waiting for admin approval. You can sign in once your KYC is approved.');
    case 'REJECTED': return format(msg('Your KYC was rejected: {reason}. Register again with the same email and password to resubmit your documents.'), { reason: str(kyc.rejection_reason) });
    default: return msg('Your KYC documents were not received. Register again with the same email and password to upload them.');
  }
};
const ownKYC = async (userId: string) =>
  (await supabase.from('customer_kyc').select('status,rejection_reason').eq('user_id', userId).maybeSingle()).data as Row | null;

interface AppContextType {
  isLoaded: boolean;
  operationError: string;
  customerUser: UserProfile | null;
  adminUser: UserProfile | null;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  customerLogin: (email: string, password: string) => Promise<AuthResult>;
  customerSignUp: (name: string, email: string, phone: string, password: string, kyc: KycSubmission) => Promise<AuthResult>;
  customerLogout: () => Promise<void>;
  adminLogin: (email: string, password: string) => AsyncAction;
  adminLogout: () => Promise<void>;
  groups: ChitGroup[];
  subscribers: ChitSubscriber[];
  installments: Installment[];
  payments: PaymentRecord[];
  kycList: CustomerKYC[];
  bankAccounts: BankAccount[];
  nominees: Nominee[];
  agreements: ChitAgreement[];
  auctions: AuctionEvent[];
  payouts: PayoutRequest[];
  documents: DigitalDocument[];
  notifications: NotificationItem[];
  ledger: LedgerEntry[];
  tickets: SupportTicket[];
  auditLogs: AuditLogEntry[];
  customers: UserProfile[];
  createChitGroup: (group: Partial<ChitGroup>) => AsyncAction;
  deleteChitGroup: (id: string) => AsyncAction;
  joinChitGroup: (id: string, signedName: string) => AsyncAction;
  staffEnrollSubscriber: (groupId: string, userId: string) => AsyncAction;
  approveKYC: (id: string) => AsyncAction;
  rejectKYC: (id: string, reason: string) => AsyncAction;
  addBankAccount: (account: Omit<BankAccount, 'id' | 'userId' | 'isVerified' | 'proofPath' | 'rejectionReason'>, proof: File | null) => AsyncAction;
  removeBankAccount: (id: string) => AsyncAction;
  verifyBankAccount: (id: string) => AsyncAction;
  rejectBankAccount: (id: string, reason: string) => AsyncAction;
  addNominee: (nominee: Omit<Nominee, 'id' | 'userId'>) => AsyncAction;
  removeNominee: (id: string) => AsyncAction;
  payInstallment: (id: string, mode: PaymentMode) => AsyncAction;
  scheduleAuction: (groupId: string, month: number, when: string) => AsyncAction;
  placeAuctionBid: (auctionId: string, amount: number) => AsyncAction;
  finalizeAuction: (id: string) => AsyncAction;
  makerApprovePayout: (id: string, notes: string) => AsyncAction;
  checkerReleasePayout: (id: string, notes: string) => AsyncAction;
  createSupportTicket: (subject: string, category: TicketCategory, message: string) => AsyncAction;
  replySupportTicket: (id: string, message: string) => AsyncAction;
  markNotificationRead: (id: string) => AsyncAction;
  openKYCDocument: (path: string) => AsyncAction;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const staffRoles: UserRole[] = ['SUPER_ADMIN', 'FINANCE_MANAGER', 'KYC_OFFICER', 'SUPPORT_AGENT'];
const profile = (row: Row): UserProfile => ({
  id: str(row.id), fullName: str(row.full_name), email: str(row.email),
  phone: str(row.phone_number), role: str(row.role) as UserRole,
  avatarUrl: str(row.avatar_url), joinedDate: date(row.created_at),
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useT();
  const [isLoaded, setIsLoaded] = useState(false);
  const [operationError, setOperationError] = useState('');
  const [customerUser, setCustomerUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [subscribers, setSubscribers] = useState<ChitSubscriber[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [kycList, setKycList] = useState<CustomerKYC[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [agreements, setAgreements] = useState<ChitAgreement[]>([]);
  const [auctions, setAuctions] = useState<AuctionEvent[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [documents, setDocuments] = useState<DigitalDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);

  const refresh = useCallback(async () => {
    const groupRows = (await loadRows('chit_groups')).sort((a, b) => str(b.created_at).localeCompare(str(a.created_at)));
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError && authError.name !== 'AuthSessionMissingError') throw authError;
    const userId = authData.user?.id;
    const showSignedOut = () => {
      setCustomerUser(null); setAdminUser(null); setCustomers([]);
      setSubscribers([]); setInstallments([]); setPayments([]); setKycList([]);
      setBankAccounts([]); setNominees([]); setAgreements([]); setAuctions([]); setPayouts([]);
      setDocuments([]); setNotifications([]); setLedger([]); setTickets([]); setAuditLogs([]);
      setGroups(groupRows.map(g => mapGroup(g, 0, null)));
    };
    if (!userId) { showSignedOut(); return; }

    const { data: adminRow } = await supabase.from('admin_users').select('*').eq('id', userId).maybeSingle();
    let currentAdmin: UserProfile | null = null;
    let currentCustomer: UserProfile | null = null;
    if (adminRow) {
      if (!adminRow.is_active) throw new Error(msg('This account is inactive. Contact the administrator.'));
      currentAdmin = profile(adminRow as Row);
    } else {
      const { data: own, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (profileError) throw profileError;
      if (own) {
        if (!own.is_active) throw new Error(msg('This account is inactive. Contact the administrator.'));
        const current = profile(own as Row);
        if (current.role === 'CUSTOMER' && !approvalBlock(await ownKYC(userId))) currentCustomer = current;
        if (staffRoles.includes(current.role)) currentAdmin = current;
      }
    }
    // A customer whose KYC is not approved yet is treated as signed out
    if (!currentCustomer && !currentAdmin) { showSignedOut(); return; }
    setCustomerUser(currentCustomer);
    setAdminUser(currentAdmin);

    const names = [
      'admin_users', 'profiles', 'chit_subscribers', 'installments', 'payments', 'customer_kyc',
      'kyc_documents', 'customer_bank_accounts', 'nominees', 'auctions', 'auction_bids',
      'prizes', 'payouts', 'payout_approvals', 'guarantors', 'documents', 'notifications',
      'ledger_entries', 'support_tickets', 'support_ticket_messages', 'chit_agreements',
    ] as const;
    // The audit log grows with every change, so only the latest entries are loaded
    const [results, audit] = await Promise.all([
      Promise.all(names.map(loadRows)),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(AUDIT_LOG_LIMIT),
    ]);
    if (audit.error) throw new Error(`audit_logs: ${audit.error.message}`);
    const rows = Object.fromEntries(names.map((name, index) => [name, results[index]])) as Record<typeof names[number], Row[]>;
    const adminUsers = (rows.admin_users ?? []).map(profile);
    const profiles = rows.profiles.map(profile);
    const allUsers = [...profiles, ...adminUsers];
    const nameFor = (id: unknown) => allUsers.find(p => p.id === id)?.fullName ?? 'Member';
    const subscribersMapped: ChitSubscriber[] = rows.chit_subscribers.map(s => ({
      id: str(s.id), groupId: str(s.group_id), userId: str(s.user_id), userName: nameFor(s.user_id),
      seatNumber: num(s.seat_number), status: str(s.status) as ChitSubscriber['status'],
      hasWonAuction: Boolean(s.has_won_auction), wonMonth: s.won_auction_month == null ? undefined : num(s.won_auction_month),
      totalPaid: 0, joinedDate: date(s.joined_at),
    }));
    const groupFor = (id: unknown) => groupRows.find(g => g.id === id);
    const installmentsMapped: Installment[] = rows.installments.map(i => ({
      id: str(i.id), groupId: str(i.group_id), groupCode: str(groupFor(i.group_id)?.group_code),
      subscriberId: str(i.subscriber_id), userId: subscribersMapped.find(s => s.id === i.subscriber_id)?.userId ?? '',
      monthNumber: num(i.month_number), dueDate: date(i.due_date), grossAmount: num(i.gross_amount),
      dividendDiscount: num(i.dividend_discount), netPayable: num(i.net_payable), penaltyAmount: num(i.penalty_amount),
      paidAmount: num(i.paid_amount), status: str(i.status) as Installment['status'], paidDate: date(i.updated_at),
    }));
    const paymentsMapped: PaymentRecord[] = rows.payments.map(p => ({
      id: str(p.id), transactionRef: str(p.transaction_ref), installmentId: str(p.installment_id),
      userId: str(p.user_id), groupCode: installmentsMapped.find(i => i.id === p.installment_id)?.groupCode ?? '',
      monthNumber: installmentsMapped.find(i => i.id === p.installment_id)?.monthNumber ?? 0,
      amountPaid: num(p.amount_paid), paymentMode: str(p.payment_mode) as PaymentRecord['paymentMode'],
      gatewayRef: str(p.gateway_payment_id), receiptNumber: str(p.receipt_number),
      status: str(p.status) as PaymentRecord['status'], paidAt: stamp(p.paid_at ?? p.created_at),
    }));
    for (const subscriber of subscribersMapped) {
      subscriber.totalPaid = paymentsMapped.filter(p => p.userId === subscriber.userId && installmentsMapped.some(i => i.id === p.installmentId && i.subscriberId === subscriber.id) && ['SUCCESS', 'RECONCILED'].includes(p.status)).reduce((sum, p) => sum + p.amountPaid, 0);
    }
    const bankMapped: BankAccount[] = rows.customer_bank_accounts.map(b => ({
      id: str(b.id), userId: str(b.user_id), accountHolder: str(b.account_holder_name),
      accountNumber: str(b.account_number), ifscCode: str(b.ifsc_code), bankName: str(b.bank_name),
      branch: str(b.branch_name), isVerified: Boolean(b.is_verified),
      proofPath: str(b.proof_path), rejectionReason: str(b.rejection_reason),
    }));
    const auctionsMapped: AuctionEvent[] = rows.auctions.map(a => {
      const group = groupFor(a.group_id);
      const winner = subscribersMapped.find(s => s.id === a.winning_subscriber_id);
      return {
        id: str(a.id), groupId: str(a.group_id), groupCode: str(group?.group_code), groupName: str(group?.group_name),
        monthNumber: num(a.month_number), auctionDate: stamp(a.auction_date), status: str(a.status) as AuctionEvent['status'],
        winningBidDiscount: num(a.winning_bid_discount), winningSubscriberId: str(a.winning_subscriber_id),
        winningSubscriberName: winner?.userName, winningSeatNumber: winner?.seatNumber, foremanFee: num(a.foreman_fee),
        totalDividendPool: num(a.total_dividend_pool), dividendPerMember: num(a.dividend_per_member), netPrizeAmount: num(a.net_prize_amount),
        bids: rows.auction_bids.filter(b => b.auction_id === a.id).map(b => {
          const bidder = subscribersMapped.find(s => s.id === b.subscriber_id);
          return { id: str(b.id), auctionId: str(a.id), subscriberId: str(b.subscriber_id),
            subscriberName: bidder?.userName ?? 'Member', seatNumber: bidder?.seatNumber ?? 0,
            bidDiscountAmount: num(b.bid_discount_amount), timestamp: stamp(b.bid_timestamp) };
        }),
      };
    });
    setGroups(groupRows.map(g => mapGroup(g, subscribersMapped.filter(s => s.groupId === g.id).length,
      auctionsMapped.filter(a => a.groupId === g.id).sort((a, b) => a.auctionDate.localeCompare(b.auctionDate))[0] ?? null)));
    setCustomers(profiles.filter(p => p.role === 'CUSTOMER'));
    setSubscribers(subscribersMapped); setInstallments(installmentsMapped); setPayments(paymentsMapped);
    setKycList(rows.customer_kyc.map(k => {
      const applicant = allUsers.find(p => p.id === k.user_id);
      return {
        id: str(k.id),
        userId: str(k.user_id),
        userName: applicant?.fullName || nameFor(k.user_id),
        userEmail: applicant?.email || '',
        userPhone: applicant?.phone || '',
        panNumber: str(k.pan_number),
        aadhaarNumber: k.aadhaar_last4 ? `•••• •••• ${str(k.aadhaar_last4)}` : '',
        status: str(k.status) as CustomerKYC['status'],
        rejectionReason: str(k.rejection_reason),
        verifiedBy: nameFor(k.verified_by),
        verifiedAt: stamp(k.verified_at),
        submittedAt: stamp(k.submitted_at),
        documents: rows.kyc_documents.filter(d => d.kyc_id === k.id).map(d => ({
          type: str(d.document_type) as CustomerKYC['documents'][number]['type'],
          fileName: str(d.file_name),
          fileUrl: str(d.file_path),
          uploadedAt: date(d.uploaded_at),
        })),
      };
    }));
    setBankAccounts(bankMapped);
    setAgreements(rows.chit_agreements.map(a => {
      const terms = (a.terms ?? {}) as Row;
      return { id: str(a.id), subscriberId: str(a.subscriber_id), groupId: str(a.group_id), userId: str(a.user_id),
        version: str(a.agreement_version), signedName: str(a.signed_name), signedAt: stamp(a.signed_at),
        terms: { groupCode: str(terms.group_code), groupName: str(terms.group_name), totalValue: num(terms.total_value),
          durationMonths: num(terms.duration_months), monthlyContribution: num(terms.monthly_contribution),
          totalMembers: num(terms.total_members), foremanCommissionPercent: num(terms.foreman_commission_percent),
          minBidPercent: num(terms.min_bid_discount_percent), maxBidPercent: num(terms.max_bid_discount_percent),
          startDate: date(terms.start_date), seatNumber: num(terms.seat_number) } };
    }));
    setNominees(rows.nominees.map(n => ({ id: str(n.id), userId: str(n.user_id), name: str(n.nominee_name),
      relationship: str(n.relationship), phone: str(n.phone_number), idProofNumber: str(n.id_proof_number) })));
    setAuctions(auctionsMapped);
    setPayouts(rows.payouts.map(p => {
      const prize = rows.prizes.find(x => x.id === p.prize_id);
      const winner = subscribersMapped.find(s => s.id === prize?.winner_subscriber_id);
      const approval = rows.payout_approvals.find(x => x.payout_id === p.id);
      return { id: str(p.id), groupId: str(prize?.group_id), groupCode: str(groupFor(prize?.group_id)?.group_code),
        winnerSubscriberId: str(prize?.winner_subscriber_id), winnerName: winner?.userName ?? 'Member',
        winnerPhone: profiles.find(x => x.id === winner?.userId)?.phone ?? '',
        monthNumber: auctionsMapped.find(a => a.id === prize?.auction_id)?.monthNumber ?? 0,
        prizeAmount: num(prize?.net_payout_amount), status: str(p.status) as PayoutRequest['status'],
        bankDetails: bankMapped.find(b => b.id === p.bank_account_id) ?? { id: '', userId: winner?.userId ?? '', accountHolder: '', accountNumber: '', ifscCode: '', bankName: '', branch: '', isVerified: false, proofPath: '' },
        guarantors: rows.guarantors.filter(g => g.payout_id === p.id).map(g => ({ id: str(g.id), payoutId: str(p.id), name: str(g.guarantor_name), phone: str(g.phone_number), relationship: str(g.relationship), occupation: str(g.occupation), monthlyIncome: num(g.monthly_income), documentType: str(g.document_type) as PayoutRequest['guarantors'][number]['documentType'], documentRef: str(g.document_ref), verified: Boolean(g.verified) })),
        makerUserId: str(approval?.maker_user_id), makerApprovedAt: stamp(approval?.maker_approved_at), makerNotes: str(approval?.maker_notes),
        checkerUserId: str(approval?.checker_user_id), checkerApprovedAt: stamp(approval?.checker_approved_at), checkerNotes: str(approval?.checker_notes),
        disbursedRef: str(p.payout_ref), requestedAt: stamp(p.created_at),
      };
    }));
    setDocuments(rows.documents.map(d => ({ id: str(d.id), userId: str(d.user_id), groupId: str(d.group_id),
      documentType: str(d.document_type) as DigitalDocument['documentType'], title: str(d.title),
      referenceNumber: '', generatedAt: date(d.generated_at), downloadUrl: str(d.file_path) })));
    setNotifications(rows.notifications.map(n => ({ id: str(n.id), userId: str(n.user_id), title: str(n.title), message: str(n.message),
      channel: str(n.channel) as NotificationItem['channel'], isRead: Boolean(n.is_read), timestamp: stamp(n.created_at) })));
    setLedger(rows.ledger_entries.map(l => ({ id: str(l.id), entryNumber: str(l.entry_number), groupId: str(l.group_id),
      groupCode: str(groupFor(l.group_id)?.group_code), userId: str(l.user_id), userName: nameFor(l.user_id),
      accountType: str(l.account_type) as LedgerEntry['accountType'], debitAmount: num(l.debit_amount), creditAmount: num(l.credit_amount),
      narration: str(l.narration), timestamp: stamp(l.transaction_date) })));
    setTickets(rows.support_tickets.map(t => ({ id: str(t.id), ticketCode: str(t.ticket_code), userId: str(t.user_id),
      userName: nameFor(t.user_id), subject: str(t.subject), category: str(t.category) as TicketCategory,
      priority: str(t.priority) as SupportTicket['priority'], status: str(t.status) as SupportTicket['status'],
      messages: rows.support_ticket_messages.filter(m => m.ticket_id === t.id).map(m => ({ sender: str(m.sender_type) as 'CUSTOMER' | 'SUPPORT', senderName: nameFor(m.sender_id), text: str(m.message), timestamp: stamp(m.created_at) })),
      createdAt: stamp(t.created_at), updatedAt: stamp(t.updated_at) })));
    setAuditLogs(((audit.data ?? []) as Row[]).map(a => ({
      id: str(a.id), actorId: str(a.actor_id), actorName: a.actor_id ? nameFor(a.actor_id) : 'System',
      actorRole: str(a.actor_role) as UserRole, action: str(a.action), resourceType: str(a.resource_type),
      resourceId: str(a.resource_id), ipAddress: str(a.ip_address), details: auditDetails(a.details), timestamp: stamp(a.created_at) })));
  }, []);

  useEffect(() => {
    let active = true;
    const load = () => refresh().catch(error => { if (active) setOperationError(error.message ?? msg('Database loading failed')); })
      .finally(() => { if (active) setIsLoaded(true); });
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { window.setTimeout(() => { if (active) void load(); }, 0); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [refresh]);

  const mutate = async (action: () => Promise<void>): AsyncAction => {
    try { setOperationError(''); await action(); await refresh(); return true; }
    catch (error) { setOperationError(error instanceof Error ? error.message : msg('Database request failed')); return false; }
  };
  const fail = (message: string): AsyncAction => { setOperationError(message); return Promise.resolve(false); };
  const adminLogin = (email: string, password: string): AsyncAction => mutate(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id ?? '';

    const { data: adminRow } = await supabase.from('admin_users').select('role,is_active').eq('id', uid).maybeSingle();
    if (adminRow) {
      if (!adminRow.is_active || !staffRoles.includes(adminRow.role as UserRole)) {
        await supabase.auth.signOut();
        throw new Error('This account has no staff access.');
      }
      return;
    }
    const { data: row, error: profileError } = await supabase.from('profiles').select('role,is_active').eq('id', uid).maybeSingle();
    if (profileError || !row || !row.is_active || !staffRoles.includes(row.role as UserRole)) {
      await supabase.auth.signOut();
      throw new Error('This account has no staff access.');
    }
  });
  // Signs in, returning the message to show if the account can't use the portal (yet)
  const customerSession = async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return error.code === 'invalid_credentials' ? msg('Invalid email or password.') : error.message;
    const { data: row } = await supabase.from('profiles').select('role,is_active').eq('id', data.user.id).maybeSingle();
    if (!row || row.role !== 'CUSTOMER') return msg('Use the staff sign-in for this account.');
    if (!row.is_active) return msg('This account is inactive. Contact the administrator.');
    return true;
  };
  const customerLogin = async (email: string, password: string): Promise<AuthResult> => {
    setOperationError('');
    const session = await customerSession(email, password);
    const { data: auth } = await supabase.auth.getUser();
    const blocked = session === true ? approvalBlock(await ownKYC(auth.user?.id ?? '')) : session;
    if (blocked) { await supabase.auth.signOut(); await refresh().catch(() => {}); return blocked; }
    try { await refresh(); return true; }
    catch (loadError) { return loadError instanceof Error ? loadError.message : msg('Unable to load account'); }
  };
  // Registration uploads the KYC documents, then signs out until an admin approves them.
  // Registering again with the same email and password resubmits KYC for a rejected or incomplete account.
  const customerSignUp = async (name: string, email: string, phone: string, password: string, kyc: KycSubmission): Promise<AuthResult> => {
    setOperationError('');
    const invalid = validateKYC(kyc);
    if (invalid) return invalid;
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password,
      options: { data: { full_name: name.trim(), phone_number: phone.trim() } } });
    const exists = error?.code === 'user_already_exists' || error?.code === 'email_exists';
    if (error && !exists) return error.message;
    try {
      if (!data.session) {
        const session = await customerSession(email, password);
        if (session !== true) return exists && session === msg('Invalid email or password.') ? msg('An account with this email already exists. Sign in instead.') : session;
      }
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id ?? '';
      const status = (await ownKYC(userId))?.status;
      if (status === 'VERIFIED') return msg('This account is already approved. Please sign in.');
      await uploadKYC(userId, kyc);
      return true;
    } catch (uploadError) {
      return format(msg('{error} — please try again with the same email and password.'), { error: uploadError instanceof Error ? uploadError.message : msg('KYC upload failed') });
    } finally {
      await supabase.auth.signOut();
      await refresh().catch(() => {});
    }
  };
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) setOperationError(error.message); await refresh().catch(() => {}); };
  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signup') => { setAuthModalMode(mode); setAuthModalOpen(true); }, []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const createChitGroup = (group: Partial<ChitGroup>) => mutate(async () => {
    const total = group.totalValue ?? 100000; const members = group.totalMembers ?? group.durationMonths ?? 20;
    const contribution = total / members;
    const { error } = await supabase.from('chit_groups').insert({
      group_code: group.groupCode ?? `CF-${Math.round(total / 1000)}K-${Date.now().toString(36).slice(-6)}`,
      group_name: group.groupName ?? `ChitFund Scheme ₹${total}`, total_value: total, duration_months: members,
      monthly_contribution: contribution, total_members: members, max_tickets_per_person: group.maxTicketsPerPerson ?? 3,
      start_date: group.startDate ?? new Date().toISOString().slice(0, 10), status: 'RECRUITING', created_by: adminUser?.id,
    });
    if (error) throw error;
  });
  const deleteChitGroup = (id: string) => mutate(async () => {
    const { error } = await supabase.from('chit_groups').delete().eq('id', id); if (error) throw error;
  });
  // The customer signs the chit agreement by typing their full name; the database records it with the ticket
  const joinChitGroup = (id: string, signedName: string) => mutate(async () => {
    const { error } = await supabase.rpc('join_chit_group', { p_group_id: id, p_signed_name: signedName.trim() });
    if (error) throw error;
  });
  const staffEnrollSubscriber = (groupId: string, userId: string) => mutate(async () => {
    const { error } = await supabase.rpc('staff_join_chit_group', { p_group_id: groupId, p_user_id: userId });
    if (error) throw error;
  });
  const approveKYC = (id: string) => mutate(async () => { const { error } = await supabase.from('customer_kyc').update({ status: 'VERIFIED', verified_by: adminUser?.id, verified_at: new Date().toISOString() }).eq('id', id); if (error) throw error; });
  const rejectKYC = (id: string, reason: string) => mutate(async () => { const { error } = await supabase.from('customer_kyc').update({ status: 'REJECTED', rejection_reason: reason, verified_by: adminUser?.id, verified_at: new Date().toISOString() }).eq('id', id); if (error) throw error; });
  const addBankAccount = (account: Omit<BankAccount, 'id' | 'userId' | 'isVerified' | 'proofPath' | 'rejectionReason'>, proof: File | null): AsyncAction => {
    if (!customerUser) return fail(msg('Sign in before adding a bank account.'));
    const accountNumber = account.accountNumber.replace(/\s/g, '');
    const ifsc = account.ifscCode.trim().toUpperCase();
    if (!account.accountHolder.trim() || !account.bankName.trim()) return fail(msg('Enter the account holder name and bank name.'));
    if (!/^[0-9]{9,18}$/.test(accountNumber)) return fail(msg('Enter a valid account number (9 to 18 digits).'));
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return fail(msg('Enter a valid 11-character IFSC code (e.g. SBIN0001234).'));
    const problem = fileProblem(proof, msg('Cancelled cheque or passbook page'), ANY_DOCUMENT);
    if (problem) return fail(problem);
    return mutate(async () => {
      const proofPath = await uploadPrivateFile(customerUser.id, proof as File);
      const { error } = await supabase.from('customer_bank_accounts').insert({ user_id: customerUser.id,
        account_holder_name: account.accountHolder.trim(), account_number: accountNumber, ifsc_code: ifsc,
        bank_name: account.bankName.trim(), branch_name: account.branch.trim() || null, proof_path: proofPath,
        is_primary: !bankAccounts.some(b => b.userId === customerUser.id) });
      if (error) {
        await supabase.storage.from('kyc-documents').remove([proofPath]);
        throw error.code === '23505' ? new Error(msg('This bank account is already added.')) : error;
      }
    });
  };
  const removeBankAccount = (id: string) => mutate(async () => {
    const proof = bankAccounts.find(b => b.id === id)?.proofPath;
    const { error } = await supabase.from('customer_bank_accounts').delete().eq('id', id); if (error) throw error;
    if (proof) await supabase.storage.from('kyc-documents').remove([proof]);
  });
  const verifyBankAccount = (id: string) => mutate(async () => { const { error } = await supabase.from('customer_bank_accounts').update({ is_verified: true, rejection_reason: null, verified_by: adminUser?.id, verified_at: new Date().toISOString() }).eq('id', id); if (error) throw error; });
  const rejectBankAccount = (id: string, reason: string) => mutate(async () => { const { error } = await supabase.from('customer_bank_accounts').update({ is_verified: false, rejection_reason: reason, verified_by: null, verified_at: null }).eq('id', id); if (error) throw error; });
  const addNominee = (nominee: Omit<Nominee, 'id' | 'userId'>): AsyncAction => {
    if (!customerUser) return fail(msg('Sign in before adding a nominee.'));
    const phone = nominee.phone.replace(/\D/g, '');
    if (!nominee.name.trim() || !nominee.relationship.trim()) return fail(msg('Enter the nominee\'s name and relationship.'));
    if (phone.length !== 10) return fail(msg('Enter the nominee\'s 10-digit mobile number.'));
    return mutate(async () => {
      const { error } = await supabase.from('nominees').insert({ user_id: customerUser.id, nominee_name: nominee.name.trim(),
        relationship: nominee.relationship.trim(), phone_number: phone, id_proof_number: nominee.idProofNumber?.trim() || null });
      if (error) throw error;
    });
  };
  const removeNominee = (id: string) => mutate(async () => { const { error } = await supabase.from('nominees').delete().eq('id', id); if (error) throw error; });
  const payInstallment = () => fail(msg('Online payment is unavailable until a verified payment gateway and webhook are configured. No money was charged or marked as paid.'));
  const scheduleAuction = (groupId: string, month: number, when: string) => mutate(async () => { const { error } = await supabase.from('auctions').insert({ group_id: groupId, month_number: month, auction_date: new Date(when).toISOString(), conducted_by: adminUser?.id }); if (error) throw error; });
  const placeAuctionBid = (auctionId: string, amount: number): AsyncAction => {
    const auction = auctions.find(a => a.id === auctionId);
    const sub = subscribers.find(s => s.groupId === auction?.groupId && s.userId === customerUser?.id && !s.hasWonAuction);
    if (!sub) return fail(msg('You need an eligible ticket in this group to bid.'));
    return mutate(async () => { const { error } = await supabase.from('auction_bids').insert({ auction_id: auctionId, group_id: auction?.groupId, subscriber_id: sub.id, bid_discount_amount: amount }); if (error) throw error; });
  };
  const finalizeAuction = (id: string) => mutate(async () => {
    const { error } = await supabase.rpc('finalize_chit_auction', { p_auction_id: id }); if (error) throw error;
  });
  const makerApprovePayout = (id: string, notes: string) => mutate(async () => {
    const { error } = await supabase.rpc('maker_approve_payout', { p_payout_id: id, p_notes: notes }); if (error) throw error;
  });
  const checkerReleasePayout = () => fail('A checker sign-off and verified bank transfer reference are required before release. No funds were released.');
  const createSupportTicket = (subject: string, category: TicketCategory, message: string) => mutate(async () => {
    if (!customerUser) throw new Error(msg('Sign in before opening a support ticket.'));
    const { data: ticket, error } = await supabase.from('support_tickets').insert({
      ticket_code: `TKT-${Date.now().toString(36).toUpperCase()}`, user_id: customerUser.id, subject, category,
    }).select('id').single();
    if (error) throw error;
    const result = await supabase.from('support_ticket_messages').insert({ ticket_id: ticket.id,
      sender_id: customerUser.id, sender_type: 'CUSTOMER', message });
    if (result.error) throw result.error;
  });
  const replySupportTicket = (id: string, message: string) => mutate(async () => {
    const sender = adminUser ?? customerUser; if (!sender) throw new Error(msg('Sign in to reply.'));
    const { error } = await supabase.from('support_ticket_messages').insert({ ticket_id: id,
      sender_id: sender.id, sender_type: adminUser ? 'SUPPORT' : 'CUSTOMER', message }); if (error) throw error;
  });
  const markNotificationRead = (id: string) => mutate(async () => { const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id); if (error) throw error; });
  const openKYCDocument = async (path: string): AsyncAction => {
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;
    try {
      const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 60);
      if (error) throw error;
      if (tab) tab.location.href = data.signedUrl;
      else window.location.href = data.signedUrl;
      return true;
    } catch (error) {
      tab?.close();
      setOperationError(error instanceof Error ? error.message : msg('Unable to open KYC document'));
      return false;
    }
  };

  return <AppContext.Provider value={{ isLoaded, operationError, customerUser, adminUser, authModalOpen,
    authModalMode, openAuthModal, closeAuthModal, customerLogin, customerSignUp,
    customerLogout: signOut, adminLogin, adminLogout: signOut, groups, subscribers, installments, payments,
    kycList, bankAccounts, nominees, agreements, auctions, payouts, documents, notifications, ledger, tickets,
    auditLogs, customers, createChitGroup, deleteChitGroup, joinChitGroup, staffEnrollSubscriber, approveKYC, rejectKYC,
    addBankAccount, removeBankAccount, verifyBankAccount, rejectBankAccount, addNominee, removeNominee,
    payInstallment, scheduleAuction, placeAuctionBid, finalizeAuction, makerApprovePayout, checkerReleasePayout,
    createSupportTicket, replySupportTicket, markNotificationRead, openKYCDocument }}>
    {children}
    {operationError && <div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-md rounded-xl bg-red-800 p-4 text-sm text-white shadow-xl">
      <button aria-label={t('Dismiss error')} onClick={() => setOperationError('')} className="float-right ml-4">×</button>{t(operationError)}
    </div>}
  </AppContext.Provider>;
};

function mapGroup(g: Row, count: number, nextAuction: AuctionEvent | null): ChitGroup {
  return { id: str(g.id), groupCode: str(g.group_code), groupName: str(g.group_name), totalValue: num(g.total_value),
    durationMonths: num(g.duration_months), monthlyContribution: num(g.monthly_contribution), totalMembers: num(g.total_members),
    currentMemberCount: num(g.current_member_count ?? count), foremanCommissionPercent: num(g.foreman_commission_percent),
    minBidPercent: num(g.min_bid_discount_percent), maxBidPercent: num(g.max_bid_discount_percent),
    startDate: date(g.start_date), status: str(g.status) as ChitGroup['status'], currentMonth: nextAuction?.monthNumber ?? 1,
    nextAuctionDate: nextAuction?.auctionDate ?? '', maxTicketsPerPerson: num(g.max_tickets_per_person), };
}

export const useApp = () => { const context = useContext(AppContext); if (!context) throw new Error('useApp must be used within an AppProvider'); return context; };
