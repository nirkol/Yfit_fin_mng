from datetime import datetime
from typing import Optional, Tuple
from enum import Enum


class MemberStatus(str, Enum):
    ARCHIVED = "archived"
    IN_DEBT = "in_debt"
    NO_CLASSES = "no_classes"
    ACTIVE = "active"


def calculate_member_balance(
    member_id: str,
    year_key: str,
    storage
) -> int:
    """
    Calculate member's class balance for a year.
    Formula: opening + purchased - attended - refunded
    """
    year_data = storage.get_year_data(year_key)
    if not year_data:
        return 0

    # Get opening balance
    opening = 0
    for ob in year_data.get("openingBalances", []):
        if ob["memberId"] == member_id:
            opening = ob.get("classesRemaining", ob.get("classes", 0))
            break

    # Sum purchased classes
    purchased = sum(
        p["classCount"]
        for p in year_data.get("packages", [])
        if p["memberId"] == member_id
    )

    # Count attended classes
    attended = sum(
        1 for a in year_data.get("attendance", [])
        if a["memberId"] == member_id
    )

    # Sum refunded classes
    refunded = sum(
        r["classesRefunded"]
        for r in year_data.get("refunds", [])
        if r["memberId"] == member_id
    )

    return opening + purchased - attended - refunded


def calculate_debt(
    classes_remaining: int,
    price_per_class: float
) -> float:
    """
    Calculate debt amount (negative balance).
    Debt = |negative balance| × price per class
    """
    if classes_remaining >= 0:
        return 0.0
    return abs(classes_remaining) * price_per_class


def calculate_money_balance(
    member_id: str,
    year_key: str,
    storage,
    settings: dict
) -> float:
    """
    Calculate member's money balance for a year.
    Formula: opening_money + money_paid - (classes_attended × price_per_class) - refund_amount
    Positive = credit, Negative = debt
    """
    year_data = storage.get_year_data(year_key)
    if not year_data:
        return 0.0

    # Get opening money balance (if exists)
    opening_money = 0.0
    for ob in year_data.get("openingBalances", []):
        if ob["memberId"] == member_id:
            opening_money = float(ob.get("moneyBalance", 0.0))
            break

    # Sum money paid from packages
    money_paid = float(sum(
        p.get("amountPaid", 0)
        for p in year_data.get("packages", [])
        if p["memberId"] == member_id
    ))

    # Calculate cost of attended classes
    attendance_records = [
        a for a in year_data.get("attendance", [])
        if a["memberId"] == member_id
    ]

    # Get price per class (use most recent package or default)
    price_per_class = float(get_price_per_class(member_id, year_key, storage, settings))

    # Calculate total cost of attendance
    attendance_cost = float(len(attendance_records)) * price_per_class

    # Sum refunded money
    refunded_money = float(sum(
        r.get("refundAmount", 0)
        for r in year_data.get("refunds", [])
        if r["memberId"] == member_id
    ))

    # Money balance = opening + paid - attendance_cost - refunds
    return opening_money + money_paid - attendance_cost - refunded_money


def get_price_per_class(
    member_id: str,
    year_key: str,
    storage,
    settings: dict
) -> float:
    """
    Get price per class from most recent package, or default from settings.
    """
    purchases = storage.get_package_purchases(year_key=year_key, member_id=member_id)

    if purchases:
        # Sort by date descending, get most recent
        purchases.sort(key=lambda p: p["purchaseDate"], reverse=True)
        latest = purchases[0]
        if latest["classCount"] > 0:
            return latest["price"] / latest["classCount"]

    # Fallback to package1 rate
    pkg1 = settings.get("package1", {})
    if pkg1.get("classCount", 0) > 0:
        return pkg1["price"] / pkg1["classCount"]

    return 45.0  # Ultimate fallback


def is_year_editable(year_key: str) -> bool:
    """
    Check if a year can be edited.
    - Current year: always editable
    - Previous year: only editable in January
    - Older years: never editable
    """
    current_year = datetime.now().year
    current_month = datetime.now().month
    year = int(year_key)

    if year == current_year:
        return True

    if year == current_year - 1 and current_month == 1:
        return True

    return False


def get_member_status(
    is_archived: bool,
    classes_remaining: int
) -> Tuple[MemberStatus, str]:
    """
    Determine member status and color.
    Returns: (status, color)
    """
    if is_archived:
        return MemberStatus.ARCHIVED, "gray"

    if classes_remaining < 0:
        return MemberStatus.IN_DEBT, "red"

    if classes_remaining == 0:
        return MemberStatus.NO_CLASSES, "yellow"

    return MemberStatus.ACTIVE, "green"
