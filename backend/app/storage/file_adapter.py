import json
import os
from datetime import datetime
from filelock import FileLock
from typing import List, Optional, Dict
from .base import StorageAdapter


class FileStorageAdapter(StorageAdapter):
    def __init__(self, base_path: str = "./data"):
        self.base_path = base_path
        self.members_file = os.path.join(base_path, "members.json")
        self.years_dir = os.path.join(base_path, "years")
        self.settings_file = os.path.join(base_path, "settings.json")
        self.auth_file = os.path.join(base_path, "auth.json")

        # Create directories if they don't exist
        os.makedirs(self.years_dir, exist_ok=True)

        # Initialize files if they don't exist
        self._init_files()

    def _init_files(self):
        """Initialize data files with defaults if they don't exist"""
        if not os.path.exists(self.members_file):
            self._write_json(self.members_file, [])

        if not os.path.exists(self.settings_file):
            self._write_json(self.settings_file, self._default_settings())

        if not os.path.exists(self.auth_file):
            # Default credentials: admin / admin123
            from app.utils.auth import hash_password
            self._write_json(self.auth_file, {
                "username": "admin",
                "passwordHash": hash_password("admin123")
            })

    def _read_json(self, file_path: str) -> any:
        """Read JSON file with file locking"""
        lock_path = f"{file_path}.lock"
        with FileLock(lock_path, timeout=10):
            if not os.path.exists(file_path):
                return None
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)

    def _write_json(self, file_path: str, data: any):
        """Write JSON file atomically with file locking"""
        lock_path = f"{file_path}.lock"
        with FileLock(lock_path, timeout=10):
            # Write to temp file first
            temp_path = f"{file_path}.tmp"
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            # Atomic rename
            os.replace(temp_path, file_path)

    def _generate_id(self) -> str:
        """Generate unique ID based on timestamp"""
        return str(int(datetime.now().timestamp() * 1000))

    def _get_year_file(self, year_key: str) -> str:
        """Get path to year data file"""
        return os.path.join(self.years_dir, f"{year_key}.json")

    def _default_settings(self) -> Dict:
        """Return default settings"""
        return {
            "package1": {"name": "כרטיסיה 20", "classCount": 20, "price": 900},
            "package2": {"name": "כרטיסיה 10", "classCount": 10, "price": 500},
            "package3": {"name": "נוער 20", "classCount": 20, "price": 700},
            "package4": {"name": "נוער 10", "classCount": 10, "price": 400},
            "yearlyTaxCap": None,
            "updatedAt": datetime.now().isoformat()
        }

    def _default_year_data(self, year_key: str) -> Dict:
        """Return default year data structure"""
        return {
            "yearKey": year_key,
            "openingBalances": [],
            "packages": [],
            "attendance": [],
            "refunds": []
        }

    # === Members ===
    def get_members(self, archived: bool = False) -> List[Dict]:
        """Get all members, optionally filtered by archived status"""
        members = self._read_json(self.members_file) or []
        if archived is not None:
            return [m for m in members if m.get("isArchived", False) == archived]
        return members

    def get_member(self, member_id: str) -> Optional[Dict]:
        """Get a single member by ID"""
        members = self._read_json(self.members_file) or []
        for member in members:
            if member["id"] == member_id:
                return member
        return None

    def create_member(self, data: Dict) -> Dict:
        """Create a new member"""
        members = self._read_json(self.members_file) or []

        member = {
            "id": self._generate_id(),
            "memberId": self.get_next_member_id(),
            "createdAt": datetime.now().isoformat(),
            **data
        }

        members.append(member)
        self._write_json(self.members_file, members)
        return member

    def update_member(self, member_id: str, data: Dict) -> Optional[Dict]:
        """Update an existing member"""
        members = self._read_json(self.members_file) or []

        for i, member in enumerate(members):
            if member["id"] == member_id:
                members[i] = {**member, **data}
                self._write_json(self.members_file, members)
                return members[i]

        return None

    def delete_member(self, member_id: str) -> bool:
        """Delete a member"""
        members = self._read_json(self.members_file) or []

        original_len = len(members)
        members = [m for m in members if m["id"] != member_id]

        if len(members) < original_len:
            self._write_json(self.members_file, members)
            return True

        return False

    def get_next_member_id(self) -> int:
        """Get next sequential member ID"""
        members = self._read_json(self.members_file) or []
        if not members:
            return 1
        return max(m.get("memberId", 0) for m in members) + 1

    # === Years ===
    def get_years(self) -> List[Dict]:
        """Get all years"""
        years = []
        if not os.path.exists(self.years_dir):
            return years

        for filename in os.listdir(self.years_dir):
            if filename.endswith(".json"):
                year_key = filename[:-5]
                years.append({"yearKey": year_key})

        return sorted(years, key=lambda y: y["yearKey"], reverse=True)

    def get_year_data(self, year_key: str) -> Optional[Dict]:
        """Get all data for a year"""
        year_file = self._get_year_file(year_key)
        if not os.path.exists(year_file):
            return None
        return self._read_json(year_file)

    def create_year(self, year_key: str, opening_balances: List[Dict]) -> Dict:
        """Create a new year with opening balances"""
        year_file = self._get_year_file(year_key)

        if os.path.exists(year_file):
            raise ValueError(f"Year {year_key} already exists")

        year_data = self._default_year_data(year_key)
        year_data["openingBalances"] = opening_balances

        self._write_json(year_file, year_data)
        return year_data

    def delete_year(self, year_key: str) -> bool:
        """Delete a year and all its data"""
        year_file = self._get_year_file(year_key)

        if os.path.exists(year_file):
            os.remove(year_file)
            lock_file = f"{year_file}.lock"
            if os.path.exists(lock_file):
                os.remove(lock_file)
            return True

        return False

    def set_opening_balance(self, year_key: str, member_id: str, classes: int) -> bool:
        """Set opening balance for a member in a year"""
        year_data = self.get_year_data(year_key)
        if not year_data:
            return False

        balances = year_data.get("openingBalances", [])

        # Update existing or add new
        found = False
        for balance in balances:
            if balance["memberId"] == member_id:
                balance["classes"] = classes
                found = True
                break

        if not found:
            balances.append({"memberId": member_id, "classes": classes})

        year_data["openingBalances"] = balances
        self._write_json(self._get_year_file(year_key), year_data)
        return True

    # === Package Purchases ===
    def add_package_purchase(self, year_key: str, data: Dict) -> Dict:
        """Add a package purchase"""
        year_data = self.get_year_data(year_key)
        if not year_data:
            year_data = self._default_year_data(year_key)

        purchase = {
            "id": self._generate_id(),
            "yearKey": year_key,
            **data
        }

        year_data.setdefault("packages", []).append(purchase)
        self._write_json(self._get_year_file(year_key), year_data)
        return purchase

    def get_package_purchases(self, year_key: str = None, member_id: str = None) -> List[Dict]:
        """Get package purchases, optionally filtered"""
        if year_key:
            year_data = self.get_year_data(year_key)
            if not year_data:
                return []
            purchases = year_data.get("packages", [])
        else:
            # Get from all years
            purchases = []
            for year in self.get_years():
                year_data = self.get_year_data(year["yearKey"])
                if year_data:
                    purchases.extend(year_data.get("packages", []))

        if member_id:
            purchases = [p for p in purchases if p.get("memberId") == member_id]

        return purchases

    # === Attendance ===
    def add_attendance(self, year_key: str, records: List[Dict]) -> List[Dict]:
        """Add attendance records"""
        year_data = self.get_year_data(year_key)
        if not year_data:
            year_data = self._default_year_data(year_key)

        added_records = []
        for record in records:
            attendance = {
                "id": f"{self._generate_id()}-{record['memberId']}",
                "yearKey": year_key,
                **record
            }
            year_data.setdefault("attendance", []).append(attendance)
            added_records.append(attendance)

        self._write_json(self._get_year_file(year_key), year_data)
        return added_records

    def get_attendance(self, year_key: str = None, member_id: str = None) -> List[Dict]:
        """Get attendance records, optionally filtered"""
        if year_key:
            year_data = self.get_year_data(year_key)
            if not year_data:
                return []
            attendance = year_data.get("attendance", [])
        else:
            # Get from all years
            attendance = []
            for year in self.get_years():
                year_data = self.get_year_data(year["yearKey"])
                if year_data:
                    attendance.extend(year_data.get("attendance", []))

        if member_id:
            attendance = [a for a in attendance if a.get("memberId") == member_id]

        return attendance

    def remove_attendance_for_class(self, year_key: str, date: str, time: str) -> int:
        """Remove existing attendance for a specific class (date+time)"""
        year_data = self.get_year_data(year_key)
        if not year_data:
            return 0

        attendance = year_data.get("attendance", [])
        original_len = len(attendance)

        # Remove records matching date and time
        attendance = [
            a for a in attendance
            if not (a.get("date") == date and a.get("time") == time)
        ]

        year_data["attendance"] = attendance
        self._write_json(self._get_year_file(year_key), year_data)

        return original_len - len(attendance)

    # === Refunds ===
    def add_refund(self, year_key: str, data: Dict) -> Dict:
        """Add a refund transaction"""
        year_data = self.get_year_data(year_key)
        if not year_data:
            year_data = self._default_year_data(year_key)

        refund = {
            "id": self._generate_id(),
            "yearKey": year_key,
            **data
        }

        year_data.setdefault("refunds", []).append(refund)
        self._write_json(self._get_year_file(year_key), year_data)
        return refund

    def get_refunds(self, year_key: str = None, member_id: str = None) -> List[Dict]:
        """Get refunds, optionally filtered"""
        if year_key:
            year_data = self.get_year_data(year_key)
            if not year_data:
                return []
            refunds = year_data.get("refunds", [])
        else:
            # Get from all years
            refunds = []
            for year in self.get_years():
                year_data = self.get_year_data(year["yearKey"])
                if year_data:
                    refunds.extend(year_data.get("refunds", []))

        if member_id:
            refunds = [r for r in refunds if r.get("memberId") == member_id]

        return refunds

    # === Settings ===
    def get_settings(self) -> Dict:
        """Get application settings"""
        settings = self._read_json(self.settings_file)
        if not settings:
            settings = self._default_settings()
            self._write_json(self.settings_file, settings)
        return settings

    def update_settings(self, data: Dict) -> Dict:
        """Update application settings"""
        settings = self.get_settings()
        settings.update(data)
        settings["updatedAt"] = datetime.now().isoformat()
        self._write_json(self.settings_file, settings)
        return settings

    # === Auth ===
    def get_credentials(self) -> Dict:
        """Get stored credentials"""
        creds = self._read_json(self.auth_file)
        if not creds:
            from app.utils.auth import hash_password
            creds = {
                "username": "admin",
                "passwordHash": hash_password("admin123")
            }
            self._write_json(self.auth_file, creds)
        return creds

    def update_credentials(self, username: str, password_hash: str) -> bool:
        """Update credentials"""
        creds = {
            "username": username,
            "passwordHash": password_hash
        }
        self._write_json(self.auth_file, creds)
        return True
