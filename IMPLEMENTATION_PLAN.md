# YFit Fin Management - Implementation Plan

**Version:** 1.0
**Date:** April 13, 2026
**Status:** Ready for Implementation
**Spec Reference:** `NEW_YFIT_FIN_MNG_FUNCTIONAL_SPEC.md`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Implementation Phases](#4-implementation-phases)
5. [Backend Implementation](#5-backend-implementation)
6. [Frontend Implementation](#6-frontend-implementation)
7. [Data Models](#7-data-models)
8. [API Endpoints Summary](#8-api-endpoints-summary)
9. [File Storage Structure](#9-file-storage-structure)
10. [Development Setup](#10-development-setup)
11. [Testing Strategy](#11-testing-strategy)
12. [Migration to Production](#12-migration-to-production)

---

## 1. Project Overview

### Goal
Implement the YFit Fin Management application based on the completed functional specification. This document covers the technical implementation details for building the system.

### Key Constraints
- **Phase 1 (Current):** Local development with JSON file storage
- **Phase 2 (Future):** Production deployment with PostgreSQL on Railway
- **Backend:** Python FastAPI
- **Frontend:** React + TypeScript with Vite
- **Root folder:** `/Users/i807291/Library/CloudStorage/OneDrive-SAPSE/Documents/Dev/Yfit_fin_mng`

### Implementation Approach
1. Build backend with file storage adapter first (no database setup needed)
2. Implement all API endpoints
3. Build frontend with full UI
4. Test locally with JSON files
5. (Later) Add PostgreSQL adapter for production

---

## 2. Technology Stack

### Backend Dependencies

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dateutil==2.8.2
filelock==3.13.1
python-dotenv==1.0.0
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.303.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 3. Directory Structure

```
Yfit_fin_mng/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── config.py               # Environment configuration
│   │   │
│   │   ├── schemas/                # Pydantic schemas (data models)
│   │   │   ├── __init__.py
│   │   │   ├── member.py           # Member schemas
│   │   │   ├── package.py          # Package purchase schemas
│   │   │   ├── attendance.py       # Attendance schemas
│   │   │   ├── refund.py           # Refund schemas
│   │   │   ├── year.py             # Year schemas
│   │   │   ├── settings.py         # Settings schemas
│   │   │   ├── auth.py             # Auth schemas
│   │   │   └── dashboard.py        # Dashboard response schemas
│   │   │
│   │   ├── storage/                # Storage abstraction layer
│   │   │   ├── __init__.py
│   │   │   ├── base.py             # Abstract interface
│   │   │   └── file_adapter.py     # JSON file implementation
│   │   │
│   │   ├── services/               # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── member_service.py   # Member operations
│   │   │   ├── year_service.py     # Year operations
│   │   │   ├── calculation_service.py  # Balance/debt calculations
│   │   │   └── auth_service.py     # Authentication logic
│   │   │
│   │   ├── api/                    # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # Dependencies (auth, storage)
│   │   │   ├── auth.py             # Auth endpoints
│   │   │   ├── members.py          # Member endpoints
│   │   │   ├── years.py            # Year endpoints
│   │   │   ├── packages.py         # Package sale endpoints
│   │   │   ├── attendance.py       # Attendance endpoints
│   │   │   ├── refunds.py          # Refund endpoints
│   │   │   ├── settings.py         # Settings endpoints
│   │   │   └── dashboard.py        # Dashboard endpoints
│   │   │
│   │   └── utils/                  # Utility functions
│   │       ├── __init__.py
│   │       ├── auth.py             # JWT, password hashing
│   │       └── hebrew.py           # Hebrew day-of-week conversion
│   │
│   ├── data/                       # JSON storage directory
│   │   ├── members.json            # All members
│   │   ├── years/                  # Year-specific data
│   │   │   └── 2026.json           # Year 2026 transactions
│   │   ├── settings.json           # Application settings
│   │   └── auth.json               # Credentials (hashed)
│   │
│   ├── requirements.txt
│   ├── .env                        # Environment variables
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navigation.tsx      # Main sidebar navigation
│   │   │   ├── Sidebar.tsx         # Collapsible sidebar
│   │   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   │   ├── AuthGuard.tsx       # Protected route wrapper
│   │   │   ├── YearSelector.tsx    # Year dropdown
│   │   │   ├── StatCard.tsx        # Dashboard stat card
│   │   │   ├── MemberCard.tsx      # Member selection card
│   │   │   ├── MemberTable.tsx     # Members list table
│   │   │   ├── Modal.tsx           # Generic modal
│   │   │   ├── Toast.tsx           # Toast notification
│   │   │   ├── Loading.tsx         # Loading spinner
│   │   │   └── Charts/             # Chart components
│   │   │       ├── BarChart.tsx
│   │   │       ├── LineChart.tsx
│   │   │       └── PieChart.tsx
│   │   │
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.tsx           # Login page
│   │   │   ├── Finance.tsx         # Finance dashboard
│   │   │   ├── AttendanceDashboard.tsx  # Attendance analytics
│   │   │   ├── Members.tsx         # Members list
│   │   │   ├── MemberDetail.tsx    # Member detail view
│   │   │   ├── Attendance.tsx      # Mark attendance
│   │   │   ├── Classes.tsx         # Classes calendar
│   │   │   ├── Package.tsx         # Sell package
│   │   │   ├── History.tsx         # Transaction history
│   │   │   └── Settings.tsx        # Settings & admin
│   │   │
│   │   ├── services/               # API service layer
│   │   │   ├── api.ts              # Axios client config
│   │   │   ├── authService.ts      # Auth API calls
│   │   │   ├── memberService.ts    # Member API calls
│   │   │   ├── yearService.ts      # Year API calls
│   │   │   ├── settingsService.ts  # Settings API calls
│   │   │   └── dashboardService.ts # Dashboard API calls
│   │   │
│   │   ├── contexts/               # React contexts
│   │   │   ├── AuthContext.tsx     # Authentication state
│   │   │   ├── YearContext.tsx     # Selected year state
│   │   │   └── ToastContext.tsx    # Toast notifications
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts          # Auth hook
│   │   │   ├── useYear.ts          # Year hook
│   │   │   └── useMembers.ts       # Members data hook
│   │   │
│   │   ├── types/                  # TypeScript interfaces
│   │   │   └── index.ts            # All type definitions
│   │   │
│   │   ├── utils/                  # Utility functions
│   │   │   ├── calculations.ts     # Client-side calculations
│   │   │   ├── formatting.ts       # Date/number formatting
│   │   │   └── validation.ts       # Form validation
│   │   │
│   │   ├── App.tsx                 # Root component
│   │   ├── main.tsx                # Entry point
│   │   └── router.tsx              # Route configuration
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.local
│   └── .env.local.example
│
├── NEW_YFIT_FIN_MNG_FUNCTIONAL_SPEC.md
└── IMPLEMENTATION_PLAN.md (this file)
```

---

## 4. Implementation Phases

### Phase 1A: Backend Foundation (Day 1-2)

| Task | Description | Files |
|------|-------------|-------|
| 1.1 | Create directory structure | All directories |
| 1.2 | Setup requirements.txt | `backend/requirements.txt` |
| 1.3 | Create config module | `backend/app/config.py` |
| 1.4 | Create all Pydantic schemas | `backend/app/schemas/*.py` |
| 1.5 | Create storage base interface | `backend/app/storage/base.py` |
| 1.6 | Implement file storage adapter | `backend/app/storage/file_adapter.py` |
| 1.7 | Create utility functions | `backend/app/utils/*.py` |

### Phase 1B: Backend API (Day 2-3)

| Task | Description | Files |
|------|-------------|-------|
| 2.1 | Create FastAPI main entry | `backend/app/main.py` |
| 2.2 | Create API dependencies | `backend/app/api/deps.py` |
| 2.3 | Implement auth endpoints | `backend/app/api/auth.py` |
| 2.4 | Implement member endpoints | `backend/app/api/members.py` |
| 2.5 | Implement year endpoints | `backend/app/api/years.py` |
| 2.6 | Implement package endpoints | `backend/app/api/packages.py` |
| 2.7 | Implement attendance endpoints | `backend/app/api/attendance.py` |
| 2.8 | Implement refund endpoints | `backend/app/api/refunds.py` |
| 2.9 | Implement settings endpoints | `backend/app/api/settings.py` |
| 2.10 | Implement dashboard endpoint | `backend/app/api/dashboard.py` |

### Phase 1C: Backend Services (Day 3)

| Task | Description | Files |
|------|-------------|-------|
| 3.1 | Calculation service | `backend/app/services/calculation_service.py` |
| 3.2 | Member service | `backend/app/services/member_service.py` |
| 3.3 | Year service | `backend/app/services/year_service.py` |
| 3.4 | Auth service | `backend/app/services/auth_service.py` |

### Phase 1D: Frontend Foundation (Day 4)

| Task | Description | Files |
|------|-------------|-------|
| 4.1 | Create Vite project | `frontend/package.json`, configs |
| 4.2 | Configure Tailwind | `frontend/tailwind.config.js` |
| 4.3 | Create TypeScript types | `frontend/src/types/index.ts` |
| 4.4 | Create API service | `frontend/src/services/api.ts` |
| 4.5 | Create auth context | `frontend/src/contexts/AuthContext.tsx` |
| 4.6 | Create year context | `frontend/src/contexts/YearContext.tsx` |
| 4.7 | Create router | `frontend/src/router.tsx` |

### Phase 1E: Frontend Components (Day 4-5)

| Task | Description | Files |
|------|-------------|-------|
| 5.1 | AuthGuard component | `frontend/src/components/AuthGuard.tsx` |
| 5.2 | Navigation component | `frontend/src/components/Navigation.tsx` |
| 5.3 | StatCard component | `frontend/src/components/StatCard.tsx` |
| 5.4 | MemberCard component | `frontend/src/components/MemberCard.tsx` |
| 5.5 | Modal component | `frontend/src/components/Modal.tsx` |
| 5.6 | Toast component | `frontend/src/components/Toast.tsx` |
| 5.7 | Chart components | `frontend/src/components/Charts/*.tsx` |

### Phase 1F: Frontend Pages (Day 5-7)

| Task | Description | Files |
|------|-------------|-------|
| 6.1 | Login page | `frontend/src/pages/Login.tsx` |
| 6.2 | Finance dashboard | `frontend/src/pages/Finance.tsx` |
| 6.3 | Attendance dashboard | `frontend/src/pages/AttendanceDashboard.tsx` |
| 6.4 | Members list | `frontend/src/pages/Members.tsx` |
| 6.5 | Member detail | `frontend/src/pages/MemberDetail.tsx` |
| 6.6 | Attendance page | `frontend/src/pages/Attendance.tsx` |
| 6.7 | Package sales | `frontend/src/pages/Package.tsx` |
| 6.8 | Classes calendar | `frontend/src/pages/Classes.tsx` |
| 6.9 | History page | `frontend/src/pages/History.tsx` |
| 6.10 | Settings page | `frontend/src/pages/Settings.tsx` |

---

## 5. Backend Implementation

### 5.1 Configuration (config.py)

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "YFit Fin Management"
    DEBUG: bool = True

    # Storage
    STORAGE_MODE: str = "file"  # "file" or "database"
    FILE_STORAGE_PATH: str = "./data"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
```

### 5.2 Storage Base Interface (storage/base.py)

```python
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
```

### 5.3 File Storage Adapter (storage/file_adapter.py)

Key implementation details:

```python
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

    # Implementation of all abstract methods...
    # (See full implementation in code)
```

### 5.4 Calculation Service (services/calculation_service.py)

```python
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
            opening = ob.get("classes", 0)
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
    Calculate debt amount.
    Debt = |negative balance| × price per class
    """
    if classes_remaining >= 0:
        return 0.0
    return abs(classes_remaining) * price_per_class

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
```

### 5.5 Auth Utilities (utils/auth.py)

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

### 5.6 Hebrew Utilities (utils/hebrew.py)

```python
from datetime import datetime
from dateutil import parser

HEBREW_DAYS = {
    0: "יום שני",      # Monday
    1: "יום שלישי",    # Tuesday
    2: "יום רביעי",    # Wednesday
    3: "יום חמישי",    # Thursday
    4: "יום שישי",     # Friday
    5: "שבת",          # Saturday
    6: "יום ראשון"     # Sunday
}

def get_hebrew_day_of_week(date_str: str) -> str:
    """
    Convert a date string to Hebrew day of week.
    Accepts ISO format (YYYY-MM-DD or full ISO datetime)
    """
    try:
        date = parser.parse(date_str)
        weekday = date.weekday()
        return HEBREW_DAYS.get(weekday, "")
    except:
        return ""
```

---

## 6. Frontend Implementation

### 6.1 TypeScript Interfaces (types/index.ts)

```typescript
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
```

### 6.2 API Service (services/api.ts)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6.3 Auth Context (contexts/AuthContext.tsx)

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 6.4 Router Configuration (router.tsx)

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Finance from './pages/Finance';
import AttendanceDashboard from './pages/AttendanceDashboard';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Attendance from './pages/Attendance';
import Classes from './pages/Classes';
import Package from './pages/Package';
import History from './pages/History';
import Settings from './pages/Settings';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route path="/" element={<AuthGuard><Navigate to="/finance" /></AuthGuard>} />
      <Route path="/finance" element={<AuthGuard><Finance /></AuthGuard>} />
      <Route path="/attendance-dashboard" element={<AuthGuard><AttendanceDashboard /></AuthGuard>} />
      <Route path="/members" element={<AuthGuard><Members /></AuthGuard>} />
      <Route path="/members/:id" element={<AuthGuard><MemberDetail /></AuthGuard>} />
      <Route path="/attendance" element={<AuthGuard><Attendance /></AuthGuard>} />
      <Route path="/classes" element={<AuthGuard><Classes /></AuthGuard>} />
      <Route path="/package" element={<AuthGuard><Package /></AuthGuard>} />
      <Route path="/history" element={<AuthGuard><History /></AuthGuard>} />
      <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/finance" />} />
    </Routes>
  );
}
```

---

## 7. Data Models

### JSON File Structures

**members.json:**
```json
[
  {
    "id": "1773692326018",
    "memberId": 1,
    "name": "מיכל טרפינקרט",
    "phone": "0545214603",
    "dateOfBirth": "1990-05-15",
    "isArchived": false,
    "createdAt": "2026-03-16T20:18:46.018Z"
  }
]
```

**years/2026.json:**
```json
{
  "yearKey": "2026",
  "openingBalances": [
    {
      "memberId": "1773692326018",
      "classes": 10
    }
  ],
  "packages": [
    {
      "id": "1774024337703",
      "memberId": "1773692326018",
      "memberName": "מיכל טרפינקרט",
      "packageType": "package1",
      "price": 900,
      "classCount": 20,
      "amountPaid": 900,
      "purchaseDate": "2026-03-19T00:00:00.000Z",
      "paymentMethod": "Paybox"
    }
  ],
  "attendance": [
    {
      "id": "1774025000000-1773692326018",
      "memberId": "1773692326018",
      "memberName": "מיכל טרפינקרט",
      "date": "2026-03-20",
      "time": "18:00",
      "dayOfWeek": "יום חמישי",
      "classType": "regular"
    }
  ],
  "refunds": []
}
```

**settings.json:**
```json
{
  "package1": {
    "name": "כרטיסיה 20",
    "classCount": 20,
    "price": 900
  },
  "package2": {
    "name": "כרטיסיה 10",
    "classCount": 10,
    "price": 500
  },
  "package3": {
    "name": "נוער 20",
    "classCount": 20,
    "price": 700
  },
  "package4": {
    "name": "נוער 10",
    "classCount": 10,
    "price": 400
  },
  "yearlyTaxCap": 120000,
  "updatedAt": "2026-03-20T16:31:55.209Z"
}
```

**auth.json:**
```json
{
  "username": "admin",
  "passwordHash": "$2b$12$..."
}
```

---

## 8. API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/update-credentials` | Change credentials |
| GET | `/api/members` | List members |
| GET | `/api/members/{id}` | Get member |
| POST | `/api/members` | Create member |
| PUT | `/api/members/{id}` | Update member |
| DELETE | `/api/members/{id}` | Delete member |
| GET | `/api/years` | List years |
| GET | `/api/years/{year}` | Get year data |
| POST | `/api/years` | Create year |
| DELETE | `/api/years/{year}` | Delete year |
| GET | `/api/years/{year}/balances` | Get balances |
| POST | `/api/years/{year}/opening-balance` | Set opening balance |
| POST | `/api/years/{year}/packages` | Sell package |
| POST | `/api/years/{year}/attendance` | Mark attendance |
| POST | `/api/years/{year}/refunds` | Process refund |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| POST | `/api/settings/export` | Export data |
| POST | `/api/settings/import` | Import data |
| GET | `/api/dashboard/{year}` | Get dashboard stats |

---

## 9. File Storage Structure

```
data/
├── members.json              # All members (shared across years)
├── years/
│   ├── 2025.json             # Year 2025 transactions
│   └── 2026.json             # Year 2026 transactions
├── settings.json             # Package configs, tax cap
└── auth.json                 # Login credentials (hashed)
```

---

## 10. Development Setup

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Create data directory
mkdir -p data/years

# Run development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 11. Testing Strategy

### Manual Testing Checklist

1. **Authentication**
   - [ ] Login with valid credentials
   - [ ] Login with invalid credentials shows error
   - [ ] Logout clears session
   - [ ] Protected routes redirect when not logged in

2. **Members**
   - [ ] List members displays correctly
   - [ ] Search filters members
   - [ ] Archive toggle works
   - [ ] Create member modal works
   - [ ] Edit member works
   - [ ] Delete member (balance=0) works
   - [ ] View member detail shows all data

3. **Packages**
   - [ ] Select member for package
   - [ ] Select standard package
   - [ ] Select adhoc with custom values
   - [ ] Purchase date works
   - [ ] Payment method dropdown works
   - [ ] Submit creates purchase
   - [ ] Member balance updates

4. **Attendance**
   - [ ] Select date and time
   - [ ] Select multiple members
   - [ ] Debt warnings appear
   - [ ] Submit creates records
   - [ ] Member balances decrease

5. **Refunds**
   - [ ] Refund button shows for positive balance
   - [ ] Confirmation shows calculated amount
   - [ ] Submit creates refund
   - [ ] Member balance goes to zero

6. **Dashboards**
   - [ ] Finance stats display
   - [ ] Charts render
   - [ ] Attendance stats display

7. **Settings**
   - [ ] Package configs editable
   - [ ] Export downloads JSON
   - [ ] Import uploads and replaces data

---

## 12. Migration to Production (Phase 2)

### Steps (Future)

1. **Create PostgreSQL adapter**
   - Implement `PostgresStorageAdapter` class
   - Use SQLAlchemy for ORM
   - Same interface as file adapter

2. **Database schema**
   - Create Alembic migrations
   - Tables: members, years, opening_balances, package_purchases, attendance_records, refund_transactions, settings, auth_credentials

3. **Railway deployment**
   - Add PostgreSQL plugin
   - Configure environment variables
   - Deploy backend
   - Run migrations

4. **Frontend deployment**
   - Deploy to Vercel/Netlify
   - Configure CORS
   - Set API URL

5. **Cron jobs**
   - Configure Railway cron or external service
   - Weekly backup: Sunday 2:13 AM
   - Monthly backup: 1st of month 1:07 AM
   - Email report: Saturday 11:00 AM

---

## Summary

This implementation plan provides:

- Complete directory structure for backend and frontend
- All code patterns and implementations
- Data models and JSON structures
- API endpoint list
- Development setup instructions
- Testing checklist
- Future migration path

**Estimated Implementation Time:** 5-7 days for full application

**Recommended Start Order:**
1. Backend schemas → storage → APIs
2. Frontend types → services → contexts
3. Frontend components → pages

---

**Document Version:** 1.0
**Last Updated:** April 13, 2026
