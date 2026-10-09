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
  AuditLogEntry
} from './types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-001',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    joinedDate: '2025-11-15'
  },
  {
    id: 'user-002',
    fullName: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 98123 45678',
    role: 'CUSTOMER',
    joinedDate: '2026-01-10'
  },
  {
    id: 'user-003',
    fullName: 'Vikram Mehta',
    email: 'vikram.admin@rakvih.com',
    phone: '+91 99000 11122',
    role: 'SUPER_ADMIN',
    joinedDate: '2025-01-01'
  },
  {
    id: 'user-004',
    fullName: 'Ananya Reddy',
    email: 'ananya.finance@rakvih.com',
    phone: '+91 99000 33344',
    role: 'FINANCE_MANAGER',
    joinedDate: '2025-02-01'
  },
  {
    id: 'user-005',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kyc@rakvih.com',
    phone: '+91 99000 55566',
    role: 'KYC_OFFICER',
    joinedDate: '2025-03-01'
  }
];

export const INITIAL_KYC: CustomerKYC[] = [
  {
    id: 'kyc-001',
    userId: 'user-001',
    panNumber: 'ABCPS1234K',
    aadhaarNumber: '9876 5432 1098',
    status: 'VERIFIED',
    verifiedBy: 'Rajesh Kumar',
    verifiedAt: '2025-11-16 11:30',
    submittedAt: '2025-11-15 14:20',
    documents: [
      { type: 'PAN_CARD', fileName: 'pan_rahul.pdf', fileUrl: '#', uploadedAt: '2025-11-15' },
      { type: 'AADHAAR_FRONT', fileName: 'aadhaar_front.pdf', fileUrl: '#', uploadedAt: '2025-11-15' },
      { type: 'BANK_PROOF', fileName: 'cheque_leaf.jpg', fileUrl: '#', uploadedAt: '2025-11-15' }
    ]
  },
  {
    id: 'kyc-002',
    userId: 'user-002',
    panNumber: 'XYZPN8765M',
    aadhaarNumber: '1234 5678 9012',
    status: 'PENDING_APPROVAL',
    submittedAt: '2026-10-08 09:15',
    documents: [
      { type: 'PAN_CARD', fileName: 'pan_priya.pdf', fileUrl: '#', uploadedAt: '2026-10-08' },
      { type: 'AADHAAR_FRONT', fileName: 'aadhaar_priya_front.pdf', fileUrl: '#', uploadedAt: '2026-10-08' }
    ]
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-001',
    userId: 'user-001',
    accountHolder: 'Rahul Sharma',
    accountNumber: '50100234567890',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branch: 'MG Road, Bengaluru',
    isVerified: true
  },
  {
    id: 'bank-002',
    userId: 'user-002',
    accountHolder: 'Priya Nair',
    accountNumber: '918237465012',
    ifscCode: 'SBIN0008899',
    bankName: 'State Bank of India',
    branch: 'Kochi Central',
    isVerified: false
  }
];

export const INITIAL_NOMINEES: Nominee[] = [
  {
    id: 'nom-001',
    userId: 'user-001',
    name: 'Sunita Sharma',
    relationship: 'Spouse',
    phone: '+91 98765 43211',
    idProofNumber: 'Aadhaar 5566 7788 9900'
  }
];

