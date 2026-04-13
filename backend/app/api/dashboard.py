from fastapi import APIRouter, Depends
from datetime import datetime
from collections import defaultdict
from typing import List, Dict
from app.schemas.dashboard import (
    DashboardResponse, FinancialStats, AttendanceStats,
    MonthlyData, PaymentMethodData, PackageDistData, DebtMember, TopAttendee
)
from app.services.member_service import MemberService
from app.services.calculation_service import calculate_member_balance, get_price_per_class, calculate_debt
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def get_month_name(month: int) -> str:
    """Convert month number to Hebrew month name"""
    hebrew_months = {
        1: "ינואר", 2: "פברואר", 3: "מרץ", 4: "אפריל",
        5: "מאי", 6: "יוני", 7: "יולי", 8: "אוגוסט",
        9: "ספטמבר", 10: "אוקטובר", 11: "נובמבר", 12: "דצמבר"
    }
    return hebrew_months.get(month, str(month))


@router.get("/{year_key}", response_model=DashboardResponse)
async def get_dashboard(
    year_key: str,
    current_user: dict = Depends(get_current_user)
):
    """Get dashboard statistics for a year"""
    storage = get_storage()
    year_data = storage.get_year_data(year_key)

    if not year_data:
        return DashboardResponse(
            financial=FinancialStats(
                totalRevenue=0, totalRefunds=0, netRevenue=0, packagesSold=0,
                avgMoneyPerMonth=0, totalDebt=0, membersWithDebt=0,
                monthlyEarnings=[], cumulativeEarnings=[], paymentMethods=[],
                packageDistribution=[], membersInDebt=[], recentRefunds=[]
            ),
            attendance=AttendanceStats(
                totalActiveMembers=0, totalClasses=0, totalAttendees=0,
                avgAttendeesPerClass=0, avgAttendeesPerMonth=0,
                monthlyAttendees=[], topAttendees=[]
            )
        )

    # === Financial Stats ===
    packages = year_data.get("packages", [])
    refunds = year_data.get("refunds", [])
    attendance_records = year_data.get("attendance", [])

    # Calculate revenue
    total_revenue = sum(p.get("amountPaid", 0) for p in packages)
    total_refunds = sum(r.get("refundAmount", 0) for r in refunds)
    net_revenue = total_revenue - total_refunds
    packages_sold = len(packages)

    # Monthly earnings
    monthly_earnings_map = defaultdict(float)
    for package in packages:
        try:
            date = datetime.fromisoformat(package["purchaseDate"].replace("Z", "+00:00"))
            month_key = get_month_name(date.month)
            monthly_earnings_map[month_key] += package.get("amountPaid", 0)
        except:
            pass

    monthly_earnings = [
        MonthlyData(month=month, value=amount)
        for month, amount in sorted(monthly_earnings_map.items(), key=lambda x: list(monthly_earnings_map.keys()).index(x[0]))
    ]

    # Cumulative earnings
    cumulative = 0
    cumulative_earnings = []
    for item in monthly_earnings:
        cumulative += item.value
        cumulative_earnings.append(MonthlyData(month=item.month, value=cumulative))

    # Average per month
    months_with_data = len([m for m in monthly_earnings if m.value > 0])
    avg_money_per_month = net_revenue / months_with_data if months_with_data > 0 else 0

    # Payment methods
    payment_methods_map = defaultdict(lambda: {"count": 0, "amount": 0})
    for package in packages:
        method = package.get("paymentMethod", "אחר")
        payment_methods_map[method]["count"] += 1
        payment_methods_map[method]["amount"] += package.get("amountPaid", 0)

    payment_methods = [
        PaymentMethodData(method=method, count=data["count"], amount=data["amount"])
        for method, data in payment_methods_map.items()
    ]

    # Package distribution
    package_dist_map = defaultdict(lambda: {"count": 0, "amount": 0})
    for package in packages:
        pkg_type = package.get("packageType", "adhoc")
        package_dist_map[pkg_type]["count"] += 1
        package_dist_map[pkg_type]["amount"] += package.get("amountPaid", 0)

    package_distribution = [
        PackageDistData(packageType=pkg_type, count=data["count"], amount=data["amount"])
        for pkg_type, data in package_dist_map.items()
    ]

    # Members in debt
    settings = storage.get_settings()
    members = storage.get_members(archived=False)
    members_in_debt = []

    for member in members:
        member_id = member["id"]
        balance = calculate_member_balance(member_id, year_key, storage)
        if balance < 0:
            price = get_price_per_class(member_id, year_key, storage, settings)
            debt = calculate_debt(balance, price)
            members_in_debt.append(DebtMember(
                memberId=member_id,
                memberName=member["name"],
                classesRemaining=balance,
                debtAmount=debt
            ))

    total_debt = sum(m.debtAmount for m in members_in_debt)
    members_with_debt = len(members_in_debt)

    # Recent refunds (last 10)
    recent_refunds = sorted(refunds, key=lambda r: r.get("refundDate", ""), reverse=True)[:10]

    # === Attendance Stats ===
    active_members = storage.get_members(archived=False)
    total_active_members = len(active_members)

    # Count unique classes (date+time combinations)
    unique_classes = set()
    for record in attendance_records:
        unique_classes.add((record.get("date"), record.get("time")))
    total_classes = len(unique_classes)

    total_attendees = len(attendance_records)
    avg_attendees_per_class = total_attendees / total_classes if total_classes > 0 else 0

    # Monthly attendees
    monthly_attendees_map = defaultdict(int)
    for record in attendance_records:
        try:
            date = datetime.fromisoformat(record["date"])
            month_key = get_month_name(date.month)
            monthly_attendees_map[month_key] += 1
        except:
            pass

    monthly_attendees = [
        MonthlyData(month=month, value=count)
        for month, count in sorted(monthly_attendees_map.items(), key=lambda x: list(monthly_attendees_map.keys()).index(x[0]))
    ]

    months_with_attendance = len([m for m in monthly_attendees if m.value > 0])
    avg_attendees_per_month = total_attendees / months_with_attendance if months_with_attendance > 0 else 0

    # Top attendees
    attendance_count_map = defaultdict(int)
    for record in attendance_records:
        attendance_count_map[record["memberId"]] += 1

    top_attendees = []
    for member_id, count in sorted(attendance_count_map.items(), key=lambda x: x[1], reverse=True)[:10]:
        member = storage.get_member(member_id)
        if member:
            top_attendees.append(TopAttendee(
                memberId=member_id,
                memberName=member["name"],
                attendanceCount=count
            ))

    return DashboardResponse(
        financial=FinancialStats(
            totalRevenue=total_revenue,
            totalRefunds=total_refunds,
            netRevenue=net_revenue,
            packagesSold=packages_sold,
            avgMoneyPerMonth=avg_money_per_month,
            totalDebt=total_debt,
            membersWithDebt=members_with_debt,
            monthlyEarnings=monthly_earnings,
            cumulativeEarnings=cumulative_earnings,
            paymentMethods=payment_methods,
            packageDistribution=package_distribution,
            membersInDebt=members_in_debt,
            recentRefunds=recent_refunds
        ),
        attendance=AttendanceStats(
            totalActiveMembers=total_active_members,
            totalClasses=total_classes,
            totalAttendees=total_attendees,
            avgAttendeesPerClass=avg_attendees_per_class,
            avgAttendeesPerMonth=avg_attendees_per_month,
            monthlyAttendees=monthly_attendees,
            topAttendees=top_attendees
        )
    )
