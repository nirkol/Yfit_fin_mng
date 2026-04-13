from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any


class StorageAdapter(ABC):
    """Abstract interface for storage operations"""

    # === Members ===
    @abstractmethod
    def get_members(self, archived: bool = False) -> List[Dict]:
        """Get all members, optionally filtered by archived status"""
        pass

    @abstractmethod
    def get_member(self, member_id: str) -> Optional[Dict]:
        """Get a single member by ID"""
        pass

    @abstractmethod
    def create_member(self, data: Dict) -> Dict:
        """Create a new member"""
        pass

    @abstractmethod
    def update_member(self, member_id: str, data: Dict) -> Optional[Dict]:
        """Update an existing member"""
        pass

    @abstractmethod
    def delete_member(self, member_id: str) -> bool:
        """Delete a member"""
        pass

    @abstractmethod
    def get_next_member_id(self) -> int:
        """Get next sequential member ID"""
        pass

    # === Years ===
    @abstractmethod
    def get_years(self) -> List[Dict]:
        """Get all years"""
        pass

    @abstractmethod
    def get_year_data(self, year_key: str) -> Optional[Dict]:
        """Get all data for a year"""
        pass

    @abstractmethod
    def create_year(self, year_key: str, opening_balances: List[Dict]) -> Dict:
        """Create a new year with opening balances"""
        pass

    @abstractmethod
    def delete_year(self, year_key: str) -> bool:
        """Delete a year and all its data"""
        pass

    @abstractmethod
    def set_opening_balance(self, year_key: str, member_id: str, classes: int) -> bool:
        """Set opening balance for a member in a year"""
        pass

    # === Package Purchases ===
    @abstractmethod
    def add_package_purchase(self, year_key: str, data: Dict) -> Dict:
        """Add a package purchase"""
        pass

    @abstractmethod
    def get_package_purchases(self, year_key: str = None, member_id: str = None) -> List[Dict]:
        """Get package purchases, optionally filtered"""
        pass

    # === Attendance ===
    @abstractmethod
    def add_attendance(self, year_key: str, records: List[Dict]) -> List[Dict]:
        """Add attendance records"""
        pass

    @abstractmethod
    def get_attendance(self, year_key: str = None, member_id: str = None) -> List[Dict]:
        """Get attendance records, optionally filtered"""
        pass

    @abstractmethod
    def remove_attendance_for_class(self, year_key: str, date: str, time: str) -> int:
        """Remove existing attendance for a specific class (date+time)"""
        pass

    # === Refunds ===
    @abstractmethod
    def add_refund(self, year_key: str, data: Dict) -> Dict:
        """Add a refund transaction"""
        pass

    @abstractmethod
    def get_refunds(self, year_key: str = None, member_id: str = None) -> List[Dict]:
        """Get refunds, optionally filtered"""
        pass

    # === Settings ===
    @abstractmethod
    def get_settings(self) -> Dict:
        """Get application settings"""
        pass

    @abstractmethod
    def update_settings(self, data: Dict) -> Dict:
        """Update application settings"""
        pass

    # === Auth ===
    @abstractmethod
    def get_credentials(self) -> Dict:
        """Get stored credentials"""
        pass

    @abstractmethod
    def update_credentials(self, username: str, password_hash: str) -> bool:
        """Update credentials"""
        pass