export const INITIAL_GROUPS: ChitGroup[] = [
  {
    id: 'grp-001',
    groupCode: 'RAK-100K-01',
    groupName: 'RAKVIH Emerald ₹1 Lakh Scheme',
    totalValue: 100000,
    durationMonths: 20,
    monthlyContribution: 5000,
    totalMembers: 20,
    currentMemberCount: 20,
    foremanCommissionPercent: 5.0,
    minBidPercent: 5.0,
    maxBidPercent: 30.0,
    startDate: '2025-12-01',
    status: 'ACTIVE',
    currentMonth: 5,
    nextAuctionDate: '2026-10-15 15:00'
  },
  {
    id: 'grp-002',
    groupCode: 'RAK-500K-02',
    groupName: 'RAKVIH Royal ₹5 Lakh Scheme',
    totalValue: 500000,
    durationMonths: 25,
    monthlyContribution: 20000,
    totalMembers: 25,
    currentMemberCount: 22,
    foremanCommissionPercent: 5.0,
    minBidPercent: 5.0,
    maxBidPercent: 30.0,
    startDate: '2026-02-01',
    status: 'ACTIVE',
    currentMonth: 3,
    nextAuctionDate: '2026-10-18 16:00'
  },
  {
    id: 'grp-003',
    groupCode: 'RAK-10L-03',
    groupName: 'RAKVIH Platinum ₹10 Lakh Scheme',
    totalValue: 1000000,
    durationMonths: 40,
    monthlyContribution: 25000,
    totalMembers: 40,
    currentMemberCount: 18,
    foremanCommissionPercent: 5.0,
    minBidPercent: 5.0,
    maxBidPercent: 30.0,
    startDate: '2026-11-01',
    status: 'RECRUITING',
    currentMonth: 1,
    nextAuctionDate: '2026-11-10 14:00'
  }
];

export const INITIAL_SUBSCRIBERS: ChitSubscriber[] = [
  {
    id: 'sub-001',
    groupId: 'grp-001',
    userId: 'user-001',
    userName: 'Rahul Sharma',
    seatNumber: 7,
    status: 'ACTIVE',
    hasWonAuction: false,
    totalPaid: 20400,
    joinedDate: '2025-11-20'
  },
  {
    id: 'sub-002',
    groupId: 'grp-002',
    userId: 'user-001',
    userName: 'Rahul Sharma',
    seatNumber: 12,
    status: 'ACTIVE',
    hasWonAuction: false,
    totalPaid: 36000,
    joinedDate: '2026-01-15'
  },
  {
    id: 'sub-003',
    groupId: 'grp-001',
    userId: 'user-002',
    userName: 'Priya Nair',
    seatNumber: 14,
    status: 'ACTIVE',
    hasWonAuction: true,
    wonMonth: 3,
    totalPaid: 20400,
    joinedDate: '2025-11-25'
  }
];

export const INITIAL_INSTALLMENTS: Installment[] = [
  {
    id: 'inst-101',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    subscriberId: 'sub-001',
    userId: 'user-001',
    monthNumber: 1,
    dueDate: '2025-12-05',
    grossAmount: 5000,
    dividendDiscount: 0,
    netPayable: 5000,
    penaltyAmount: 0,
    paidAmount: 5000,
    status: 'PAID',
    paidDate: '2025-12-03'
  },
  {
    id: 'inst-102',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    subscriberId: 'sub-001',
    userId: 'user-001',
    monthNumber: 2,
    dueDate: '2026-01-05',
    grossAmount: 5000,
    dividendDiscount: 900, // Month 1 auction bid ₹23,000 -> Foreman ₹5,000 -> Div ₹18,000 / 20 = 900
    netPayable: 4100,
    penaltyAmount: 0,
    paidAmount: 4100,
    status: 'PAID',
    paidDate: '2026-01-04'
  },
  {
    id: 'inst-103',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    subscriberId: 'sub-001',
    userId: 'user-001',
    monthNumber: 3,
    dueDate: '2026-02-05',
    grossAmount: 5000,
    dividendDiscount: 850,
    netPayable: 4150,
    penaltyAmount: 0,
    paidAmount: 4150,
    status: 'PAID',
    paidDate: '2026-02-02'
  },
  {
    id: 'inst-104',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    subscriberId: 'sub-001',
    userId: 'user-001',
    monthNumber: 4,
    dueDate: '2026-03-05',
    grossAmount: 5000,
    dividendDiscount: 750,
    netPayable: 4250,
    penaltyAmount: 0,
    paidAmount: 4250,
    status: 'PAID',
    paidDate: '2026-03-04'
  },
  {
    id: 'inst-105',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    subscriberId: 'sub-001',
    userId: 'user-001',
    monthNumber: 5,
    dueDate: '2026-10-12',
    grossAmount: 5000,
    dividendDiscount: 700,
    netPayable: 4300,
    penaltyAmount: 0,
    paidAmount: 0,
    status: 'DUE'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    transactionRef: 'TXN-RAK-20251203-8891',
    installmentId: 'inst-101',
    userId: 'user-001',
    groupCode: 'RAK-100K-01',
    monthNumber: 1,
    amountPaid: 5000,
    paymentMode: 'UPI',
    gatewayRef: 'pay_M001928374',
    receiptNumber: 'RCP-2025-00192',
    status: 'RECONCILED',
    paidAt: '2025-12-03 10:45'
  },
  {
    id: 'pay-002',
    transactionRef: 'TXN-RAK-20260104-9912',
    installmentId: 'inst-102',
    userId: 'user-001',
    groupCode: 'RAK-100K-01',
    monthNumber: 2,
    amountPaid: 4100,
    paymentMode: 'NET_BANKING',
    gatewayRef: 'pay_M002837465',
    receiptNumber: 'RCP-2026-00045',
    status: 'RECONCILED',
    paidAt: '2026-01-04 14:10'
  }
];

