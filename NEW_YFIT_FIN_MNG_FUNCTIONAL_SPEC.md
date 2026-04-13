# YFit Fin Management - Functional Specification

**Version:** 1.0
**Date:** April 11, 2026
**Author:** System Architecture Team
**Status:** Draft for Review

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete Data Model](#2-complete-data-model)
3. [Navigation & Application Structure](#3-navigation--application-structure)
4. [Authentication System](#4-authentication-system)
5. [Dashboard Pages](#5-dashboard-pages)
6. [Member Management](#6-member-management)
7. [Attendance Management](#7-attendance-management)
8. [Package Sales](#8-package-sales)
9. [Transaction History](#9-transaction-history)
10. [Settings & Administration](#10-settings--administration)
11. [Automated Features](#11-automated-features)
12. [Business Logic & Calculations](#12-business-logic--calculations)
13. [User Workflows](#13-user-workflows)
14. [API Specification](#14-api-specification)
15. [Technical Architecture](#15-technical-architecture)
16. [Security & Validation](#16-security--validation)
17. [Testing Strategy](#17-testing-strategy)
18. [Deployment Guide](#18-deployment-guide)
19. [Future Enhancements](#19-future-enhancements)
20. [Appendices](#20-appendices)

---

## 1. Executive Summary

### 1.1 Project Overview

**YFit Fin Management** is a comprehensive web-based application designed for fitness studios to manage member packages, track class attendance, and monitor financial transactions. The system streamlines studio operations by providing real-time visibility into member balances, debt tracking, attendance patterns, and revenue analytics.

### 1.2 Purpose & Goals

The application solves the following business challenges for fitness studio owners:

- **Package Management:** Track multiple package types (10-class, 20-class, youth packages, custom packages)
- **Attendance Tracking:** Record class attendance with automatic class deduction from member balances
- **Financial Oversight:** Monitor revenue, track member debt, analyze payment methods
- **Year-over-Year Data:** Maintain historical data with year-based data isolation
- **Automated Operations:** Weekly backups, monthly reports, email notifications
- **Admin Control:** Manage pricing, credentials, year transitions, and data exports

### 1.3 Target Users

- **Primary User:** Single fitness studio owner or manager
- **Scale:** Designed for studios managing 50-500 members
- **Access:** Single-user admin access (multi-user support planned for V2)
- **Technical Skill:** No technical expertise required; intuitive web interface

### 1.4 Key Features Summary

**Core Capabilities (11 Application Pages):**
1. **Authentication** - Secure login/logout with credential management
2. **Finance Dashboard** - Primary dashboard with earnings, debt analysis, payment tracking
3. **Attendance Dashboard** - Analytics for class attendance patterns and trends
4. **Member Management** - CRUD operations, search, archive, member detail views
5. **Attendance Marking** - Record class attendance with debt warnings
6. **Class Calendar** - Monthly view of classes with attendee lists
7. **Package Sales** - Sell 4 configurable packages + custom packages
8. **Transaction History** - Complete audit trail with running totals
9. **Settings & Admin** - Configure pricing, manage years, credentials, data import/export
10. **Automated Backups** - Weekly and monthly automated backups
11. **Email Reports** - Weekly comprehensive email reports

**Advanced Features:**
- Dual dashboards (finance + attendance analytics)
- 4 standard package types + ad-hoc custom packages
- Year-based data isolation with automatic carry-over
- Year locking (current year editable, previous year only in January)
- Automated debt calculations and warnings
- Payment method tracking
- Member birthday tracking
- Refund processing with automatic amount calculation
- Export/import functionality for data portability
- Tax cap tracking for financial reporting

### 1.5 Technology Stack

#### Development & Production Modes

The application supports **dual deployment modes** to facilitate development and production workflows:

**Development Mode (File Storage):**
- JSON file-based storage
- Runs on localhost without database setup
- Fast iteration and testing
- Easy data inspection (human-readable JSON files)
- Ideal for development, testing, and small-scale deployments

**Production Mode (Database):**
- PostgreSQL database for scalability
- Hosted on Railway with automatic backups
- Supports concurrent access
- ACID transaction guarantees
- Ideal for production deployment

#### Technology Components

**Backend:**
- **Framework:** Python FastAPI 0.109+
- **Language:** Python 3.11+
- **Validation:** Pydantic 2.5+
- **ORM:** SQLAlchemy 2.0+ (database mode)
- **Migrations:** Alembic (database mode)
- **Database Driver:** Psycopg2-binary (PostgreSQL)
- **File Locking:** FileLock (file storage mode)
- **Testing:** Pytest
- **Environment:** Python-dotenv

**Database:**
- **Production:** PostgreSQL 14+
- **Development:** JSON file storage

**Frontend:**
- **Framework:** React 18
- **Language:** TypeScript 5
- **Build Tool:** Vite
- **Routing:** React Router DOM 6
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Date Handling:** Date-fns

**Deployment:**
- **Backend Hosting:** Railway (production)
- **Frontend Hosting:** Vercel or Netlify
- **Containerization:** Docker
- **Cron Jobs:** Railway Cron or external service (cron-job.org)
- **Email Service:** Resend API (for automated reports)

### 1.6 Architecture Highlights

**Storage Abstraction Layer:**
- Abstract interface allows switching between file and database storage
- Same business logic works with both storage modes
- Easy migration from development to production

**API-First Design:**
- RESTful API with comprehensive endpoint coverage
- OpenAPI/Swagger documentation auto-generated
- Clear separation between frontend and backend
- Enables future mobile app development

**Year-Based Data Isolation:**
- Each calendar year has separate transaction data
- Opening balances carried forward automatically
- Previous years become read-only (with January grace period)
- Prevents accidental historical data modification

**Automated Operations:**
- Weekly automated backups (Sunday 2:13 AM)
- Monthly automated backups (1st of month 1:07 AM)
- Weekly email reports (Saturday 11:00 AM)
- Automatic backup cleanup (retain last 4 per year)

### 1.7 Project Scope

**In Scope for V1:**
- All 11 application pages with full functionality
- Authentication and authorization
- Dual storage modes (file + database)
- Complete CRUD operations for all entities
- Automated backups and email reports
- Year management and locking
- Debt tracking and calculations
- Export/import functionality
- Responsive web interface (desktop + mobile)
- Railway production deployment

**Out of Scope for V1:**
- Multi-user access with role-based permissions
- Mobile native applications (iOS/Android)
- SMS notifications
- Payment gateway integration
- Member self-service portal
- Class booking/reservation system
- Capacity management per class
- Custom reporting with date ranges

### 1.8 Success Criteria

The application will be considered successful if it:
1. Accurately tracks all member balances and transactions
2. Prevents data loss through automated backups
3. Provides clear visibility into studio finances
4. Loads all pages in under 2 seconds
5. Supports up to 500 members without performance degradation
6. Successfully migrates from file storage to PostgreSQL
7. Deploys to Railway without manual intervention
8. Runs automated tasks reliably (backups, reports)

### 1.9 Document Structure

This functional specification is organized to support both **business stakeholders** and **technical implementers**:

**Sections 1-13:** Feature-focused documentation (what the application does)
- Business requirements
- User interface specifications
- User workflows
- Business logic rules

**Sections 14-20:** Implementation-focused documentation (how to build it)
- API specifications
- Technical architecture
- Database schemas
- Deployment procedures
- Testing strategies

---

## 2. Complete Data Model

This section documents all data entities, their fields, relationships, and validation rules. The data model is designed to be storage-agnostic and works with both file storage (JSON) and database storage (PostgreSQL).

### 2.1 Member Entity

The Member entity represents a studio member (customer).

**Fields:**

| Field | Type | Required | Description | Validation |
| --- | --- | --- | --- | --- |
| `id` | string | Yes | Unique identifier (UUID or timestamp-based) | Must be unique |
| `memberId` | integer | Yes | Human-friendly sequential ID | Auto-increment, unique |
| `name` | string | Yes | Member's full name | Non-empty, max 200 chars |
| `phone` | string | No | Contact phone number | Optional, format: 10 digits |
| `dateOfBirth` | string | No | Date of birth (YYYY-MM-DD) | Optional, valid date |
| `isArchived` | boolean | Yes | Soft delete flag | Default: false |
| `createdAt` | string | Yes | Creation timestamp (ISO 8601) | Auto-generated |

**Example:**
```json
{
  "id": "1773692326018",
  "memberId": 1,
  "name": "מיכל טרפינקרט",
  "phone": "0545214603",
  "dateOfBirth": "1990-05-15",
  "isArchived": false,
  "createdAt": "2026-03-16T20:18:46.018Z"
}
```

**Business Rules:**
- Members can be archived (soft delete) but not hard deleted if they have transactions
- Member deletion is only allowed if balance = 0 and no transaction history
- `memberId` is used for display and sorting, while `id` is used for relationships
- Name supports Hebrew and other Unicode characters

**Indexes (Database Mode):**
- Primary key: `id`
- Unique index: `memberId`
- Index: `name` (for search)
- Index: `isArchived` (for filtering)

---

### 2.2 PackagePurchase Entity

Represents a package sale transaction to a member.

**Fields:**

| Field | Type | Required | Description | Validation |
| --- | --- | --- | --- | --- |
| `id` | string | Yes | Unique transaction ID | UUID or timestamp-based |
| `memberId` | string | Yes | Reference to Member.id | Must exist in members |
| `memberName` | string | Yes | Denormalized member name | Captured at purchase time |
| `packageType` | string | Yes | Package type identifier | See package types below |
| `price` | number | Yes | Package price at purchase (₪) | Positive number |
| `classCount` | integer | Yes | Number of classes in package | Positive integer |
| `amountPaid` | number | Yes | Actual amount paid (₪) | Positive number |
| `purchaseDate` | string | Yes | Purchase date (ISO 8601) | Valid date |
| `yearKey` | string | Yes | Year this purchase belongs to | YYYY format |
| `paymentMethod` | string | No | Payment method | Optional, freeform |

**Package Types (9 Total):**

**Modern Types (Primary):**
- `package1` - Standard 20-class package (default: 900₪)
- `package2` - Standard 10-class package (default: 500₪)
- `package3` - Youth 20-class package (default: 700₪)
- `package4` - Youth 10-class package (default: 400₪)
- `adhoc` - Custom/ad-hoc package (variable price and class count)

**Legacy Types (Backward Compatibility):**
- `10` - Legacy 10-class package (maps to package2)
- `20` - Legacy 20-class package (maps to package1)
- `youth10` - Legacy youth 10-class (maps to package4)
- `youth20` - Legacy youth 20-class (maps to package3)

**Payment Methods (Examples):**
- "Paybox"
- "Bit"
- "Bank transfer"
- "Check"
- "Cash (Avoid)"
- "Other"
- (Any custom string allowed)

**Example:**
```json
{
  "id": "1774024337703",
  "memberId": "1773692326018",
  "memberName": "מיכל טרפינקרט",
  "packageType": "package1",
  "price": 900,
  "classCount": 20,
  "amountPaid": 900,
  "purchaseDate": "2026-03-19T00:00:00.000Z",
  "yearKey": "2026",
  "paymentMethod": "Paybox"
}
```

**Business Rules:**
- Price is captured at purchase time for historical accuracy (allows price changes without affecting history)
- `amountPaid` can differ from `price` (for discounts)
- Member name is denormalized to preserve historical accuracy
- Each purchase belongs to exactly one year
- `adhoc` packages allow custom class count and price

**Indexes (Database Mode):**
- Primary key: `id`
- Foreign key: `memberId` references `members(id)` ON DELETE CASCADE
- Foreign key: `yearKey` references `years(year_key)` ON DELETE CASCADE
- Index: `purchaseDate` (for date filtering)
- Index: `yearKey` (for year filtering)

---

### 2.3 AttendanceRecord Entity

Records a member's attendance at a class.

**Fields:**

| Field | Type | Required | Description | Validation |
| --- | --- | --- | --- | --- |
| `id` | string | Yes | Unique record ID | Composite: timestamp-memberId |
| `memberId` | string | Yes | Reference to Member.id | Must exist in members |
| `memberName` | string | Yes | Denormalized member name | Captured at attendance time |
| `classType` | string | No | Type of class | Optional: "beginner", "regular" |
| `date` | string | Yes | Class date (YYYY-MM-DD) | Valid date, normalized |
| `time` | string | No | Class time (HH:MM) | Optional, default: "18:00" |
| `dayOfWeek` | string | No | Day name in Hebrew | Optional, calculated |
| `yearKey` | string | Yes | Year this attendance belongs to | YYYY format |

**Hebrew Days of Week:**
- `יום ראשון` - Sunday
- `יום שני` - Monday
- `יום שלישי` - Tuesday
- `יום רביעי` - Wednesday
- `יום חמישי` - Thursday
- `יום שישי` - Friday
- `שבת` - Saturday

**Example:**
```json
{
  "id": "1774025000000-1773692326018",
  "memberId": "1773692326018",
  "memberName": "מיכל טרפינקרט",
  "classType": "regular",
  "date": "2026-03-20",
  "time": "18:00",
  "dayOfWeek": "יום חמישי",
  "yearKey": "2026"
}
```

**Business Rules:**
- Each attendance record deducts 1 class from member balance
- Duplicate records for same date+time are removed before adding new ones
- Multiple classes can exist on same date at different times
- Time defaults to "18:00" if not specified
- Day of week is calculated from date for display purposes

**Indexes (Database Mode):**
- Primary key: `id`
- Foreign key: `memberId` references `members(id)` ON DELETE CASCADE
- Foreign key: `yearKey` references `years(year_key)` ON DELETE CASCADE
- Composite index: `(date, time)` for deduplication
- Index: `date` (for date filtering)
- Index: `yearKey` (for year filtering)

---

### 2.4 RefundTransaction Entity

Records a refund transaction when a member is refunded for remaining classes.

**Fields:**

| Field | Type | Required | Description | Validation |
| --- | --- | --- | --- | --- |
| `id` | string | Yes | Unique transaction ID | UUID or timestamp-based |
| `memberId` | string | Yes | Reference to Member.id | Must exist in members |
| `memberName` | string | Yes | Denormalized member name | Captured at refund time |
| `classesRefunded` | integer | Yes | Number of classes refunded | Positive integer |
| `refundAmount` | number | Yes | Monetary refund amount (₪) | Positive number |
| `refundDate` | string | Yes | Refund date (ISO 8601) | Valid date |
| `yearKey` | string | Yes | Year this refund belongs to | YYYY format |

**Example:**
```json
{
  "id": "1774030000000",
  "memberId": "1773692326018",
  "memberName": "מיכל טרפינקרט",
  "classesRefunded": 5,
  "refundAmount": 225.0,
  "refundDate": "2026-03-21T00:00:00.000Z",
  "yearKey": "2026"
}
```

**Business Rules:**
- Refund amount calculated as: `classesRefunded × pricePerClass`
- Price per class determined from most recent package purchase
- If no purchases exist, uses package1 rate from settings
- Refunds can only be processed if member has positive class balance
- Refunds are final (no "undo refund" operation)

**Indexes (Database Mode):**
- Primary key: `id`
- Foreign key: `memberId` references `members(id)` ON DELETE CASCADE
- Foreign key: `yearKey` references `years(year_key)` ON DELETE CASCADE
- Index: `refundDate` (for date filtering)
- Index: `yearKey` (for year filtering)

---

### 2.5 Settings Entity

Stores global application settings including package configurations.

**Fields:**

| Field | Type | Required | Description | Validation |
| --- | --- | --- | --- | --- |
| `package1` | object | Yes | Package 1 configuration | See PackageConfig below |
| `package2` | object | Yes | Package 2 configuration | See PackageConfig below |
| `package3` | object | Yes | Package 3 configuration | See PackageConfig below |
| `package4` | object | Yes | Package 4 configuration | See PackageConfig below |
| `yearlyTaxCap` | number | No | Yearly tax cap amount (₪) | Optional, positive number |
| `updatedAt` | string | Yes | Last update timestamp | ISO 8601 |

**PackageConfig Sub-object:**

| Field | Type | Required | Description | Validation |
| --- | --- | --- | --- | --- |
| `name` | string | Yes | Display name | Non-empty |
| `classCount` | integer | Yes | Number of classes | Positive integer |
| `price` | number | Yes | Package price (₪) | Positive number |

**Example:**
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

**Business Rules:**
- Settings are global (not year-specific)
- Price changes only affect future purchases
- Historical purchases retain original prices
- All 4 packages must be configured
- Tax cap is optional (used for financial reporting visualization)

**Default Values:**
- Package1: 20 classes @ 900₪
- Package2: 10 classes @ 500₪
- Package3: 20 classes @ 700₪
- Package4: 10 classes @ 400₪
- Tax cap: null (no cap)

---

### 2.6 YearData Structure

Container for all transaction data for a specific calendar year.

**Fields:**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `yearKey` | string | Yes | Year identifier (YYYY) |
| `openingBalances` | object | Yes | Opening balances per member |
| `packagePurchases` | array | Yes | All package purchases for year |
| `refunds` | array | Yes | All refund transactions for year |
| `attendance` | array | Yes | All attendance records for year |
| `lastUpdated` | string | Yes | Last update timestamp |

**Opening Balances Structure:**
```typescript
{
  [memberId: string]: {
    classes: number  // Starting class count for this year
  }
}
```

**Example:**
```json
{
  "yearKey": "2026",
  "openingBalances": {
    "1773692326018": { "classes": 33 },
    "1773692338810": { "classes": 14 }
  },
  "packagePurchases": [...],
  "refunds": [...],
  "attendance": [...],
  "lastUpdated": "2026-04-11T14:57:47.480Z"
}
```

**Business Rules:**
- Each year has completely isolated transaction data
- Opening balances are carried forward from previous year's closing balance
- New year creation copies current members and their closing balances
- Transaction arrays start empty for new years
- Year data can be deleted (with automatic backup)

---

### 2.7 AuthCredentials Entity

Stores authentication credentials for admin access.

**Fields:**

| Field | Type | Required | Description | Validation |
| --- | --- | --- | --- | --- |
| `username` | string | Yes | Admin username | Alphanumeric, 4-12 chars |
| `password` | string | Yes | Admin password (hashed) | Alphanumeric, 4-12 chars |
| `lastUpdated` | string | Yes | Last credential change | ISO 8601 |

**Example (Stored):**
```json
{
  "username": "yifatkol",
  "password": "$2b$10$...",  // Bcrypt hash
  "lastUpdated": "2026-03-20T16:42:31.135Z"
}
```

**Default Credentials:**
- Username: "yifatkol"
- Password: "5771" (hashed in storage)

**Business Rules:**
- Passwords must be hashed (bcrypt) before storage
- Never store plain text passwords
- Username and password constraints enforced on update
- Single set of credentials (multi-user not supported in V1)

**Security Requirements:**
- Use bcrypt with salt rounds >= 10
- Session management via JWT or similar
- Credentials changeable by admin

---

### 2.8 Derived/Calculated Fields

These fields are calculated dynamically and not stored directly.

#### classesRemaining (for Member)

**Formula:**
```
classesRemaining =
  openingBalances[memberId].classes +
  SUM(packagePurchases[memberId].classCount) -
  COUNT(attendance[memberId]) -
  SUM(refunds[memberId].classesRefunded)
```

**Notes:**
- Calculated per year
- Can be negative (indicates debt)
- Always recalculated, never cached

#### debtAmount (for Member)

**Formula:**
```
IF classesRemaining < 0:
  pricePerClass = mostRecentPackage.price / mostRecentPackage.classCount
  debtAmount = ABS(classesRemaining) × pricePerClass
ELSE:
  debtAmount = 0
```

**Fallback:**
- If no packages exist: use `settings.package1.price / settings.package1.classCount`

#### memberStatus (for Member)

**Logic:**
```
IF member.isArchived:
  status = "Archived"
ELSE IF classesRemaining < 0:
  status = "In Debt"
ELSE IF classesRemaining = 0:
  status = "No Classes"
ELSE:
  status = "Active"
```

**Color Coding:**
- Archived: Gray
- In Debt: Red (bold)
- No Classes: Yellow/Orange
- Active: Green/Blue

#### Monthly Aggregations

**Attendees per Month:**
```sql
SELECT YEAR-MONTH(date), COUNT(DISTINCT memberId)
FROM attendance
GROUP BY YEAR-MONTH(date)
```

**Earnings per Month:**
```sql
SELECT YEAR-MONTH(purchaseDate),
       SUM(amountPaid) - COALESCE(SUM(refunds.refundAmount), 0)
FROM packagePurchases
LEFT JOIN refunds ON YEAR-MONTH(purchaseDate) = YEAR-MONTH(refundDate)
GROUP BY YEAR-MONTH(purchaseDate)
```

---

### 2.9 Entity Relationships

**Entity Relationship Diagram (Text Format):**

```
Member (1) ----< (M) PackagePurchase
  |
  |----< (M) AttendanceRecord
  |
  |----< (M) RefundTransaction
  |
  |----< (1) OpeningBalance (per year)

Year (1) ----< (M) PackagePurchase
  |
  |----< (M) AttendanceRecord
  |
  |----< (M) RefundTransaction
  |
  |----< (M) OpeningBalance

Settings (1) - Global configuration

AuthCredentials (1) - Single admin
```

**Cascade Delete Rules:**
- Deleting a Member → CASCADE delete all associated purchases, attendance, refunds, opening balances
- Deleting a Year → CASCADE delete all associated purchases, attendance, refunds, opening balances
- Settings and AuthCredentials → Cannot be deleted, only updated

---

### 2.10 Data Validation Rules

**Cross-Entity Validation:**

1. **Package Sale Validation:**
  - Member must exist and not be archived
  - Year must be editable (current year or previous year in January)
  - `amountPaid` must be ≤ `price` (discounts allowed, no overpayment)

2. **Attendance Marking Validation:**
  - Member must exist and not be archived
  - Year must be editable
  - Warn if member has classesRemaining ≤ 0 (allow with confirmation)
  - Date must not be in future

3. **Refund Processing Validation:**
  - Member must exist
  - Member must have classesRemaining > 0
  - Year must be editable
  - Refund classes cannot exceed classesRemaining

4. **Member Deletion Validation:**
  - Can only delete if classesRemaining = 0
  - Alternative: Archive instead of delete (soft delete)

5. **Year Deletion Validation:**
  - Cannot delete current year if it's the only year
  - Must create backup before deletion

---

### 2.11 Data Storage Formats

**File Storage (JSON):**
- Members: `/data/members.json`
- Settings: `/data/settings.json`
- Auth: `/data/auth.json`
- Years: `/data/years/YYYY.json` (one file per year)
- Backups: `/data/backups/YYYY/timestamp.json`

**Database Storage (PostgreSQL):**
- All entities as separate tables
- See Section 15.4 for complete database schema

---

## 3. Navigation & Application Structure

### 3.1 Navigation System

The application uses a **sidebar navigation** for desktop and a **bottom navigation bar** for mobile devices.

#### Desktop Sidebar Navigation

**Location:** Fixed left sidebar (width: 256px)
**Behavior:** Always visible, collapsible to icon-only mode

**Navigation Structure:**

```
┌─────────────────────────────┐
│  YFit Fin Logo              │
│  [Year Selector ▼]          │
│  [Read-Only Badge] (if locked)│
├─────────────────────────────┤
│  DASHBOARDS                 │
│  💰 Finance Dashboard       │
│  📊 Attendance Dashboard    │
├─────────────────────────────┤
│  MAIN OPERATIONS            │
│  👥 Members                 │
│  ✓  Attendance              │
│  📅 Monthly Classes         │
│  📦 Packages                │
├─────────────────────────────┤
│  ⚙️  Settings               │
│  🚪 Logout                  │
└─────────────────────────────┘
```

**Navigation Groups:**

1. **Header Section:**
  - YFit Fin branding/logo
  - Year selector dropdown (shows all available years)
  - "Read-Only" badge (displayed when viewing locked years)

2. **Dashboards Group:**
  - Finance Dashboard (`/finance`) - DollarSign icon
  - Attendance Dashboard (`/attendance-dashboard`) - TrendingUp icon

3. **Main Operations Group:**
  - Members (`/members`) - Users icon
  - Attendance (`/attendance`) - ClipboardCheck icon
  - Monthly Classes (`/classes`) - CalendarDays icon
  - Packages (`/package`) - Package icon

4. **Settings & Logout:**
  - Settings (`/settings`) - Settings icon
  - Logout Button - LogOut icon

#### Mobile Bottom Navigation

**Location:** Fixed bottom bar
**Behavior:** Always visible, limited to 4 items

**Navigation Items:**
- Members (Users icon)
- Attendance (ClipboardCheck icon)
- Classes (CalendarDays icon)
- Settings (Settings icon)

**Note:** Finance and Attendance dashboards accessible via Settings menu on mobile

---

### 3.2 Complete Page Inventory

The application consists of **11 pages** total:

| # | Route | Page Title | Type | Public | Editable |
| --- | --- | --- | --- | --- | --- |
| 1 | `/` | Root | Redirect | No | N/A |
| 2 | `/login` | Login | Authentication | Yes | N/A |
| 3 | `/finance` | Finance Dashboard | Dashboard | No | N/A (View-only) |
| 4 | `/attendance-dashboard` | Attendance Analytics | Dashboard | No | N/A (View-only) |
| 5 | `/members` | Members List | CRUD | No | Yes |
| 6 | `/members/[id]` | Member Detail | Detail View | No | Yes |
| 7 | `/attendance` | Mark Attendance | Transaction | No | Year-dependent |
| 8 | `/classes` | Class Calendar | View | No | N/A (View-only) |
| 9 | `/package` | Sell Package | Transaction | No | Year-dependent |
| 10 | `/history` | Transaction History | View | No | N/A (View-only) |
| 11 | `/settings` | Settings & Admin | Configuration | No | Yes |

**Page Type Definitions:**
- **Redirect:** Automatically redirects to another page
- **Authentication:** Public page for login
- **Dashboard:** Analytics and overview pages
- **CRUD:** Create, Read, Update, Delete operations
- **Detail View:** Detailed view of a single entity
- **Transaction:** Pages for creating transactions
- **View:** Read-only display pages
- **Configuration:** System settings and administration

**Access Control:**
- **Public Pages:** Login only (1 page)
- **Protected Pages:** All others require authentication (10 pages)
- **Dynamic Routes:** Member detail (`/members/[id]`)

---

### 3.3 Page Purposes & Key Features

#### 1. Root (`/`)
- **Purpose:** Entry point redirect
- **Behavior:** Automatically redirects to `/finance` (primary dashboard)
- **Authentication:** Required

#### 2. Login (`/login`)
- **Purpose:** User authentication
- **Features:**
  - Username and password input fields
  - Login button
  - Error messages for invalid credentials
  - Gradient UI design
- **Authentication:** Public (no auth required)

#### 3. Finance Dashboard (`/finance`) - PRIMARY DASHBOARD
- **Purpose:** Financial overview and analysis
- **Features:**
  - 5 financial stat cards
  - Monthly earnings chart
  - Cumulative earnings with tax cap line
  - Payment method distribution chart
  - Package type distribution chart
  - Members with debt table
  - Recent refunds list
  - Complete package selling history
- **Authentication:** Required
- **See:** Section 5.1 for detailed specifications

#### 4. Attendance Dashboard (`/attendance-dashboard`)
- **Purpose:** Attendance analytics and patterns
- **Features:**
  - 6 attendance stat cards
  - Monthly attendees bar chart
  - Unique members per month chart
  - Top 20 attendees list
- **Authentication:** Required
- **See:** Section 5.2 for detailed specifications

#### 5. Members List (`/members`)
- **Purpose:** Manage all studio members
- **Features:**
  - Search by name
  - Filter active/archived
  - Add new member modal
  - Member table with actions
  - Status indicators (debt, active, archived)
- **Authentication:** Required
- **See:** Section 6.1 for detailed specifications

#### 6. Member Detail (`/members/[id]`)
- **Purpose:** View individual member details and history
- **Features:**
  - Member status cards
  - Quick action buttons
  - Transaction history (purchases + attendance)
  - Member information grid
- **Authentication:** Required
- **Dynamic:** Uses member ID from URL
- **See:** Section 6.2 for detailed specifications

#### 7. Mark Attendance (`/attendance`)
- **Purpose:** Record class attendance
- **Features:**
  - Class details (date, time, type)
  - Member selection with search
  - Upcoming birthdays sidebar
  - Debt warnings
  - Year lock enforcement
- **Authentication:** Required
- **Editable:** Only for current year (+ previous year in January)
- **See:** Section 7.1 for detailed specifications

#### 8. Class Calendar (`/classes`)
- **Purpose:** View monthly class schedule
- **Features:**
  - Month/year navigation
  - Classes table grouped by date
  - Edit class attendance
  - Summary statistics
- **Authentication:** Required
- **See:** Section 7.2 for detailed specifications

#### 9. Sell Package (`/package`)
- **Purpose:** Sell class packages to members
- **Features:**
  - Member selection
  - 5 package type buttons (4 standard + adhoc)
  - Purchase date and payment method
  - Transaction summary
  - Year lock enforcement
- **Authentication:** Required
- **Editable:** Only for current year (+ previous year in January)
- **See:** Section 8 for detailed specifications

#### 10. Transaction History (`/history`)
- **Purpose:** Complete audit trail of all transactions
- **Features:**
  - Year filter
  - Running totals
  - Color-coded transactions
  - Export functionality
- **Authentication:** Required
- **See:** Section 9 for detailed specifications

#### 11. Settings & Admin (`/settings`)
- **Purpose:** System configuration and administration
- **Features:**
  - Package pricing configuration
  - Data export/import
  - Manual member balance editing
  - Credential management
  - Year creation/deletion
- **Authentication:** Required
- **See:** Section 10 for detailed specifications

---

### 3.4 Routing Configuration

**React Router Setup:**

```typescript
<Routes>
  {/* Public Route */}
  <Route path="/login" element={<Login />} />

  {/* Protected Routes */}
  <Route element={<AuthGuard />}>
    <Route path="/" element={<Navigate to="/finance" />} />
    <Route path="/finance" element={<FinanceDashboard />} />
    <Route path="/attendance-dashboard" element={<AttendanceDashboard />} />
    <Route path="/members" element={<MembersList />} />
    <Route path="/members/:id" element={<MemberDetail />} />
    <Route path="/attendance" element={<MarkAttendance />} />
    <Route path="/classes" element={<ClassCalendar />} />
    <Route path="/package" element={<SellPackage />} />
    <Route path="/history" element={<TransactionHistory />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Routes>
```

**AuthGuard Component:**
- Checks for valid authentication session
- Redirects to `/login` if not authenticated
- Allows access to protected routes if authenticated

---

## 4. Authentication System

### 4.1 Login Page (`/login`)

**Page Purpose:** Secure entry point for admin access

**UI Components:**

1. **Branding Section:**
  - YFit Fin logo/title
  - Gradient background design

2. **Login Form:**
  - Username input field
    - Label: "שם משתמש" (Username in Hebrew)
    - Validation: Alphanumeric, 4-12 characters
  - Password input field
    - Label: "סיסמה" (Password in Hebrew)
    - Type: password (masked input)
    - Validation: Alphanumeric, 4-12 characters
  - Login button: "התחבר" (Login in Hebrew)

3. **Error Display:**
  - Shows error message for invalid credentials
  - Red background alert
  - Clear error text

**Login Flow:**

```
1. User enters username and password
   ↓
2. Click "התחבר" (Login) button
   ↓
3. Frontend validates input format
   ↓
4. POST request to /api/auth with credentials
   ↓
5. Backend validates against stored credentials
   ↓
6a. If VALID:
    - Generate session token (JWT)
    - Store token in localStorage
    - Redirect to /finance
    ↓
6b. If INVALID:
    - Return error response
    - Display error message
    - Clear password field
    - Allow retry
```

**Default Credentials:**
- Username: `yifatkol`
- Password: `5771`

**Session Management:**
- Token stored in localStorage: `yfit_auth_token`
- Token includes expiration time
- Token validated on each protected route access

---

### 4.2 Protected Routes

**AuthGuard Implementation:**

```typescript
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('yfit_auth_token');

    if (!token) {
      navigate('/login');
      return;
    }

    // Validate token (check expiration, format)
    const isValid = validateToken(token);

    if (!isValid) {
      localStorage.removeItem('yfit_auth_token');
      navigate('/login');
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : null;
}
```

**Protection Behavior:**
- All routes except `/login` require authentication
- Unauthenticated users redirected to `/login`
- After successful login, redirect to originally requested page (or `/finance` by default)
- Session persists across browser refresh
- Session expires after inactivity (configurable, e.g., 24 hours)

---

### 4.3 Credential Management

**Changing Credentials (in Settings Page):**

**UI Section:**
- Located in right column of Settings page
- Section title: "שינוי פרטי התחברות" (Change Login Credentials)

**Form Fields:**

1. **Current Credentials Verification:**
  - Current username (read-only display)
  - Admin verification checkbox/confirmation

2. **New Credentials:**
  - New username input
    - Validation: Alphanumeric only, 4-12 characters
    - Real-time validation feedback
  - New password input
    - Validation: Alphanumeric only, 4-12 characters
    - Real-time validation feedback
  - Confirm new password input (optional)

3. **Constraints Display:**
  - "שם משתמש וסיסמה חייבים להיות אלפאנומרים בלבד" (Username and password must be alphanumeric only)
  - "אורך: 4-12 תווים" (Length: 4-12 characters)

4. **Submit Button:**
  - Text: "שמור שינויים" (Save Changes)
  - Disabled until validation passes

**Update Flow:**

```
1. User fills new username/password
   ↓
2. Client-side validation (format, length)
   ↓
3. Click "Save Changes"
   ↓
4. Confirmation dialog: "Are you sure?"
   ↓
5. POST /api/auth (action: updateCredentials)
   ↓
6. Backend validates and hashes new password
   ↓
7. Update credentials in storage
   ↓
8. Return success response
   ↓
9. Show success message
   ↓
10. Force logout (user must login with new credentials)
```

**Security Requirements:**
- New password must be different from old password
- Password hashed with bcrypt (10 rounds minimum)
- Never log or display passwords in plain text
- Update `lastUpdated` timestamp on credential change

---

### 4.4 Logout Flow

**Logout Button:**
- Located at bottom of sidebar navigation
- Icon: LogOut (door with arrow)
- Text: "יציאה" (Logout in Hebrew)

**Logout Process:**

```
1. User clicks Logout button
   ↓
2. Confirmation dialog (optional): "האם אתה בטוח?" (Are you sure?)
   ↓
3. Clear authentication token from localStorage
   ↓
4. Clear any cached user data
   ↓
5. Redirect to /login
   ↓
6. Show message: "התנתקת בהצלחה" (Logged out successfully)
```

**Session Cleanup:**
- Remove `yfit_auth_token` from localStorage
- Clear any session-related cookies
- Reset application state
- Redirect to login page

---

### 4.5 Security Considerations

**Authentication Security:**

1. **Password Storage:**
  - Never store passwords in plain text
  - Use bcrypt hashing with salt rounds ≥ 10
  - Store only the hashed value

2. **Session Management:**
  - Use JWT tokens with expiration
  - Include user identifier in token payload
  - Validate token on every API request
  - Refresh token mechanism (optional for V1)

3. **Brute Force Protection:**
  - Rate limiting on login attempts
  - Temporary lockout after 5 failed attempts
  - Exponential backoff on repeated failures

4. **Transport Security:**
  - HTTPS enforced in production
  - Secure cookie flags (HttpOnly, Secure, SameSite)

5. **XSS Prevention:**
  - React's built-in sanitization
  - Content Security Policy headers
  - No eval() or innerHTML usage

6. **CSRF Protection:**
  - SameSite cookie attribute
  - CSRF tokens for state-changing operations (if using cookies)

---

## 5. Dashboard Pages

### 5.1 Finance Dashboard (`/finance`) - PRIMARY DASHBOARD

**Route:** `/finance`
**Purpose:** Financial overview, earnings analysis, and debt tracking
**Default Landing Page:** Yes (redirect from `/`)

---

#### 5.1.1 Page Layout

**Header Section:**
- Page title: "דשבורד פיננסי" (Finance Dashboard in Hebrew)
- Year selector dropdown (top-right)
- Read-only badge (if year is locked)

**Content Sections:**

1. Financial Status Cards (5 cards)
2. Charts Section (4 charts)
3. Members with Debt Table
4. Recent Refunds List
5. Complete Transaction History (collapsible)

---

#### 5.1.2 Financial Status Cards

**Card 1: Money Received**
- **Label:** "כסף שהתקבל" (Money Received)
- **Value:** Net revenue (purchases - refunds) in ₪
- **Calculation:** `SUM(packagePurchases.amountPaid) - SUM(refunds.refundAmount)`
- **Icon:** DollarSign
- **Color:** Green

**Card 2: Packages Sold**
- **Label:** "כרטיסיות שנמכרו" (Packages Sold)
- **Value:** Count of package purchases
- **Calculation:** `COUNT(packagePurchases)`
- **Icon:** Package
- **Color:** Blue

**Card 3: Average Money per Month**
- **Label:** "ממוצע לחודש" (Average per Month)
- **Value:** Average monthly revenue in ₪
- **Calculation:** `Total Revenue / Active Months`
- **Icon:** TrendingUp
- **Color:** Purple

**Card 4: Total Debt**
- **Label:** "חובות כוללים" (Total Debt)
- **Value:** Sum of all member debts in ₪
- **Calculation:** `SUM(debtAmount for all members with classesRemaining < 0)`
- **Icon:** AlertTriangle
- **Color:** Red
- **Bold:** Yes (warning indicator)

**Card 5: Members with Debt**
- **Label:** "חברים בחוב" (Members in Debt)
- **Value:** Count of members with negative balance
- **Calculation:** `COUNT(members where classesRemaining < 0)`
- **Icon:** Users
- **Color:** Orange

---

#### 5.1.3 Charts Section

**Chart 1: Monthly Earnings Bar Chart**
- **Title:** "הכנסות לפי חודש" (Earnings by Month)
- **Type:** Bar chart
- **X-Axis:** Month labels (e.g., "Jan 26", "Feb 26", "Mar 26")
- **Y-Axis:** Amount in ₪
- **Data:** Net earnings per month (purchases - refunds)
- **Colors:** Green bars
- **Tooltip:** Shows exact amount on hover
- **Height:** 300px

**Chart 2: Cumulative Earnings Chart**
- **Title:** "הכנסות מצטברות" (Cumulative Earnings)
- **Type:** Line chart
- **X-Axis:** Month labels
- **Y-Axis:** Cumulative amount in ₪
- **Data:** Running total of net earnings
- **Line Color:** Blue
- **Special Feature:** Tax cap visualization
  - If `yearlyTaxCap` is set in settings
  - Draw horizontal red line at tax cap amount
  - Label: "תקרת מס" (Tax Cap)
- **Height:** 300px

**Chart 3: Payment Method Distribution**
- **Title:** "התפלגות אמצעי תשלום" (Payment Method Distribution)
- **Type:** Pie chart or Bar chart
- **Data:** Count of purchases by payment method
- **Categories:** Paybox, Bit, Bank transfer, Check, Cash, Other
- **Colors:** Different color per method
- **Shows:** Percentage and count

**Chart 4: Package Type Distribution**
- **Title:** "התפלגות סוגי כרטיסיות" (Package Type Distribution)
- **Type:** Pie chart or Bar chart
- **Data:** Count of purchases by package type
- **Categories:** Package1 (20), Package2 (10), Package3 (Youth 20), Package4 (Youth 10), Adhoc
- **Colors:** Different color per package type
- **Shows:** Percentage and count

---

#### 5.1.4 Members with Debt Section

**Section Title:** "חברים בחוב" (Members in Debt)
**Display Mode:** Table, top 5 by default, expandable to show all

**Table Columns:**
1. Member Name - (Red, bold)
2. Classes Remaining - Negative number (e.g., "-5")
3. Debt Amount - in ₪ (e.g., "225₪")

**Sorting:** By debt amount descending (largest debt first)

**Expand Button:**
- Text: "הצג הכל" (Show All) / "הצג פחות" (Show Less)
- Toggles between top 5 and full list

**Empty State:**
- Message: "אין חברים בחוב" (No members in debt)
- Icon: CheckCircle
- Color: Green

---

#### 5.1.5 Recent Refunds List

**Section Title:** "החזרים אחרונים" (Recent Refunds)
**Display Mode:** List, top 5 by default, expandable

**List Items:**
- Member Name
- Classes Refunded (e.g., "5 classes")
- Refund Amount (in ₪)
- Refund Date

**Sorting:** By date descending (most recent first)

**Styling:**
- Red color theme
- RefundIcon indicator

**Empty State:**
- Message: "אין החזרים" (No refunds)

---

#### 5.1.6 Complete Transaction History

**Section Title:** "היסטוריית מכירות והחזרים" (Package Selling History & Refunds)
**Display Mode:** Collapsible table (collapsed by default)

**Table Columns:**
1. Date (YYYY-MM-DD)
2. Member Name
3. Transaction Type (Sale / Refund with icon)
4. Package Type (for sales)
5. Amount (₪)
6. Running Total (₪)

**Row Styling:**
- **Sales:** Green background/text
- **Refunds:** Red background/text

**Running Total:**
- Starts at 0
- Adds for sales, subtracts for refunds
- Shows cumulative revenue at each transaction

**Sorting:** By date descending (newest first)

**Toggle Button:**
- Text: "הצג היסטוריה מלאה" (Show Full History) / "הסתר" (Hide)
- Icon: ChevronDown / ChevronUp

---

### 5.2 Attendance Dashboard (`/attendance-dashboard`)

**Route:** `/attendance-dashboard`
**Purpose:** Attendance analytics, trends, and top attendees

---

#### 5.2.1 Page Layout

**Header Section:**
- Page title: "דשבורד נוכחות" (Attendance Dashboard)
- Year selector dropdown
- Read-only badge (if year is locked)

**Content Sections:**
1. Attendance Status Cards (6 cards)
2. Charts Section (2 charts)
3. Top Attendees List

---

#### 5.2.2 Attendance Status Cards

**Card 1: Total Active Members**
- **Label:** "חברים פעילים" (Active Members)
- **Value:** Count of non-archived members
- **Calculation:** `COUNT(members where isArchived = false)`
- **Icon:** Users
- **Color:** Blue

**Card 2: Total Classes**
- **Label:** "כיתות סה״כ" (Total Classes)
- **Value:** Count of unique class sessions (date + time combinations)
- **Calculation:** `COUNT(DISTINCT (date, time) from attendance)`
- **Icon:** CalendarDays
- **Color:** Purple

**Card 3: Total Attendees**
- **Label:** "נוכחות סה״כ" (Total Attendees)
- **Value:** Total attendance records count
- **Calculation:** `COUNT(attendance)`
- **Icon:** UserCheck
- **Color:** Green

**Card 4: Average Attendees per Class**
- **Label:** "ממוצע לכיתה" (Average per Class)
- **Value:** Average attendees per class session
- **Calculation:** `Total Attendees / Total Classes`
- **Icon:** TrendingUp
- **Color:** Teal

**Card 5: Average Attendees per Month**
- **Label:** "ממוצע לחודש" (Average per Month)
- **Value:** Average attendees per month
- **Calculation:** `Total Attendees / Active Months`
- **Icon:** Calendar
- **Color:** Orange

**Card 6: Packages Sold (Context)**
- **Label:** "כרטיסיות שנמכרו" (Packages Sold)
- **Value:** Count of package purchases
- **Note:** Included for context (relates attendance to sales)
- **Icon:** Package
- **Color:** Blue

---

#### 5.2.3 Charts Section

**Chart 1: Monthly Attendees Bar Chart**
- **Title:** "נוכחות לפי חודש" (Attendance by Month)
- **Type:** Bar chart
- **X-Axis:** Month labels
- **Y-Axis:** Number of attendance records
- **Data:** Count of attendance per month
- **Colors:** Blue bars
- **Tooltip:** Shows count and percentage
- **Height:** 300px

**Chart 2: Unique Members per Month**
- **Title:** "חברים ייחודיים לפי חודש" (Unique Members by Month)
- **Type:** Line chart or Bar chart
- **X-Axis:** Month labels
- **Y-Axis:** Number of unique members
- **Data:** Count of distinct members who attended each month
- **Colors:** Green line/bars
- **Tooltip:** Shows count
- **Height:** 300px

---

#### 5.2.4 Top Attendees List

**Section Title:** "מובילי נוכחות" (Top Attendees)
**Display Mode:** Table showing top 20 members

**Table Columns:**
1. Rank (#1, #2, #3, ...)
2. Member Name
3. Total Classes Attended (count)

**Sorting:** By attendance count descending (most classes first)

**Styling:**
- Top 3 highlighted (gold, silver, bronze icons)
- Alternating row colors for readability

**Pagination:**
- Shows top 20 by default
- "Show More" button to expand to all members

---

## 6. Member Management

### 6.1 Members List Page (`/members`)

**Route:** `/members`
**Purpose:** View, search, and manage all studio members

---

#### 6.1.1 Page Header

**Title:** "חברים" (Members)

**Action Buttons:**
- **Add Member Button**
  - Text: "+ הוסף חבר" (Add Member)
  - Color: Primary (Blue)
  - Action: Opens Add Member modal

**Search & Filter Bar:**
- **Search Box**
  - Placeholder: "חפש חבר..." (Search member...)
  - Icon: Search
  - Behavior: Real-time filtering by member name
  - Debounce: 300ms

- **Archive Toggle**
  - Options: "פעילים" (Active) / "ארכיון" (Archived)
  - Default: Active
  - Action: Filters table to show active or archived members

---

#### 6.1.2 Members Table

**Table Columns:**

| Column | Content | Width | Sortable |
| --- | --- | --- | --- |
| Status | Status indicator (badge + icon) | 120px | Yes |
| Name | Member name + ID (#) | 200px | Yes |
| Phone | Phone number | 120px | No |
| Date of Birth | YYYY-MM-DD | 120px | Yes |
| Classes Attended | Count (for current year) | 100px | Yes |
| Amount Paid | Total in ₪ (for current year) | 120px | Yes |
| Remaining Classes | Balance (negative in red) | 120px | Yes |
| Remaining Balance | Amount in ₪ (negative in red) | 120px | Yes |
| Actions | Action buttons | 150px | No |

**Status Indicators:**

1. **Active (Green):**
  - Badge: "פעיל" (Active)
  - Icon: CheckCircle
  - Condition: `classesRemaining > 0` and not archived

2. **In Debt (Red, Bold):**
  - Badge: "בחוב" (In Debt)
  - Icon: AlertTriangle
  - Condition: `classesRemaining < 0`
  - Text color: Red
  - Font weight: Bold

3. **No Classes (Yellow):**
  - Badge: "אין כיתות" (No Classes)
  - Icon: AlertCircle
  - Condition: `classesRemaining = 0` and not archived

4. **Archived (Gray):**
  - Badge: "ארכיון" (Archived)
  - Icon: Archive
  - Condition: `isArchived = true`

**Row Actions:**

1. **View Details Button**
  - Icon: ExternalLink
  - Tooltip: "פרטי חבר" (Member Details)
  - Action: Navigate to `/members/{id}`

2. **Archive/Unarchive Toggle**
  - Icon: Archive / ArchiveRestore
  - Tooltip: "העבר לארכיון" (Archive) / "שחזר" (Unarchive)
  - Confirmation: "האם אתה בטוח?" (Are you sure?)
  - Action: Toggle `isArchived` flag

3. **Refund Button** (conditional)
  - Icon: RefundIcon
  - Tooltip: "החזר כספי" (Refund)
  - Condition: Only shown if `classesRemaining > 0`
  - Action: Process refund for remaining classes
  - Confirmation: Shows refund amount before processing

4. **Delete Button** (conditional)
  - Icon: Trash2
  - Tooltip: "מחק חבר" (Delete Member)
  - Condition: Only shown if `classesRemaining = 0`
  - Confirmation: Double confirmation dialog
  - Action: Permanently delete member and all associated data

**Table Behavior:**
- Pagination: 50 members per page
- Sorting: Click column headers to sort
- Loading state: Skeleton rows while fetching
- Empty state: "אין חברים" (No members) message

---

#### 6.1.3 Add Member Modal

**Trigger:** Click "Add Member" button

**Modal Layout:**
- Title: "הוסף חבר חדש" (Add New Member)
- Close button (X) in top-right

**Form Fields:**

1. **Name Field** (Required)
  - Label: "שם מלא" (Full Name)
  - Placeholder: "הזן שם..."
  - Validation: Non-empty, max 200 characters
  - Error: "שם חובה" (Name required)

2. **Phone Field** (Optional)
  - Label: "טלפון" (Phone)
  - Placeholder: "05XXXXXXXX"
  - Validation: 10 digits, starts with 0
  - Format: Auto-format as user types

3. **Date of Birth Field** (Optional)
  - Label: "תאריך לידה" (Date of Birth)
  - Type: Date picker
  - Format: YYYY-MM-DD
  - Validation: Must be in the past

**Action Buttons:**
- **Cancel Button**
  - Text: "ביטול" (Cancel)
  - Style: Secondary (Gray)
  - Action: Close modal without saving

- **Save Button**
  - Text: "שמור" (Save)
  - Style: Primary (Blue)
  - Action: Create member and close modal
  - Disabled: Until name is filled

**Creation Flow:**
```
1. User fills form fields
   ↓
2. Click "Save"
   ↓
3. Frontend validates
   ↓
4. POST /api/members
   ↓
5. Backend creates member (auto-assigns memberId)
   ↓
6. Return created member
   ↓
7. Close modal
   ↓
8. Refresh members table
   ↓
9. Show success toast: "חבר נוסף בהצלחה" (Member added successfully)
```

---

### 6.2 Member Detail Page (`/members/[id]`)

**Route:** `/members/[id]` (dynamic route with member ID)
**Purpose:** Detailed view of individual member with transaction history

---

#### 6.2.1 Page Header

**Back Navigation:**
- Link: "← חזרה לחברים" (Back to Members)
- Action: Navigate to `/members`

**Member Name:**
- Display: Large, prominent
- Color: Red and bold if in debt, normal otherwise
- ID Badge: Shows member ID (e.g., "#5")

**Status Badge:**
- "ארכיון" (Archived) - Gray badge if archived
- Position: Next to member name

---

#### 6.2.2 Status Cards Row

**Card 1: Classes Remaining**
- **Title:** "כיתות שנותרו" (Classes Remaining)
- **Value:** Number of remaining classes
- **Styling:**
  - Green if positive
  - Red + bold if negative
  - "חוב" (DEBT) label in red if negative
- **Icon:** GraduationCap

**Card 2: Total Packages**
- **Title:** "סה״כ כרטיסיות" (Total Packages)
- **Value 1:** Count of package purchases
- **Value 2:** Total money paid (₪)
- **Format:** "5 packages / 3,500₪"
- **Icon:** Package
- **Color:** Blue

**Card 3: Total Attended**
- **Title:** "סה״כ נוכחות" (Total Attended)
- **Value:** Count of attendance records
- **Icon:** UserCheck
- **Color:** Green

---

#### 6.2.3 Quick Actions Section

**Title:** "פעולות מהירות" (Quick Actions)

**Buttons:**

1. **Sell Package**
  - Icon: Package
  - Text: "מכור כרטיסייה" (Sell Package)
  - Color: Blue
  - Action: Navigate to `/package?memberId={id}` (pre-filled)

2. **Mark Attendance**
  - Icon: CheckCircle
  - Text: "סמן נוכחות" (Mark Attendance)
  - Color: Green
  - Action: Navigate to `/attendance?memberId={id}` (pre-selected)

3. **Archive/Unarchive**
  - Icon: Archive / ArchiveRestore
  - Text: "העבר לארכיון" (Archive) / "שחזר" (Unarchive)
  - Color: Orange
  - Confirmation dialog
  - Action: Toggle `isArchived` flag

4. **Refund** (conditional)
  - Icon: RefundIcon
  - Text: "החזר" (Refund)
  - Color: Red
  - Condition: Only shown if `classesRemaining > 0`
  - Shows refund amount in confirmation
  - Action: Process refund

5. **Delete** (conditional)
  - Icon: Trash2
  - Text: "מחק" (Delete)
  - Color: Red
  - Condition: Only shown if `classesRemaining = 0`
  - Double confirmation required
  - Warning about permanent deletion
  - Action: Delete member and all data

---

#### 6.2.4 Transaction History Section

**Layout:** Two-column layout (side-by-side)

---

**Left Column: Package Purchases**

**Title:** "כרטיסיות שנרכשו" (Packages Purchased)

**Display:** List of cards, newest first

**Card Content:**
- Package type name (e.g., "כרטיסיה 20")
- Price paid (e.g., "900₪")
- Purchase date
- Payment method (if recorded)
- Classes count (e.g., "20 classes")

**Styling:**
- Green accent color
- Package icon
- Chronological order (newest at top)

**Empty State:**
- Message: "אין רכישות" (No purchases)
- Icon: Package
- Muted color

---

**Right Column: Attendance History**

**Title:** "היסטוריית נוכחות" (Attendance History)

**Display:** Grouped by month, expandable sections

**Month Group:**
- Header: "March 2026" with count (e.g., "5 classes")
- Initially collapsed (expand/collapse toggle)
- Icon: ChevronDown / ChevronUp

**Attendance Entry:**
- Date (YYYY-MM-DD)
- Time (HH:MM)
- Day of week in Hebrew (e.g., "יום רביעי")
- "-1" notation (indicates 1 class deducted)
- Class type badge (if recorded)

**Limiting:**
- Shows last 10 attendance records by default
- "הצג הכל" (Show All) button if more exist
- Total count displayed (e.g., "35 classes attended")

**Empty State:**
- Message: "אין נוכחות" (No attendance)
- Icon: Calendar
- Muted color

---

#### 6.2.5 Member Information Grid

**Title:** "פרטי חבר" (Member Information)

**Layout:** 2-column grid (3 rows)

**Fields:**

| Field | Label (Hebrew) | Value |
| --- | --- | --- |
| Member ID | מס׳ חבר | Auto-incremented number |
| Member Since | חבר מאז | Creation date (formatted) |
| Total Classes | סה״כ כיתות | Attendance count |
| Total Money | סה״כ כסף | Total paid (₪) |
| Status | סטטוס | Active/In Debt/No Classes/Archived |
| Total Packages | סה״כ כרטיסיות | Package count |

**Styling:**
- Label: Gray, smaller font
- Value: Black, larger font, bold
- Grid spacing: Comfortable padding

---

## 7. Attendance Management

### 7.1 Mark Attendance Page (`/attendance`)

**Route:** `/attendance`
**Purpose:** Record class attendance for multiple members

---

#### 7.1.1 Year Lock Warning

**Condition:** Displayed if current year is not editable

**Alert Box:**
- Background: Yellow/Orange
- Icon: Lock
- Text: "שנה זו נעולה לעריכה" (This year is locked for editing)
- Explanation: "רק השנה הנוכחית והשנה הקודמת בחודש ינואר ניתנות לעריכה"
  (Only current year and previous year in January are editable)

**Form Behavior:**
- All inputs disabled
- Submit button disabled
- Read-only mode

---

#### 7.1.2 Class Details Section

**Title:** "פרטי כיתה" (Class Details)

**Form Fields:**

1. **Date Picker**
  - Label: "תאריך" (Date)
  - Type: Date input
  - Default: Today's date
  - Format: YYYY-MM-DD
  - Hebrew calendar support (optional)

2. **Time Selector**
  - Label: "שעה" (Time)
  - Type: Time input or dropdown
  - Default: "18:00"
  - Format: HH:MM (24-hour)
  - Common times: 17:00, 18:00, 19:00, 20:00

3. **Class Type** (Optional)
  - Label: "סוג כיתה" (Class Type)
  - Type: Dropdown
  - Options:
    - "רגיל" (Regular)
    - "מתחילים" (Beginners)
    - (Empty/None)
  - Default: Empty

---

#### 7.1.3 Member Selection Section

**Title:** "בחירת חברים" (Member Selection)

**Search Box:**
- Placeholder: "חפש חבר..." (Search member)
- Icon: Search
- Behavior: Autocomplete dropdown
- Shows: Member name + current class balance
- Highlights: Members in debt (red text)

**Show All Toggle:**
- Button: "הצג את כל החברים" (Show All Members)
- Action: Expands to show member grid

**Member Grid:**
- Layout: Responsive grid
  - Mobile: 2 columns
  - Desktop: 4 columns
- Card per member

**Member Card:**
- Member name (red if in debt)
- Classes remaining
- Checkbox for selection
- Warning icon if `classesRemaining ≤ 0`
- Hover effect
- Click to toggle selection

**Status Indicators:**
- ⚠️ Red warning: Debt (negative balance)
- ⚠️ Orange warning: Will go into debt (balance = 0)
- ✓ Green check: Selected

---

#### 7.1.4 Selected Members Display

**Title:** "חברים שנבחרו" (Selected Members)

**Display Mode:** Chip list with remove buttons

**Chip Content:**
- Member name
- Remove button (X icon)
- Click to deselect

**Count Display:**
- "נבחרו X חברים" (X members selected)
- Color: Blue
- Limit: 1-15 members

**Validation Warning:**
- If > 15 selected:
  - Red alert: "מקסימום 15 חברים ניתן לסמן בבת אחת"
  - (Maximum 15 members can be marked at once)
  - Submit button disabled

---

#### 7.1.5 Upcoming Birthdays Sidebar

**Location:** Sticky sidebar (right side on desktop)
**Title:** "ימי הולדת קרובים" (Upcoming Birthdays)

**Display:** Next 10 birthdays

**Birthday Entry:**
- Member name
- Birth date (DD/MM)
- Countdown: "בעוד X ימים" (In X days)
- Icon: Cake or Gift

**Sorting:** By proximity (nearest first)

**Special Styling:**
- Today's birthday: Gold highlight + "היום!" (Today!)
- This week: Bold text

**Empty State:**
- Message: "אין ימי הולדת קרובים" (No upcoming birthdays)
- Icon: Calendar

---

#### 7.1.6 Debt Warning Dialog

**Trigger:** When marking attendance for member with `classesRemaining ≤ 0`

**Dialog Title:** "אזהרה: חברים בחוב" (Warning: Members in Debt)

**Content:**
- List of members with debt/zero balance
- For each member:
  - Name (red, bold)
  - Current balance (e.g., "-3 classes")
  - Calculated debt amount (₪)

**Warning Text:**
- "סימון נוכחות יגדיל את החוב"
- (Marking attendance will increase the debt)

**Actions:**
- **Cancel Button**: "בטל" (Cancel) - Go back to edit
- **Continue Button**: "המשך בכל זאת" (Continue Anyway) - Proceed with marking

---

#### 7.1.7 Action Buttons

**Cancel Button:**
- Text: "בטל" (Cancel)
- Style: Secondary (Gray)
- Action: Reset form, clear selections

**Submit Button:**
- Text: "סמן נוכחות" (Mark Attendance)
- Style: Primary (Green)
- Icon: CheckCircle
- Disabled if:
  - No members selected
  - Year is locked
  - More than 15 members selected

**Success Flow:**
```
1. User selects members and fills class details
   ↓
2. Click "Mark Attendance"
   ↓
3. Check for members with debt
   ↓
4a. If debt exists: Show warning dialog
    - User can cancel or continue
    ↓
4b. If no debt: Proceed directly
   ↓
5. POST /api/years/{year}/attendance
   ↓
6. Backend creates attendance records (1 per member)
   ↓
7. Backend deducts 1 class from each member balance
   ↓
8. Return success response
   ↓
9. Show success toast: "נוכחות נרשמה בהצלחה" (Attendance recorded)
   ↓
10. Reset form
   ↓
11. Optionally: Navigate to /classes (show in calendar)
```

---

### 7.2 Class Calendar Page (`/classes`)

**Route:** `/classes`
**Purpose:** View monthly class schedule with attendee lists

---

#### 7.2.1 Page Header

**Title:** "כיתות חודשיות" (Monthly Classes)

**Month/Year Navigation:**
- Previous Month Button: "◀"
- Current Display: "March 2026"
- Next Month Button: "▶"
- "Current Month" badge (if viewing current month)

---

#### 7.2.2 Summary Stats

**Card 1: Total Classes**
- Label: "סה״כ כיתות" (Total Classes)
- Value: Count of unique class sessions in month
- Icon: CalendarDays

**Card 2: Total Attendees**
- Label: "סה״כ משתתפים" (Total Attendees)
- Value: Sum of attendance records in month
- Icon: Users

---

#### 7.2.3 Classes Table

**Table Columns:**

| Column | Content | Width | Sortable |
| --- | --- | --- | --- |
| Date | YYYY-MM-DD | 120px | Yes |
| Time | HH:MM | 80px | Yes |
| Day | Hebrew day name | 100px | No |
| Attendees | Comma-separated names | Auto | No |
| Actions | Edit button | 80px | No |

**Row Details:**

**Date Column:**
- Format: DD/MM/YYYY (display)
- Stored: YYYY-MM-DD
- Today's date highlighted

**Time Column:**
- Format: HH:MM
- Default: 18:00

**Day Column:**
- Hebrew day names
- (יום ראשון, יום שני, etc.)

**Attendees Column:**
- Comma-separated member names
- Truncate if too long with "..." and count
- Tooltip shows full list on hover
- Example: "John, Jane, Bob... +3 more"

**Actions Column:**
- Edit button (pencil icon)
- Action: Navigate to `/attendance` with pre-filled data

---

#### 7.2.4 Edit Class Functionality

**Edit Button Click:**
```
1. User clicks Edit button for a class
   ↓
2. Extract class data: date, time, member IDs
   ↓
3. Navigate to `/attendance` with query params
   ↓
4. Attendance page pre-populates:
   - Date field
   - Time field
   - Selected members
   ↓
5. User can modify and re-submit
   ↓
6. Backend removes old attendance records for this date+time
   ↓
7. Backend creates new attendance records
```

**Highlight Animation:**
- Newly created/edited classes flash with green highlight
- Animation duration: 2 seconds
- Helps user locate their recent changes

---

#### 7.2.5 Grouping and Sorting

**Grouping:**
- Optional: Group by date (all classes on same date together)
- Visual separator between dates

**Default Sort:**
- Date descending (newest first)
- Within same date: Time ascending

**Empty State:**
- Message: "אין כיתות בחודש זה" (No classes this month)
- Icon: CalendarX
- Suggestion: "עבור לחודש אחר או סמן נוכחות חדשה"
  (Go to another month or mark new attendance)

---

## 8. Package Sales

### 8.1 Sell Package Page (`/package`)

**Route:** `/package`
**Purpose:** Sell class packages to members

---

#### 8.1.1 Year Lock Warning

**Same as Attendance page** - Shows warning if year is locked

---

#### 8.1.2 Member Selection

**Title:** "בחר חבר" (Select Member)

**Search Box:**
- Placeholder: "חפש חבר..." (Search member)
- Icon: Search
- Autocomplete dropdown
- Shows: Name + current balance

**Show All Toggle:**
- Button: "הצג את כל החברים" (Show All Members)
- Expands to member grid

**Member Grid:**
- Layout: 2 columns (mobile), 4 columns (desktop)
- Click card to select member

**Member Card:**
- Member name (red if in debt)
- Current classes balance
- Status indicator:
  - "בחוב" (In Debt) - Red badge if negative
  - "פעיל" (Active) - Green badge if positive
- Click to select (radio behavior - single selection)

---

#### 8.1.3 Selected Member Display

**Card:**
- Member name (large, bold)
- Current class balance
- Status badge
- Clear selection button (X)

---

#### 8.1.4 Package Selection

**Title:** "בחר סוג כרטיסייה" (Select Package Type)

**Layout:** Grid of package buttons (2x3 grid)

**Package Buttons:**

**1. Ad-Hoc Package (Custom)**
- Title: "כרטיסייה אד-הוק" (Ad-Hoc Package)
- Description: "סכום וכמות מותאמים אישית"
  (Custom amount and quantity)
- Icon: Sparkles
- Color: Purple
- Action: Opens custom input fields

**2. Package 1 (Standard 20)**
- Title: From settings (e.g., "כרטיסיה 20")
- Price: From settings (e.g., "900₪")
- Classes: 20
- Price per class: Auto-calculated (e.g., "45₪/class")
- Badge: "Best Value" (optional)
- Icon: Package
- Color: Blue
- Selected: Green border when selected

**3. Package 2 (Standard 10)**
- Title: From settings (e.g., "כרטיסיה 10")
- Price: From settings (e.g., "500₪")
- Classes: 10
- Price per class: Auto-calculated (e.g., "50₪/class")
- Icon: Package
- Color: Cyan

**4. Package 3 (Youth 20)**
- Title: From settings (e.g., "נוער 20")
- Price: From settings (e.g., "700₪")
- Classes: 20
- Price per class: Auto-calculated
- Icon: Users
- Color: Orange

**5. Package 4 (Youth 10)**
- Title: From settings (e.g., "נוער 10")
- Price: From settings (e.g., "400₪")
- Classes: 10
- Price per class: Auto-calculated
- Icon: Users
- Color: Yellow

**Button Behavior:**
- Single selection (radio)
- Selected state: Green border + checkmark
- Hover effect: Slight lift + shadow

---

#### 8.1.5 Transaction Details

**Purchase Date:**
- Label: "תאריך רכישה" (Purchase Date)
- Type: Date picker
- Default: Today
- Format: YYYY-MM-DD

**Payment Method:**
- Label: "אמצעי תשלום" (Payment Method)
- Type: Dropdown
- Options:
  - "Paybox"
  - "Bit"
  - "העברה בנקאית" (Bank transfer)
  - "צ'ק" (Check)
  - "מזומן (לא מומלץ)" (Cash - Not recommended)
  - "אחר" (Other)
- Optional field (can be empty)

**Custom Amount & Classes (Ad-Hoc Only):**
- **Custom Price Field:**
  - Label: "מחיר" (Price)
  - Type: Number input
  - Suffix: "₪"
  - Validation: Positive number

- **Custom Classes Field:**
  - Label: "מספר כיתות" (Number of Classes)
  - Type: Number input
  - Validation: Positive integer
  - Default: 1

---

#### 8.1.6 Transaction Summary Card

**Title:** "סיכום עסקה" (Transaction Summary)

**Content:**
- **Package Type:** Display name (e.g., "כרטיסיה 20")
- **Price:** Amount in ₪
- **Current Classes:** Member's current balance
- **After Purchase:** New balance after adding classes
  - Format: "33 + 20 = 53 classes"
  - Color: Green
- **Amount to Pay:** Total price (₪)

**Calculation Display:**
- Before: "10 classes"
- Adding: "+20 classes"
- After: "30 classes"
- Visual: Arrow or plus sign

---

#### 8.1.7 Action Buttons

**Cancel Button:**
- Text: "בטל" (Cancel)
- Style: Secondary
- Action: Reset form, clear selections

**Submit Button:**
- Text: "מכור כרטיסייה" (Sell Package)
- Displays price: "מכור - 900₪"
- Style: Primary (Blue)
- Icon: ShoppingCart
- Disabled if:
  - No member selected
  - No package selected
  - Year is locked
  - (For adhoc: No price or classes entered)

**Success Flow:**
```
1. User selects member, package, date, payment method
   ↓
2. Reviews transaction summary
   ↓
3. Click "Sell Package"
   ↓
4. POST /api/years/{year}/packages
   ↓
5. Backend creates PackagePurchase record
   ↓
6. Backend calculates new member balance
   ↓
7. Return success response
   ↓
8. Show success toast: "כרטיסייה נמכרה בהצלחה" (Package sold successfully)
   ↓
9. Options:
   a) Navigate to member detail page
   b) Reset form for next sale
   c) Navigate to finance dashboard
```

---

#### 8.1.8 Pre-population Support

**URL Parameter:** `?memberId=xxx`

**Behavior:**
- If `memberId` in URL query params
- Automatically select that member on page load
- Useful for "Sell Package" quick action from member detail page

**Example:** `/package?memberId=1773692326018`

---

## 9. Transaction History

### 9.1 History Page (`/history`)

**Route:** `/history`
**Purpose:** Complete audit trail of all financial transactions

---

#### 9.1.1 Page Header

**Title:** "היסטוריית עסקאות" (Transaction History)

**Filters Row:**

**Year Filter:**
- Label: "שנה" (Year)
- Type: Dropdown
- Options:
  - "כל השנים" (All Years)
  - "2026"
  - "2025"
  - "2024"
  - (All available years)
- Default: Current year
- Action: Filter transactions by year

**Transaction Type Filter (Optional):**
- Label: "סוג" (Type)
- Options:
  - "הכל" (All)
  - "מכירות" (Sales)
  - "החזרים" (Refunds)
- Action: Filter by transaction type

---

#### 9.1.2 Summary Stats

**Card 1: Total Transactions**
- Label: "סה״כ עסקאות" (Total Transactions)
- Value: Count of filtered transactions
- Icon: Receipt

**Card 2: Final Total**
- Label: "סכום סופי" (Final Total)
- Value: Net revenue (sales - refunds) in ₪
- Icon: DollarSign
- Color: Green if positive, Red if negative

---

#### 9.1.3 Transactions Table

**Table Columns:**

| Column | Content | Width | Sortable |
| --- | --- | --- | --- |
| Member Name | Name | 200px | Yes |
| Date | YYYY-MM-DD | 120px | Yes (default desc) |
| Type | Sale/Refund with icon | 100px | Yes |
| Payment Method | Method (for sales) | 120px | No |
| Amount | ₪ with +/- | 120px | Yes |
| Running Total | Cumulative ₪ | 120px | No |

**Transaction Type Display:**

**Sale:**
- Icon: TrendingUp or ShoppingCart
- Text: "מכירה" (Sale)
- Color: Green
- Amount: "+900₪" (positive, green)

**Refund:**
- Icon: TrendingDown or RefundIcon
- Text: "החזר" (Refund)
- Color: Red
- Amount: "-225₪" (negative, red)

**Running Total:**
- Starts at 0
- Adds for sales, subtracts for refunds
- Shows cumulative revenue at each row
- Format: "3,500₪"
- Updates as filters change

**Row Styling:**
- Sales: Light green background (hover)
- Refunds: Light red background (hover)
- Alternating row colors for readability

---

#### 9.1.4 Export Functionality

**Export Button:**
- Text: "ייצא" (Export)
- Icon: Download
- Position: Top-right of page

**Export Formats:**
- CSV (primary)
- JSON (alternative)

**CSV Content:**
- All columns from table
- Respects current filters
- Filename: `yfit_transactions_YYYY-MM-DD.csv`

**Export Flow:**
```
1. User clicks Export button
   ↓
2. Optional: Format selection dialog
   ↓
3. Generate file with filtered data
   ↓
4. Trigger browser download
   ↓
5. Show success toast: "הקובץ ירד בהצלחה" (File downloaded successfully)
```

---

#### 9.1.5 Table Behavior

**Sorting:**
- Default: Date descending (newest first)
- Click column header to change sort
- Arrow indicator shows current sort direction

**Pagination:**
- 100 transactions per page
- Page numbers at bottom
- "Next" and "Previous" buttons

**Loading State:**
- Skeleton rows while fetching
- Loading spinner

**Empty State:**
- Message: "אין עסקאות להצגה" (No transactions to display)
- Icon: FileText
- Suggestion: Change filters or add transactions

---

## 10. Settings & Administration

### 10.1 Settings Page (`/settings`)

**Route:** `/settings`
**Purpose:** System configuration and administration

**Layout:** Two-column layout (left + right)

---

### 10.2 Left Column

---

#### 10.2.1 Package Pricing Configuration

**Section Title:** "תמחור כרטיסיות" (Package Pricing)

**Form Fields (4 Packages):**

Each package has 3 fields:

**Package 1:**
- **Name:** "שם" (Name)
  - Default: "כרטיסיה 20"
  - Input: Text, max 50 chars
- **Class Count:** "כמות כיתות" (Class Count)
  - Default: 20
  - Input: Number, positive integer
- **Price:** "מחיר" (Price)
  - Default: 900
  - Input: Number, positive, suffix "₪"

(Repeat for Packages 2, 3, 4 with different defaults)

**Yearly Tax Cap:**
- Label: "תקרת מס שנתית" (Yearly Tax Cap)
- Input: Number (optional)
- Default: 120000 or empty
- Suffix: "₪"
- Help text: "יוצג כקו אדום בגרף הכנסות מצטברות"
  (Will be shown as red line in cumulative earnings chart)

**Per-Class Cost Display:**
- Auto-calculated for each package
- Format: "מחיר לכיתה: 45₪" (Price per class: 45₪)
- Read-only, updates as user types

**Save Button:**
- Text: "שמור שינויים" (Save Changes)
- Style: Primary (Blue)
- Action: PUT /api/settings
- Success feedback: "הגדרות נשמרו" (Settings saved)

---

#### 10.2.2 Data Management

**Section Title:** "ניהול נתונים" (Data Management)

**Export Data:**
- Button: "ייצא נתונים" (Export Data)
- Icon: Download
- Action: Download JSON file
- Filename: `yfit_fin_backup_YYYY-MM-DD.json`
- Content: All data (members, years, settings)

**Import Data:**
- Button: "ייבא נתונים" (Import Data)
- Icon: Upload
- Action: Open file picker
- Accepts: .json files only
- Validation: Checks JSON structure
- Warning dialog: "פעולה זו תחליף את כל הנתונים הקיימים"
  (This action will replace all existing data)
- Confirmation: Double confirmation required
- Success: Auto-reload page

**Generate Report:**
- Button: "צור דוח" (Generate Report)
- Icon: FileText
- Action: Generate markdown report
- Download: `.md` file
- Content: Financial summary, member stats, transaction history

---

#### 10.2.3 Manual Member Setup (Collapsible)

**Section Title:** "הגדרת יתרות פתיחה" (Opening Balance Setup)

**Toggle:** Click to expand/collapse section

**Warning Banner:**
- Text: "שימוש בזהירות - שינויים ידניים עשויים להשפיע על חישובי יתרות"
  (Use with caution - manual changes may affect balance calculations)
- Color: Yellow

**Table:**

| Column | Content | Editable |
| --- | --- | --- |
| Member Name | Name | No |
| Opening Balance | Starting classes | Yes (input) |
| Purchased | Classes from purchases | No (calculated) |
| Attended | Classes attended | No (calculated) |
| Current Balance | Final balance | No (calculated) |

**Edit Mode:**
- Click "ערוך" (Edit) button to enter edit mode
- Opening Balance column becomes input fields
- Type numbers directly

**Actions:**
- **Save:** "שמור" (Save) - Commits changes
- **Cancel:** "בטל" (Cancel) - Discards changes

**Flow:**
```
1. Click Edit
   ↓
2. Modify opening balances
   ↓
3. Click Save
   ↓
4. POST /api/years/{year}/opening-balance (for each changed member)
   ↓
5. Backend updates opening balances
   ↓
6. Recalculate all member balances
   ↓
7. Show success toast
   ↓
8. Refresh table
```

---

### 10.3 Right Column

---

#### 10.3.1 Security Settings

**Section Title:** "אבטחה" (Security)

**Change Login Credentials:**

**Current Credentials Display:**
- Username: Read-only display (e.g., "yifatkol")
- Label: "שם משתמש נוכחי" (Current Username)

**New Credentials Form:**

**New Username:**
- Label: "שם משתמש חדש" (New Username)
- Input: Text
- Validation: Alphanumeric, 4-12 characters
- Real-time feedback

**New Password:**
- Label: "סיסמה חדשה" (New Password)
- Input: Password (masked)
- Validation: Alphanumeric, 4-12 characters
- Real-time feedback

**Constraints Display:**
- "אלפאנומרי בלבד, 4-12 תווים"
  (Alphanumeric only, 4-12 characters)
- Color: Gray, smaller font

**Submit Button:**
- Text: "עדכן אישורים" (Update Credentials)
- Disabled until validation passes
- Confirmation dialog
- Success: Force logout

---

#### 10.3.2 Year Management

**Create New Year:**

**Section Title:** "צור שנה חדשה" (Create New Year)

**Year Input:**
- Label: "שנה" (Year)
- Input: Number (YYYY format)
- Validation: 4-digit year, future or current only
- Example: "2027"

**Explanation Box:**
- Title: "מה יקרה?" (What will happen?)
- Content:
  - "✓ רשימת חברים תועתק"
  - (Member list will be copied)
  - "✓ יתרות סגירה יהפכו ליתרות פתיחה"
  - (Closing balances will become opening balances)
  - "✓ היסטוריית עסקאות תתחיל ריקה"
  - (Transaction history will start empty)

**Create Button:**
- Text: "צור שנה" (Create Year)
- Color: Primary (Blue)
- Confirmation: "האם אתה בטוח?" (Are you sure?)
- Success: Navigate to new year, show toast

---

**Delete Year Data (Danger Zone):**

**Section Title:** "⚠️ אזור מסוכן" (Danger Zone)
**Background:** Light red

**Year Selection:**
- Label: "בחר שנה למחיקה" (Select Year to Delete)
- Dropdown: All years except current (if only year)

**Warning Box:**
- Icon: AlertTriangle
- Text:
  - "פעולה זו תמחק לצמיתות את כל הנתונים של השנה"
  - (This action will permanently delete all data for the year)
  - "החברים יישארו, אך העסקאות יימחקו"
  - (Members will remain, but transactions will be deleted)
  - "גיבוי אוטומטי ייווצר לפני המחיקה"
  - (Automatic backup will be created before deletion)

**Delete Button:**
- Text: "מחק שנה" (Delete Year)
- Color: Red
- Icon: Trash2

**Confirmation Flow:**
```
1. User selects year and clicks Delete
   ↓
2. First confirmation dialog:
   "האם אתה בטוח שברצונך למחוק את שנת YYYY?"
   (Are you sure you want to delete year YYYY?)
   ↓
3. Second confirmation dialog:
   "זוהי פעולה בלתי הפיכה. אישור סופי?"
   (This is irreversible. Final confirmation?)
   ↓
4. Create automatic backup
   ↓
5. Download backup file to user
   ↓
6. DELETE /api/years/{year}
   ↓
7. Backend deletes all year data
   ↓
8. If current year deleted: Switch to most recent year
   ↓
9. Show success toast
   ↓
10. Refresh page
```

---

#### 10.3.3 About Section

**Section Title:** "אודות" (About)

**Information:**
- **Version:** "גרסה 1.0" (Version 1.0)
- **Storage:** "אחסון: Vercel Blob" (Storage: Vercel Blob)
- **Backup Schedule:** "גיבוי אוטומטי: ימי ראשון, 02:13"
  (Automatic backup: Sundays, 02:13 AM)
- **Credits:** Optional attribution
- **Support:** Contact information (optional)

---

## 11. Automated Features

### 11.1 Automated Backup System

---

#### 11.1.1 Weekly Backup

**Schedule:** Every Sunday at 02:13 AM (server time)

**Trigger:** Cron job (Vercel Cron or external service)

**Endpoint:** `GET /api/backup/cron`

**Authentication:**
- Bearer token in Authorization header
- Token value from `CRON_SECRET` environment variable

**Process:**
```
1. Cron triggers endpoint at scheduled time
   ↓
2. Validate cron secret token
   ↓
3. For each year with data:
   a) Fetch all year data (purchases, attendance, refunds, opening balances)
   b) Fetch all members
   c) Fetch settings
   d) Create backup object with timestamp
   e) Save to /backups/{year}/{timestamp}.json
   ↓
4. Cleanup old backups:
   - Keep last 4 backups per year
   - Delete older backups
   ↓
5. Return success response with backup count
```

**Backup File Structure:**
```json
{
  "yearKey": "2026",
  "timestamp": "2026-04-13T02:13:00.000Z",
  "backupType": "automated_weekly",
  "data": {
    "members": [...],
    "yearData": {
      "yearKey": "2026",
      "openingBalances": {...},
      "packagePurchases": [...],
      "refunds": [...],
      "attendance": [...]
    },
    "settings": {...}
  }
}
```

**Storage Location:**
- Development: `/data/backups/{year}/`
- Production: Vercel Blob Storage `backups/{year}/`

**Retention Policy:**
- Keep last 4 weekly backups per year
- Automatically delete older backups
- Total storage: ~4 backups × years × avg 500KB ≈ 2MB

---

#### 11.1.2 Monthly Backup

**Schedule:** 1st of each month at 01:07 AM

**Endpoint:** `GET /api/backup/monthly`

**Similar process to weekly backup, but:**
- Different retention policy: Keep all monthly backups (no automatic deletion)
- Tagged as "automated_monthly" in backup file
- Stored in separate folder or with different naming convention

**Use Case:**
- Long-term archival
- Year-end compliance
- Historical reference

---

#### 11.1.3 Manual Backup

**Trigger:** User clicks "Export Data" in Settings page

**Endpoint:** `GET /api/settings?action=export`

**Process:**
```
1. User clicks Export button
   ↓
2. Frontend sends GET request to export endpoint
   ↓
3. Backend gathers all data (all years, members, settings)
   ↓
4. Create complete backup JSON
   ↓
5. Return as downloadable file
   ↓
6. Browser downloads: yfit_fin_backup_YYYY-MM-DD.json
```

**Backup Content:**
- All members (including archived)
- All years data
- All settings
- Creation timestamp
- Version identifier

---

#### 11.1.4 Backup Restoration

**Trigger:** User uploads backup file via Import in Settings

**Endpoint:** `POST /api/settings?action=import`

**Process:**
```
1. User selects .json file
   ↓
2. Frontend reads file
   ↓
3. Validates JSON structure
   ↓
4. Shows confirmation dialog (warns about data replacement)
   ↓
5. User confirms
   ↓
6. POST file content to import endpoint
   ↓
7. Backend validates data structure
   ↓
8. Backend replaces all data:
   - Clear existing members
   - Clear existing years
   - Clear existing settings
   - Import backup data
   ↓
9. Return success response
   ↓
10. Frontend auto-reloads page
```

**Validation Checks:**
- Valid JSON format
- Required fields present
- Data types correct
- Referential integrity (member IDs exist in transactions)

---

#### 11.1.5 Backup List & Management

**Endpoint:** `GET /api/backup?year={year}` (optional year filter)

**Response:**
```json
{
  "backups": [
    {
      "key": "backups/2026/1712977980000.json",
      "yearKey": "2026",
      "timestamp": "2026-04-13T02:13:00.000Z",
      "type": "automated_weekly",
      "size": 524288
    },
    ...
  ]
}
```

**Use Cases:**
- Admin review of available backups
- Selective restoration (future feature)
- Backup verification

---

### 11.2 Automated Email Reports

---

#### 11.2.1 Weekly Report

**Schedule:** Every Saturday at 11:00 AM (server time)

**Trigger:** Cron job

**Endpoint:** `GET /api/reports/email`

**Authentication:** Bearer token (CRON_SECRET)

**Email Service:** Resend API

**Recipients:** Configured in environment variables
- Primary: `nirkol@gmail.com`
- Secondary: `kolyifat@gmail.com`
- (Configurable via ADMIN_EMAIL env var)

---

#### 11.2.2 Email Content

**Subject:** `yFit backup report {date}`
- Example: "yFit backup report 2026-04-12"

**Format:** HTML email + Markdown attachment

**Email Body:**

```markdown
# YFit Fin - Weekly Report
**Report Date:** April 12, 2026
**Year:** 2026

---

## Financial Summary

- **Total Money Received:** 25,500₪
- **Total Packages Sold:** 35
- **Average Money/Month:** 6,375₪
- **Total Debt:** 1,250₪
- **Members with Debt:** 5

---

## Monthly Earnings

| Month | Earnings | Refunds | Net |
|-------|----------|---------|-----|
| Jan 2026 | 7,200₪ | -200₪ | 7,000₪ |
| Feb 2026 | 6,500₪ | 0₪ | 6,500₪ |
| Mar 2026 | 8,000₪ | -500₪ | 7,500₪ |
| Apr 2026 | 4,750₪ | 0₪ | 4,750₪ |

---

## Members Overview

Total Active Members: 42
Total Archived Members: 5

### Members in Debt

| Name | Classes Remaining | Debt Amount |
|------|-------------------|-------------|
| Member A | -5 | 225₪ |
| Member B | -3 | 135₪ |
| Member C | -2 | 90₪ |

---

## Package Sales This Week

- Package 1 (20 Classes): 8 sold
- Package 2 (10 Classes): 12 sold
- Package 3 (Youth 20): 3 sold
- Package 4 (Youth 10): 2 sold

---

## Attendance Statistics

- Total Classes This Week: 18
- Total Attendees This Week: 247
- Average Attendees/Class: 13.7

---

## Top 10 Attendees (This Year)

1. Member Name 1 - 45 classes
2. Member Name 2 - 42 classes
3. Member Name 3 - 38 classes
...

---

*This is an automated report. Do not reply to this email.*
```

**Attachment:** Same content as .md file

---

#### 11.2.3 Report Generation Service

**Function:** `generateReportMarkdown(year: string): string`

**Location:** `/lib/reportGenerator.ts` (backend)

**Process:**
```
1. Fetch all year data for specified year
2. Calculate financial statistics
3. Generate monthly breakdown
4. Identify members with debt
5. Calculate attendance statistics
6. Generate top attendees list
7. Format as markdown
8. Return markdown string
```

**Report Sections:**
1. Header with date and year
2. Financial summary (5 key metrics)
3. Monthly earnings table
4. Members overview with debt list
5. Package sales breakdown
6. Attendance statistics
7. Top attendees list
8. Footer

---

#### 11.2.4 Email Sending

**Function:** `sendEmailReport(recipients, content)`

**Resend API Integration:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmailReport(recipients: string[], markdown: string) {
  await resend.emails.send({
    from: 'YFit Fin Reports <reports@yfit.com>',
    to: recipients,
    subject: `yFit backup report ${new Date().toISOString().split('T')[0]}`,
    html: convertMarkdownToHTML(markdown),
    attachments: [
      {
        filename: `yfit_report_${Date.now()}.md`,
        content: markdown
      }
    ]
  });
}
```

**Environment Variables:**
- `RESEND_API_KEY`: Resend API key
- `ADMIN_EMAIL`: Comma-separated recipient emails
- `EMAIL_FROM`: Sender email address

---

#### 11.2.5 Cron Configuration

**Vercel Cron (if using Vercel):**

**File:** `vercel.json` (root of project)

```json
{
  "crons": [
    {
      "path": "/api/backup/cron",
      "schedule": "13 2 * * 0"
    },
    {
      "path": "/api/backup/monthly",
      "schedule": "7 1 1 * *"
    },
    {
      "path": "/api/reports/email",
      "schedule": "0 11 * * 6"
    }
  ]
}
```

**Cron Schedule Format:** `minute hour day month dayOfWeek`

**External Cron Service (if not using Vercel):**

Use service like cron-job.org:

```bash
# Weekly backup - Every Sunday 02:13 AM
13 2 * * 0  curl -H "Authorization: Bearer $CRON_SECRET" https://api.yfit.com/api/backup/cron

# Monthly backup - 1st of month 01:07 AM
7 1 1 * *   curl -H "Authorization: Bearer $CRON_SECRET" https://api.yfit.com/api/backup/monthly

# Email report - Every Saturday 11:00 AM
0 11 * * 6  curl -H "Authorization: Bearer $CRON_SECRET" https://api.yfit.com/api/reports/email
```

---

## 12. Business Logic & Calculations

This section documents all calculation formulas and business rules.

### 12.1 Member Balance Calculation

**Formula:**
```
classesRemaining =
  openingBalances[memberId][yearKey].classes +
  SUM(packagePurchases WHERE memberId AND yearKey).classCount -
  COUNT(attendanceRecords WHERE memberId AND yearKey) -
  SUM(refunds WHERE memberId AND yearKey).classesRefunded
```

**Implementation Notes:**
- Calculated dynamically, never stored
- Filtered by year
- Can be negative (indicates debt)
- Opening balance is year-specific

**Python Implementation Example:**
```python
def calculate_member_balance(member_id: str, year_key: str, storage) -> int:
    # Get opening balance
    opening = storage.get_opening_balance(member_id, year_key) or 0

    # Get package purchases
    purchases = storage.get_package_purchases(
        member_id=member_id,
        year_key=year_key
    )
    purchased_classes = sum(p.class_count for p in purchases)

    # Get attendance
    attendance = storage.get_attendance(
        member_id=member_id,
        year_key=year_key
    )
    attended_classes = len(attendance)

    # Get refunds
    refunds = storage.get_refunds(
        member_id=member_id,
        year_key=year_key
    )
    refunded_classes = sum(r.classes_refunded for r in refunds)

    # Calculate balance
    balance = opening + purchased_classes - attended_classes - refunded_classes

    return balance
```

---

### 12.2 Debt Calculation

**Formula:**
```
IF classesRemaining < 0:
  mostRecentPackage = GET most recent package purchase for member
  IF mostRecentPackage exists:
    pricePerClass = mostRecentPackage.price / mostRecentPackage.classCount
  ELSE:
    pricePerClass = settings.package1.price / settings.package1.classCount

  debtAmount = ABS(classesRemaining) × pricePerClass
ELSE:
  debtAmount = 0
```

**Rounding:** Round to 2 decimal places

**Display:** Always show in red + bold when debtAmount > 0

**Python Implementation:**
```python
def calculate_debt_amount(member_id: str, year_key: str, storage) -> float:
    balance = calculate_member_balance(member_id, year_key, storage)

    if balance >= 0:
        return 0.0

    # Get most recent package
    purchases = storage.get_package_purchases(
        member_id=member_id,
        year_key=year_key
    )

    if purchases:
        recent = max(purchases, key=lambda p: p.purchase_date)
        price_per_class = recent.price / recent.class_count
    else:
        # Fallback to package1 rate
        settings = storage.get_settings()
        price_per_class = settings.package1.price / settings.package1.classCount

    debt = abs(balance) * price_per_class
    return round(debt, 2)
```

---

### 12.3 Year Editability Rules

**Logic:**
```
current_year = Current year (e.g., 2026)
current_month = Current month (1-12)
year_to_check = Year being checked

IF year_to_check == current_year:
  RETURN True (always editable)

IF year_to_check == (current_year - 1) AND current_month == 1:
  RETURN True (previous year editable only in January)

RETURN False (all other years locked)
```

**Affected Operations:**
- Marking attendance
- Selling packages
- Processing refunds
- Setting opening balances

**UI Behavior:**
- Display "Read-Only" badge
- Disable form submissions
- Show warning message

**Python Implementation:**
```python
from datetime import datetime

def is_year_editable(year_key: str) -> bool:
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    year = int(year_key)

    # Current year always editable
    if year == current_year:
        return True

    # Previous year only in January
    if year == current_year - 1 and current_month == 1:
        return True

    # All other years locked
    return False
```

---

### 12.4 Refund Amount Calculation

**Formula:**
```
classesRemaining = calculate_member_balance(memberId, yearKey)

IF classesRemaining <= 0:
  ERROR: "Cannot refund, member has no remaining classes"

mostRecentPackage = GET most recent package for member
IF mostRecentPackage:
  pricePerClass = mostRecentPackage.price / mostRecentPackage.classCount
ELSE:
  pricePerClass = settings.package1.price / settings.package1.classCount

refundAmount = classesRemaining × pricePerClass
classesRefunded = classesRemaining
```

**Business Rules:**
- Only refund if balance > 0
- Refund entire remaining balance (cannot partial refund)
- Use most recent package price for calculation
- Fallback to package1 if no purchase history

**Python Implementation:**
```python
def calculate_refund(member_id: str, year_key: str, storage) -> dict:
    balance = calculate_member_balance(member_id, year_key, storage)

    if balance <= 0:
        raise ValueError("Cannot refund: member has no remaining classes")

    # Get most recent package
    purchases = storage.get_package_purchases(
        member_id=member_id,
        year_key=year_key
    )

    if purchases:
        recent = max(purchases, key=lambda p: p.purchase_date)
        price_per_class = recent.price / recent.class_count
    else:
        settings = storage.get_settings()
        price_per_class = settings.package1.price / settings.package1.classCount

    refund_amount = balance * price_per_class

    return {
        "classes_refunded": balance,
        "refund_amount": round(refund_amount, 2),
        "price_per_class": round(price_per_class, 2)
    }
```

---

### 12.5 Monthly Aggregations

#### Attendees per Month

**Formula:**
```sql
SELECT
  YEAR(date) || '-' || MONTH(date) as month_key,
  COUNT(DISTINCT member_id) as unique_members,
  COUNT(*) as total_attendance
FROM attendance_records
WHERE year_key = ?
GROUP BY YEAR(date), MONTH(date)
ORDER BY month_key
```

**Python Implementation:**
```python
from collections import defaultdict
from datetime import datetime

def calculate_monthly_attendance(year_key: str, storage) -> list:
    attendance = storage.get_attendance(year_key=year_key)

    monthly_data = defaultdict(lambda: {"unique_members": set(), "total": 0})

    for record in attendance:
        date = datetime.fromisoformat(record.date)
        month_key = f"{date.year}-{date.month:02d}"

        monthly_data[month_key]["unique_members"].add(record.member_id)
        monthly_data[month_key]["total"] += 1

    result = []
    for month_key in sorted(monthly_data.keys()):
        data = monthly_data[month_key]
        result.append({
            "month": month_key,
            "unique_members": len(data["unique_members"]),
            "total_attendance": data["total"]
        })

    return result
```

#### Earnings per Month

**Formula:**
```sql
SELECT
  YEAR(purchase_date) || '-' || MONTH(purchase_date) as month_key,
  SUM(amount_paid) as total_sales,
  (SELECT COALESCE(SUM(refund_amount), 0)
   FROM refunds
   WHERE YEAR(refund_date) = YEAR(purchase_date)
   AND MONTH(refund_date) = MONTH(purchase_date)) as total_refunds,
  SUM(amount_paid) -
    (SELECT COALESCE(SUM(refund_amount), 0)
     FROM refunds
     WHERE YEAR(refund_date) = YEAR(purchase_date)
     AND MONTH(refund_date) = MONTH(purchase_date)) as net_earnings
FROM package_purchases
WHERE year_key = ?
GROUP BY YEAR(purchase_date), MONTH(purchase_date)
ORDER BY month_key
```

**Python Implementation:**
```python
def calculate_monthly_earnings(year_key: str, storage) -> list:
    purchases = storage.get_package_purchases(year_key=year_key)
    refunds = storage.get_refunds(year_key=year_key)

    monthly_sales = defaultdict(float)
    monthly_refunds = defaultdict(float)

    for purchase in purchases:
        date = datetime.fromisoformat(purchase.purchase_date)
        month_key = f"{date.year}-{date.month:02d}"
        monthly_sales[month_key] += purchase.amount_paid

    for refund in refunds:
        date = datetime.fromisoformat(refund.refund_date)
        month_key = f"{date.year}-{date.month:02d}"
        monthly_refunds[month_key] += refund.refund_amount

    all_months = set(monthly_sales.keys()) | set(monthly_refunds.keys())

    result = []
    for month_key in sorted(all_months):
        sales = monthly_sales.get(month_key, 0)
        refunds_amt = monthly_refunds.get(month_key, 0)
        result.append({
            "month": month_key,
            "sales": round(sales, 2),
            "refunds": round(refunds_amt, 2),
            "net": round(sales - refunds_amt, 2)
        })

    return result
```

---

### 12.6 Member Status Determination

**Logic:**
```
IF member.isArchived == True:
  status = "Archived"
  color = Gray

ELSE IF classesRemaining < 0:
  status = "In Debt"
  color = Red
  bold = True

ELSE IF classesRemaining == 0:
  status = "No Classes"
  color = Yellow/Orange

ELSE:
  status = "Active"
  color = Green/Blue
```

**Python Implementation:**
```python
from enum import Enum

class MemberStatus(str, Enum):
    ARCHIVED = "archived"
    IN_DEBT = "in_debt"
    NO_CLASSES = "no_classes"
    ACTIVE = "active"

def get_member_status(member, classes_remaining: int) -> tuple[MemberStatus, str]:
    if member.is_archived:
        return MemberStatus.ARCHIVED, "gray"

    if classes_remaining < 0:
        return MemberStatus.IN_DEBT, "red"

    if classes_remaining == 0:
        return MemberStatus.NO_CLASSES, "yellow"

    return MemberStatus.ACTIVE, "green"
```

---

### 12.7 Running Total Calculation (Transaction History)

**Formula:**
```
running_total = 0

FOR EACH transaction IN transactions (sorted by date):
  IF transaction.type == "sale":
    running_total += transaction.amount_paid
  ELSE IF transaction.type == "refund":
    running_total -= transaction.refund_amount

  transaction.running_total = running_total
```

**Python Implementation:**
```python
def calculate_running_totals(year_key: str, storage) -> list:
    # Get all transactions
    purchases = storage.get_package_purchases(year_key=year_key)
    refunds = storage.get_refunds(year_key=year_key)

    # Combine and sort by date
    transactions = []

    for p in purchases:
        transactions.append({
            "type": "sale",
            "date": p.purchase_date,
            "member_name": p.member_name,
            "amount": p.amount_paid,
            "payment_method": p.payment_method,
            "package_type": p.package_type
        })

    for r in refunds:
        transactions.append({
            "type": "refund",
            "date": r.refund_date,
            "member_name": r.member_name,
            "amount": -r.refund_amount,  # Negative
            "classes_refunded": r.classes_refunded
        })

    # Sort by date descending
    transactions.sort(key=lambda t: t["date"], reverse=True)

    # Calculate running total (from oldest to newest for cumulative)
    reversed_transactions = list(reversed(transactions))
    running_total = 0

    for txn in reversed_transactions:
        running_total += txn["amount"]
        txn["running_total"] = round(running_total, 2)

    # Return in original order (newest first)
    return list(reversed(reversed_transactions))
```

---

### 12.8 Price Per Class Calculation

**Used in:** Debt calculation, refund calculation

**Formula:**
```
mostRecentPackage = GET most recent package for member
IF mostRecentPackage:
  RETURN mostRecentPackage.price / mostRecentPackage.classCount
ELSE:
  RETURN settings.package1.price / settings.package1.classCount
```

---

### 12.9 Average Calculations

**Average Money per Month:**
```
active_months = COUNT(distinct months with transactions)
total_net_revenue = SUM(purchases) - SUM(refunds)
average = total_net_revenue / active_months
```

**Average Attendees per Month:**
```
active_months = COUNT(distinct months with attendance)
total_attendance = COUNT(all attendance records)
average = total_attendance / active_months
```

**Average Attendees per Class:**
```
unique_classes = COUNT(distinct date+time combinations)
total_attendance = COUNT(all attendance records)
average = total_attendance / unique_classes
```

---

## 13. User Workflows

This section documents complete step-by-step workflows for all major operations.

---

### 13.1 User Login Workflow

**Pre-condition:** User is not authenticated

**Steps:**
1. User navigates to application URL
2. System detects no authentication → redirects to `/login`
3. User sees login page with username and password fields
4. User enters username (e.g., "yifatkol")
5. User enters password (e.g., "5771")
6. User clicks "התחבר" (Login) button
7. Frontend validates input format (4-12 chars, alphanumeric)
8. Frontend sends POST request to `/api/auth` with credentials
9. Backend validates credentials against stored hash
10. **If valid:**
    - Backend generates JWT token
    - Backend returns success with token
    - Frontend stores token in localStorage
    - Frontend redirects to `/finance`
11. **If invalid:**
    - Backend returns error
    - Frontend displays error message
    - Password field cleared
    - User can retry

**Success Criteria:** User lands on finance dashboard, authenticated

**Error Handling:**
- Invalid format: Show validation error before submission
- Wrong credentials: Show "שם משתמש או סיסמה שגויים" (Invalid username or password)
- Network error: Show "שגיאת תקשורת" (Communication error)

---

### 13.2 Add New Member Workflow

**Pre-condition:** User is authenticated and on `/members` page

**Steps:**
1. User clicks "+ הוסף חבר" (Add Member) button
2. Modal opens with member creation form
3. User enters member name (required) - e.g., "John Doe"
4. User optionally enters phone number - e.g., "0541234567"
5. User optionally selects date of birth
6. User clicks "שמור" (Save) button
7. Frontend validates:
  - Name is non-empty
  - Phone is 10 digits (if provided)
  - Date of birth is valid date (if provided)
8. Frontend sends POST to `/api/members` with data
9. Backend creates member:
  - Generates unique ID (timestamp-based)
  - Auto-assigns next sequential memberId
  - Sets isArchived = false
  - Sets createdAt = now
10. Backend returns created member
11. Frontend closes modal
12. Frontend refreshes members table
13. Success toast: "חבר נוסף בהצלחה" (Member added successfully)
14. New member appears in table

**Success Criteria:** New member visible in members list

**Error Handling:**
- Validation errors: Show inline error messages
- Duplicate name: Warning (but allowed)
- Network error: Show error toast, keep modal open

---

### 13.3 Sell Package to Member Workflow

**Pre-condition:** User is authenticated, year is editable

**Steps:**
1. User navigates to `/package` page
2. User clicks "הצג את כל החברים" (Show All Members) or uses search
3. User selects member by clicking their card
4. Selected member displayed with current balance
5. User selects package type:
  - Option A: Clicks standard package (Package1-4)
  - Option B: Clicks "Ad-Hoc" and enters custom price/classes
6. User optionally changes purchase date (defaults to today)
7. User optionally selects payment method from dropdown
8. Transaction summary displays:
  - Package type
  - Price
  - Current classes → New classes calculation
9. User reviews summary
10. User clicks "מכור כרטיסייה - {price}₪" button
11. Frontend validates:
    - Member selected
    - Package selected
    - Year is editable
12. Frontend sends POST to `/api/years/{year}/packages` with:
    - memberId
    - packageType
    - price, classCount
    - amountPaid
    - purchaseDate
    - paymentMethod (optional)
13. Backend creates PackagePurchase record
14. Backend recalculates member balance (increases)
15. Backend returns success
16. Frontend shows success toast: "כרטיסייה נמכרה בהצלחה"
17. Frontend offers options:
    - View member detail
    - Sell another package
    - Go to finance dashboard

**Success Criteria:** Package recorded, member balance increased

**Error Handling:**
- Year locked: Show warning, disable form
- Member archived: Show warning, suggest unarchiving
- Network error: Show error, allow retry

---

### 13.4 Mark Class Attendance Workflow

**Pre-condition:** User is authenticated, year is editable

**Steps:**
1. User navigates to `/attendance` page
2. User selects class date (defaults to today)
3. User selects class time (defaults to 18:00)
4. User optionally selects class type (Regular/Beginners)
5. User selects members:
  - Option A: Search and click autocomplete results
  - Option B: Click "Show All" and select from grid
6. Selected members appear as chips
7. System checks each member's balance:
  - If balance ≤ 0: Show warning icon
8. User has 1-15 members selected
9. User clicks "סמן נוכחות" (Mark Attendance) button
10. **If any member has balance ≤ 0:**
    - Dialog appears: "אזהרה: חברים בחוב"
    - Shows list of affected members with debt amounts
    - User can Cancel or Continue
11. **If user continues (or no debt):**
12. Frontend sends POST to `/api/years/{year}/attendance` with:
    - memberIds array
    - date
    - time
    - classType (optional)
13. Backend removes any existing attendance for this date+time
14. Backend creates new AttendanceRecord for each member
15. Backend deducts 1 class from each member's balance
16. Backend returns success with count
17. Frontend shows success toast: "נוכחות נרשמה בהצלחה - {count} חברים"
18. Frontend resets form
19. Optionally: Navigate to `/classes` to see in calendar

**Success Criteria:** Attendance recorded, member balances decreased

**Error Handling:**
- Year locked: Disable form, show warning
- No members selected: Disable submit button
- More than 15 members: Show error, disable submit
- Network error: Show error, allow retry

---

### 13.5 View Member Details Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User clicks "View Details" icon on member row in `/members` table
2. System navigates to `/members/{id}`
3. Backend fetches:
  - Member data
  - Package purchases for member (all years)
  - Attendance records for member (all years)
  - Refund transactions for member (all years)
4. System calculates:
  - Current classes remaining
  - Debt amount (if negative)
  - Member status
  - Total packages count
  - Total money paid
  - Total classes attended
5. Page displays:
  - Member name (red if in debt) with ID badge
  - Archived badge (if archived)
  - 3 status cards (classes, packages, attendance)
  - Quick action buttons
  - Two-column transaction history
  - Member information grid
6. User can:
  - Click "Sell Package" → Navigate to `/package?memberId={id}`
  - Click "Mark Attendance" → Navigate to `/attendance?memberId={id}`
  - Click "Archive" → Toggle archive status
  - Click "Refund" → Process refund (if balance > 0)
  - Click "Delete" → Delete member (if balance = 0)
  - Click "Back" → Return to members list

**Success Criteria:** Complete member information displayed

---

### 13.6 Process Member Refund Workflow

**Pre-condition:** Member has classesRemaining > 0, year is editable

**Steps:**
1. User clicks "Refund" button (from member detail or members list)
2. System calculates refund:
  - Gets most recent package purchase for member
  - Calculates price per class
  - Calculates refund amount = classesRemaining × pricePerClass
3. Confirmation dialog appears:
  - "החזר כספי לחבר" (Refund for Member)
  - Member name
  - Classes to refund: {count}
  - Refund amount: {amount}₪
  - "האם אתה בטוח?" (Are you sure?)
4. User clicks "אישור" (Confirm)
5. Frontend sends POST to `/api/years/{year}/refunds` with memberId
6. Backend:
  - Validates member has positive balance
  - Calculates refund details
  - Creates RefundTransaction record
  - Recalculates member balance (should be 0 after)
7. Backend returns success with refund details
8. Frontend shows success toast: "החזר בוצע בהצלחה - {amount}₪"
9. Frontend refreshes member data
10. Member balance now shows 0

**Success Criteria:** Refund recorded, member balance = 0

**Error Handling:**
- Balance ≤ 0: Show error "אין כיתות להחזר" (No classes to refund)
- Year locked: Show error, operation not allowed
- Network error: Show error, no refund created

---

### 13.7 Archive/Delete Member Workflow

**Archive:**
1. User clicks Archive button
2. Confirmation dialog: "העבר לארכיון?" (Archive?)
3. User confirms
4. Frontend sends PUT to `/api/members/{id}` with isArchived = true
5. Backend updates member.isArchived = true
6. Frontend refreshes, member moves to archived list
7. Success toast: "חבר הועבר לארכיון" (Member archived)

**Unarchive:**
- Same process but sets isArchived = false

**Delete (only if balance = 0):**
1. User clicks Delete button (only shown if balance = 0)
2. First confirmation: "מחק חבר?" (Delete member?)
3. Warning displayed about permanent deletion
4. User confirms
5. Second confirmation: "זוהי פעולה בלתי הפיכה. אישור סופי?"
6. User confirms final
7. Frontend sends DELETE to `/api/members/{id}`
8. Backend:
  - Validates balance = 0
  - CASCADE delete from all tables:
    - opening_balances
    - package_purchases
    - attendance_records
    - refund_transactions
  - Delete member record
9. Frontend navigates back to `/members`
10. Success toast: "חבר נמחק לצמיתות" (Member permanently deleted)

**Success Criteria:** Member removed from system (archive) or deleted permanently

---

### 13.8 View Financial Dashboard Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User clicks "Finance Dashboard" in navigation (or lands after login)
2. System navigates to `/finance`
3. Backend fetches for selected year:
  - All package purchases
  - All refund transactions
  - All members with balances
  - Settings (for tax cap)
4. System calculates:
  - Total money received (net)
  - Total packages sold
  - Average money/month
  - Total debt (sum of all negative balances)
  - Members with debt count
  - Monthly earnings (chart data)
  - Payment method distribution
  - Package type distribution
5. Page renders:
  - 5 financial status cards
  - Monthly earnings bar chart
  - Cumulative earnings chart (with tax cap line if set)
  - Payment method pie chart
  - Package type pie chart
  - Members with debt table (top 5, expandable)
  - Recent refunds list (top 5, expandable)
  - Complete transaction history (collapsible)
6. User can:
  - Change year with dropdown
  - Expand/collapse sections
  - Click member name → Navigate to member detail
  - Review charts and statistics

**Success Criteria:** Complete financial overview displayed

---

### 13.9 View Attendance Analytics Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User clicks "Attendance Dashboard" in navigation
2. System navigates to `/attendance-dashboard`
3. Backend fetches for selected year:
  - All attendance records
  - All members (for active count)
  - Package purchases (for context)
4. System calculates:
  - Total active members
  - Total classes (unique date+time)
  - Total attendees
  - Avg attendees/class
  - Avg attendees/month
  - Monthly attendance (chart data)
  - Top attendees list
5. Page renders:
  - 6 attendance status cards
  - Monthly attendees bar chart
  - Unique members per month chart
  - Top 20 attendees table
6. User can:
  - Change year with dropdown
  - Review attendance patterns
  - Identify top attendees
  - Compare months

**Success Criteria:** Attendance analytics displayed

---

### 13.10 Manage Class Sessions Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User clicks "Monthly Classes" in navigation
2. System navigates to `/classes`
3. User selects month/year with navigation buttons
4. Backend fetches attendance for selected month
5. System groups by date and time
6. Page displays classes table:
  - Date, Time, Day of week
  - Attendees list (comma-separated)
  - Edit button per class
7. User can:
  - **View class details:** See who attended
  - **Edit class:** Click edit button
    - System navigates to `/attendance` with pre-filled data
    - User can modify attendees or details
    - Resubmit → Old records deleted, new ones created
  - **Navigate months:** See historical classes

**Success Criteria:** Monthly class schedule displayed

---

### 13.11 Export/Import Data Workflow

**Export:**
1. User navigates to `/settings`
2. User clicks "ייצא נתונים" (Export Data) button
3. Backend gathers all data:
  - All members
  - All years data
  - Settings
4. Backend creates JSON file
5. Browser downloads: `yfit_fin_backup_YYYY-MM-DD.json`
6. Success toast: "הקובץ ירד בהצלחה" (File downloaded)

**Import:**
1. User clicks "ייבא נתונים" (Import Data) button
2. File picker opens
3. User selects .json backup file
4. Frontend reads and validates JSON
5. Warning dialog: "פעולה זו תחליף את כל הנתונים. המשך?"
6. User confirms
7. Second confirmation: "אישור סופי?"
8. User confirms
9. Frontend sends POST to `/api/settings?action=import` with data
10. Backend validates structure
11. Backend replaces all data
12. Success response
13. Frontend auto-reloads page
14. All data restored from backup

**Success Criteria:** Data exported or imported successfully

---

### 13.12 Update Package Prices Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User navigates to `/settings`
2. User scrolls to "תמחור כרטיסיות" (Package Pricing) section
3. User modifies package settings:
  - Package names
  - Class counts
  - Prices
4. System shows real-time per-class cost calculation
5. User optionally sets yearly tax cap
6. User clicks "שמור שינויים" (Save Changes)
7. Frontend validates all fields are positive numbers
8. Frontend sends PUT to `/api/settings` with new settings
9. Backend updates settings
10. Backend returns success
11. Success toast: "הגדרות נשמרו" (Settings saved)
12. New prices effective immediately for future sales

**Success Criteria:** Package prices updated

**Note:** Historical purchases retain original prices

---

### 13.13 Create New Year Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User navigates to `/settings`
2. User scrolls to "צור שנה חדשה" (Create New Year) section
3. User enters year (e.g., "2027")
4. User reviews explanation of what happens
5. User clicks "צור שנה" (Create Year) button
6. Confirmation dialog: "האם אתה בטוח?" (Are you sure?)
7. User confirms
8. Frontend sends POST to `/api/years` with yearKey
9. Backend:
  - Creates new year record
  - Copies current member list
  - Calculates closing balances from current year
  - Sets closing balances as opening balances for new year
  - Initializes empty transaction arrays
10. Backend returns success
11. Success toast: "שנה {year} נוצרה בהצלחה"
12. Year selector updated to include new year
13. System switches to new year

**Success Criteria:** New year created, balances carried over

---

### 13.14 Delete Year Data Workflow

**Pre-condition:** User is authenticated, year is not the only year

**Steps:**
1. User navigates to `/settings`
2. User scrolls to "מחיקת נתוני שנה" (Delete Year Data) danger zone
3. User selects year from dropdown
4. User clicks "מחק שנה" (Delete Year) red button
5. First confirmation: "האם אתה בטוח שברצונך למחוק את שנת {year}?"
6. User confirms
7. Second confirmation: "זוהי פעולה בלתי הפיכה. אישור סופי?"
8. User confirms
9. Backend creates automatic backup:
  - Generates backup file
  - Returns file to frontend
  - Frontend downloads: `yfit_fin_{year}_deleted_{timestamp}.json`
10. Backend sends DELETE to `/api/years/{year}`
11. Backend CASCADE deletes all year data:
    - opening_balances
    - package_purchases
    - attendance_records
    - refund_transactions
12. Backend returns success
13. If deleted year was current: Switch to most recent year
14. Success toast: "שנת {year} נמחקה לצמיתות"
15. Page refreshes
16. Year no longer in year selector

**Success Criteria:** Year data deleted, backup downloaded

---

### 13.15 Change Login Credentials Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User navigates to `/settings`
2. User scrolls to "שינוי פרטי התחברות" (Change Login Credentials)
3. User enters new username (4-12 chars, alphanumeric)
4. User enters new password (4-12 chars, alphanumeric)
5. Real-time validation shows green/red indicators
6. User clicks "עדכן אישורים" (Update Credentials)
7. Confirmation dialog: "שינוי אישורים ידרוש התחברות מחדש. המשך?"
8. User confirms
9. Frontend sends POST to `/api/auth?action=updateCredentials`
10. Backend:
    - Validates format
    - Hashes new password (bcrypt)
    - Updates credentials
    - Updates lastUpdated timestamp
11. Backend returns success
12. Frontend clears authentication token
13. Frontend redirects to `/login`
14. Success message: "אישורים עודכנו. אנא התחבר עם האישורים החדשים"
15. User logs in with new credentials

**Success Criteria:** Credentials updated, user forced to re-login

---

### 13.16 View Transaction History Workflow

**Pre-condition:** User is authenticated

**Steps:**
1. User clicks "History" in navigation
2. System navigates to `/history`
3. User selects year filter (default: current year)
4. Backend fetches:
  - All package purchases for year
  - All refunds for year
5. System combines and sorts by date (newest first)
6. System calculates running total
7. Page displays:
  - Summary stats (total transactions, final total)
  - Transactions table with running totals
  - Color coding (green for sales, red for refunds)
8. User can:
  - Filter by year
  - Sort by columns
  - Export to CSV
  - Review complete audit trail

**Success Criteria:** Complete transaction history with running totals displayed

---

*This completes the 16 main user workflows. All critical operations are documented with step-by-step instructions, success criteria, and error handling.*

---


- `ADMIN_EMAIL`: Comma-separated recipient emails
- `EMAIL_FROM`: Sender email address

---

#### 11.2.5 Cron Configuration

**Vercel Cron (if using Vercel):**

**File:** `vercel.json` (root of project)

```json
{
  "crons": [
    {
      "path": "/api/backup/cron",
      "schedule": "13 2 * * 0"
    },
    {
      "path": "/api/backup/monthly",
      "schedule": "7 1 1 * *"
    },
    {
      "path": "/api/reports/email",
      "schedule": "0 11 * * 6"
    }
  ]
}
```

**Cron Schedule Format:** `minute hour day month dayOfWeek`

**External Cron Service (if not using Vercel):**

Use service like cron-job.org:

```bash
# Weekly backup - Every Sunday 02:13 AM
13 2 * * 0  curl -H "Authorization: Bearer $CRON_SECRET" https://api.yfit.com/api/backup/cron

# Monthly backup - 1st of month 01:07 AM
7 1 1 * *   curl -H "Authorization: Bearer $CRON_SECRET" https://api.yfit.com/api/backup/monthly

# Email report - Every Saturday 11:00 AM
0 11 * * 6  curl -H "Authorization: Bearer $CRON_SECRET" https://api.yfit.com/api/reports/email
```

---




## Section 14: API Specification

Complete REST API documentation for Python FastAPI backend.

### Base Configuration

**Base URL (Production):** `https://yfit-api.railway.app`
**Base URL (Development):** `http://localhost:8000`

**Content Type:** `application/json`
**Authentication:** Bearer token (JWT) in Authorization header
**Date Format:** ISO 8601 (`YYYY-MM-DD`, `YYYY-MM-DDTHH:MM:SS.sssZ`)

---

### 14.1 Authentication Endpoints

#### POST /api/auth/login

Authenticate user and receive session token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

**Validation:**
- Username: 4-12 characters, alphanumeric
- Password: 4-12 characters, alphanumeric

---

#### POST /api/auth/update-credentials

Update login credentials (requires authentication).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "currentPassword": "string",
  "newUsername": "string",
  "newPassword": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credentials updated successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "detail": "Current password is incorrect"
}
```

**Validation:**
- Current password must match
- New username: 4-12 alphanumeric characters
- New password: 4-12 alphanumeric characters

---

### 14.2 Member Endpoints

#### GET /api/members

Retrieve all members with optional filters.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `archived` (optional): `true` | `false` (default: `false`)
- `search` (optional): string (filters by name)
- `year` (optional): string (includes balance calculation for year)

**Response (200 OK):**
```json
{
  "members": [
    {
      "id": "uuid",
      "memberId": "M001",
      "name": "שם חבר",
      "phone": "050-1234567",
      "dateOfBirth": "1990-05-15",
      "isArchived": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "classesRemaining": 15,
      "debtAmount": 0,
      "status": "Active",
      "totalAttended": 85,
      "totalPaid": 4500
    }
  ],
  "count": 1
}
```

**Notes:**
- If `year` param provided, includes `classesRemaining` and `debtAmount`
- `status` calculated: "Active" | "In Debt" | "No Classes" | "Archived"

---

#### GET /api/members/{id}

Retrieve single member with all transaction history.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id`: Member UUID

**Query Parameters:**
- `year` (optional): string (filter transactions by year)

**Response (200 OK):**
```json
{
  "member": {
    "id": "uuid",
    "memberId": "M001",
    "name": "שם חבר",
    "phone": "050-1234567",
    "dateOfBirth": "1990-05-15",
    "isArchived": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "balance": {
    "classesRemaining": 15,
    "debtAmount": 0,
    "status": "Active",
    "totalPackages": 10,
    "totalPaid": 9000,
    "totalAttended": 185
  },
  "packages": [
    {
      "id": "uuid",
      "packageType": "package1",
      "price": 900,
      "classCount": 20,
      "amountPaid": 900,
      "purchaseDate": "2025-03-10",
      "paymentMethod": "Bit",
      "yearKey": "2025"
    }
  ],
  "attendance": [
    {
      "id": "uuid",
      "date": "2025-03-15",
      "time": "18:00",
      "dayOfWeek": "ראשון",
      "classType": "Regular",
      "yearKey": "2025"
    }
  ],
  "refunds": [
    {
      "id": "uuid",
      "classesRefunded": 5,
      "refundAmount": 225,
      "refundDate": "2025-02-20",
      "yearKey": "2025"
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Member not found"
}
```

---

#### POST /api/members

Create new member.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "string (required)",
  "phone": "string (optional)",
  "dateOfBirth": "YYYY-MM-DD (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "memberId": "M042",
  "name": "שם חבר",
  "phone": "050-1234567",
  "dateOfBirth": "1995-08-20",
  "isArchived": false,
  "createdAt": "2026-04-11T14:30:00.000Z"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Name is required"
}
```

**Validation:**
- Name: Required, non-empty string
- Phone: Optional, valid format
- Date of Birth: Optional, valid date (not future)

---

#### PUT /api/members/{id}

Update member information.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id`: Member UUID

**Request Body:**
```json
{
  "name": "string (optional)",
  "phone": "string (optional)",
  "dateOfBirth": "YYYY-MM-DD (optional)",
  "isArchived": "boolean (optional)"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "memberId": "M001",
  "name": "שם מעודכן",
  "phone": "050-9999999",
  "dateOfBirth": "1990-05-15",
  "isArchived": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Member not found"
}
```

---

#### DELETE /api/members/{id}

Delete member (only if balance = 0).

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id`: Member UUID

**Query Parameters:**
- `year` (optional): Year to check balance (default: current year)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Cannot delete member with non-zero balance"
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Member not found"
}
```

**Business Rule:**
- Only members with classesRemaining = 0 can be deleted
- All related transactions are cascade deleted

---

### 14.3 Year Management Endpoints

#### GET /api/years

List all available years.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "years": [
    {
      "yearKey": "2026",
      "isCurrent": true,
      "isEditable": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "yearKey": "2025",
      "isCurrent": false,
      "isEditable": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Notes:**
- `isEditable` calculated based on year editability rules
- Current year always editable
- Previous year editable only in January

---

#### GET /api/years/{year}

Load complete year data with all transactions.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key (YYYY format)

**Response (200 OK):**
```json
{
  "yearKey": "2026",
  "openingBalances": [
    {
      "memberId": "uuid",
      "memberName": "שם חבר",
      "classes": 10
    }
  ],
  "packages": [
    {
      "id": "uuid",
      "memberId": "uuid",
      "packageType": "package1",
      "price": 900,
      "classCount": 20,
      "amountPaid": 900,
      "purchaseDate": "2026-03-10",
      "paymentMethod": "Bit"
    }
  ],
  "attendance": [
    {
      "id": "uuid",
      "memberId": "uuid",
      "memberName": "שם חבר",
      "date": "2026-03-15",
      "time": "18:00",
      "dayOfWeek": "ראשון",
      "classType": "Regular"
    }
  ],
  "refunds": [
    {
      "id": "uuid",
      "memberId": "uuid",
      "classesRefunded": 5,
      "refundAmount": 225,
      "refundDate": "2026-02-20"
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Year not found"
}
```

---

#### POST /api/years

Create new year with opening balances from previous year.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "yearKey": "2027"
}
```

**Response (201 Created):**
```json
{
  "yearKey": "2027",
  "isCurrent": true,
  "isEditable": true,
  "createdAt": "2026-04-11T14:45:00.000Z",
  "openingBalances": [
    {
      "memberId": "uuid",
      "classes": 15
    }
  ],
  "message": "Year created with opening balances from 2026"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Year 2027 already exists"
}
```

**Business Logic:**
1. Create new year record
2. Calculate closing balances from previous year (current year)
3. Set closing balances as opening balances for new year
4. Mark new year as current year

**Validation:**
- Year must be 4-digit numeric string
- Year must not already exist
- Year should be sequential (warning if gap)

---

#### DELETE /api/years/{year}

Delete year data with automatic backup.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key to delete

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Year 2025 deleted successfully",
  "backupFile": "backup_2025_20260411_144530.json",
  "newCurrentYear": "2026"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Cannot delete the only year in the system"
}
```

**Business Logic:**
1. Validate: Cannot delete if only one year exists
2. Create automatic backup of year data
3. Delete all transactions for year (packages, attendance, refunds)
4. Delete opening balances for year
5. Delete year record
6. If deleted year was current, set most recent year as current
7. Return backup file path for user download

---

#### GET /api/years/{year}/balances

Get member balances for specific year.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key

**Query Parameters:**
- `includeArchived` (optional): `true` | `false` (default: `false`)

**Response (200 OK):**
```json
{
  "year": "2026",
  "balances": [
    {
      "memberId": "uuid",
      "memberName": "שם חבר",
      "openingBalance": 10,
      "packagesPurchased": 40,
      "classesAttended": 35,
      "classesRefunded": 0,
      "classesRemaining": 15,
      "debtAmount": 0,
      "status": "Active"
    }
  ]
}
```

---

#### GET /api/years/{year}/members/{memberId}/breakdown

Get detailed balance breakdown for single member in year.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key
- `memberId`: Member UUID

**Response (200 OK):**
```json
{
  "memberId": "uuid",
  "memberName": "שם חבר",
  "year": "2026",
  "breakdown": {
    "openingBalance": 10,
    "packagesPurchased": 40,
    "classesAttended": 35,
    "classesRefunded": 0,
    "classesRemaining": 15
  },
  "debt": {
    "debtAmount": 0,
    "pricePerClass": 45
  },
  "packages": [
    {
      "packageType": "package1",
      "classCount": 20,
      "price": 900,
      "purchaseDate": "2026-03-10"
    }
  ]
}
```

---

#### POST /api/years/{year}/opening-balance

Manually set opening balance for member in year.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key

**Request Body:**
```json
{
  "memberId": "uuid",
  "classes": 10
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "memberId": "uuid",
  "year": "2026",
  "openingBalance": 10
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "Cannot modify opening balance for locked year"
}
```

**Validation:**
- Year must be editable
- Classes must be integer (can be negative)
- Creates or updates opening balance record

---

### 14.4 Transaction Endpoints

#### POST /api/years/{year}/packages

Sell package to member.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key

**Request Body:**
```json
{
  "memberId": "uuid",
  "packageType": "package1" | "package2" | "package3" | "package4" | "adhoc",
  "customPrice": 1000 (required if adhoc),
  "customClassCount": 25 (required if adhoc),
  "amountPaid": 900,
  "purchaseDate": "2026-04-11",
  "paymentMethod": "Bit" | "Paybox" | "Bank transfer" | "Check" | "Cash" | "Other"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "memberId": "uuid",
  "packageType": "package1",
  "price": 900,
  "classCount": 20,
  "amountPaid": 900,
  "purchaseDate": "2026-04-11",
  "paymentMethod": "Bit",
  "yearKey": "2026",
  "newBalance": 35
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Invalid package type"
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "Year 2025 is locked and cannot be modified"
}
```

**Validation:**
- Year must be editable
- Member must exist
- Package type must be valid enum
- If adhoc: customPrice and customClassCount required
- If standard package: price/classCount loaded from settings
- Amount paid must be positive number
- Purchase date must be valid date (not future)

**Business Logic:**
1. Validate year editability
2. Load package configuration (or use custom for adhoc)
3. Create PackagePurchase record
4. Recalculate member balance
5. Return new balance

---

#### POST /api/years/{year}/attendance

Mark class attendance for multiple members.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key

**Request Body:**
```json
{
  "memberIds": ["uuid1", "uuid2", "uuid3"],
  "date": "2026-04-11",
  "time": "18:00",
  "classType": "Regular" (optional)
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "attendanceRecords": [
    {
      "id": "uuid",
      "memberId": "uuid1",
      "memberName": "חבר 1",
      "date": "2026-04-11",
      "time": "18:00",
      "dayOfWeek": "שישי",
      "classType": "Regular",
      "yearKey": "2026"
    }
  ],
  "warnings": [
    {
      "memberId": "uuid2",
      "memberName": "חבר 2",
      "message": "Member went into debt (-2 classes)"
    }
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Cannot mark attendance for more than 15 members at once"
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "Year 2025 is locked"
}
```

**Validation:**
- Year must be editable
- Maximum 15 members per request
- All members must exist
- Date must be valid (not future)
- Time must be valid HH:MM format

**Business Logic:**
1. Validate year editability
2. Calculate Hebrew day of week from date
3. Create attendance record for each member
4. Recalculate balances for all members
5. Check for debt warnings (negative balance)
6. Return records with warnings

---

#### POST /api/years/{year}/refunds

Process refund for member.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key

**Request Body:**
```json
{
  "memberId": "uuid"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "memberId": "uuid",
  "memberName": "שם חבר",
  "classesRefunded": 15,
  "refundAmount": 675,
  "refundDate": "2026-04-11",
  "yearKey": "2026",
  "newBalance": 0
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Member has no classes to refund"
}
```

**Response (403 Forbidden):**
```json
{
  "detail": "Year 2025 is locked"
}
```

**Validation:**
- Year must be editable
- Member must exist
- Member must have classesRemaining > 0

**Business Logic:**
1. Get member's current balance
2. Validate balance > 0
3. Get most recent package to calculate price per class
4. Calculate refund amount = balance × pricePerClass
5. Create RefundTransaction record
6. Recalculate member balance (should be 0)
7. Return refund details

---

#### GET /api/years/{year}/transactions

Get all transactions for year with filters.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key

**Query Parameters:**
- `type` (optional): `"package"` | `"refund"` | `"all"` (default: `"all"`)
- `memberId` (optional): Filter by member UUID

**Response (200 OK):**
```json
{
  "year": "2026",
  "transactions": [
    {
      "type": "package",
      "id": "uuid",
      "memberId": "uuid",
      "memberName": "שם חבר",
      "date": "2026-03-10",
      "amount": 900,
      "paymentMethod": "Bit",
      "packageType": "package1",
      "classCount": 20
    },
    {
      "type": "refund",
      "id": "uuid",
      "memberId": "uuid",
      "memberName": "שם חבר",
      "date": "2026-02-15",
      "amount": -450,
      "classesRefunded": 10
    }
  ],
  "summary": {
    "totalRevenue": 45000,
    "totalRefunds": -2250,
    "netRevenue": 42750,
    "packageCount": 50,
    "refundCount": 5
  }
}
```

**Notes:**
- Transactions sorted by date descending
- Amounts: positive for packages, negative for refunds
- Includes running total calculation

---

### 14.5 Settings Endpoints

#### GET /api/settings

Get application settings.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "package1": {
    "name": "מנוי 20",
    "classCount": 20,
    "price": 900
  },
  "package2": {
    "name": "מנוי 10",
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
  "yearlyTaxCap": 50000,
  "updatedAt": "2026-04-11T10:00:00.000Z"
}
```

---

#### PUT /api/settings

Update application settings.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "package1": {
    "name": "מנוי 20",
    "classCount": 20,
    "price": 900
  },
  "package2": {
    "name": "מנוי 10",
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
  "yearlyTaxCap": 50000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "settings": {
    "id": "uuid",
    "package1": {...},
    "package2": {...},
    "package3": {...},
    "package4": {...},
    "yearlyTaxCap": 50000,
    "updatedAt": "2026-04-11T14:30:00.000Z"
  }
}
```

**Validation:**
- All package configs required
- Name: non-empty string
- ClassCount: positive integer
- Price: positive number
- YearlyTaxCap: optional positive number

---

#### POST /api/settings/export

Export all application data as JSON.

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "exportDate": "2026-04-11T14:30:00.000Z",
  "version": "1.0",
  "members": [...],
  "years": [...],
  "settings": {...}
}
```

**Headers (Response):**
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="yfit_fin_backup_20260411.json"`

**Notes:**
- Downloads complete database dump
- Includes all members, years, transactions, settings
- Used for manual backup and data migration

---

#### POST /api/settings/import

Import data from JSON backup file.

**Headers:** `Authorization: Bearer {token}`

**Request Body:** `multipart/form-data`
- `file`: JSON file (application/json)

**Response (200 OK):**
```json
{
  "success": true,
  "imported": {
    "members": 42,
    "years": 3,
    "packages": 250,
    "attendance": 3500,
    "refunds": 15
  },
  "message": "Data imported successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Invalid JSON format"
}
```

**Business Logic:**
1. Validate JSON structure
2. Backup current data before import
3. Clear existing data (optional based on import mode)
4. Import members
5. Import years and transactions
6. Import settings
7. Validate referential integrity
8. Return import summary

**Validation:**
- File must be valid JSON
- Must contain required keys: members, years, settings
- All UUIDs must be valid
- All foreign keys must resolve

---

### 14.6 Backup Endpoints

#### GET /api/backup

List all available backups.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `year` (optional): Filter backups by year

**Response (200 OK):**
```json
{
  "backups": [
    {
      "key": "2026/weekly_20260411_021300.json",
      "year": "2026",
      "type": "weekly",
      "timestamp": "2026-04-11T02:13:00.000Z",
      "size": 245678
    },
    {
      "key": "2026/monthly_20260401_010700.json",
      "year": "2026",
      "type": "monthly",
      "timestamp": "2026-04-01T01:07:00.000Z",
      "size": 198432
    }
  ],
  "count": 2
}
```

---

#### POST /api/backup

Create manual backup or restore from backup.

**Headers:** `Authorization: Bearer {token}`

**Create Backup - Request Body:**
```json
{
  "action": "create",
  "year": "2026"
}
```

**Create Backup - Response (201 Created):**
```json
{
  "success": true,
  "backup": {
    "key": "2026/manual_20260411_143000.json",
    "year": "2026",
    "timestamp": "2026-04-11T14:30:00.000Z",
    "downloadUrl": "/api/backup/download/2026/manual_20260411_143000.json"
  }
}
```

**Restore Backup - Request Body:**
```json
{
  "action": "restore",
  "backupKey": "2026/weekly_20260411_021300.json"
}
```

**Restore Backup - Response (200 OK):**
```json
{
  "success": true,
  "message": "Data restored from backup",
  "restored": {
    "year": "2026",
    "timestamp": "2026-04-11T02:13:00.000Z"
  }
}
```

---

#### GET /api/backup/cron

Automated weekly backup (triggered by cron job).

**Headers:** `Authorization: Bearer {CRON_SECRET}`

**Response (200 OK):**
```json
{
  "success": true,
  "backups": [
    {
      "year": "2026",
      "key": "2026/weekly_20260411_021300.json"
    },
    {
      "year": "2025",
      "key": "2025/weekly_20260411_021300.json"
    }
  ],
  "cleanedUp": 3
}
```

**Business Logic:**
1. Get all years
2. Create backup for each year
3. Store in `backups/{year}/weekly_{timestamp}.json`
4. Clean up old backups (keep last 4 weekly per year)
5. Return backup list

**Authentication:**
- Uses `CRON_SECRET` environment variable
- Not accessible with regular user token

---

#### GET /api/backup/monthly

Automated monthly backup (triggered by cron job).

**Headers:** `Authorization: Bearer {CRON_SECRET}`

**Response (200 OK):**
```json
{
  "success": true,
  "backups": [
    {
      "year": "2026",
      "key": "2026/monthly_20260401_010700.json"
    }
  ]
}
```

**Business Logic:**
- Similar to weekly backup
- Stores as `monthly_{timestamp}.json`
- No cleanup (keep all monthly backups)

---

### 14.7 Report Endpoints

#### GET /api/reports/email

Generate and send email report (triggered by cron job).

**Headers:** `Authorization: Bearer {CRON_SECRET}`

**Query Parameters:**
- `year` (optional): Generate report for specific year (default: current year)

**Response (200 OK):**
```json
{
  "success": true,
  "emailSent": true,
  "recipients": ["owner@yfit.com"],
  "reportGenerated": "2026-04-11T11:00:00.000Z"
}
```

**Business Logic:**
1. Generate comprehensive markdown report
2. Send via email API (Resend)
3. Attach .md file
4. Return confirmation

**Report Content:**
- Financial summary (revenue, refunds, debt)
- Monthly earnings breakdown
- Members overview with balances
- Members in debt section
- Package sales history
- Transaction log with running totals
- Monthly classes breakdown

---

#### POST /api/reports/generate

Generate report manually and download.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "year": "2026",
  "format": "markdown" | "json"
}
```

**Response (200 OK):**
- **Content-Type:** `text/markdown` or `application/json`
- **Content-Disposition:** `attachment; filename="yfit_report_2026.md"`

**Report Markdown Structure:**
```markdown
# yFit Backup Report - 2026

## Financial Summary
- Total Money Received: 42,750₪
- Total Packages Sold: 50
- Average Money/Month: 3,562₪
- Total Debt: 2,250₪

## Monthly Earnings
| Month | Revenue | Refunds | Net     |
| ----- | ------- | ------- | ------- |
| Jan   | 4,500₪  | -450₪   | 4,050₪  |
...

## Members Overview
...
```

---

### 14.8 Dashboard Endpoints

#### GET /api/dashboard/{year}

Get all dashboard statistics for year.

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `year`: Year key

**Response (200 OK):**
```json
{
  "year": "2026",
  "financial": {
    "totalRevenue": 42750,
    "totalRefunds": 2250,
    "netRevenue": 40500,
    "packagesSold": 50,
    "avgMoneyPerMonth": 3375,
    "totalDebt": 2250,
    "membersWithDebt": 8,
    "monthlyEarnings": [
      {"month": "2026-01", "revenue": 4500, "refunds": 450},
      {"month": "2026-02", "revenue": 3600, "refunds": 0}
    ],
    "cumulativeEarnings": [
      {"month": "2026-01", "cumulative": 4050},
      {"month": "2026-02", "cumulative": 7650}
    ],
    "paymentMethods": [
      {"method": "Bit", "count": 25, "amount": 22500},
      {"method": "Paybox", "count": 15, "amount": 13500}
    ],
    "packageDistribution": [
      {"packageType": "package1", "count": 30, "amount": 27000},
      {"packageType": "package2", "count": 20, "amount": 10000}
    ],
    "membersInDebt": [
      {
        "memberId": "uuid",
        "memberName": "שם חבר",
        "classesRemaining": -5,
        "debtAmount": 225
      }
    ],
    "recentRefunds": [
      {
        "memberId": "uuid",
        "memberName": "שם חבר",
        "classesRefunded": 10,
        "refundAmount": 450,
        "refundDate": "2026-03-15"
      }
    ]
  },
  "attendance": {
    "totalActiveMembers": 42,
    "totalClasses": 120,
    "totalAttendees": 1850,
    "avgAttendeesPerClass": 15.4,
    "avgAttendeesPerMonth": 154.2,
    "packagesSold": 50,
    "monthlyAttendees": [
      {"month": "2026-01", "count": 180, "uniqueMembers": 38},
      {"month": "2026-02", "count": 165, "uniqueMembers": 35}
    ],
    "topAttendees": [
      {
        "memberId": "uuid",
        "memberName": "שם חבר",
        "attendanceCount": 45
      }
    ]
  }
}
```

**Notes:**
- Single endpoint for both financial and attendance dashboards
- All calculations performed on backend
- Cached for performance (5-minute TTL)

---

### 14.9 Error Response Format

All error responses follow this structure:

```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE",
  "field": "fieldName" (optional, for validation errors),
  "timestamp": "2026-04-11T14:30:00.000Z"
}
```

**Common Error Codes:**
- `AUTH_INVALID_CREDENTIALS` - Login failed
- `AUTH_TOKEN_EXPIRED` - Session expired
- `VALIDATION_ERROR` - Input validation failed
- `NOT_FOUND` - Resource not found
- `YEAR_LOCKED` - Year is not editable
- `INSUFFICIENT_BALANCE` - Member has no classes
- `DUPLICATE_ENTRY` - Resource already exists
- `FOREIGN_KEY_ERROR` - Referenced resource doesn't exist

---

### 14.10 HTTP Status Codes

- **200 OK** - Successful GET, PUT, DELETE
- **201 Created** - Successful POST (resource created)
- **400 Bad Request** - Validation error, business rule violation
- **401 Unauthorized** - Authentication failed or missing token
- **403 Forbidden** - Authenticated but not authorized (e.g., year locked)
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server-side error

---
## Section 15: Technical Architecture

Complete technical architecture for YFit Fin Management system.

---

### 15.1 Technology Stack

#### Backend Stack

**Core Framework:**
- **FastAPI 0.109+** - Modern Python web framework
  - Automatic OpenAPI documentation
  - Built-in Pydantic validation
  - Async support for performance
  - Type hints throughout

**Language & Runtime:**
- **Python 3.11+** - Latest stable Python
  - Type hints for IDE support
  - Improved performance over 3.10
  - Better error messages

**Validation & Serialization:**
- **Pydantic 2.5+** - Data validation
  - Request/response schemas
  - Automatic JSON parsing
  - Field validation with custom validators

**Database (Production Mode):**
- **PostgreSQL 14+** - Primary database
- **SQLAlchemy 2.0+** - ORM layer
  - Async support
  - Type-safe queries
  - Relationship management
- **Alembic** - Database migrations
  - Version-controlled schema changes
  - Up/down migrations
- **Psycopg2-binary** - PostgreSQL driver

**File Storage (Development Mode):**
- **Python JSON module** - File-based storage
- **FileLock** - Concurrent access control
- **Atomic writes** - Data integrity

**Authentication & Security:**
- **Python-Jose** - JWT token handling
- **Passlib** - Password hashing (bcrypt)
- **Python-Multipart** - File upload handling

**Date/Time:**
- **Python-dateutil** - Date parsing and manipulation
- **Pytz** - Timezone support

**Email (Optional):**
- **Resend Python SDK** - Email API integration

**Development & Testing:**
- **Pytest** - Testing framework
- **Pytest-asyncio** - Async test support
- **HTTPX** - HTTP client for testing
- **Python-dotenv** - Environment configuration

---

#### Frontend Stack

**Core Framework:**
- **React 18** - UI library
  - Hooks API (useState, useEffect, useContext)
  - Function components
  - Concurrent rendering

**Language:**
- **TypeScript 5** - Type-safe JavaScript
  - Strict mode enabled
  - Interface definitions for all data
  - IDE autocomplete

**Build Tool:**
- **Vite** - Fast build tool
  - Hot module replacement (HMR)
  - Optimized production builds
  - Fast dev server

**Routing:**
- **React Router DOM 6** - Client-side routing
  - Nested routes
  - Route guards
  - URL parameters

**HTTP Client:**
- **Axios** - HTTP requests
  - Interceptors for auth tokens
  - Error handling
  - Request/response transformation

**UI & Styling:**
- **Tailwind CSS** - Utility-first CSS
  - Responsive design utilities
  - Custom theme configuration
  - JIT compiler
- **Lucide React** - Icon library
  - Consistent icon set
  - Tree-shakeable
- **Recharts** - Data visualization
  - Bar charts (monthly earnings, attendance)
  - Line charts (cumulative earnings)
  - Pie charts (payment methods)

**Date Handling:**
- **Date-fns** - Date formatting and manipulation
  - Lightweight alternative to Moment.js
  - Tree-shakeable functions
  - Locale support

**Form Handling:**
- **React Hook Form** (optional) - Form management
  - Validation
  - Error handling
  - Performance optimization

---

#### Deployment Stack

**Production Hosting:**
- **Railway** - Backend hosting
  - PostgreSQL database (managed)
  - Container deployment
  - Environment variables
  - Automatic deployments from Git
- **Vercel / Netlify** - Frontend hosting
  - CDN distribution
  - Automatic HTTPS
  - Preview deployments
  - Custom domains

**Development:**
- **Localhost** - Local development
  - File storage mode
  - Hot reload
  - Debug logging

**Containerization:**
- **Docker** - Container packaging
  - Multi-stage builds
  - Production-ready images
  - Docker Compose for local stack

**Version Control:**
- **Git** - Source control
- **GitHub** - Repository hosting
  - Actions for CI/CD
  - Pull request workflows

**Cron Jobs:**
- **Railway Cron** (if supported) - Scheduled tasks
- **External Cron Service** - Fallback (cron-job.org)

---

### 15.2 Backend Architecture

#### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entry
│   ├── config.py                   # Configuration management
│   ├── database.py                 # Database connection setup
│   │
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── member.py               # Member model
│   │   ├── year.py                 # Year model
│   │   ├── opening_balance.py      # Opening balance model
│   │   ├── package_purchase.py     # Package purchase model
│   │   ├── attendance_record.py    # Attendance model
│   │   ├── refund_transaction.py   # Refund model
│   │   ├── settings.py             # Settings model
│   │   └── auth.py                 # Authentication model
│   │
│   ├── schemas/                    # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── member.py               # Member schemas (request/response)
│   │   ├── year.py                 # Year schemas
│   │   ├── package.py              # Package schemas
│   │   ├── attendance.py           # Attendance schemas
│   │   ├── refund.py               # Refund schemas
│   │   ├── settings.py             # Settings schemas
│   │   ├── auth.py                 # Auth schemas
│   │   └── dashboard.py            # Dashboard schemas
│   │
│   ├── api/                        # API route handlers
│   │   ├── __init__.py
│   │   ├── deps.py                 # Dependencies (auth, DB session)
│   │   ├── auth.py                 # Authentication routes
│   │   ├── members.py              # Member routes
│   │   ├── years.py                # Year management routes
│   │   ├── packages.py             # Package sales routes
│   │   ├── attendance.py           # Attendance routes
│   │   ├── refunds.py              # Refund routes
│   │   ├── settings.py             # Settings routes
│   │   ├── backup.py               # Backup routes
│   │   ├── reports.py              # Report routes
│   │   └── dashboard.py            # Dashboard routes
│   │
│   ├── services/                   # Business logic layer
│   │   ├── __init__.py
│   │   ├── member_service.py       # Member operations
│   │   ├── year_service.py         # Year operations
│   │   ├── transaction_service.py  # Package/attendance/refund logic
│   │   ├── calculation_service.py  # Balance calculations
│   │   ├── backup_service.py       # Backup creation/restoration
│   │   └── report_service.py       # Report generation
│   │
│   ├── storage/                    # Storage abstraction layer
│   │   ├── __init__.py
│   │   ├── base.py                 # Abstract base class (interface)
│   │   ├── postgres_adapter.py     # PostgreSQL implementation
│   │   └── file_adapter.py         # JSON file implementation
│   │
│   └── utils/                      # Utility functions
│       ├── __init__.py
│       ├── auth.py                 # JWT token generation/validation
│       ├── validation.py           # Custom validators
│       ├── formatting.py           # Date/number formatting
│       └── hebrew.py               # Hebrew day-of-week calculation
│
├── alembic/                        # Database migrations
│   ├── versions/                   # Migration files
│   │   ├── 001_initial_schema.py
│   │   ├── 002_add_payment_methods.py
│   │   └── ...
│   ├── env.py                      # Alembic configuration
│   └── script.py.mako              # Migration template
│
├── tests/                          # Test suite
│   ├── __init__.py
│   ├── conftest.py                 # Pytest fixtures
│   ├── test_auth.py
│   ├── test_members.py
│   ├── test_years.py
│   ├── test_calculations.py
│   └── ...
│
├── data/                           # JSON storage (file mode)
│   ├── members.json
│   ├── years.json
│   ├── settings.json
│   └── auth.json
│
├── backups/                        # Backup storage
│   ├── 2026/
│   │   ├── weekly_20260411_021300.json
│   │   └── monthly_20260401_010700.json
│   └── 2025/
│       └── ...
│
├── logs/                           # Application logs
│   └── app.log
│
├── requirements.txt                # Production dependencies
├── requirements-dev.txt            # Development dependencies
├── .env.example                    # Example environment variables
├── Dockerfile                      # Docker image definition
├── docker-compose.yml              # Local development stack
├── alembic.ini                     # Alembic configuration
├── pytest.ini                      # Pytest configuration
└── README.md                       # Backend documentation
```

---

#### Core Files Description

**app/main.py** - FastAPI application entry point
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, members, years, packages, attendance, refunds, settings as settings_routes, backup, reports, dashboard

app = FastAPI(
    title="YFit Fin Management API",
    version="1.0.0",
    description="Fitness studio management system"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(members.router, prefix="/api/members", tags=["Members"])
app.include_router(years.router, prefix="/api/years", tags=["Years"])
app.include_router(packages.router, prefix="/api/years/{year}/packages", tags=["Packages"])
app.include_router(attendance.router, prefix="/api/years/{year}/attendance", tags=["Attendance"])
app.include_router(refunds.router, prefix="/api/years/{year}/refunds", tags=["Refunds"])
app.include_router(settings_routes.router, prefix="/api/settings", tags=["Settings"])
app.include_router(backup.router, prefix="/api/backup", tags=["Backup"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
async def root():
    return {"message": "YFit Fin Management API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**app/config.py** - Configuration management
```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "YFit Fin Management"
    DEBUG: bool = False

    # Storage
    STORAGE_MODE: str = "database"  # "database" or "file"
    FILE_STORAGE_PATH: str = "./data"

    # Database (PostgreSQL mode)
    DATABASE_URL: str = None

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    # Cron
    CRON_SECRET: str

    # Email (optional)
    RESEND_API_KEY: str = None
    ADMIN_EMAIL: List[str] = []
    EMAIL_FROM: str = "noreply@yfit.com"

    class Config:
        env_file = ".env"

settings = Settings()
```

**app/database.py** - Database connection
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

if settings.STORAGE_MODE == "database":
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    engine = None
    SessionLocal = None

Base = declarative_base()

def get_db():
    """Dependency for database session"""
    if settings.STORAGE_MODE != "database":
        return None

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### 15.3 Storage Layer Abstraction

#### Abstract Interface (app/storage/base.py)

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.member import Member, MemberCreate, MemberUpdate
from app.schemas.year import Year, YearData
from app.schemas.package import PackagePurchase, PackagePurchaseCreate
from app.schemas.attendance import AttendanceRecord, AttendanceRecordCreate
from app.schemas.refund import RefundTransaction, RefundTransactionCreate
from app.schemas.settings import Settings, SettingsUpdate

class StorageAdapter(ABC):
    """Abstract interface for storage operations"""

    # Members
    @abstractmethod
    async def get_members(self, archived: bool = False, search: str = None) -> List[Member]:
        pass

    @abstractmethod
    async def get_member(self, member_id: str) -> Optional[Member]:
        pass

    @abstractmethod
    async def create_member(self, member: MemberCreate) -> Member:
        pass

    @abstractmethod
    async def update_member(self, member_id: str, member: MemberUpdate) -> Member:
        pass

    @abstractmethod
    async def delete_member(self, member_id: str) -> bool:
        pass

    # Years
    @abstractmethod
    async def get_years(self) -> List[Year]:
        pass

    @abstractmethod
    async def get_year_data(self, year_key: str) -> Optional[YearData]:
        pass

    @abstractmethod
    async def create_year(self, year_key: str) -> Year:
        pass

    @abstractmethod
    async def delete_year(self, year_key: str) -> bool:
        pass

    # Opening Balances
    @abstractmethod
    async def get_opening_balance(self, member_id: str, year_key: str) -> int:
        pass

    @abstractmethod
    async def set_opening_balance(self, member_id: str, year_key: str, classes: int) -> bool:
        pass

    # Package Purchases
    @abstractmethod
    async def get_package_purchases(self, member_id: str = None, year_key: str = None) -> List[PackagePurchase]:
        pass

    @abstractmethod
    async def create_package_purchase(self, package: PackagePurchaseCreate) -> PackagePurchase:
        pass

    # Attendance Records
    @abstractmethod
    async def get_attendance_records(self, member_id: str = None, year_key: str = None) -> List[AttendanceRecord]:
        pass

    @abstractmethod
    async def create_attendance_record(self, attendance: AttendanceRecordCreate) -> AttendanceRecord:
        pass

    # Refund Transactions
    @abstractmethod
    async def get_refund_transactions(self, member_id: str = None, year_key: str = None) -> List[RefundTransaction]:
        pass

    @abstractmethod
    async def create_refund_transaction(self, refund: RefundTransactionCreate) -> RefundTransaction:
        pass

    # Settings
    @abstractmethod
    async def get_settings(self) -> Settings:
        pass

    @abstractmethod
    async def update_settings(self, settings: SettingsUpdate) -> Settings:
        pass

    # Auth
    @abstractmethod
    async def get_credentials(self) -> dict:
        pass

    @abstractmethod
    async def update_credentials(self, username: str, password_hash: str) -> bool:
        pass
```

---

#### PostgreSQL Implementation (app/storage/postgres_adapter.py)

```python
from sqlalchemy.orm import Session
from app.storage.base import StorageAdapter
from app.models import member as member_model, year as year_model, package_purchase as package_model
# ... other imports

class PostgresAdapter(StorageAdapter):
    def __init__(self, db: Session):
        self.db = db

    async def get_members(self, archived: bool = False, search: str = None) -> List[Member]:
        query = self.db.query(member_model.Member)

        # Filter by archived status
        query = query.filter(member_model.Member.is_archived == archived)

        # Search by name
        if search:
            query = query.filter(member_model.Member.name.ilike(f"%{search}%"))

        members = query.all()
        return [Member.from_orm(m) for m in members]

    async def create_member(self, member: MemberCreate) -> Member:
        # Generate next member ID
        last_member = self.db.query(member_model.Member).order_by(member_model.Member.member_id.desc()).first()
        next_id = 1 if not last_member else int(last_member.member_id[1:]) + 1
        member_id = f"M{next_id:03d}"

        # Create member
        db_member = member_model.Member(
            member_id=member_id,
            name=member.name,
            phone=member.phone,
            date_of_birth=member.date_of_birth,
            is_archived=False
        )

        self.db.add(db_member)
        self.db.commit()
        self.db.refresh(db_member)

        return Member.from_orm(db_member)

    # ... other method implementations with SQLAlchemy queries
```

---

#### File Storage Implementation (app/storage/file_adapter.py)

```python
import json
import os
from typing import List, Optional
from datetime import datetime
from filelock import FileLock
from app.storage.base import StorageAdapter
from app.config import settings

class FileAdapter(StorageAdapter):
    def __init__(self):
        self.data_path = settings.FILE_STORAGE_PATH
        os.makedirs(self.data_path, exist_ok=True)

        self.members_file = os.path.join(self.data_path, "members.json")
        self.years_file = os.path.join(self.data_path, "years.json")
        self.settings_file = os.path.join(self.data_path, "settings.json")
        self.auth_file = os.path.join(self.data_path, "auth.json")

    def _read_json(self, file_path: str, default=None):
        """Read JSON file with file locking"""
        lock_path = f"{file_path}.lock"
        with FileLock(lock_path, timeout=10):
            if not os.path.exists(file_path):
                return default if default is not None else []

            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)

    def _write_json(self, file_path: str, data):
        """Write JSON file atomically with file locking"""
        lock_path = f"{file_path}.lock"
        with FileLock(lock_path, timeout=10):
            # Write to temp file first
            temp_path = f"{file_path}.tmp"
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            # Atomic rename
            os.replace(temp_path, file_path)

    async def get_members(self, archived: bool = False, search: str = None) -> List[Member]:
        members = self._read_json(self.members_file, [])

        # Filter by archived status
        filtered = [m for m in members if m.get('isArchived', False) == archived]

        # Search by name
        if search:
            search_lower = search.lower()
            filtered = [m for m in filtered if search_lower in m['name'].lower()]

        return [Member(**m) for m in filtered]

    async def create_member(self, member: MemberCreate) -> Member:
        members = self._read_json(self.members_file, [])

        # Generate next member ID
        if not members:
            next_id = 1
        else:
            last_id = max(int(m['memberId'][1:]) for m in members)
            next_id = last_id + 1

        # Create new member
        new_member = {
            "id": str(uuid.uuid4()),
            "memberId": f"M{next_id:03d}",
            "name": member.name,
            "phone": member.phone,
            "dateOfBirth": member.date_of_birth.isoformat() if member.date_of_birth else None,
            "isArchived": False,
            "createdAt": datetime.utcnow().isoformat()
        }

        members.append(new_member)
        self._write_json(self.members_file, members)

        return Member(**new_member)

    # ... other method implementations with JSON file operations
```

---

### 15.4 Database Schema (PostgreSQL)

#### Tables Overview

```sql
-- Members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Years table
CREATE TABLE years (
    year_key VARCHAR(4) PRIMARY KEY,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opening balances table
CREATE TABLE opening_balances (
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    year_key VARCHAR(4) REFERENCES years(year_key) ON DELETE CASCADE,
    classes INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (member_id, year_key)
);

-- Package purchases table
CREATE TABLE package_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    year_key VARCHAR(4) REFERENCES years(year_key) ON DELETE CASCADE,
    package_type VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    class_count INTEGER NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    year_key VARCHAR(4) REFERENCES years(year_key) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    day_of_week VARCHAR(10),
    class_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refund transactions table
CREATE TABLE refund_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    year_key VARCHAR(4) REFERENCES years(year_key) ON DELETE CASCADE,
    classes_refunded INTEGER NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package1_config JSONB NOT NULL,
    package2_config JSONB NOT NULL,
    package3_config JSONB NOT NULL,
    package4_config JSONB NOT NULL,
    yearly_tax_cap DECIMAL(10, 2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Authentication credentials table
CREATE TABLE auth_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_members_archived ON members(is_archived);
CREATE INDEX idx_members_name ON members(name);
CREATE INDEX idx_package_purchases_member ON package_purchases(member_id);
CREATE INDEX idx_package_purchases_year ON package_purchases(year_key);
CREATE INDEX idx_package_purchases_date ON package_purchases(purchase_date);
CREATE INDEX idx_attendance_records_member ON attendance_records(member_id);
CREATE INDEX idx_attendance_records_year ON attendance_records(year_key);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_refund_transactions_member ON refund_transactions(member_id);
CREATE INDEX idx_refund_transactions_year ON refund_transactions(year_key);
```

#### Initial Migration (Alembic)

**File:** `alembic/versions/001_initial_schema.py`

```python
"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-11 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create members table
    op.create_table(
        'members',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('member_id', sa.String(10), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20)),
        sa.Column('date_of_birth', sa.Date()),
        sa.Column('is_archived', sa.Boolean(), default=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.func.now())
    )

    # Create years table
    op.create_table(
        'years',
        sa.Column('year_key', sa.String(4), primary_key=True),
        sa.Column('is_current', sa.Boolean(), default=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.func.now())
    )

    # Create opening_balances table
    op.create_table(
        'opening_balances',
        sa.Column('member_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('members.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('year_key', sa.String(4), sa.ForeignKey('years.year_key', ondelete='CASCADE'), primary_key=True),
        sa.Column('classes', sa.Integer(), nullable=False, default=0)
    )

    # ... other tables

    # Create indexes
    op.create_index('idx_members_archived', 'members', ['is_archived'])
    op.create_index('idx_members_name', 'members', ['name'])
    # ... other indexes


def downgrade():
    op.drop_table('refund_transactions')
    op.drop_table('attendance_records')
    op.drop_table('package_purchases')
    op.drop_table('opening_balances')
    op.drop_table('years')
    op.drop_table('members')
    op.drop_table('settings')
    op.drop_table('auth_credentials')
```

---

### 15.5 Frontend Architecture

#### Project Structure

```
frontend/
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── Navigation.tsx          # Main navigation sidebar
│   │   ├── Sidebar.tsx             # Collapsible sidebar
│   │   ├── BottomNav.tsx           # Mobile bottom navigation
│   │   ├── AuthGuard.tsx           # Protected route wrapper
│   │   ├── YearSelector.tsx        # Year dropdown selector
│   │   ├── StatCard.tsx            # Dashboard stat card
│   │   ├── MemberCard.tsx          # Member selection card
│   │   ├── MemberTable.tsx         # Members list table
│   │   ├── AttendanceCalendar.tsx  # Calendar view
│   │   ├── TransactionTable.tsx    # Transaction history table
│   │   ├── ChartContainer.tsx      # Chart wrapper
│   │   ├── FloatingActionButton.tsx # FAB for quick actions
│   │   ├── Modal.tsx               # Generic modal
│   │   ├── Toast.tsx               # Toast notification
│   │   └── Loading.tsx             # Loading spinner
│   │
│   ├── pages/                      # Page components
│   │   ├── Login.tsx               # Login page
│   │   ├── Finance.tsx             # Finance dashboard
│   │   ├── AttendanceDashboard.tsx # Attendance analytics
│   │   ├── Members/
│   │   │   ├── MembersList.tsx     # Members list page
│   │   │   └── MemberDetail.tsx    # Member detail page
│   │   ├── Attendance.tsx          # Mark attendance page
│   │   ├── Classes.tsx             # Classes calendar page
│   │   ├── Package.tsx             # Sell package page
│   │   ├── History.tsx             # Transaction history page
│   │   └── Settings.tsx            # Settings page
│   │
│   ├── services/                   # API & business logic
│   │   ├── api.ts                  # Axios client configuration
│   │   ├── authService.ts          # Authentication API calls
│   │   ├── memberService.ts        # Member API calls
│   │   ├── yearService.ts          # Year API calls
│   │   ├── packageService.ts       # Package API calls
│   │   ├── attendanceService.ts    # Attendance API calls
│   │   ├── refundService.ts        # Refund API calls
│   │   ├── settingsService.ts      # Settings API calls
│   │   └── dashboardService.ts     # Dashboard API calls
│   │
│   ├── contexts/                   # React contexts
│   │   ├── AuthContext.tsx         # Authentication state
│   │   ├── YearContext.tsx         # Selected year state
│   │   └── ToastContext.tsx        # Toast notifications
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useMembers.ts           # Members data hook
│   │   ├── useYearData.ts          # Year data hook
│   │   ├── useBalance.ts           # Balance calculations hook
│   │   ├── useYearValidation.ts    # Year editability hook
│   │   └── useDebounce.ts          # Debounce hook
│   │
│   ├── types/                      # TypeScript interfaces
│   │   └── index.ts                # All type definitions
│   │
│   ├── utils/                      # Utility functions
│   │   ├── calculations.ts         # Balance & debt calculations
│   │   ├── formatting.ts           # Date/number formatting
│   │   ├── validation.ts           # Form validation
│   │   ├── hebrew.ts               # Hebrew utilities
│   │   └── storage.ts              # LocalStorage helpers
│   │
│   ├── App.tsx                     # Root component
│   ├── main.tsx                    # Application entry
│   └── router.tsx                  # Route configuration
│
├── public/                         # Static assets
│   ├── favicon.ico
│   └── logo.png
│
├── index.html                      # HTML template
├── package.json                    # NPM dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── .env.local.example              # Example environment variables
└── README.md                       # Frontend documentation
```

---

#### Core Files Description

**src/main.tsx** - Application entry point
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**src/App.tsx** - Root component with providers
```tsx
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { YearProvider } from './contexts/YearContext'
import { ToastProvider } from './contexts/ToastContext'
import AppRouter from './router'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <YearProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </YearProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
```

**src/router.tsx** - Route configuration
```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import Login from './pages/Login'
import Finance from './pages/Finance'
import AttendanceDashboard from './pages/AttendanceDashboard'
import MembersList from './pages/Members/MembersList'
import MemberDetail from './pages/Members/MemberDetail'
import Attendance from './pages/Attendance'
import Classes from './pages/Classes'
import Package from './pages/Package'
import History from './pages/History'
import Settings from './pages/Settings'

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<AuthGuard><Navigate to="/finance" /></AuthGuard>} />
      <Route path="/finance" element={<AuthGuard><Finance /></AuthGuard>} />
      <Route path="/attendance-dashboard" element={<AuthGuard><AttendanceDashboard /></AuthGuard>} />
      <Route path="/members" element={<AuthGuard><MembersList /></AuthGuard>} />
      <Route path="/members/:id" element={<AuthGuard><MemberDetail /></AuthGuard>} />
      <Route path="/attendance" element={<AuthGuard><Attendance /></AuthGuard>} />
      <Route path="/classes" element={<AuthGuard><Classes /></AuthGuard>} />
      <Route path="/package" element={<AuthGuard><Package /></AuthGuard>} />
      <Route path="/history" element={<AuthGuard><History /></AuthGuard>} />
      <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
    </Routes>
  )
}

export default AppRouter
```

**src/services/api.ts** - Axios client configuration
```tsx
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

### 15.6 Deployment Configurations

#### Development Environment (File Storage)

**Backend \****`.env`**\*\* file:**
```bash
# Application
APP_NAME=YFit Fin Management
DEBUG=true

# Storage
STORAGE_MODE=file
FILE_STORAGE_PATH=./data

# Security
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
CORS_ORIGINS=["http://localhost:5173"]

# Cron
CRON_SECRET=dev-cron-secret
```

**Frontend \****`.env.local`**\*\* file:**
```bash
VITE_API_URL=http://localhost:8000
```

**Start Development:**
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

#### Production Environment (Railway + PostgreSQL)

**Railway Backend Environment Variables:**
```bash
# Application
APP_NAME=YFit Fin Management
DEBUG=false

# Storage
STORAGE_MODE=database

# Database (automatically provided by Railway PostgreSQL plugin)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security (generate secure values)
SECRET_KEY=<generate-secure-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (your frontend domain)
CORS_ORIGINS=["https://yfit-fin.vercel.app","https://yfit-fin.com"]

# Cron
CRON_SECRET=<generate-secure-random-string>

# Email (if using Resend)
RESEND_API_KEY=<your-resend-api-key>
ADMIN_EMAIL=["owner@yfit.com"]
EMAIL_FROM=noreply@yfit.com
```

**Railway Setup Steps:**
1. Create new Railway project
2. Add PostgreSQL database (plugin)
3. Add web service from GitHub repo
4. Configure environment variables
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Run migrations: `alembic upgrade head`

**Vercel Frontend Environment Variables:**
```bash
VITE_API_URL=https://yfit-api.railway.app
```

**Vercel Setup Steps:**
1. Import project from GitHub
2. Select frontend directory
3. Set framework preset: Vite
4. Configure environment variables
5. Deploy

---

#### Docker Configuration

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml** (local development)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: yfit
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: yfit_fin
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      STORAGE_MODE: database
      DATABASE_URL: postgresql://yfit:devpassword@postgres:5432/yfit_fin
      SECRET_KEY: dev-secret-key
      CORS_ORIGINS: '["http://localhost:5173"]'
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:8000
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Run with Docker Compose:**
```bash
docker-compose up --build
```

---

### 15.7 Cron Jobs Configuration

#### Railway Cron (if supported)

**File:** `.railway/cron.json`
```json
{
  "jobs": [
    {
      "name": "weekly-backup",
      "schedule": "13 2 * * 0",
      "command": "curl -H 'Authorization: Bearer ${CRON_SECRET}' ${API_URL}/api/backup/cron"
    },
    {
      "name": "monthly-backup",
      "schedule": "7 1 1 * *",
      "command": "curl -H 'Authorization: Bearer ${CRON_SECRET}' ${API_URL}/api/backup/monthly"
    },
    {
      "name": "email-report",
      "schedule": "0 11 * * 6",
      "command": "curl -H 'Authorization: Bearer ${CRON_SECRET}' ${API_URL}/api/reports/email"
    }
  ]
}
```

#### External Cron Service (cron-job.org)

**Setup Instructions:**
1. Create account on cron-job.org
2. Add three jobs with these settings:

**Weekly Backup:**
- URL: `https://yfit-api.railway.app/api/backup/cron`
- Schedule: `13 2 * * 0` (Sunday 2:13 AM)
- Headers: `Authorization: Bearer {CRON_SECRET}`

**Monthly Backup:**
- URL: `https://yfit-api.railway.app/api/backup/monthly`
- Schedule: `7 1 1 * *` (1st of month 1:07 AM)
- Headers: `Authorization: Bearer {CRON_SECRET}`

**Email Report:**
- URL: `https://yfit-api.railway.app/api/reports/email`
- Schedule: `0 11 * * 6` (Saturday 11:00 AM)
- Headers: `Authorization: Bearer {CRON_SECRET}`

---
## Section 16: Security & Validation

Security implementation and validation rules.

---

### 16.1 Authentication Security

#### Password Hashing

**Implementation (using Passlib with bcrypt):**

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plain password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)
```

**Requirements:**
- Bcrypt algorithm (industry standard)
- Automatic salt generation
- Cost factor: 12 rounds (default)
- Never store plain passwords

---

#### JWT Token Management

**Token Generation:**

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.config import settings

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
```

**Token Contents:**
```json
{
  "sub": "username",
  "exp": 1713542400,
  "iat": 1713456000
}
```

**Security Features:**
- Expiration time: 24 hours (configurable)
- Algorithm: HS256 (HMAC with SHA-256)
- Secret key: Strong random string (min 32 characters)
- Automatic expiration validation

---

#### Session Management

**Frontend Token Storage:**
- Store in `localStorage` (persistent across tabs)
- Alternative: `sessionStorage` (tab-specific)
- Never expose token in URL or logs

**Token Refresh:**
- User must re-login after expiration
- No automatic refresh (simplicity for single-user app)
- Future: Implement refresh tokens for multi-user

**Logout:**
```typescript
// Frontend
function logout() {
  localStorage.removeItem('authToken')
  window.location.href = '/login'
}
```

---

#### Brute Force Protection

**Rate Limiting (Future Enhancement):**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")  # Max 5 attempts per minute
async def login(credentials: LoginRequest):
    # ... login logic
```

**Current Approach:**
- Single-user system (low risk)
- No rate limiting in V1
- Consider adding if deployed publicly

---

### 16.2 Input Validation

#### Pydantic Schema Validation

**All API inputs validated with Pydantic schemas:**

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import date

class MemberCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    dateOfBirth: Optional[date] = None

    @validator('name')
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

    @validator('dateOfBirth')
    def date_not_future(cls, v):
        if v and v > date.today():
            raise ValueError('Date of birth cannot be in the future')
        return v

    @validator('phone')
    def phone_format(cls, v):
        if v:
            # Remove spaces and dashes
            cleaned = v.replace(' ', '').replace('-', '')
            # Basic validation (10 digits minimum)
            if not cleaned.isdigit() or len(cleaned) < 10:
                raise ValueError('Invalid phone format')
        return v
```

**Validation Features:**
- Type checking (automatic)
- Length constraints
- Custom validators
- Optional/required fields
- Automatic error messages

---

#### SQL Injection Prevention

**Protection Methods:**

1. **SQLAlchemy ORM** (automatic parameterization):
```python
# Safe - parameterized query
query = db.query(Member).filter(Member.name.ilike(f"%{search}%"))
```

2. **File storage** (JSON-based, no SQL):
```python
# No SQL injection risk with JSON
members = [m for m in members if search.lower() in m['name'].lower()]
```

**Never use:**
```python
# DANGEROUS - Never do this
query = f"SELECT * FROM members WHERE name = '{user_input}'"
```

---

#### XSS Prevention

**React Built-in Protection:**
- React automatically escapes all content
- No manual sanitization needed
- JSX prevents injection by default

**Example:**
```tsx
// Safe - React escapes automatically
<div>{member.name}</div>

// Safe - Even if name contains <script>
<input value={member.name} />
```

**Only risk: dangerouslySetInnerHTML**
```tsx
// DANGEROUS - Avoid using this
<div dangerouslySetInnerHTML={{__html: userInput}} />

// Solution: Don't use it, or sanitize first with DOMPurify
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

---

#### CSRF Protection

**API Protection:**
- JWT tokens in Authorization header (not cookies)
- No automatic credential sending
- No CSRF risk with bearer tokens

**If using cookies (future):**
```python
from fastapi.middleware.csrf import CSRFMiddleware

app.add_middleware(
    CSRFMiddleware,
    secret_key=settings.SECRET_KEY
)
```

---

### 16.3 Authorization

#### Protected Endpoints

**All endpoints (except /login) require authentication:**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.auth import verify_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Dependency to verify JWT token"""
    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    return payload.get("sub")  # username

# Usage in route
@app.get("/api/members")
async def get_members(
    current_user: str = Depends(get_current_user)
):
    # ... route logic
```

---

#### Cron Endpoint Protection

**Separate authentication for cron jobs:**

```python
from fastapi import Header, HTTPException

async def verify_cron_secret(authorization: str = Header(...)):
    """Verify cron secret token"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization")

    token = authorization.split(" ")[1]
    if token != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Invalid cron secret")

    return True

@app.get("/api/backup/cron")
async def weekly_backup(verified: bool = Depends(verify_cron_secret)):
    # ... backup logic
```

---

#### Role-Based Access (Future)

**Currently:** Single-user system (no roles)

**Future Multi-User:**
```python
from enum import Enum

class UserRole(Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    VIEWER = "viewer"

def require_role(required_role: UserRole):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in [required_role, UserRole.ADMIN]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

@app.delete("/api/years/{year}")
async def delete_year(
    year: str,
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    # Only admins can delete years
```

---

### 16.4 Data Validation Rules

#### Member Validation

| Field | Rules |
| --- | --- |
| Name | Required, non-empty, max 255 chars |
| Phone | Optional, valid phone format, 10-20 digits |
| Date of Birth | Optional, valid date, not in future |
| Member ID | Auto-generated, unique, format: M001-M999 |

---

#### Package Validation

| Field | Rules |
| --- | --- |
| Package Type | Enum: package1-4, adhoc |
| Custom Price | Required if adhoc, positive number |
| Custom Classes | Required if adhoc, positive integer |
| Amount Paid | Required, positive number |
| Purchase Date | Required, valid date, not in future |
| Payment Method | Enum: Bit, Paybox, Bank transfer, Check, Cash, Other |

---

#### Attendance Validation

| Field | Rules |
| --- | --- |
| Member IDs | Required, 1-15 members, all must exist |
| Date | Required, valid date, not in future |
| Time | Required, HH:MM format |
| Class Type | Optional, string |

---

#### Year Validation

| Field | Rules |
| --- | --- |
| Year Key | Required, 4-digit string, YYYY format, must not exist |
| Editability | Current year always, previous year only in January |

---

#### Settings Validation

| Field | Rules |
| --- | --- |
| Package Name | Required, non-empty |
| Class Count | Required, positive integer |
| Price | Required, positive number |
| Yearly Tax Cap | Optional, positive number |

---

#### Credentials Validation

| Field | Rules |
| --- | --- |
| Username | 4-12 characters, alphanumeric only |
| Password | 4-12 characters, alphanumeric only |

**Regex:**
```python
import re

USERNAME_REGEX = r'^[a-zA-Z0-9]{4,12}$'
PASSWORD_REGEX = r'^[a-zA-Z0-9]{4,12}$'

def validate_credentials(username: str, password: str):
    if not re.match(USERNAME_REGEX, username):
        raise ValueError("Username must be 4-12 alphanumeric characters")

    if not re.match(PASSWORD_REGEX, password):
        raise ValueError("Password must be 4-12 alphanumeric characters")
```

---

### 16.5 Error Handling

#### Consistent Error Responses

**All errors return standardized format:**

```python
from fastapi import HTTPException
from datetime import datetime

class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = None,
        field: str = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code
        self.field = field
        self.timestamp = datetime.utcnow().isoformat()

# Usage
raise AppException(
    status_code=400,
    detail="Member has non-zero balance",
    code="INSUFFICIENT_BALANCE",
    field="balance"
)
```

**Response:**
```json
{
  "detail": "Member has non-zero balance",
  "code": "INSUFFICIENT_BALANCE",
  "field": "balance",
  "timestamp": "2026-04-11T14:30:00.000Z"
}
```

---

#### Business Rule Violations

**Examples:**

1. **Year Locked:**
```python
if not is_year_editable(year_key):
    raise AppException(
        status_code=403,
        detail=f"Year {year_key} is locked and cannot be modified",
        code="YEAR_LOCKED"
    )
```

2. **Insufficient Balance:**
```python
if classes_remaining <= 0:
    raise AppException(
        status_code=400,
        detail="Member has no classes to refund",
        code="INSUFFICIENT_BALANCE"
    )
```

3. **Cannot Delete:**
```python
if balance != 0:
    raise AppException(
        status_code=400,
        detail="Cannot delete member with non-zero balance",
        code="CANNOT_DELETE"
    )
```

---

### 16.6 Security Best Practices

#### Environment Variables

**Never commit to Git:**
- Secret keys
- Database credentials
- API keys
- Cron secrets

**Use ****`.gitignore`****:**
```
.env
.env.local
.env.production
*.key
*.pem
```

---

#### HTTPS Enforcement

**Production:**
- Always use HTTPS
- Railway/Vercel provide automatic HTTPS
- Redirect HTTP to HTTPS

**Frontend API calls:**
```typescript
// Always use HTTPS in production
const API_URL = import.meta.env.VITE_API_URL || 'https://yfit-api.railway.app'
```

---

#### CORS Configuration

**Restrict to known origins:**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yfit-fin.vercel.app",
        "https://yfit-fin.com",
        # Never use "*" in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

#### Sensitive Data

**Never log:**
- Passwords (plain or hashed)
- JWT tokens
- API keys
- Credit card numbers (N/A for this app)

**Safe logging:**
```python
import logging

logger = logging.getLogger(__name__)

# Safe
logger.info(f"User {username} logged in")

# DANGEROUS - Never log
logger.info(f"User logged in with password {password}")
```

---

### 16.7 Data Privacy

#### Personal Information

**Collected:**
- Name (required)
- Phone (optional)
- Date of birth (optional)

**Storage:**
- Encrypted at rest (database encryption)
- Transmitted over HTTPS
- No sharing with third parties

---

#### Data Retention

**Active members:**
- Retained indefinitely while active

**Archived members:**
- Retained for historical records
- Can be permanently deleted via admin action

**Backups:**
- Retained for 1 month (weekly)
- Retained for 1 year (monthly)

---

#### Export & Deletion

**User rights:**
- Export all data (JSON format)
- Delete member records (with zero balance)
- Delete entire year data (with backup)

---

## Section 17: Testing Strategy

Complete testing approach for YFit Fin Management.

---

### 17.1 Backend Testing

#### Unit Tests

**Test coverage:**
- Business logic functions
- Calculation services
- Validation functions
- Utility functions

**Example (pytest):**

**File:** `tests/test_calculations.py`

```python
import pytest
from app.services.calculation_service import calculate_balance, calculate_debt

def test_calculate_balance_basic():
    """Test basic balance calculation"""
    balance = calculate_balance(
        opening_balance=10,
        packages_purchased=20,
        classes_attended=15,
        classes_refunded=0
    )
    assert balance == 15

def test_calculate_balance_with_refund():
    """Test balance with refund"""
    balance = calculate_balance(
        opening_balance=5,
        packages_purchased=20,
        classes_attended=10,
        classes_refunded=5
    )
    assert balance == 10

def test_calculate_debt_positive_balance():
    """Test debt calculation with positive balance"""
    debt = calculate_debt(
        classes_remaining=10,
        price_per_class=45
    )
    assert debt == 0

def test_calculate_debt_negative_balance():
    """Test debt calculation with negative balance"""
    debt = calculate_debt(
        classes_remaining=-5,
        price_per_class=45
    )
    assert debt == 225  # 5 * 45

def test_year_editability_current_year():
    """Test current year is always editable"""
    from datetime import datetime
    current_year = str(datetime.now().year)
    assert is_year_editable(current_year) == True

def test_year_editability_previous_year_january():
    """Test previous year editable in January"""
    from datetime import datetime
    if datetime.now().month == 1:
        previous_year = str(datetime.now().year - 1)
        assert is_year_editable(previous_year) == True

def test_year_editability_old_year():
    """Test old year is not editable"""
    old_year = "2020"
    assert is_year_editable(old_year) == False
```

---

#### Integration Tests

**Test coverage:**
- API endpoints
- Database operations
- Authentication flow
- Error handling

**Example:**

**File:** `tests/test_members_api.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_token():
    """Fixture to get auth token"""
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "password"
    })
    return response.json()["token"]

def test_get_members_unauthorized():
    """Test GET /api/members without auth"""
    response = client.get("/api/members")
    assert response.status_code == 401

def test_get_members_authorized(auth_token):
    """Test GET /api/members with auth"""
    response = client.get(
        "/api/members",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    assert "members" in response.json()

def test_create_member(auth_token):
    """Test POST /api/members"""
    response = client.post(
        "/api/members",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Test Member",
            "phone": "050-1234567",
            "dateOfBirth": "1990-01-01"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Member"
    assert data["memberId"].startswith("M")

def test_create_member_invalid_name(auth_token):
    """Test POST /api/members with invalid name"""
    response = client.post(
        "/api/members",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "",
            "phone": "050-1234567"
        }
    )
    assert response.status_code == 400
```

---

#### Storage Adapter Tests

**Test both implementations:**

```python
import pytest
from app.storage.postgres_adapter import PostgresAdapter
from app.storage.file_adapter import FileAdapter

@pytest.fixture(params=["postgres", "file"])
def storage_adapter(request):
    """Fixture to test both storage adapters"""
    if request.param == "postgres":
        # Setup test database
        return PostgresAdapter(test_db_session)
    else:
        # Setup test file storage
        return FileAdapter(test_data_path)

def test_create_member_storage(storage_adapter):
    """Test member creation in both adapters"""
    member = await storage_adapter.create_member(MemberCreate(
        name="Test Member",
        phone="050-1234567"
    ))

    assert member.name == "Test Member"
    assert member.memberId is not None

def test_get_member_storage(storage_adapter):
    """Test member retrieval in both adapters"""
    # Create member first
    created = await storage_adapter.create_member(MemberCreate(name="Test"))

    # Retrieve
    retrieved = await storage_adapter.get_member(created.id)

    assert retrieved.id == created.id
    assert retrieved.name == created.name
```

---

### 17.2 Frontend Testing

#### Component Tests (React Testing Library)

**Example:**

**File:** `src/components/__tests__/StatCard.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import StatCard from '../StatCard'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(
      <StatCard
        title="Total Members"
        value="42"
        icon={<span>👥</span>}
      />
    )

    expect(screen.getByText('Total Members')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('applies red color for debt', () => {
    render(
      <StatCard
        title="Total Debt"
        value="2,250₪"
        color="red"
      />
    )

    const valueElement = screen.getByText('2,250₪')
    expect(valueElement).toHaveClass('text-red-600')
  })
})
```

---

#### Integration Tests (User Flows)

**Example:**

**File:** `src/__tests__/LoginFlow.test.tsx`

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

describe('Login Flow', () => {
  it('allows user to login with valid credentials', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Should show login page
    expect(screen.getByText('התחברות')).toBeInTheDocument()

    // Fill credentials
    fireEvent.change(screen.getByLabelText('שם משתמש'), {
      target: { value: 'admin' }
    })
    fireEvent.change(screen.getByLabelText('סיסמה'), {
      target: { value: 'password' }
    })

    // Submit
    fireEvent.click(screen.getByText('כניסה'))

    // Wait for redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText('מצב פיננסי')).toBeInTheDocument()
    })
  })

  it('shows error for invalid credentials', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // Fill invalid credentials
    fireEvent.change(screen.getByLabelText('שם משתמש'), {
      target: { value: 'wrong' }
    })
    fireEvent.change(screen.getByLabelText('סיסמה'), {
      target: { value: 'wrong' }
    })

    // Submit
    fireEvent.click(screen.getByText('כניסה'))

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/שגיאה/)).toBeInTheDocument()
    })
  })
})
```

---

#### E2E Tests (Optional - Playwright)

**Example:**

**File:** `e2e/sellPackage.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('sell package to member', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5173/login')
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // Wait for dashboard
  await page.waitForURL('**/finance')

  // Navigate to package page
  await page.click('text=מכירת מנוי')

  // Select member
  await page.click('text=חבר לדוגמה')

  // Select package
  await page.click('text=מנוי 20 שיעורים')

  // Submit
  await page.click('button:has-text("מכור מנוי")')

  // Wait for success
  await expect(page.locator('text=המנוי נמכר בהצלחה')).toBeVisible()
})
```

---

### 17.3 Test Data

#### Sample Dataset

**File:** `tests/fixtures/sample_data.json`

```json
{
  "members": [
    {
      "id": "uuid-1",
      "memberId": "M001",
      "name": "חבר ראשון",
      "phone": "050-1111111",
      "dateOfBirth": "1990-01-15",
      "isArchived": false
    },
    {
      "id": "uuid-2",
      "memberId": "M002",
      "name": "חבר שני",
      "phone": "050-2222222",
      "dateOfBirth": "1985-05-20",
      "isArchived": false
    }
  ],
  "packages": [
    {
      "id": "uuid-p1",
      "memberId": "uuid-1",
      "yearKey": "2026",
      "packageType": "package1",
      "price": 900,
      "classCount": 20,
      "amountPaid": 900,
      "purchaseDate": "2026-01-10",
      "paymentMethod": "Bit"
    }
  ],
  "attendance": [
    {
      "id": "uuid-a1",
      "memberId": "uuid-1",
      "yearKey": "2026",
      "date": "2026-01-15",
      "time": "18:00",
      "dayOfWeek": "ראשון"
    }
  ]
}
```

---

#### Edge Cases to Test

1. **Member with negative balance (debt)**
2. **Member with zero balance**
3. **Year transition (carry-over balances)**
4. **Locked year (editability)**
5. **Refund when no packages exist**
6. **Attendance for member with 0 classes**
7. **Delete member with transactions**
8. **Import invalid JSON**
9. **Concurrent requests (file locking)**
10. **Token expiration**

---

### 17.4 Test Commands

**Backend:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_calculations.py

# Run specific test
pytest tests/test_members_api.py::test_create_member -v
```

**Frontend:**
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run E2E tests
npm run test:e2e
```

---

### 17.5 Continuous Integration

**GitHub Actions Workflow:**

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: yfit_test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements-dev.txt

      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/yfit_test
        run: |
          cd backend
          pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage
```

---

## Section 18: Deployment Guide

Step-by-step deployment instructions.

---

### 18.1 Prerequisites

#### Required Accounts

1. **Railway Account** (backend hosting)
  - Sign up at https://railway.app
  - Connect GitHub account

2. **Vercel Account** (frontend hosting)
  - Sign up at https://vercel.com
  - Connect GitHub account

3. **GitHub Account** (version control)
  - Repository for code

4. **Domain Name** (optional)
  - Purchase from Namecheap, Google Domains, etc.

---

### 18.2 Local Development Setup

#### Backend Setup

```bash
# Clone repository
git clone https://github.com/your-org/yfit-fin-mng.git
cd yfit-fin-mng/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-dev.txt

# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env

# Initialize database (file mode - no migration needed)
mkdir -p data

# Run development server
uvicorn app.main:app --reload --port 8000
```

**File:** `backend/.env`
```bash
APP_NAME=YFit Fin Management
DEBUG=true
STORAGE_MODE=file
FILE_STORAGE_PATH=./data
SECRET_KEY=dev-secret-key-replace-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:5173"]
CRON_SECRET=dev-cron-secret
```

---

#### Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local

# Run development server
npm run dev
```

**File:** `frontend/.env.local`
```bash
VITE_API_URL=http://localhost:8000
```

**Access application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### 18.3 Railway Production Deployment (Backend)

#### Step 1: Create Railway Project

1. Log in to Railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select `backend` as root directory

---

#### Step 2: Add PostgreSQL Database

1. In Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Database automatically provisions
4. Copy `DATABASE_URL` from variables

---

#### Step 3: Configure Environment Variables

In Railway project settings, add variables:

```bash
# Application
APP_NAME=YFit Fin Management
DEBUG=false

# Storage
STORAGE_MODE=database

# Database (automatically set by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security (generate secure random strings)
SECRET_KEY=<use: openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (add your frontend domain)
CORS_ORIGINS=["https://yfit-fin.vercel.app"]

# Cron
CRON_SECRET=<use: openssl rand -hex 32>

# Email (optional - if using Resend)
RESEND_API_KEY=<your-resend-api-key>
ADMIN_EMAIL=["owner@yfit.com"]
EMAIL_FROM=noreply@yfit.com
```

**Generate secure secrets:**
```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

---

#### Step 4: Configure Build Settings

**Root Directory:** `backend`

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Procfile (optional):**
```
web: alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

#### Step 5: Deploy

1. Push code to GitHub
2. Railway automatically detects changes
3. Builds and deploys
4. Check logs for any errors

**Get your API URL:**
- Railway provides: `https://yfit-api.up.railway.app`
- Or configure custom domain

---

#### Step 6: Run Database Migrations

**Option A: Automatic (in start command)**
- Migrations run automatically on each deploy
- Included in start command: `alembic upgrade head &&`

**Option B: Manual (Railway CLI)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run alembic upgrade head
```

---

#### Step 7: Initialize Admin Credentials

**Create initial admin user:**

1. Use Railway shell:
```bash
railway run python

>>> from app.utils.auth import hash_password
>>> from app.storage.postgres_adapter import PostgresAdapter
>>> # ... create admin credentials
```

2. Or use API endpoint (one-time setup):
```bash
curl -X POST https://yfit-api.railway.app/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "change-me-now"}'
```

---

### 18.4 Vercel Frontend Deployment

#### Step 1: Create Vercel Project

1. Log in to Vercel.com
2. Click "Add New" → "Project"
3. Import from GitHub
4. Select your repository
5. Select `frontend` as root directory

---

#### Step 2: Configure Project Settings

**Framework Preset:** Vite

**Root Directory:** `frontend`

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
dist
```

**Install Command:**
```bash
npm install
```

---

#### Step 3: Environment Variables

Add in Vercel project settings:

```bash
VITE_API_URL=https://yfit-api.railway.app
```

**Important:** Replace with your actual Railway API URL

---

#### Step 4: Deploy

1. Click "Deploy"
2. Vercel builds and deploys
3. Get your URL: `https://yfit-fin.vercel.app`

---

#### Step 5: Configure Custom Domain (Optional)

1. In Vercel project settings → "Domains"
2. Add your domain: `yfit-fin.com`
3. Configure DNS records (Vercel provides instructions)
4. Wait for SSL certificate (automatic)

**Update backend CORS:**
```bash
# In Railway environment variables
CORS_ORIGINS=["https://yfit-fin.com","https://yfit-fin.vercel.app"]
```

---

### 18.5 Cron Jobs Setup

#### Option A: Railway Cron (if supported)

**File:** `.railway/cron.json`
```json
{
  "jobs": [
    {
      "name": "weekly-backup",
      "schedule": "13 2 * * 0",
      "command": "curl -H 'Authorization: Bearer ${CRON_SECRET}' ${RAILWAY_PUBLIC_DOMAIN}/api/backup/cron"
    },
    {
      "name": "monthly-backup",
      "schedule": "7 1 1 * *",
      "command": "curl -H 'Authorization: Bearer ${CRON_SECRET}' ${RAILWAY_PUBLIC_DOMAIN}/api/backup/monthly"
    },
    {
      "name": "email-report",
      "schedule": "0 11 * * 6",
      "command": "curl -H 'Authorization: Bearer ${CRON_SECRET}' ${RAILWAY_PUBLIC_DOMAIN}/api/reports/email"
    }
  ]
}
```

---

#### Option B: External Cron Service (cron-job.org)

1. **Create account** at https://cron-job.org

2. **Add Weekly Backup Job:**
  - Title: YFit Weekly Backup
  - URL: `https://yfit-api.railway.app/api/backup/cron`
  - Schedule: `13 2 * * 0` (Sunday 2:13 AM)
  - Request Method: GET
  - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

3. **Add Monthly Backup Job:**
  - Title: YFit Monthly Backup
  - URL: `https://yfit-api.railway.app/api/backup/monthly`
  - Schedule: `7 1 1 * *` (1st of month 1:07 AM)
  - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

4. **Add Email Report Job:**
  - Title: YFit Email Report
  - URL: `https://yfit-api.railway.app/api/reports/email`
  - Schedule: `0 11 * * 6` (Saturday 11:00 AM)
  - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

**Verify cron secret matches Railway environment variable**

---

### 18.6 Email Configuration (Optional)

#### Setup Resend

1. **Create account** at https://resend.com
2. **Get API key** from dashboard
3. **Add to Railway** environment variables:
```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ADMIN_EMAIL=["owner@yfit.com"]
   EMAIL_FROM=noreply@yfit.com
```

4. **Verify domain** (if using custom sender):
  - Add DNS records provided by Resend
  - Wait for verification

---

### 18.7 Post-Deployment Checklist

- [ ] Backend API accessible at Railway URL
- [ ] Frontend accessible at Vercel URL
- [ ] Login works with admin credentials
- [ ] Database migrations applied
- [ ] CORS configured correctly
- [ ] Cron jobs scheduled
- [ ] Email reports working (if configured)
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled (automatic)
- [ ] Environment variables set correctly
- [ ] Backup strategy tested
- [ ] Logs monitoring setup

---

### 18.8 Monitoring & Logging

#### Railway Logs

**Access logs:**
1. Railway dashboard → Your project
2. Click on service
3. View "Logs" tab
4. Filter by severity

**Log levels:**
- INFO: Normal operations
- WARNING: Potential issues
- ERROR: Errors requiring attention

---

#### Vercel Logs

**Access logs:**
1. Vercel dashboard → Your project
2. Click "Logs" tab
3. View build and runtime logs

---

#### Error Tracking (Optional)

**Sentry Integration:**

**Backend:**
```python
import sentry_sdk

sentry_sdk.init(
    dsn="https://xxx@sentry.io/xxx",
    environment="production",
)
```

**Frontend:**
```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  environment: "production",
})
```

---

### 18.9 Backup & Recovery

#### Manual Backup

**Download data via API:**
```bash
curl -X POST https://yfit-api.railway.app/api/settings/export \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -o backup_$(date +%Y%m%d).json
```

**Restore from backup:**
1. Login to application
2. Go to Settings
3. Click "Import Data"
4. Select backup JSON file
5. Confirm import

---

#### Automated Backups

**Verify cron jobs running:**
1. Check cron-job.org dashboard
2. View execution history
3. Check Railway logs for backup endpoints

**Backup storage:**
- File storage mode: Local `backups/` directory
- Database mode: Railway disk (persistent)
- Future: Migrate to S3/Blob storage for redundancy

---

## Section 19: Future Enhancements

Features planned for V2 and beyond.

---

### 19.1 Out of Scope for V1

**Not included in initial release:**

1. **Mobile App**
  - Native iOS/Android apps
  - React Native implementation
  - Offline mode

2. **Multi-User Access**
  - Multiple admin accounts
  - Role-based permissions (admin, instructor, viewer)
  - User management interface

3. **SMS Notifications**
  - Class reminders
  - Low balance alerts
  - Payment confirmations

4. **Payment Gateway Integration**
  - Online payment processing
  - Stripe/PayPal integration
  - Automatic invoice generation

5. **Advanced Reporting**
  - Custom date range reports
  - Revenue projections
  - Attendance trends analysis
  - Export to Excel/PDF

6. **Member Self-Service Portal**
  - Member login
  - View package balance
  - Book classes online
  - Payment history

7. **Capacity Management**
  - Class size limits
  - Waitlist functionality
  - Booking system

8. **Booking/Scheduling System**
  - Class schedule management
  - Online booking
  - Cancellation policies
  - Instructor scheduling

---

### 19.2 Planned for V2

**Priority features for next version:**

#### 1. Multi-User Support

**Features:**
- Admin, Instructor, Viewer roles
- User account management
- Per-user permissions
- Audit log (who did what)

**Database Changes:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    role VARCHAR(20),
    created_at TIMESTAMP
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    timestamp TIMESTAMP
);
```

---

#### 2. SMS Notifications

**Use Cases:**
- Class reminder (1 hour before)
- Low balance alert (< 3 classes)
- Birthday greetings
- Payment confirmation

**Integration:**
- Twilio API
- SMS.to API
- Local Israeli SMS gateway

**Settings:**
- Enable/disable per member
- Notification preferences
- SMS templates

---

#### 3. Advanced Reporting

**Reports:**
- Revenue by package type
- Attendance trends (by day/time)
- Member retention analysis
- Churn prediction
- Peak hours analysis

**Export Formats:**
- PDF (printable)
- Excel (data analysis)
- CSV (import to other tools)

---

#### 4. Capacity Management

**Features:**
- Set max capacity per class
- Real-time availability display
- Waitlist when full
- Automatic notifications when spots open

**UI Changes:**
- Attendance page shows "X / Y spots"
- Warning when near capacity
- Waitlist management interface

---

### 19.3 Technical Debt & Improvements

**Code Quality:**
- Increase test coverage to 80%+
- Add integration tests for all endpoints
- Refactor large components
- Document all functions

**Performance:**
- Implement caching (Redis)
- Optimize database queries
- Add pagination to large lists
- Lazy load images

**Security:**
- Add rate limiting
- Implement 2FA
- Regular security audits
- Penetration testing

**UX/UI:**
- Dark mode
- Accessibility improvements (WCAG compliance)
- Mobile-responsive refinements
- Hebrew RTL polish

---

## Section 20: Appendices

Additional reference materials.

---

### 20.1 Sample Data Structures

#### Complete Member Object

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "memberId": "M042",
  "name": "דוד כהן",
  "phone": "050-1234567",
  "dateOfBirth": "1985-03-15",
  "isArchived": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "classesRemaining": 15,
  "debtAmount": 0,
  "status": "Active",
  "totalAttended": 185,
  "totalPaid": 9000
}
```

---

#### Complete Year Data Object

```json
{
  "yearKey": "2026",
  "isCurrent": true,
  "isEditable": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "openingBalances": [
    {
      "memberId": "550e8400-e29b-41d4-a716-446655440000",
      "memberName": "דוד כהן",
      "classes": 10
    }
  ],
  "packages": [
    {
      "id": "uuid-p1",
      "memberId": "550e8400-e29b-41d4-a716-446655440000",
      "packageType": "package1",
      "price": 900,
      "classCount": 20,
      "amountPaid": 900,
      "purchaseDate": "2026-03-10",
      "paymentMethod": "Bit",
      "yearKey": "2026"
    }
  ],
  "attendance": [
    {
      "id": "uuid-a1",
      "memberId": "550e8400-e29b-41d4-a716-446655440000",
      "memberName": "דוד כהן",
      "date": "2026-03-15",
      "time": "18:00",
      "dayOfWeek": "ראשון",
      "classType": "Regular",
      "yearKey": "2026"
    }
  ],
  "refunds": []
}
```

---

### 20.2 Error Code Reference

| Code | Status | Description |
| --- | --- | --- |
| AUTH_INVALID_CREDENTIALS | 401 | Login failed - wrong username/password |
| AUTH_TOKEN_EXPIRED | 401 | JWT token has expired |
| AUTH_TOKEN_INVALID | 401 | JWT token is malformed or invalid |
| VALIDATION_ERROR | 400 | Input validation failed |
| NOT_FOUND | 404 | Resource doesn't exist |
| MEMBER_NOT_FOUND | 404 | Member ID not found |
| YEAR_NOT_FOUND | 404 | Year key not found |
| YEAR_LOCKED | 403 | Year is not editable |
| YEAR_EXISTS | 400 | Year already exists |
| INSUFFICIENT_BALANCE | 400 | Member has no classes to refund |
| CANNOT_DELETE | 400 | Cannot delete (non-zero balance) |
| DUPLICATE_ENTRY | 400 | Resource already exists |
| FOREIGN_KEY_ERROR | 400 | Referenced resource doesn't exist |
| INVALID_PACKAGE_TYPE | 400 | Package type not recognized |
| TOO_MANY_MEMBERS | 400 | Attendance limit exceeded (max 15) |
| INVALID_DATE | 400 | Date format invalid or in future |
| CRON_UNAUTHORIZED | 401 | Invalid cron secret |
| IMPORT_ERROR | 400 | JSON import validation failed |

---

### 20.3 API Response Formats

#### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

---

#### Error Response

```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE",
  "field": "fieldName",
  "timestamp": "2026-04-11T14:30:00.000Z"
}
```

---

#### List Response

```json
{
  "items": [...],
  "count": 42,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

### 20.4 Database Migration Scripts

#### Initial Schema Migration

**File:** `alembic/versions/001_initial_schema.py`

See Section 15.4 for complete SQL schema.

---

#### Sample Migration (Add Field)

**File:** `alembic/versions/002_add_payment_methods.py`

```python
"""Add payment method to package purchases

Revision ID: 002
Revises: 001
Create Date: 2026-04-15 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'

def upgrade():
    op.add_column(
        'package_purchases',
        sa.Column('payment_method', sa.String(50), nullable=True)
    )

def downgrade():
    op.drop_column('package_purchases', 'payment_method')
```

**Run migration:**
```bash
alembic upgrade head
```

**Rollback migration:**
```bash
alembic downgrade -1
```

---

### 20.5 Glossary of Terms

| Term | Hebrew | Definition |
| --- | --- | --- |
| Member | חבר | Person enrolled in the studio |
| Package | מנוי | Set of classes purchased |
| Class | שיעור | Single class session |
| Attendance | נוכחות | Record of member attending a class |
| Balance | יתרה | Number of classes remaining |
| Debt | חוב | Negative balance (classes owed) |
| Refund | החזר כספי | Return of money for unused classes |
| Opening Balance | יתרת פתיחה | Classes carried over from previous year |
| Year | שנה | Fiscal period for transactions |
| Archived | בארכיון | Inactive member |
| Package Type | סוג מנוי | Standard packages (1-4) or custom (adhoc) |
| Payment Method | אמצעי תשלום | How member paid (Bit, Paybox, Cash, etc.) |
| Tax Cap | תקרת מס | Yearly limit for tax purposes |
| Cron Job | משימה מתוזמנת | Automated scheduled task |
| Dashboard | לוח בקרה | Overview page with statistics |
| Transaction | עסקה | Any operation (package sale, refund, attendance) |

---

### 20.6 Keyboard Shortcuts (Future)

**Planned shortcuts for V2:**

| Shortcut | Action |
| --- | --- |
| `/` | Focus search |
| `n` | New member |
| `p` | Sell package |
| `a` | Mark attendance |
| `Ctrl+S` | Save changes |
| `Esc` | Close modal |
| `Ctrl+K` | Command palette |

---

### 20.7 Configuration Files

#### Backend Dependencies

**File:** `backend/requirements.txt`
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.25
alembic==1.13.0
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dateutil==2.8.2
pytz==2023.3
filelock==3.13.1
resend==0.7.0
```

---

#### Frontend Dependencies

**File:** `frontend/package.json`
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

### 20.8 Contact & Support

**Project Repository:**
- GitHub: `https://github.com/your-org/yfit-fin-mng`
- Issues: Report bugs and feature requests

**Documentation:**
- This functional specification document
- README.md in each directory
- Inline code comments

**Future:**
- User documentation (help center)
- Video tutorials
- Community forum

---

**END OF DOCUMENT**

---

**Document Version:** 1.0
**Last Updated:** 2026-04-11
**Total Sections:** 20
**Total Pages:** ~140 (estimated)
**Word Count:** ~35,000+
