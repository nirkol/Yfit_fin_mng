from datetime import datetime
from typing import List, Dict
from app.services.calculation_service import is_year_editable


class YearService:
    def __init__(self, storage):
        self.storage = storage

    def ensure_current_year_exists(self) -> Dict:
        """
        Ensure current year exists in database.
        If not, automatically create it from previous year's balances.
        This should be called on app startup or when loading year data.
        """
        current_year = str(datetime.now().year)
        year_data = self.storage.get_year_data(current_year)

        if not year_data:
            # Current year doesn't exist, create it
            return self.create_year_from_previous(current_year)

        return year_data

    def get_years_list(self) -> List[Dict]:
        """Get list of all years with metadata"""
        # Ensure current year exists before listing
        self.ensure_current_year_exists()

        years = self.storage.get_years()
        current_year = str(datetime.now().year)

        result = []
        for year in years:
            year_key = year["yearKey"]
            result.append({
                "yearKey": year_key,
                "isCurrent": year_key == current_year,
                "isEditable": is_year_editable(year_key),
                "createdAt": year.get("createdAt")
            })

        return result

    def create_year_from_previous(self, year_key: str) -> Dict:
        """
        Create a new year with opening balances from previous year's ending balances
        """
        # Check if year already exists
        if self.storage.get_year_data(year_key):
            raise ValueError(f"Year {year_key} already exists")

        # Get previous year
        try:
            prev_year = str(int(year_key) - 1)
        except ValueError:
            raise ValueError("Invalid year format")

        prev_year_data = self.storage.get_year_data(prev_year)

        opening_balances = []
        if prev_year_data:
            # Calculate ending balances for each member
            members = self.storage.get_members()
            for member in members:
                member_id = member["id"]

                # Calculate balance: opening + purchased - attended - refunded
                opening = 0
                for ob in prev_year_data.get("openingBalances", []):
                    if ob["memberId"] == member_id:
                        opening = ob.get("classes", 0)
                        break

                purchased = sum(
                    p["classCount"]
                    for p in prev_year_data.get("packages", [])
                    if p["memberId"] == member_id
                )

                attended = sum(
                    1 for a in prev_year_data.get("attendance", [])
                    if a["memberId"] == member_id
                )

                refunded = sum(
                    r["classesRefunded"]
                    for r in prev_year_data.get("refunds", [])
                    if r["memberId"] == member_id
                )

                balance = opening + purchased - attended - refunded

                if balance != 0:  # Only include non-zero balances
                    opening_balances.append({
                        "memberId": member_id,
                        "classes": balance
                    })

        # Create new year
        return self.storage.create_year(year_key, opening_balances)
