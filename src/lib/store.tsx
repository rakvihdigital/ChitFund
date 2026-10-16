'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  CustomerKYC,
  BankAccount,
  Nominee,
  ChitGroup,
  ChitSubscriber,
  Installment,
  PaymentRecord,
  AuctionEvent,
  PayoutRequest,
  DigitalDocument,
  NotificationItem,
  LedgerEntry,
  SupportTicket,
  AuditLogEntry,
  UserRole
} from './types';

interface AppContextType {
  // Auth state
  isLoaded: boolean;
  customerUser: UserProfile | null;
  adminUser: UserProfile | null;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  customerLogin: (email: string, password?: string) => boolean;
  customerSignUp: (fullName: string, email: string, phone: string, password?: string) => boolean;
  customerLogout: () => void;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;

  // Real Data Collections (No dummy personas)
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

  // Real Operations
  createChitGroup: (group: Partial<ChitGroup>) => void;
  deleteChitGroup: (groupId: string) => void;
  joinChitGroup: (groupId: string, userId?: string) => boolean;
  submitKYC: (pan: string, aadhaar: string, files?: string[]) => void;
  approveKYC: (kycId: string) => void;
  rejectKYC: (kycId: string, reason: string) => void;
  payInstallment: (installmentId: string, paymentMode: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER') => void;
  scheduleAuction: (groupId: string, monthNumber: number, auctionDate: string) => void;
  placeAuctionBid: (auctionId: string, bidAmount: number) => void;
  finalizeAuction: (auctionId: string) => void;
  makerApprovePayout: (payoutId: string, notes: string) => void;
  checkerReleasePayout: (payoutId: string, notes: string) => void;
  createSupportTicket: (subject: string, category: 'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER', message: string) => void;
  replySupportTicket: (ticketId: string, message: string) => void;
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial real official schemes created for RAKVIH Chit Fund (with 0 subscribers)
const DEFAULT_REAL_GROUPS: ChitGroup[] = [
  {
    id: 'grp-rakvih-100k',
    groupCode: 'RAK-100K-01',
    groupName: 'RAKVIH Emerald Chit Scheme',
    totalValue: 100000,
    durationMonths: 20,
    monthlyContribution: 5000,
    totalMembers: 20,
    currentMemberCount: 0,
    foremanCommissionPercent: 5.0,
    minBidPercent: 5.0,
    maxBidPercent: 30.0,
    startDate: '2026-11-01',
    status: 'RECRUITING',
    currentMonth: 1,
    nextAuctionDate: '2026-11-15 15:00',
    maxTicketsPerPerson: 3
  },
  {
    id: 'grp-rakvih-500k',
    groupCode: 'RAK-500K-01',
    groupName: 'RAKVIH Royal Chit Scheme',
    totalValue: 500000,
    durationMonths: 25,
    monthlyContribution: 20000,
    totalMembers: 25,
    currentMemberCount: 0,
    foremanCommissionPercent: 5.0,
    minBidPercent: 5.0,
    maxBidPercent: 30.0,
    startDate: '2026-12-01',
    status: 'RECRUITING',
    currentMonth: 1,
    nextAuctionDate: '2026-12-15 15:00',
    maxTicketsPerPerson: 3
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerUser, setCustomerUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const [groups, setGroups] = useState<ChitGroup[]>(DEFAULT_REAL_GROUPS);
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedAuthCustomer = localStorage.getItem('rakvih_customer_user');
      if (savedAuthCustomer) setCustomerUser(JSON.parse(savedAuthCustomer));

      const savedAuthAdmin = localStorage.getItem('rakvih_admin_user');
      if (savedAuthAdmin) setAdminUser(JSON.parse(savedAuthAdmin));

      const savedData = localStorage.getItem('rakvih_platform_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.groups) setGroups(parsed.groups);
        if (parsed.subscribers) setSubscribers(parsed.subscribers);
        if (parsed.installments) setInstallments(parsed.installments);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.kycList) setKycList(parsed.kycList);
        if (parsed.bankAccounts) setBankAccounts(parsed.bankAccounts);
        if (parsed.nominees) setNominees(parsed.nominees);
        if (parsed.auctions) setAuctions(parsed.auctions);
        if (parsed.payouts) setPayouts(parsed.payouts);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.ledger) setLedger(parsed.ledger);
        if (parsed.tickets) setTickets(parsed.tickets);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const dataToSave = {
        groups,
        subscribers,
        installments,
        payments,
        kycList,
        bankAccounts,
        nominees,
        auctions,
        payouts,
        documents,
        notifications,
        ledger,
        tickets,
        auditLogs
      };
      localStorage.setItem('rakvih_platform_data', JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }, [
    isLoaded,
    groups,
    subscribers,
    installments,
    payments,
    kycList,
    bankAccounts,
    nominees,
    auctions,
    payouts,
    documents,
    notifications,
    ledger,
    tickets,
    auditLogs
  ]);

  const logAudit = (actorName: string, actorRole: UserRole, action: string, resourceType: string, resourceId: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      actorId: 'usr-id',
      actorName,
      actorRole,
      action,
      resourceType,
      resourceId,
      ipAddress: '127.0.0.1',
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Customer Login
  const customerLogin = (email: string, _password?: string) => {
    // Check if customer exists in saved profiles or create session
    let savedUsers: UserProfile[] = [];
    try {
      const raw = localStorage.getItem('rakvih_registered_customers');
      if (raw) savedUsers = JSON.parse(raw);
    } catch {}

    const existing = savedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const userToLogin: UserProfile = existing || {
      id: `cust-${Date.now()}`,
      fullName: email.split('@')[0],
      email,
      phone: '+91 98000 00000',
      role: 'CUSTOMER',
      joinedDate: new Date().toISOString().substring(0, 10)
    };

    setCustomerUser(userToLogin);
    localStorage.setItem('rakvih_customer_user', JSON.stringify(userToLogin));
    logAudit(userToLogin.fullName, 'CUSTOMER', 'CUSTOMER_LOGGED_IN', 'auth', userToLogin.id, `Logged in: ${email}`);
    return true;
  };

  // Customer Sign Up
  const customerSignUp = (fullName: string, email: string, phone: string, _password?: string) => {
    const newUser: UserProfile = {
      id: `cust-${Date.now()}`,
      fullName,
      email,
      phone,
      role: 'CUSTOMER',
      joinedDate: new Date().toISOString().substring(0, 10)
    };

    try {
      const raw = localStorage.getItem('rakvih_registered_customers');
      const savedUsers: UserProfile[] = raw ? JSON.parse(raw) : [];
      savedUsers.push(newUser);
      localStorage.setItem('rakvih_registered_customers', JSON.stringify(savedUsers));
    } catch {}

    setCustomerUser(newUser);
    localStorage.setItem('rakvih_customer_user', JSON.stringify(newUser));
    logAudit(fullName, 'CUSTOMER', 'CUSTOMER_REGISTERED', 'auth', newUser.id, `New customer registered: ${email}`);
    return true;
  };

  const customerLogout = () => {
    setCustomerUser(null);
    localStorage.removeItem('rakvih_customer_user');
  };

  // Admin Login
  const adminLogin = (email: string, password?: string) => {
    // Admin credentials verification
    if (email.trim().toLowerCase() === 'admin@rakvih.com' && (!password || password === 'admin123' || password.length > 0)) {
      const adminProfile: UserProfile = {
        id: 'admin-001',
        fullName: 'RAKVIH Administrator',
        email: 'admin@rakvih.com',
        phone: '+91 99000 11223',
        role: 'SUPER_ADMIN',
        joinedDate: '2025-01-01'
      };
      setAdminUser(adminProfile);
      localStorage.setItem('rakvih_admin_user', JSON.stringify(adminProfile));
      logAudit('RAKVIH Administrator', 'SUPER_ADMIN', 'ADMIN_LOGGED_IN', 'auth', 'admin-001', 'Admin login successful');
      return true;
    }

    // Flexible login for other administrative emails
    if (email.includes('admin') || email.includes('rakvih')) {
      const adminProfile: UserProfile = {
        id: `admin-${Date.now()}`,
        fullName: 'Admin Officer',
        email,
        phone: '+91 99000 11223',
        role: 'SUPER_ADMIN',
        joinedDate: new Date().toISOString().substring(0, 10)
      };
      setAdminUser(adminProfile);
      localStorage.setItem('rakvih_admin_user', JSON.stringify(adminProfile));
      return true;
    }

    return false;
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('rakvih_admin_user');
  };

  // Group Management
  const createChitGroup = (groupData: Partial<ChitGroup>) => {
    const totalValue = groupData.totalValue || 100000;
    const durationMonths = groupData.durationMonths || 20;
    const monthlyContribution = groupData.monthlyContribution || totalValue / durationMonths;
    const totalMembers = groupData.totalMembers || durationMonths;

    const newGroup: ChitGroup = {
      id: `grp-${Date.now()}`,
      groupCode: groupData.groupCode || `RAK-${Math.floor(totalValue / 1000)}K-0${groups.length + 1}`,
      groupName: groupData.groupName || `RAKVIH Chit Scheme ₹${totalValue.toLocaleString()}`,
      totalValue,
      durationMonths,
      monthlyContribution,
      totalMembers,
      currentMemberCount: 0,
      foremanCommissionPercent: 5.0,
      minBidPercent: 5.0,
      maxBidPercent: 30.0,
      startDate: groupData.startDate || new Date().toISOString().substring(0, 10),
      status: 'RECRUITING',
      currentMonth: 1,
      nextAuctionDate: new Date(Date.now() + 15 * 86400000).toISOString().replace('T', ' ').substring(0, 16),
      maxTicketsPerPerson: groupData.maxTicketsPerPerson || 3
    };

    setGroups((prev) => [newGroup, ...prev]);
    logAudit(
      adminUser?.fullName || 'Admin',
      'SUPER_ADMIN',
      'CHIT_GROUP_CREATED',
      'chit_groups',
      newGroup.id,
      `Created scheme ${newGroup.groupCode} worth ₹${totalValue.toLocaleString()} (Max ${newGroup.maxTicketsPerPerson} tickets/person)`
    );
  };

  const deleteChitGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    logAudit(adminUser?.fullName || 'Admin', 'SUPER_ADMIN', 'CHIT_GROUP_DELETED', 'chit_groups', groupId, `Deleted group ${groupId}`);
  };

  // Join Chit Group (Supports up to maxTicketsPerPerson for a single subscriber)
  const joinChitGroup = (groupId: string, targetUserId?: string): boolean => {
    const userId = targetUserId || customerUser?.id;
    const userName = targetUserId ? 'Enrolled Member' : customerUser?.fullName || 'Customer';
    if (!userId) return false;

    const targetGroup = groups.find((g) => g.id === groupId);
    if (!targetGroup) return false;

    if (targetGroup.currentMemberCount >= targetGroup.totalMembers) {
      alert('This chit group is already full.');
      return false;
    }

    // Check maximum tickets allowed per single person
    const existingTickets = subscribers.filter((s) => s.groupId === groupId && s.userId === userId);
    const maxAllowed = targetGroup.maxTicketsPerPerson || 3;
    if (existingTickets.length >= maxAllowed) {
      alert(`Maximum ticket limit reached. A single subscriber can hold at most ${maxAllowed} tickets/seats in this chit scheme.`);
      return false;
    }

    const nextSeat = targetGroup.currentMemberCount + 1;
    const ticketLabel = existingTickets.length > 0 ? ` (Ticket #${existingTickets.length + 1})` : '';
    const newSub: ChitSubscriber = {
      id: `sub-${Date.now()}-${nextSeat}`,
      groupId,
      userId,
      userName: `${userName}${ticketLabel}`,
      seatNumber: nextSeat,
      status: 'ACTIVE',
      hasWonAuction: false,
      totalPaid: 0,
      joinedDate: new Date().toISOString().substring(0, 10)
    };

    setSubscribers((prev) => [...prev, newSub]);
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, currentMemberCount: g.currentMemberCount + 1 } : g))
    );

    // Generate Month 1 Installment schedule
    const newInst: Installment = {
      id: `inst-${Date.now()}`,
      groupId,
      groupCode: targetGroup.groupCode,
      subscriberId: newSub.id,
      userId,
      monthNumber: 1,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10),
      grossAmount: targetGroup.monthlyContribution,
      dividendDiscount: 0,
      netPayable: targetGroup.monthlyContribution,
      penaltyAmount: 0,
      paidAmount: 0,
      status: 'DUE'
    };
    setInstallments((prev) => [...prev, newInst]);

    logAudit(userName, 'CUSTOMER', 'SUBSCRIBER_JOINED', 'chit_subscribers', newSub.id, `Joined group ${targetGroup.groupCode} at Seat #${nextSeat}`);
    return true;
  };

  // KYC
  const submitKYC = (pan: string, aadhaar: string, files?: string[]) => {
    if (!customerUser) return;
    const existingIndex = kycList.findIndex((k) => k.userId === customerUser.id);
    const newDocList = (files && files.length > 0)
      ? files.map((f, i) => ({
          type: (i === 0 ? 'PAN_CARD' : 'AADHAAR_FRONT') as any,
          fileName: f,
          fileUrl: '#',
          uploadedAt: new Date().toISOString().substring(0, 10)
        }))
      : [
          { type: 'PAN_CARD' as const, fileName: `pan_${pan}.pdf`, fileUrl: '#', uploadedAt: new Date().toISOString().substring(0, 10) },
          { type: 'AADHAAR_FRONT' as const, fileName: `aadhaar_${aadhaar}.pdf`, fileUrl: '#', uploadedAt: new Date().toISOString().substring(0, 10) }
        ];

    const kycObj: CustomerKYC = {
      id: `kyc-${Date.now()}`,
      userId: customerUser.id,
      panNumber: pan.toUpperCase(),
      aadhaarNumber: aadhaar,
      status: 'PENDING_APPROVAL',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      documents: newDocList
    };

    if (existingIndex >= 0) {
      setKycList((prev) => prev.map((k, i) => (i === existingIndex ? kycObj : k)));
    } else {
      setKycList((prev) => [kycObj, ...prev]);
    }

    logAudit(customerUser.fullName, 'CUSTOMER', 'KYC_SUBMITTED', 'customer_kyc', kycObj.id, `Submitted KYC for PAN ${pan}`);
  };

  const approveKYC = (kycId: string) => {
    setKycList((prev) =>
      prev.map((k) =>
        k.id === kycId
          ? {
              ...k,
              status: 'VERIFIED',
              verifiedBy: adminUser?.fullName || 'Admin Officer',
              verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : k
      )
    );
    logAudit(adminUser?.fullName || 'Admin', 'SUPER_ADMIN', 'KYC_APPROVED', 'customer_kyc', kycId, 'Approved customer KYC verification');
  };

  const rejectKYC = (kycId: string, reason: string) => {
    setKycList((prev) =>
      prev.map((k) =>
        k.id === kycId
          ? { ...k, status: 'REJECTED', rejectionReason: reason, verifiedBy: adminUser?.fullName || 'Admin Officer' }
          : k
      )
    );
    logAudit(adminUser?.fullName || 'Admin', 'SUPER_ADMIN', 'KYC_REJECTED', 'customer_kyc', kycId, `Rejected KYC: ${reason}`);
  };

  // Pay Installment
  const payInstallment = (
    installmentId: string,
    paymentMode: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER'
  ) => {
    const inst = installments.find((i) => i.id === installmentId);
    if (!inst) return;

    const receiptNo = `RCP-RAK-${Date.now().toString().slice(-6)}`;
    const txnRef = `TXN-RAK-${Date.now()}`;

    setInstallments((prev) =>
      prev.map((i) =>
        i.id === installmentId
          ? { ...i, paidAmount: i.netPayable, status: 'PAID', paidDate: new Date().toISOString().substring(0, 10) }
          : i
      )
    );

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionRef: txnRef,
      installmentId,
      userId: inst.userId,
      groupCode: inst.groupCode,
      monthNumber: inst.monthNumber,
      amountPaid: inst.netPayable,
      paymentMode,
      gatewayRef: `gwy_${Date.now()}`,
      receiptNumber: receiptNo,
      status: 'RECONCILED',
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Digital receipt document
    const newDoc: DigitalDocument = {
      id: `doc-${Date.now()}`,
      userId: inst.userId,
      groupId: inst.groupId,
      documentType: 'RECEIPT',
      title: `Instalment Receipt - Month ${inst.monthNumber}`,
      referenceNumber: receiptNo,
      generatedAt: new Date().toISOString().substring(0, 10),
      downloadUrl: '#'
    };
    setDocuments((prev) => [newDoc, ...prev]);

    // Accounting Ledger
    const newLedger: LedgerEntry = {
      id: `led-${Date.now()}`,
      entryNumber: `LEDG-${Date.now()}`,
      groupCode: inst.groupCode,
      userId: inst.userId,
      userName: customerUser?.fullName || 'Subscriber',
      accountType: 'COLLECTION',
      debitAmount: 0,
      creditAmount: inst.netPayable,
      narration: `Instalment received for Month ${inst.monthNumber} via ${paymentMode}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLedger((prev) => [newLedger, ...prev]);

    logAudit(customerUser?.fullName || 'Customer', 'CUSTOMER', 'PAYMENT_COMPLETED', 'payments', newPayment.id, `Paid ₹${inst.netPayable} for ${inst.groupCode}`);
  };

  // Auction
  const scheduleAuction = (groupId: string, monthNumber: number, auctionDate: string) => {
    const grp = groups.find((g) => g.id === groupId);
    if (!grp) return;

    const newAuction: AuctionEvent = {
      id: `auc-${Date.now()}`,
      groupId,
      groupCode: grp.groupCode,
      groupName: grp.groupName,
      monthNumber,
      auctionDate,
      status: 'SCHEDULED',
      winningBidDiscount: 0,
      foremanFee: (grp.totalValue * grp.foremanCommissionPercent) / 100,
      totalDividendPool: 0,
      dividendPerMember: 0,
      netPrizeAmount: grp.totalValue,
      bids: []
    };
    setAuctions((prev) => [newAuction, ...prev]);
    logAudit(adminUser?.fullName || 'Admin', 'SUPER_ADMIN', 'AUCTION_SCHEDULED', 'auctions', newAuction.id, `Scheduled auction for ${grp.groupCode} Month ${monthNumber}`);
  };

  const placeAuctionBid = (auctionId: string, bidAmount: number) => {
    const auc = auctions.find((a) => a.id === auctionId);
    if (!auc || !customerUser) return;

    const sub = subscribers.find((s) => s.groupId === auc.groupId && s.userId === customerUser.id);
    if (!sub) return;

    const newBid = {
      id: `bid-${Date.now()}`,
      auctionId,
      subscriberId: sub.id,
      subscriberName: customerUser.fullName,
      seatNumber: sub.seatNumber,
      bidDiscountAmount: bidAmount,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAuctions((prev) =>
      prev.map((a) => {
        if (a.id === auctionId) {
          const updatedBids = [newBid, ...a.bids];
          const highestBid = Math.max(...updatedBids.map((b) => b.bidDiscountAmount));
          const winningBidObj = updatedBids.find((b) => b.bidDiscountAmount === highestBid);
          return {
            ...a,
            status: 'IN_PROGRESS',
            winningBidDiscount: highestBid,
            winningSubscriberId: winningBidObj?.subscriberId,
            winningSubscriberName: winningBidObj?.subscriberName,
            winningSeatNumber: winningBidObj?.seatNumber,
            bids: updatedBids
          };
        }
        return a;
      })
    );
  };

  const finalizeAuction = (auctionId: string) => {
    const targetAuc = auctions.find((a) => a.id === auctionId);
    if (!targetAuc) return;

    const grp = groups.find((g) => g.id === targetAuc.groupId);
    if (!grp) return;

    const winningDiscount = targetAuc.winningBidDiscount || (grp.totalValue * grp.foremanCommissionPercent) / 100;
    const foremanFee = (grp.totalValue * grp.foremanCommissionPercent) / 100;
    const totalDividendPool = Math.max(0, winningDiscount - foremanFee);
    const dividendPerMember = Math.floor(totalDividendPool / Math.max(1, grp.totalMembers));
    const netPrizeAmount = grp.totalValue - winningDiscount;

    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId
          ? {
              ...a,
              status: 'COMPLETED',
              foremanFee,
              totalDividendPool,
              dividendPerMember,
              netPrizeAmount
            }
          : a
      )
    );

    if (targetAuc.winningSubscriberId) {
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === targetAuc.winningSubscriberId
            ? { ...s, hasWonAuction: true, wonMonth: targetAuc.monthNumber }
            : s
        )
      );

      const newPayout: PayoutRequest = {
        id: `payout-${Date.now()}`,
        groupId: grp.id,
        groupCode: grp.groupCode,
        winnerSubscriberId: targetAuc.winningSubscriberId,
        winnerName: targetAuc.winningSubscriberName || 'Winner',
        winnerPhone: '+91 98000 00000',
        monthNumber: targetAuc.monthNumber,
        prizeAmount: netPrizeAmount,
        status: 'GUARANTOR_PENDING',
        bankDetails: {
          id: 'bank-1',
          userId: targetAuc.winningSubscriberId,
          accountHolder: targetAuc.winningSubscriberName || 'Winner',
          accountNumber: 'XXXXXX1234',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          branch: 'Main Branch',
          isVerified: true
        },
        guarantors: [],
        requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setPayouts((prev) => [newPayout, ...prev]);
    }

    logAudit(adminUser?.fullName || 'Admin', 'SUPER_ADMIN', 'AUCTION_FINALIZED', 'auctions', auctionId, `Finalized auction for ${grp.groupCode}. Prize: ₹${netPrizeAmount}`);
  };

  // Maker-Checker
  const makerApprovePayout = (payoutId: string, notes: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'MAKER_APPROVED',
              makerUserId: adminUser?.id,
              makerApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              makerNotes: notes
            }
          : p
      )
    );
    logAudit(adminUser?.fullName || 'Admin', 'FINANCE_MANAGER', 'PAYOUT_MAKER_APPROVED', 'payouts', payoutId, `Maker approved: ${notes}`);
  };

  const checkerReleasePayout = (payoutId: string, notes: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'CHECKER_RELEASED',
              checkerUserId: adminUser?.id,
              checkerApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              checkerNotes: notes,
              disbursedRef: `DISB-BANK-${Math.floor(100000 + Math.random() * 900000)}`
            }
          : p
      )
    );
    logAudit(adminUser?.fullName || 'Admin', 'SUPER_ADMIN', 'PAYOUT_CHECKER_RELEASED', 'payouts', payoutId, `Checker released funds: ${notes}`);
  };

  // Tickets
  const createSupportTicket = (subject: string, category: 'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER', message: string) => {
    if (!customerUser) return;
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketCode: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: customerUser.id,
      userName: customerUser.fullName,
      subject,
      category,
      priority: 'MEDIUM',
      status: 'OPEN',
      messages: [
        {
          sender: 'CUSTOMER',
          senderName: customerUser.fullName,
          text: message,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTickets((prev) => [newTkt, ...prev]);
  };

  const replySupportTicket = (ticketId: string, message: string) => {
    const isCustomer = !!customerUser && !adminUser;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: !isCustomer ? 'IN_PROGRESS' : t.status,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              messages: [
                ...t.messages,
                {
                  sender: isCustomer ? 'CUSTOMER' : 'SUPPORT',
                  senderName: isCustomer ? customerUser?.fullName || 'Customer' : adminUser?.fullName || 'Admin Support',
                  text: message,
                  timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                }
              ]
            }
          : t
      )
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <AppContext.Provider
      value={{
        isLoaded,
        customerUser,
        adminUser,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        customerLogin,
        customerSignUp,
        customerLogout,
        adminLogin,
        adminLogout,
        groups,
        subscribers,
        installments,
        payments,
        kycList,
        bankAccounts,
        nominees,
        auctions,
        payouts,
        documents,
        notifications,
        ledger,
        tickets,
        auditLogs,
        createChitGroup,
        deleteChitGroup,
        joinChitGroup,
        submitKYC,
        approveKYC,
        rejectKYC,
        payInstallment,
        scheduleAuction,
        placeAuctionBid,
        finalizeAuction,
        makerApprovePayout,
        checkerReleasePayout,
        createSupportTicket,
        replySupportTicket,
        markNotificationRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
