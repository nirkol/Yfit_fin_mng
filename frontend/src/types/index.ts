// Member types
export interface Member {
  id: string;
  memberId: number;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  isArchived: boolean;
  createdAt: string;
}

export interface MemberWithBalance extends Member {
  classesRemaining: number;
  moneyBalance: number;  // Can be positive (credit) or negative (debt)
  debtAmount: number;
  status: MemberStatus;
  totalAttended?: number;
  totalPaid?: number;
}

export type MemberStatus = 'active' | 'in_debt' | 'no_classes' | 'archived';

// Package types
export interface PackagePurchase {
  id: string;
  memberId: string;
  memberName: string;
  packageType: PackageType;
  price: number;
  classCount: number;
  amountPaid: number;
  purchaseDate: string;
  yearKey: string;
  paymentMethod?: string;
}

export type PackageType = 'package1' | 'package2' | 'package3' | 'package4' | 'adhoc';

// Attendance types
export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  time: string;
  dayOfWeek?: string;
  classType?: string;
  yearKey: string;
}

// Refund types
export interface RefundTransaction {
  id: string;
  memberId: string;
  memberName: string;
  classesRefunded: number;
  refundAmount: number;
  refundDate: string;
  yearKey: string;
}

// Year types
export interface Year {
  yearKey: string;
  isCurrent: boolean;
  isEditable: boolean;
  createdAt?: string;
}

export interface YearData {
  yearKey: string;
  openingBalances: OpeningBalance[];
  packages: PackagePurchase[];
  attendance: AttendanceRecord[];
  refunds: RefundTransaction[];
}

export interface OpeningBalance {
  memberId: string;
  memberName?: string;
  classes: number;
}

// Settings types
export interface PackageConfig {
  name: string;
  classCount: number;
  price: number;
}

export interface Settings {
  package1: PackageConfig;
  package2: PackageConfig;
  package3: PackageConfig;
  package4: PackageConfig;
  yearlyTaxCap?: number;
  updatedAt?: string;
}

// Dashboard types
export interface FinancialStats {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  packagesSold: number;
  avgMoneyPerMonth: number;
  totalDebt: number;
  membersWithDebt: number;
  monthlyEarnings: MonthlyData[];
  cumulativeEarnings: MonthlyData[];
  paymentMethods: PaymentMethodData[];
  packageDistribution: PackageDistData[];
  membersInDebt: DebtMember[];
  recentRefunds: RefundTransaction[];
}

export interface AttendanceStats {
  totalActiveMembers: number;
  totalClasses: number;
  totalAttendees: number;
  avgAttendeesPerClass: number;
  avgAttendeesPerMonth: number;
  monthlyAttendees: MonthlyData[];
  topAttendees: TopAttendee[];
}

export interface MonthlyData {
  month: string;
  value: number;
  value2?: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
}

export interface PackageDistData {
  packageType: string;
  count: number;
  amount: number;
}

export interface DebtMember {
  memberId: string;
  memberName: string;
  classesRemaining: number;
  debtAmount: number;
}

export interface TopAttendee {
  memberId: string;
  memberName: string;
  attendanceCount: number;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  expiresIn: number;
}
