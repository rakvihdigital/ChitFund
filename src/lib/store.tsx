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
import {
  INITIAL_PROFILES,
  INITIAL_KYC,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_NOMINEES,
  INITIAL_GROUPS,
  INITIAL_SUBSCRIBERS,
  INITIAL_INSTALLMENTS,
  INITIAL_PAYMENTS,
  INITIAL_AUCTIONS,
  INITIAL_PAYOUTS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LEDGER,
  INITIAL_TICKETS,
  INITIAL_AUDIT_LOGS
} from './mockData';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
  profiles: UserProfile[];
  kycList: CustomerKYC[];
  bankAccounts: BankAccount[];
  nominees: Nominee[];
  groups: ChitGroup[];
  subscribers: ChitSubscriber[];
  installments: Installment[];
  payments: PaymentRecord[];
  auctions: AuctionEvent[];
  payouts: PayoutRequest[];
  documents: DigitalDocument[];
  notifications: NotificationItem[];
  ledger: LedgerEntry[];
  tickets: SupportTicket[];
  auditLogs: AuditLogEntry[];

  // Actions
  submitKYC: (pan: string, aadhaar: string) => void;
  approveKYC: (kycId: string) => void;
  rejectKYC: (kycId: string, reason: string) => void;
  createChitGroup: (group: Partial<ChitGroup>) => void;
  joinChitGroup: (groupId: string) => void;
  payInstallment: (installmentId: string, paymentMode: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER') => void;
  placeAuctionBid: (auctionId: string, bidAmount: number) => void;
  finalizeAuction: (auctionId: string) => void;
  makerApprovePayout: (payoutId: string, notes: string) => void;
  checkerReleasePayout: (payoutId: string, notes: string) => void;
  createSupportTicket: (subject: string, category: 'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER', message: string) => void;
  replySupportTicket: (ticketId: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  logAudit: (action: string, resourceType: string, resourceId: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles] = useState<UserProfile[]>(INITIAL_PROFILES);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PROFILES[0]); // Rahul Sharma by default

  const [kycList, setKycList] = useState<CustomerKYC[]>(INITIAL_KYC);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [nominees, setNominees] = useState<Nominee[]>(INITIAL_NOMINEES);
  const [groups, setGroups] = useState<ChitGroup[]>(INITIAL_GROUPS);
  const [subscribers, setSubscribers] = useState<ChitSubscriber[]>(INITIAL_SUBSCRIBERS);
  const [installments, setInstallments] = useState<Installment[]>(INITIAL_INSTALLMENTS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [auctions, setAuctions] = useState<AuctionEvent[]>(INITIAL_AUCTIONS);
  const [payouts, setPayouts] = useState<PayoutRequest[]>(INITIAL_PAYOUTS);
  const [documents, setDocuments] = useState<DigitalDocument[]>(INITIAL_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Switch role shortcut helper
  const setCurrentUserRole = (role: UserRole) => {
    const found = profiles.find((p) => p.role === role) || {
      ...currentUser,
      role
    };
    setCurrentUser(found);
  };

  const logAudit = (action: string, resourceType: string, resourceId: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action,
      resourceType,
      resourceId,
      ipAddress: '106.51.72.100',
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const submitKYC = (pan: string, aadhaar: string) => {
    const existing = kycList.find((k) => k.userId === currentUser.id);
    if (existing) {
      setKycList((prev) =>
        prev.map((k) =>
          k.userId === currentUser.id
            ? { ...k, panNumber: pan, aadhaarNumber: aadhaar, status: 'PENDING_APPROVAL', submittedAt: new Date().toISOString() }
            : k
        )
      );
    } else {
      const newKYC: CustomerKYC = {
        id: `kyc-${Date.now()}`,
        userId: currentUser.id,
        panNumber: pan,
        aadhaarNumber: aadhaar,
        status: 'PENDING_APPROVAL',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        documents: [
          { type: 'PAN_CARD', fileName: `pan_${currentUser.fullName}.pdf`, fileUrl: '#', uploadedAt: new Date().toISOString().substring(0, 10) },
          { type: 'AADHAAR_FRONT', fileName: 'aadhaar_front.pdf', fileUrl: '#', uploadedAt: new Date().toISOString().substring(0, 10) }
        ]
      };
      setKycList((prev) => [...prev, newKYC]);
    }
    logAudit('KYC_SUBMITTED', 'customer_kyc', currentUser.id, `Submitted PAN ${pan} and Aadhaar ${aadhaar}`);
  };

  const approveKYC = (kycId: string) => {
    setKycList((prev) =>
      prev.map((k) =>
        k.id === kycId
          ? {
              ...k,
              status: 'VERIFIED',
              verifiedBy: currentUser.fullName,
              verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : k
      )
    );
    logAudit('KYC_APPROVED', 'customer_kyc', kycId, `Approved KYC by ${currentUser.fullName}`);
  };

  const rejectKYC = (kycId: string, reason: string) => {
    setKycList((prev) =>
      prev.map((k) =>
        k.id === kycId
          ? { ...k, status: 'REJECTED', rejectionReason: reason, verifiedBy: currentUser.fullName }
          : k
      )
    );
    logAudit('KYC_REJECTED', 'customer_kyc', kycId, `Rejected KYC. Reason: ${reason}`);
  };

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
      currentMemberCount: 1,
      foremanCommissionPercent: 5.0,
      minBidPercent: 5.0,
      maxBidPercent: 30.0,
      startDate: groupData.startDate || new Date().toISOString().substring(0, 10),
      status: 'RECRUITING',
      currentMonth: 1,
      nextAuctionDate: new Date(Date.now() + 15 * 86400000).toISOString().replace('T', ' ').substring(0, 16)
    };

    setGroups((prev) => [newGroup, ...prev]);
    logAudit('CHIT_GROUP_CREATED', 'chit_groups', newGroup.id, `Created Chit Scheme ${newGroup.groupCode} worth ₹${totalValue}`);
  };

  const joinChitGroup = (groupId: string) => {
    const targetGroup = groups.find((g) => g.id === groupId);
    if (!targetGroup) return;

    const newSub: ChitSubscriber = {
      id: `sub-${Date.now()}`,
      groupId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      seatNumber: targetGroup.currentMemberCount + 1,
      status: 'ACTIVE',
      hasWonAuction: false,
      totalPaid: 0,
      joinedDate: new Date().toISOString().substring(0, 10)
    };

    setSubscribers((prev) => [...prev, newSub]);
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, currentMemberCount: g.currentMemberCount + 1 } : g))
    );

    // Create month 1 installment schedule
    const newInst: Installment = {
      id: `inst-${Date.now()}`,
      groupId,
      groupCode: targetGroup.groupCode,
      subscriberId: newSub.id,
      userId: currentUser.id,
      monthNumber: 1,
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().substring(0, 10),
      grossAmount: targetGroup.monthlyContribution,
      dividendDiscount: 0,
      netPayable: targetGroup.monthlyContribution,
      penaltyAmount: 0,
      paidAmount: 0,
      status: 'DUE'
    };
    setInstallments((prev) => [...prev, newInst]);
    logAudit('SUBSCRIBER_JOINED', 'chit_subscribers', newSub.id, `Joined group ${targetGroup.groupCode}`);
  };

  const payInstallment = (
    installmentId: string,
    paymentMode: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER'
  ) => {
    const inst = installments.find((i) => i.id === installmentId);
    if (!inst) return;

    const receiptNo = `RCP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const txnRef = `TXN-RAK-${Date.now()}`;

    // 1. Update Installment
    setInstallments((prev) =>
      prev.map((i) =>
        i.id === installmentId
          ? {
              ...i,
              paidAmount: i.netPayable,
              status: 'PAID',
              paidDate: new Date().toISOString().substring(0, 10)
            }
          : i
      )
    );

    // 2. Create Payment Record
    const newPay: PaymentRecord = {
      id: `pay-${Date.now()}`,
      transactionRef: txnRef,
      installmentId,
      userId: currentUser.id,
      groupCode: inst.groupCode,
      monthNumber: inst.monthNumber,
      amountPaid: inst.netPayable,
      paymentMode,
      gatewayRef: `pay_gwy_${Date.now()}`,
      receiptNumber: receiptNo,
      status: 'RECONCILED',
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setPayments((prev) => [newPay, ...prev]);

    // 3. Create Receipt Document
    const newDoc: DigitalDocument = {
      id: `doc-${Date.now()}`,
      userId: currentUser.id,
      groupId: inst.groupId,
      documentType: 'RECEIPT',
      title: `Payment Receipt Month ${inst.monthNumber}`,
      referenceNumber: receiptNo,
      generatedAt: new Date().toISOString().substring(0, 10),
      downloadUrl: '#'
    };
    setDocuments((prev) => [newDoc, ...prev]);

    // 4. Create Ledger Entry
    const newLedger: LedgerEntry = {
      id: `led-${Date.now()}`,
      entryNumber: `LEDG-${Date.now()}`,
      groupCode: inst.groupCode,
      userName: currentUser.fullName,
      accountType: 'COLLECTION',
      debitAmount: 0,
      creditAmount: inst.netPayable,
      narration: `Instalment collection Month ${inst.monthNumber} via ${paymentMode}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setLedger((prev) => [newLedger, ...prev]);

    logAudit('INSTALLMENT_PAID', 'installments', installmentId, `Paid ₹${inst.netPayable} for Month ${inst.monthNumber} (${receiptNo})`);
  };

  const placeAuctionBid = (auctionId: string, bidAmount: number) => {
    const auc = auctions.find((a) => a.id === auctionId);
    if (!auc) return;

    const sub = subscribers.find((s) => s.groupId === auc.groupId && s.userId === currentUser.id);
    if (!sub) return;

    const newBid = {
      id: `bid-${Date.now()}`,
      auctionId,
      subscriberId: sub.id,
      subscriberName: currentUser.fullName,
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

    logAudit('AUCTION_BID_PLACED', 'auctions', auctionId, `Submitted bid of ₹${bidAmount} discount`);
  };

  const finalizeAuction = (auctionId: string) => {
    const targetAuc = auctions.find((a) => a.id === auctionId);
    if (!targetAuc) return;

    const grp = groups.find((g) => g.id === targetAuc.groupId);
    if (!grp) return;

    const winningDiscount = targetAuc.winningBidDiscount || targetAuc.foremanFee;
    const foremanFee = (grp.totalValue * grp.foremanCommissionPercent) / 100;
    const totalDividendPool = Math.max(0, winningDiscount - foremanFee);
    const dividendPerMember = Math.floor(totalDividendPool / grp.totalMembers);
    const netPrizeAmount = grp.totalValue - winningDiscount;

    // 1. Finalize Auction object
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

    // 2. Mark subscriber won
    if (targetAuc.winningSubscriberId) {
      setSubscribers((prev) =>
        prev.map((s) =>
          s.id === targetAuc.winningSubscriberId
            ? { ...s, hasWonAuction: true, wonMonth: targetAuc.monthNumber }
            : s
        )
      );

      // Create Payout Request
      const winnerSub = subscribers.find((s) => s.id === targetAuc.winningSubscriberId);
      const newPayout: PayoutRequest = {
        id: `payout-${Date.now()}`,
        groupId: grp.id,
        groupCode: grp.groupCode,
        winnerSubscriberId: targetAuc.winningSubscriberId,
        winnerName: targetAuc.winningSubscriberName || 'Winner Subscriber',
        winnerPhone: '+91 98765 43210',
        monthNumber: targetAuc.monthNumber,
        prizeAmount: netPrizeAmount,
        status: 'GUARANTOR_PENDING',
        bankDetails: INITIAL_BANK_ACCOUNTS[0],
        guarantors: [],
        requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      setPayouts((prev) => [newPayout, ...prev]);
    }

    // 3. Update next month installment dividend credit for all group members
    setInstallments((prev) =>
      prev.map((inst) => {
        if (inst.groupId === grp.id && inst.monthNumber === targetAuc.monthNumber + 1) {
          const newNet = inst.grossAmount - dividendPerMember;
          return {
            ...inst,
            dividendDiscount: dividendPerMember,
            netPayable: newNet
          };
        }
        return inst;
      })
    );

    logAudit('AUCTION_FINALIZED', 'auctions', auctionId, `Declared winner ${targetAuc.winningSubscriberName}. Prize ₹${netPrizeAmount}, Div/Member ₹${dividendPerMember}`);
  };

  const makerApprovePayout = (payoutId: string, notes: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'MAKER_APPROVED',
              makerUserId: currentUser.id,
              makerApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              makerNotes: notes
            }
          : p
      )
    );
    logAudit('PAYOUT_MAKER_APPROVED', 'payouts', payoutId, `Maker approved payout. Notes: ${notes}`);
  };

  const checkerReleasePayout = (payoutId: string, notes: string) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'CHECKER_RELEASED',
              checkerUserId: currentUser.id,
              checkerApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              checkerNotes: notes,
              disbursedRef: `DISB-BANK-${Math.floor(100000 + Math.random() * 900000)}`
            }
          : p
      )
    );
    logAudit('PAYOUT_CHECKER_RELEASED', 'payouts', payoutId, `Checker released prize disbursement. Notes: ${notes}`);
  };

  const createSupportTicket = (
    subject: string,
    category: 'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER',
    message: string
  ) => {
    const newTkt: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketCode: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      subject,
      category,
      priority: 'MEDIUM',
      status: 'OPEN',
      messages: [
        {
          sender: 'CUSTOMER',
          senderName: currentUser.fullName,
          text: message,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTickets((prev) => [newTkt, ...prev]);
    logAudit('SUPPORT_TICKET_CREATED', 'support_tickets', newTkt.id, `Created ticket ${newTkt.ticketCode}: ${subject}`);
  };

  const replySupportTicket = (ticketId: string, message: string) => {
    const senderRole = currentUser.role === 'CUSTOMER' ? 'CUSTOMER' : 'SUPPORT';
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: senderRole === 'SUPPORT' ? 'IN_PROGRESS' : t.status,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              messages: [
                ...t.messages,
                {
                  sender: senderRole,
                  senderName: currentUser.fullName,
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
        currentUser,
        setCurrentUserRole,
        profiles,
        kycList,
        bankAccounts,
        nominees,
        groups,
        subscribers,
        installments,
        payments,
        auctions,
        payouts,
        documents,
        notifications,
        ledger,
        tickets,
        auditLogs,
        submitKYC,
        approveKYC,
        rejectKYC,
        createChitGroup,
        joinChitGroup,
        payInstallment,
        placeAuctionBid,
        finalizeAuction,
        makerApprovePayout,
        checkerReleasePayout,
        createSupportTicket,
        replySupportTicket,
        markNotificationRead,
        logAudit
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
