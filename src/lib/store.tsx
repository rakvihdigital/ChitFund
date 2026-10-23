'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type {
  UserProfile, CustomerKYC, BankAccount, Nominee, ChitGroup, ChitSubscriber,
  Installment, PaymentRecord, AuctionEvent, PayoutRequest, DigitalDocument,
  NotificationItem, LedgerEntry, SupportTicket, AuditLogEntry, UserRole,
} from './types';

type Row = Record<string, unknown>;
type AsyncAction = Promise<boolean>;
type SignUpResult = 'signed-in' | 'confirm-email' | false;
type PaymentMode = 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER';
type TicketCategory = 'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER';
const str = (value: unknown) => value == null ? '' : String(value);
const num = (value: unknown) => Number(value ?? 0);
const date = (value: unknown) => str(value).slice(0, 10);
const stamp = (value: unknown) => str(value).replace('T', ' ').slice(0, 16);
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
      if (name === 'admin_users') return [];
      throw new Error(`${name}: ${error.message}`);
    }
    const batch = (data ?? []) as Row[];
    all.push(...batch);
    if (batch.length < 1000) return all;
  }
}

interface AppContextType {
  isLoaded: boolean;
  operationError: string;
  customerUser: UserProfile | null;
  adminUser: UserProfile | null;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  customerLogin: (email: string, password: string) => AsyncAction;
  customerSignUp: (name: string, email: string, phone: string, password: string) => Promise<SignUpResult>;
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
  joinChitGroup: (id: string, userId?: string) => AsyncAction;
  submitKYC: (pan: string, aadhaar: string, files: File[]) => AsyncAction;
  approveKYC: (id: string) => AsyncAction;
  rejectKYC: (id: string, reason: string) => AsyncAction;
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
    if (!userId) {
      setCustomerUser(null); setAdminUser(null); setCustomers([]);
      setSubscribers([]); setInstallments([]); setPayments([]); setKycList([]);
      setBankAccounts([]); setNominees([]); setAuctions([]); setPayouts([]);
      setDocuments([]); setNotifications([]); setLedger([]); setTickets([]); setAuditLogs([]);
      setGroups(groupRows.map(g => mapGroup(g, 0, null)));
      return;
    }

