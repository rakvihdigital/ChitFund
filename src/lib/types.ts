export type UserRole = 'CUSTOMER' | 'SUPER_ADMIN' | 'FINANCE_MANAGER' | 'KYC_OFFICER' | 'SUPPORT_AGENT';

export type KYCStatus = 'NOT_SUBMITTED' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  joinedDate: string;
}

export interface CustomerKYC {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  panNumber: string;
  aadhaarNumber: string;
  status: KYCStatus;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  submittedAt: string;
  documents: {
    type: 'PAN_CARD' | 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PHOTOGRAPH' | 'SIGNATURE' | 'BANK_PROOF';
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

export type KycFileType = 'PAN_CARD' | 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PHOTOGRAPH' | 'BANK_PROOF';

// What a customer provides at registration
export interface KycSubmission {
  pan: string;
  aadhaar: string;
  files: Record<KycFileType, File | null>;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  isVerified: boolean;
  proofPath: string;
  rejectionReason?: string;
}

export interface Nominee {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  idProofNumber?: string;
}

// The member's signed agreement for one ticket, with the group terms as they were when signed
export interface ChitAgreement {
  id: string;
  subscriberId: string;
  groupId: string;
  userId: string;
  version: string;
  signedName: string;
  signedAt: string;
  terms: {
    groupCode: string;
    groupName: string;
    totalValue: number;
    durationMonths: number;
    monthlyContribution: number;
    totalMembers: number;
    foremanCommissionPercent: number;
    minBidPercent: number;
    maxBidPercent: number;
    startDate: string;
    seatNumber: number;
  };
}

export interface ChitGroup {
  id: string;
  groupCode: string;
  groupName: string;
  totalValue: number; // e.g. 100000
  durationMonths: number; // e.g. 20
  monthlyContribution: number; // e.g. 5000
  totalMembers: number; // 20
  currentMemberCount: number;
  foremanCommissionPercent: number; // 5%
  minBidPercent: number; // 5%
  maxBidPercent: number; // 30%
  startDate: string;
  status: 'RECRUITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  currentMonth: number;
  nextAuctionDate: string;
  maxTicketsPerPerson: number; // Maximum tickets a single person can take (default 3)
}

export interface ChitSubscriber {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  seatNumber: number;
  status: 'ACTIVE' | 'DEFAULTED' | 'PAID_OUT' | 'WITHDRAWN';
  hasWonAuction: boolean;
  wonMonth?: number;
  totalPaid: number;
  joinedDate: string;
}

export interface Installment {
  id: string;
  groupId: string;
  groupCode: string;
  subscriberId: string;
  userId: string;
  monthNumber: number;
  dueDate: string;
  grossAmount: number; // 5000
  dividendDiscount: number; // calculated from auction
  netPayable: number; // gross - dividend
  penaltyAmount: number;
  paidAmount: number;
  status: 'UPCOMING' | 'DUE' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  paidDate?: string;
}

export interface PaymentRecord {
  id: string;
  transactionRef: string;
  installmentId: string;
  userId: string;
  groupCode: string;
  monthNumber: number;
  amountPaid: number;
  paymentMode: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'CASH';
  gatewayRef: string;
  receiptNumber: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RECONCILED';
  paidAt: string;
}

export interface AuctionEvent {
  id: string;
  groupId: string;
  groupCode: string;
  groupName: string;
  monthNumber: number;
  auctionDate: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  winningBidDiscount: number; // e.g. 15000
  winningSubscriberId?: string;
  winningSubscriberName?: string;
  winningSeatNumber?: number;
  foremanFee: number; // 5% of total chit value (e.g. 5000)
  totalDividendPool: number; // winningBidDiscount - foremanFee
  dividendPerMember: number; // totalDividendPool / totalMembers
  netPrizeAmount: number; // totalValue - winningBidDiscount
  bids: AuctionBid[];
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  subscriberId: string;
  subscriberName: string;
  seatNumber: number;
  bidDiscountAmount: number;
  timestamp: string;
}

export interface Guarantor {
  id: string;
  payoutId: string;
  name: string;
  phone: string;
  relationship: string;
  occupation: string;
  monthlyIncome: number;
  documentType: 'PROPERTY_DEED' | 'SALARY_SLIP' | 'PROMISSORY_NOTE' | 'CHEQUE';
  documentRef: string;
  verified: boolean;
}

export interface PayoutRequest {
  id: string;
  groupId: string;
  groupCode: string;
  winnerSubscriberId: string;
  winnerName: string;
  winnerPhone: string;
  monthNumber: number;
  prizeAmount: number; // e.g., 85000
  status: 'REQUESTED' | 'GUARANTOR_PENDING' | 'MAKER_APPROVED' | 'CHECKER_RELEASED' | 'REJECTED';
  bankDetails: BankAccount;
  guarantors: Guarantor[];
  makerUserId?: string;
  makerApprovedAt?: string;
  makerNotes?: string;
  checkerUserId?: string;
  checkerApprovedAt?: string;
  checkerNotes?: string;
  disbursedRef?: string;
  requestedAt: string;
}

export interface DigitalDocument {
  id: string;
  userId: string;
  groupId?: string;
  documentType: 'RECEIPT' | 'CHIT_AGREEMENT' | 'STATEMENT' | 'COMPLETION_CERTIFICATE';
  title: string;
  referenceNumber: string;
  generatedAt: string;
  downloadUrl: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: 'IN_APP' | 'SMS' | 'EMAIL' | 'PUSH';
  isRead: boolean;
  timestamp: string;
}

export interface LedgerEntry {
  id: string;
  entryNumber: string;
  groupId?: string;
  groupCode?: string;
  userId?: string;
  userName?: string;
  accountType: 'COLLECTION' | 'PRIZE_DISBURSEMENT' | 'FOREMAN_COMMISSION' | 'DIVIDEND_CREDIT' | 'PENALTY';
  debitAmount: number;
  creditAmount: number;
  narration: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  userId: string;
  userName: string;
  subject: string;
  category: 'PAYMENT' | 'AUCTION' | 'KYC' | 'PAYOUT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages: {
    sender: 'CUSTOMER' | 'SUPPORT';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}
