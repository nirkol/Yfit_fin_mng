from pydantic import BaseModel
from typing import List


class MonthlyData(BaseModel):
    month: str
    value: float
    value2: float = 0


class PaymentMethodData(BaseModel):
    method: str
    count: int
    amount: float


class PackageDistData(BaseModel):
    packageType: str
    count: int
    amount: float


class DebtMember(BaseModel):
    memberId: str
    memberName: str
    classesRemaining: int
    debtAmount: float


class TopAttendee(BaseModel):
    memberId: str
    memberName: str
    attendanceCount: int


class FinancialStats(BaseModel):
    totalRevenue: float
    totalRefunds: float
    netRevenue: float
    packagesSold: int
    avgMoneyPerMonth: float
    totalDebt: float
    membersWithDebt: int
    monthlyEarnings: List[MonthlyData]
    cumulativeEarnings: List[MonthlyData]
    paymentMethods: List[PaymentMethodData]
    packageDistribution: List[PackageDistData]
    membersInDebt: List[DebtMember]
    recentRefunds: List[dict]


class AttendanceStats(BaseModel):
    totalActiveMembers: int
    totalClasses: int
    totalAttendees: int
    avgAttendeesPerClass: float
    avgAttendeesPerMonth: float
    monthlyAttendees: List[MonthlyData]
    topAttendees: List[TopAttendee]


class DashboardResponse(BaseModel):
    financial: FinancialStats
    attendance: AttendanceStats
