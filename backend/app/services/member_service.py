from typing import List, Optional, Dict
from app.services.calculation_service import (
    calculate_member_balance,
    calculate_debt,
    calculate_money_balance,
    get_price_per_class,
    get_member_status
)


class MemberService:
    def __init__(self, storage, settings_getter):
        self.storage = storage
        self.settings_getter = settings_getter

    def get_member_with_balance(self, member_id: str, year_key: str) -> Optional[Dict]:
        """Get a member with calculated balance for a specific year"""
        member = self.storage.get_member(member_id)
        if not member:
            return None

        settings = self.settings_getter()
        classes_remaining = calculate_member_balance(member_id, year_key, self.storage)
        money_balance = calculate_money_balance(member_id, year_key, self.storage, settings)

        # Debt amount is now the negative money balance (if any)
        debt_amount = abs(money_balance) if money_balance < 0 else 0.0

        # Update status based on money balance
        status, _ = get_member_status(member.get("isArchived", False), classes_remaining)

        # Get total attended for this year
        attendance = self.storage.get_attendance(year_key=year_key, member_id=member_id)
        total_attended = len(attendance)

        # Get total paid for this year
        packages = self.storage.get_package_purchases(year_key=year_key, member_id=member_id)
        total_paid = sum(p.get("amountPaid", 0) for p in packages)

        return {
            **member,
            "classesRemaining": classes_remaining,
            "moneyBalance": money_balance,  # Can be positive (credit) or negative (debt)
            "debtAmount": debt_amount,
            "status": status,
            "totalAttended": total_attended,
            "totalPaid": total_paid
        }

    def get_all_members_with_balance(self, year_key: str, include_archived: bool = False) -> List[Dict]:
        """Get all members with calculated balances"""
        members = self.storage.get_members()
        settings = self.settings_getter()

        result = []
        for member in members:
            if not include_archived and member.get("isArchived", False):
                continue

            member_id = member["id"]
            classes_remaining = calculate_member_balance(member_id, year_key, self.storage)
            money_balance = calculate_money_balance(member_id, year_key, self.storage, settings)

            # Debt amount is the negative money balance (if any)
            debt_amount = abs(money_balance) if money_balance < 0 else 0.0

            # Update status based on money balance
            status, _ = get_member_status(member.get("isArchived", False), classes_remaining)

            # Get total attended for this year
            attendance = self.storage.get_attendance(year_key=year_key, member_id=member_id)
            total_attended = len(attendance)

            # Get total paid for this year
            packages = self.storage.get_package_purchases(year_key=year_key, member_id=member_id)
            total_paid = sum(p.get("amountPaid", 0) for p in packages)

            result.append({
                **member,
                "classesRemaining": classes_remaining,
                "moneyBalance": money_balance,  # Can be positive (credit) or negative (debt)
                "debtAmount": debt_amount,
                "status": status,
                "totalAttended": total_attended,
                "totalPaid": total_paid
            })

        return result