    const { data: adminRow } = await supabase.from('admin_users').select('*').eq('id', userId).maybeSingle();
    let currentAdmin: UserProfile | null = null;
    let currentCustomer: UserProfile | null = null;
    if (adminRow) {
      if (!adminRow.is_active) throw new Error('This account is inactive. Contact the administrator.');
      currentAdmin = profile(adminRow as Row);
    } else {
      const { data: own, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (profileError) throw profileError;
      if (own) {
        if (!own.is_active) throw new Error('This account is inactive. Contact the administrator.');
        const current = profile(own as Row);
        if (current.role === 'CUSTOMER') currentCustomer = current;
        if (staffRoles.includes(current.role)) currentAdmin = current;
      }
    }
    setCustomerUser(currentCustomer);
    setAdminUser(currentAdmin);

    const names = [
      'admin_users', 'profiles', 'chit_subscribers', 'installments', 'payments', 'customer_kyc',
      'kyc_documents', 'customer_bank_accounts', 'nominees', 'auctions', 'auction_bids',
      'prizes', 'payouts', 'payout_approvals', 'guarantors', 'documents', 'notifications',
      'ledger_entries', 'support_tickets', 'support_ticket_messages', 'audit_logs',
    ] as const;
    const results = await Promise.all(names.map(loadRows));
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
        bankDetails: bankMapped.find(b => b.id === p.bank_account_id) ?? { id: '', userId: winner?.userId ?? '', accountHolder: '', accountNumber: '', ifscCode: '', bankName: '', branch: '', isVerified: false },
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
    setAuditLogs([...rows.audit_logs].sort((a, b) => str(b.created_at).localeCompare(str(a.created_at))).map(a => ({
      id: str(a.id), actorId: str(a.actor_id), actorName: a.actor_id ? nameFor(a.actor_id) : 'System',
      actorRole: str(a.actor_role) as UserRole, action: str(a.action), resourceType: str(a.resource_type),
      resourceId: str(a.resource_id), ipAddress: str(a.ip_address), details: auditDetails(a.details), timestamp: stamp(a.created_at) })));
  }, []);

  useEffect(() => {
    let active = true;
    const load = () => refresh().catch(error => { if (active) setOperationError(error.message ?? 'Database loading failed'); })
      .finally(() => { if (active) setIsLoaded(true); });
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { window.setTimeout(() => { if (active) void load(); }, 0); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [refresh]);

  const mutate = async (action: () => Promise<void>): AsyncAction => {
    try { setOperationError(''); await action(); await refresh(); return true; }
    catch (error) { setOperationError(error instanceof Error ? error.message : 'Database request failed'); return false; }
  };
  const fail = (message: string): AsyncAction => { setOperationError(message); return Promise.resolve(false); };
  const signIn = async (email: string, password: string, staff: boolean): AsyncAction => mutate(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id ?? '';

    if (staff) {
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
    } else {
      const { data: row, error: profileError } = await supabase.from('profiles').select('role,is_active').eq('id', uid).maybeSingle();
      if (profileError || !row || !row.is_active || row.role !== 'CUSTOMER') {
        await supabase.auth.signOut();
        throw new Error('Use the staff sign-in for this account.');
      }
    }
  });
  const customerLogin = (email: string, password: string) => signIn(email, password, false);
  const adminLogin = (email: string, password: string) => signIn(email, password, true);
  const customerSignUp = async (name: string, email: string, phone: string, password: string): Promise<SignUpResult> => {
    setOperationError('');
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password,
      options: { data: { full_name: name.trim(), phone_number: phone.trim() } } });
    if (error) { setOperationError(error.message); return false; }
    if (!data.session) {
      const { data: loginData } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (!loginData?.session) return 'confirm-email';
    }
    try { await refresh(); return 'signed-in'; }
    catch (loadError) { setOperationError(loadError instanceof Error ? loadError.message : 'Unable to load account'); return false; }
  };
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) setOperationError(error.message); await refresh().catch(() => {}); };
  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signup') => { setAuthModalMode(mode); setAuthModalOpen(true); }, []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const createChitGroup = (group: Partial<ChitGroup>) => mutate(async () => {
    const total = group.totalValue ?? 100000; const members = group.totalMembers ?? group.durationMonths ?? 20;
    const contribution = total / members;
    const { error } = await supabase.from('chit_groups').insert({
      group_code: group.groupCode ?? `RAK-${Math.round(total / 1000)}K-${Date.now().toString(36).slice(-6)}`,
      group_name: group.groupName ?? `RAKVIH Scheme ₹${total}`, total_value: total, duration_months: members,
      monthly_contribution: contribution, total_members: members, max_tickets_per_person: group.maxTicketsPerPerson ?? 3,
      start_date: group.startDate ?? new Date().toISOString().slice(0, 10), status: 'RECRUITING', created_by: adminUser?.id,
    });
    if (error) throw error;
  });
  const deleteChitGroup = (id: string) => mutate(async () => {
    const { error } = await supabase.from('chit_groups').delete().eq('id', id); if (error) throw error;
  });
  const joinChitGroup = (id: string, userId?: string): AsyncAction => {
    return mutate(async () => {
      const { error } = userId
        ? await supabase.rpc('staff_join_chit_group', { p_group_id: id, p_user_id: userId })
        : await supabase.rpc('join_chit_group', { p_group_id: id });
      if (error) throw error;
    });
  };
  const submitKYC = (pan: string, aadhaar: string, files: File[]): AsyncAction => {
    if (!customerUser) return fail('Sign in before submitting KYC.');
    if (files.length !== 2) return fail('Select a PAN document and an Aadhaar document before submitting KYC.');
    if (files.some(file => file.size > 10 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type))) return fail('Use PDF, JPG or PNG files up to 10 MB each.');
    const digits = aadhaar.replace(/\D/g, '');
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase()) || digits.length !== 12) return fail('Enter a valid PAN and 12-digit Aadhaar number.');
    return mutate(async () => {
      const { data: kyc, error } = await supabase.from('customer_kyc').upsert({ user_id: customerUser.id,
        pan_number: pan.toUpperCase(), aadhaar_last4: digits.slice(-4), status: 'NOT_SUBMITTED',
        verified_by: null, verified_at: null, submitted_at: null, rejection_reason: null }, { onConflict: 'user_id' }).select('id').single();
      if (error) throw error;
      for (const [index, file] of files.entries()) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${customerUser.id}/${crypto.randomUUID()}-${safeName}`;
        const uploaded = await supabase.storage.from('kyc-documents').upload(path, file, { contentType: file.type });
        if (uploaded.error) throw uploaded.error;
        const document = await supabase.from('kyc_documents').insert({
          kyc_id: kyc.id, document_type: index === 0 ? 'PAN_CARD' : 'AADHAAR_FRONT',
          file_path: path, file_name: file.name, mime_type: file.type,
        });
        if (document.error) throw document.error;
      }
      const submitted = await supabase.from('customer_kyc').update({ status: 'PENDING_APPROVAL', submitted_at: new Date().toISOString() }).eq('id', kyc.id);
      if (submitted.error) throw submitted.error;
    });
  };
  const approveKYC = (id: string) => mutate(async () => { const { error } = await supabase.from('customer_kyc').update({ status: 'VERIFIED', verified_by: adminUser?.id, verified_at: new Date().toISOString() }).eq('id', id); if (error) throw error; });
  const rejectKYC = (id: string, reason: string) => mutate(async () => { const { error } = await supabase.from('customer_kyc').update({ status: 'REJECTED', rejection_reason: reason, verified_by: adminUser?.id, verified_at: new Date().toISOString() }).eq('id', id); if (error) throw error; });
  const payInstallment = () => fail('Online payment is unavailable until a verified payment gateway and webhook are configured. No money was charged or marked as paid.');
  const scheduleAuction = (groupId: string, month: number, when: string) => mutate(async () => { const { error } = await supabase.from('auctions').insert({ group_id: groupId, month_number: month, auction_date: new Date(when).toISOString(), conducted_by: adminUser?.id }); if (error) throw error; });
  const placeAuctionBid = (auctionId: string, amount: number): AsyncAction => {
    const auction = auctions.find(a => a.id === auctionId);
    const sub = subscribers.find(s => s.groupId === auction?.groupId && s.userId === customerUser?.id && !s.hasWonAuction);
    if (!sub) return fail('You need an eligible ticket in this group to bid.');
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
    if (!customerUser) throw new Error('Sign in before opening a support ticket.');
    const { data: ticket, error } = await supabase.from('support_tickets').insert({
      ticket_code: `TKT-${Date.now().toString(36).toUpperCase()}`, user_id: customerUser.id, subject, category,
    }).select('id').single();
    if (error) throw error;
    const result = await supabase.from('support_ticket_messages').insert({ ticket_id: ticket.id,
      sender_id: customerUser.id, sender_type: 'CUSTOMER', message });
    if (result.error) throw result.error;
  });
  const replySupportTicket = (id: string, message: string) => mutate(async () => {
    const sender = adminUser ?? customerUser; if (!sender) throw new Error('Sign in to reply.');
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
      setOperationError(error instanceof Error ? error.message : 'Unable to open KYC document');
      return false;
    }
  };

  return <AppContext.Provider value={{ isLoaded, operationError, customerUser, adminUser, authModalOpen,
    authModalMode, openAuthModal, closeAuthModal, customerLogin, customerSignUp,
    customerLogout: signOut, adminLogin, adminLogout: signOut, groups, subscribers, installments, payments,
    kycList, bankAccounts, nominees, auctions, payouts, documents, notifications, ledger, tickets,
    auditLogs, customers, createChitGroup, deleteChitGroup, joinChitGroup, submitKYC, approveKYC, rejectKYC,
    payInstallment, scheduleAuction, placeAuctionBid, finalizeAuction, makerApprovePayout, checkerReleasePayout,
    createSupportTicket, replySupportTicket, markNotificationRead, openKYCDocument }}>
    {children}
    {operationError && <div role="alert" className="fixed bottom-4 right-4 z-[100] max-w-md rounded-xl bg-red-800 p-4 text-sm text-white shadow-xl">
      <button aria-label="Dismiss error" onClick={() => setOperationError('')} className="float-right ml-4">×</button>{operationError}
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