export const INITIAL_AUCTIONS: AuctionEvent[] = [
  {
    id: 'auc-001',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    groupName: 'RAKVIH Emerald ₹1 Lakh Scheme',
    monthNumber: 3,
    auctionDate: '2026-02-15 15:00',
    status: 'COMPLETED',
    winningBidDiscount: 22000,
    winningSubscriberId: 'sub-003',
    winningSubscriberName: 'Priya Nair',
    winningSeatNumber: 14,
    foremanFee: 5000,
    totalDividendPool: 17000,
    dividendPerMember: 850,
    netPrizeAmount: 78000,
    bids: [
      { id: 'bid-1', auctionId: 'auc-001', subscriberId: 'sub-003', subscriberName: 'Priya Nair', seatNumber: 14, bidDiscountAmount: 22000, timestamp: '2026-02-15 15:22' },
      { id: 'bid-2', auctionId: 'auc-001', subscriberId: 'sub-005', subscriberName: 'Karthik Raja', seatNumber: 3, bidDiscountAmount: 20000, timestamp: '2026-02-15 15:18' }
    ]
  },
  {
    id: 'auc-002',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    groupName: 'RAKVIH Emerald ₹1 Lakh Scheme',
    monthNumber: 5,
    auctionDate: '2026-10-15 15:00',
    status: 'SCHEDULED',
    winningBidDiscount: 0,
    foremanFee: 5000,
    totalDividendPool: 0,
    dividendPerMember: 0,
    netPrizeAmount: 95000,
    bids: []
  }
];

export const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: 'payout-001',
    groupId: 'grp-001',
    groupCode: 'RAK-100K-01',
    winnerSubscriberId: 'sub-003',
    winnerName: 'Priya Nair',
    winnerPhone: '+91 98123 45678',
    monthNumber: 3,
    prizeAmount: 78000,
    status: 'MAKER_APPROVED',
    bankDetails: INITIAL_BANK_ACCOUNTS[1],
    guarantors: [
      {
        id: 'guar-1',
        payoutId: 'payout-001',
        name: 'Suresh Nair',
        phone: '+91 98123 00000',
        relationship: 'Father',
        occupation: 'Govt Employee',
        monthlyIncome: 65000,
        documentType: 'SALARY_SLIP',
        documentRef: 'salary_slip_suresh.pdf',
        verified: true
      }
    ],
    makerUserId: 'user-004',
    makerApprovedAt: '2026-02-18 11:20',
    makerNotes: 'Guarantor income verified. Bank details matched.',
    requestedAt: '2026-02-16 10:00'
  }
];

export const INITIAL_DOCUMENTS: DigitalDocument[] = [
  {
    id: 'doc-001',
    userId: 'user-001',
    groupId: 'grp-001',
    documentType: 'RECEIPT',
    title: 'Payment Receipt Month 1',
    referenceNumber: 'RCP-2025-00192',
    generatedAt: '2025-12-03',
    downloadUrl: '#'
  },
  {
    id: 'doc-002',
    userId: 'user-001',
    groupId: 'grp-001',
    documentType: 'CHIT_AGREEMENT',
    title: 'Registered Chit Agreement - RAK-100K-01',
    referenceNumber: 'AGR-2025-00891',
    generatedAt: '2025-11-20',
    downloadUrl: '#'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-001',
    title: 'Instalment Due Reminder',
    message: 'Your Month 5 contribution of ₹4,300 for group RAK-100K-01 is due on Oct 12, 2026.',
    channel: 'IN_APP',
    isRead: false,
    timestamp: '2026-10-08 08:00'
  },
  {
    id: 'notif-2',
    userId: 'user-001',
    title: 'Auction Scheduled',
    message: 'Live e-Auction for RAK-100K-01 Month 5 is scheduled for Oct 15, 2026 at 3:00 PM.',
    channel: 'IN_APP',
    isRead: true,
    timestamp: '2026-10-05 10:00'
  }
];

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'led-001',
    entryNumber: 'LEDG-202512-001',
    groupCode: 'RAK-100K-01',
    userName: 'Rahul Sharma',
    accountType: 'COLLECTION',
    debitAmount: 0,
    creditAmount: 5000,
    narration: 'Month 1 Instalment collection via UPI',
    timestamp: '2025-12-03 10:45'
  },
  {
    id: 'led-002',
    entryNumber: 'LEDG-202602-014',
    groupCode: 'RAK-100K-01',
    userName: 'RAKVIH Solutions',
    accountType: 'FOREMAN_COMMISSION',
    debitAmount: 0,
    creditAmount: 5000,
    narration: '5% Foreman commission for Month 3 auction',
    timestamp: '2026-02-15 15:30'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-001',
    ticketCode: 'TKT-8849',
    userId: 'user-001',
    userName: 'Rahul Sharma',
    subject: 'Receipt not reflecting dividend credit',
    category: 'PAYMENT',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    messages: [
      { sender: 'CUSTOMER', senderName: 'Rahul Sharma', text: 'Hi team, my Month 4 receipt shows gross ₹5000. Kindly check.', timestamp: '2026-03-05 11:20' },
      { sender: 'SUPPORT', senderName: 'Rajesh Support Agent', text: 'Hello Mr. Sharma, checking with finance team regarding dividend calculation.', timestamp: '2026-03-05 14:00' }
    ],
    createdAt: '2026-03-05 11:20',
    updatedAt: '2026-03-05 14:00'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    actorId: 'user-005',
    actorName: 'Rajesh Kumar',
    actorRole: 'KYC_OFFICER',
    action: 'KYC_APPROVED',
    resourceType: 'customer_kyc',
    resourceId: 'kyc-001',
    ipAddress: '106.51.72.18',
    details: 'Verified PAN ABCPS1234K and Aadhaar 9876 5432 1098 for Rahul Sharma',
    timestamp: '2025-11-16 11:30'
  },
  {
    id: 'audit-002',
    actorId: 'user-004',
    actorName: 'Ananya Reddy',
    actorRole: 'FINANCE_MANAGER',
    action: 'PAYOUT_MAKER_APPROVED',
    resourceType: 'payouts',
    resourceId: 'payout-001',
    ipAddress: '106.51.72.22',
    details: 'Maker approved ₹78,000 payout for Priya Nair with guarantor verification',
    timestamp: '2026-02-18 11:20'
  }
];
