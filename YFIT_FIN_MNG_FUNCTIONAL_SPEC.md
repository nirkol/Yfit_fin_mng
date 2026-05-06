# YFit Fin - Complete Functional Specification
**Fitness Studio Management Application**

## Executive Summary

YFit Fin is a fitness studio management application designed for a single studio owner to track member attendance, manage class packages, and handle payment/refund operations. The application supports multi-year operations with automatic data carry-over and year-specific editing restrictions.

**Technology Stack:**
- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Storage:** localStorage (browser-based persistence)
- **Deployment:** Vercel hosting
- **Icons:** Lucide React
- **Charts:** Recharts
- **Email:** Resend API

**Key Features:**
- Authentication system with protected routes
- Two specialized dashboards (Finance + Attendance)
- 4 package types (regular + youth versions)
- Automated weekly email reports
- Automated backup system
- Advanced class session management
- Transaction history tracking
- Tax cap configuration

---

## 1. Core Entities & Data Model

### 1.1 Member
**Purpose:** Represents a fitness studio member

**Fields:**
- `id` (string, primary key) - Unique identifier
- `member_id` (integer, unique) - Sequential display number for sorting
- `name` (string, required) - Member's full name
- `phone` (string, optional) - Contact phone number
- `date_of_birth` (date, optional) - Member's birthdate
- `is_archived` (boolean, default: false) - Archive status
- `created_at` (timestamp) - Registration date

**Constraints:**
- Name cannot be empty or whitespace-only
- Member ID auto-increments from highest existing value

### 1.2 Package Purchase
**Purpose:** Records a class package sale to a member

**Fields:**
- `id` (string, primary key)
- `member_id` (foreign key → Member.id, cascade delete)
- `member_name` (string) - Snapshot of member name at purchase time
- `package_type` (enum) - Package identifier: `'package1' | 'package2' | 'package3' | 'package4' | 'adhoc' | '10' | '20' | 'youth10' | 'youth20'`
- `price` (decimal) - Price charged at time of sale
- `class_count` (integer) - Number of classes (10 or 20)
- `amount_paid` (decimal) - Amount actually paid
- `purchase_date` (timestamp) - Date/time of sale
- `payment_method` (string, optional) - Payment method used
- `year_key` (string) - Year identifier (e.g., "2025")
- `created_at` (timestamp)

**Package Types:**
- `package1` - Adult 20-class package (configured in settings)
- `package2` - Adult 10-class package (configured in settings)
- `package3` - Youth 20-class package (configured in settings)
- `package4` - Youth 10-class package (configured in settings)
- `adhoc` - Custom one-time sale (manual price/class count)
- Legacy types (`'10'`, `'20'`, `'youth10'`, `'youth20'`) - Backward compatibility

**Business Rules:**
- Cannot be created if year is locked (read-only)
- Price snapshot preserves historical pricing
- Amount paid may differ from price (discounts/adjustments)
- Adhoc packages allow custom class count and pricing

### 1.3 Attendance Record
**Purpose:** Tracks member attendance at classes

**Fields:**
- `id` (string, primary key)
- `member_id` (foreign key → Member.id, cascade delete)
- `member_name` (string) - Snapshot of member name
- `class_type` (enum: 'beginner', 'regular') - Class difficulty level
- `date` (date) - Date of class attendance
- `time` (string, optional) - Time in HH:MM format
- `day_of_week` (string, optional) - Day name in Hebrew
- `year_key` (string) - Year identifier
- `created_at` (timestamp)

**Business Rules:**
- Each attendance record deducts 1 class from member balance
- Cannot be created if year is locked
- Member can attend with negative balance (goes into debt)
- Warning shown if attendance will push member into debt

### 1.4 Refund Transaction
**Purpose:** Records class refunds given to members

**Fields:**
- `id` (string, primary key)
- `member_id` (foreign key → Member.id, cascade delete)
- `member_name` (string) - Snapshot of member name
- `classes_refunded` (integer) - Number of classes refunded
- `refund_amount` (decimal) - Money refunded
- `refund_date` (timestamp) - Date/time of refund
- `year_key` (string) - Year identifier

**Business Rules:**
- Only available for members with positive class balance
- Refund amount = classes × price per class
- Price per class from most recent package purchase
- If no purchase history: use 20-class package price ÷ 20
- Reduces member balance to 0
- Cannot be created if year is locked

### 1.5 Opening Balance
**Purpose:** Tracks carried-over class balances from previous year

**Fields:**
- `member_id` (foreign key → Member.id, cascade delete)
- `year_key` (string)
- `classes` (integer) - Opening class balance
- Primary key: (member_id, year_key)

**Business Rules:**
- Automatically set when creating new year
- Previous year's closing balance becomes new year's opening balance
- New members start with opening balance = 0

### 1.6 Settings
**Purpose:** Global configuration for package pricing

**Fields:**
- `key` (string, primary key) - Setting identifier
- `value` (JSON) - Setting value
- `updated_at` (timestamp)

**Default Settings:**
```json
{
  "package_10_price": 500,
  "package_20_price": 900
}
```

**Business Rules:**
- Prices must be positive numbers
- Price changes don't affect existing purchases (historical pricing preserved)

### 1.7 Year Data Structure
**Purpose:** Logical grouping of year-specific data

**Components:**
- Opening balances for all members
- Package purchases for the year
- Attendance records for the year
- Refund transactions for the year
- Year key (e.g., "2024", "2025")

**Not a separate table** - derived from filtering other tables by year_key

---

## 2. Application Pages & Navigation

### 2.1 Navigation Menu
**Sidebar navigation (left side, collapsible)**

**Layout:**
- Fixed left sidebar on desktop
- Collapsible with icon-only mode
- Bottom navigation bar on mobile
- Year selector dropdown in sidebar
- Logout button at bottom

**Menu Structure - Main Section:**
1. **Finance Dashboard** (/finance) - Home icon - PRIMARY VIEW
2. **Members** (/members) - Users icon
3. **Attendance** (/attendance) - ClipboardCheck icon
4. **Sell Package** (/package) - Package icon

**Menu Structure - Analytics Section:**
5. **Attendance Dashboard** (/attendance-dashboard) - BarChart icon
6. **Classes** (/classes) - Calendar icon
7. **History** (/history) - FileText icon

**Menu Structure - Admin Section:**
8. **Settings** (/settings) - Settings icon

**Global Elements:**
- Year selector dropdown (in sidebar)
- Read-only indicator badge when year is locked
- App title: "YFit Fin"
- Logout button (bottom of sidebar)

**Authentication:**
- Login page (/login) - Not in navigation, accessed when logged out
- Protected routes require authentication
- Session stored in localStorage

---

## 3. Login Page (/login)

### 3.1 Purpose
Authentication gate for the application. All routes except /login require authentication.

### 3.2 Page Elements

**Login Form:**
- Username input field (text)
- Password input field (password, masked)
- "התחבר" (Login) button
- Hebrew interface

**Behavior:**
- On successful login: Redirect to /finance
- On failed login: Show error message "שם משתמש או סיסמה שגויים" (Incorrect username or password)
- Session stored in localStorage
- Auto-redirect to /finance if already logged in

**Design:**
- Centered card layout
- Clean, minimal design
- Responsive on mobile

---

## 4. Finance Dashboard (/finance) - PRIMARY DASHBOARD

### 4.1 Purpose
Main dashboard showing comprehensive financial analysis, member statistics, and package history.

### 4.2 Year Selector
**Location:** Top of page (also in sidebar)
**Type:** Dropdown select
**Options:** List of all available years (newest first)
**Current Year:** Labeled with "(Current)"
**Locked Years:** Show "Read-Only" badge

### 4.3 Statistics Cards (8 Cards Grid)

**Card 1: Total Members**
- Icon: Users
- Value: Count of non-archived members
- Color: Blue

**Card 2: Members with Debt**
- Icon: AlertCircle
- Value: Count of members with class balance < 0
- Color: Red
- Click: Scrolls to "Members with Debt" section

**Card 3: Total Money in Debt**
- Icon: TrendingDown
- Value: Sum of all debt amounts in currency
- Color: Red
- Calculation: For each member with negative balance, debt = |classes| × price per class

**Card 4: Packages Sold**
- Icon: Package
- Value: Count of package purchases in year
- Color: Purple

**Card 5: Money Received**
- Icon: DollarSign
- Value: Net revenue = Sum(amountPaid) - Sum(refundAmount)
- Color: Green

**Card 6: Total Attendees**
- Icon: Activity
- Value: Count of attendance records in year
- Color: Blue

**Card 7: Average Attendees/Month**
- Icon: Calendar
- Value: Total attendees ÷ active months
- Color: Blue
- Active months = months with at least 1 attendance record

**Card 8: Average Money/Month**
- Icon: TrendingUp
- Value: Net revenue ÷ active months
- Color: Green

### 4.4 Quick Actions (if year is editable)
**Two prominent buttons:**
1. **Mark Attendance** (purple) → /attendance
2. **Sell Package** (blue) → /package

**Hidden if:** Year is locked (read-only)

### 4.5 Financial Analysis Section

**Monthly Earnings Trend:**
- Line/bar chart showing monthly revenue
- Compares purchases vs refunds
- Running totals displayed
- Color-coded (green for positive, red for losses)

**Package History:**
- Chronological list of all package purchases for the year
- Shows: Date, member name, package type, price, running total
- Grouped by month
- Total revenue summary at bottom

**Revenue Breakdown:**
- Total purchases (green)
- Total refunds (red)
- Net revenue (bold, green/red based on value)

### 4.6 Members with Debt Section
**Display:**
- Header: "Members with Debt" (red)
- Shows: Top 5 members with negative balance
- Each entry shows:
  - Member name (red, clickable link to member detail)
  - Debt amount in currency (red, bold)
  - Trending down icon
- Footer link: "View all X members with debt" (if more than 5)

**Sorting:** By debt amount descending (most debt first)

### 4.7 Recent Attendance Section
**Display:**
- Header: "Recent Attendance"
- Shows: Last 5 attendance records from past 7 days
- Each entry shows:
  - Member name (clickable)
  - Class type badge (beginner/regular)
  - Date
  - "-1 class" indicator
- Footer link: "View All Attendance"

**Sorting:** Newest first (by date descending)

---

## 5. Attendance Dashboard (/attendance-dashboard)

### 5.1 Purpose
Analytics dashboard focused on attendance patterns, trends, and class participation statistics.

### 5.2 Attendance Statistics

**Summary Cards:**
- Total attendance for selected year
- Average attendance per month
- Most attended class type (beginner vs regular)
- Attendance trend (increasing/decreasing)

### 5.3 Visualizations

**Monthly Attendance Chart:**
- Type: Bar chart
- X-axis: Months (Jan, Feb, Mar, etc.)
- Y-axis: Attendance count
- Color: Blue bars
- Shows: Monthly attendance totals
- Comparison line showing previous year (optional)

**Class Type Distribution:**
- Pie chart or bar chart
- Shows breakdown: Beginner vs Regular classes
- Percentage of total
- Color-coded

**Top Attendees:**
- List of most frequent attendees
- Shows: Member name, attendance count, percentage of total classes
- Sorted by attendance count descending

### 5.4 Filters
- Year selector
- Month range selector
- Class type filter (all, beginner, regular)

---

## 6. Classes Page (/classes)

### 6.1 Purpose
Monthly calendar view for managing class sessions by date and time.

### 6.2 Calendar View

**Layout:**
- Calendar grid organized by month
- Classes grouped by date
- Time slots shown for each class
- Color coding by class type

**Month/Year Selector:**
- Dropdown to select month and year
- Navigation arrows (previous/next month)

### 6.3 Class Display

**Each Class Entry Shows:**
- Date (Hebrew format)
- Time (HH:MM)
- Class type (beginner/regular)
- Number of attendees
- Attendance list (expandable)

**Actions:**
- Edit class session (change time, type)
- Delete/remove class from view
- Highlight specific sessions

### 6.4 Grouping
- Classes grouped by date
- Within each date, sorted by time
- Empty dates hidden or grayed out

---

## 7. History Page (/history)

### 7.1 Purpose
Complete transaction history showing all package purchases and refunds.

### 7.2 Filters

**Year Filter:**
- Dropdown to select year
- Shows all years with transactions
- Default: Current year

**Transaction Type Filter:**
- All transactions (default)
- Packages only
- Refunds only

### 7.3 Transaction List

**Display Format:**
- Chronological list (newest first)
- Each transaction shows:
  - Date and time
  - Member name (clickable)
  - Transaction type (Package/Refund)
  - Package type (for purchases)
  - Amount (₪)
  - Running total

**Package Transactions:**
- Green highlight or icon
- Shows: Package name (mapped from settings)
- Amount paid
- Class count

**Refund Transactions:**
- Red highlight or icon
- Shows: Classes refunded
- Refund amount (negative)

### 7.4 Summary
- Total packages sold
- Total refunds issued
- Net revenue
- Running balance throughout the year

---

## 8. Members Page (/members)

### 4.1 Page Header
**Title:** "Members"
**Subtitle:** "X active members (Y archived)"
**Action Button:** "Add Member" (blue, plus icon)

### 4.2 Search & Filters
**Search Box:**
- Placeholder: "Search members..."
- Real-time filtering by name
- Icon: Search magnifying glass

**Toggle Button:**
- Label: "Show Archived Members" / "Show Active Members"
- Icon: Archive
- Default: Shows active members
- Click: Switches view between active/archived

### 4.3 Members Table

**Columns:**

1. **Status Badge**
  - Active (green): Has classes, no debt
  - No Classes (yellow): Balance = 0
  - In Debt (red): Balance < 0
  - Archived (gray): is_archived = true

2. **Phone**
  - Shows: phone number or "-"

3. **Date of Birth**
  - Shows: Formatted date or "-"
  - Format: DD/MM/YYYY (locale-specific)

4. **Classes Attended (Year)**
  - Shows: Count of attendance records for current year
  - Bold/red if member in debt

5. **Amount Paid (Year)**
  - Shows: Sum of amountPaid for current year
  - Currency format (₪)
  - Bold/red if member in debt

6. **Remaining Classes**
  - Shows: Current class balance
  - Green if positive
  - Red if negative with "DEBT" indicator
  - Bold if zero or negative

7. **Remaining Balance $**
  - Shows: Debt amount in currency if negative, else $0
  - Red text if has debt
  - Calculation: |negative balance| × price per class

8. **Name**
  - Shows: Member name (clickable link to detail)
  - Bold and red if in debt
  - External link icon

9. **# (Member ID)**
  - Shows: Sequential member ID number
  - Used for sorting

**Row Colors:**
- Red background (bg-red-50) if member has debt
- White background otherwise
- Hover: Slight gray tint

**Sorting:**
- Default: By member ID ascending (oldest first)
- Can be changed to newest first

### 4.4 Row Actions
**Buttons in each row:**

1. **View Details** (eye icon)
  - Color: Blue
  - Action: Navigate to /members/[id]

2. **Archive/Unarchive** (archive icon)
  - Color: Orange for archive, Green for unarchive
  - Shows: Archive icon if active, ArchiveRestore if archived
  - Confirmation required
  - Action: Toggle is_archived flag

3. **Refund** (dollar icon)
  - Color: Purple
  - Only shown if: classes remaining > 0
  - Confirmation shows: number of classes and refund amount
  - Action: Create refund transaction, set balance to 0

4. **Delete** (trash icon)
  - Color: Red
  - Only enabled if: balance = 0
  - Disabled (gray) if: balance ≠ 0
  - Tooltip: "Cannot delete - balance must be zero"
  - Double confirmation required
  - Action: Delete member and all related data across all years

### 4.5 Add Member Modal
**Trigger:** Click "Add Member" button

**Modal Content:**
- Title: "Add New Member"
- Input field: Member name (required, text input)
  - Placeholder: "Member name"
  - Auto-focus on open
- Phone input (optional)
- Date of Birth input (optional, date picker)

**Buttons:**
- "Add Member" (blue) - Creates member
- "Cancel" (gray) - Closes modal

**Validation:**
- Name cannot be empty or whitespace-only
- Shows error if validation fails

**On Success:**
- Modal closes
- Member appears in table immediately
- Success alert: "Member added successfully"

---

## 5. Member Detail Page (/members/[id])

### 5.1 Page Header
**Back Link:** "← Back to Members"
**Member Name:** Large heading (red if in debt)
**Archived Badge:** If is_archived = true, shows gray "Archived" badge

### 5.2 Status Cards (2 Large Cards)

**Card 1: Classes Remaining**
- Icon: Calendar
- Large number display of class balance
- If negative: Red background, shows "X classes in DEBT"
- If positive: Blue background
- If zero: Yellow background

**Card 2: Total Packages & Money Paid**
- Icon: Package
- Shows: Number of packages purchased
- Shows: Total amount paid (sum of all purchases)
- Color: Purple

### 5.3 Quick Actions (if year is editable)
**Three prominent buttons:**

1. **Sell Package** (purple, package icon)
  - Links to: /package?memberId=[id]
  - Pre-selects this member

2. **Mark Attendance** (blue, clipboard icon)
  - Links to: /attendance?memberId=[id]
  - Pre-selects this member

3. **Delete Member** (red, trash icon)
  - Only enabled if: balance = 0
  - Disabled (gray) if: balance ≠ 0
  - Shows error alert if attempted with non-zero balance
  - Confirmation required
  - On success: Redirects to /members

**Hidden if:** Year is locked

### 5.4 Transaction History (Two-Column Layout)

**Left Column: Package Purchases**
- Header: "Package Purchases" (purple, package icon)
- Shows: All package purchases for member (all years combined)
- Each entry displays:
  - Package type badge: "10 Classes" or "20 Classes"
  - Price at time of purchase
  - Amount paid (if different from price)
  - Purchase date
  - Year indicator
- Sorted: Newest first
- Empty state: "No packages purchased"

**Right Column: Attendance History**
- Header: "Attendance History" (blue, activity icon)
- Shows: Recent attendance records (last 10)
- Each entry displays:
  - Class type badge (beginner/regular)
  - "-1 class" indicator (red)
  - Date
  - Green checkmark icon
- Sorted: Newest first
- If more than 10: Shows "And X more..." message
- Empty state: "No attendance records"

### 5.5 Member Information Grid (Bottom Section)
**6-column grid showing:**

1. **Member ID** - Display member_id number
2. **Member Since** - createdAt date formatted
3. **Total Classes Attended** - Count across all years
4. **Total Money Paid** - Sum across all years (currency)
5. **Status** - Same badge as members list
6. **Total Packages** - Count across all years

---

## 6. Attendance Page (/attendance)

### 6.1 Year Lock Check
**If year is locked (read-only):**
- Shows full-page warning card (red background)
- Icon: Lock
- Message: "Year [YEAR] Locked - Attendance Marking Disabled"
- Explanation: Year can only be edited during specific periods
- Button: "Back to Dashboard"
- All form elements hidden

### 6.2 Class Details Form (if year editable)

**Class Type Selector:**
- Label: "Class Type"
- Type: Dropdown select
- Options:
  - "Regular" (default)
  - "Beginner"

**Date Selector:**
- Label: "Date"
- Type: Date picker (HTML5 input type="date")
- Default: Today's date
- Format: YYYY-MM-DD

### 6.3 Member Selection Section

**Header:** "Select Members (X selected)"
- Shows count of selected members
- Updates in real-time

**Search with Autocomplete:**
- Placeholder: "Search for a member..."
- Icon: Search
- Behavior:
  - As user types, shows dropdown of top 10 matching members
  - Each suggestion shows: Member name + class count
  - Click suggestion: Adds to selected list, clears search
  - Members already selected not shown in suggestions
  - Highlights members in debt with red color and "(DEBT)" indicator

**Member Grid/Cards:**
- Shows: All non-archived members
- Layout: Grid of clickable cards (3-4 per row on desktop)
- Each card displays:
  - Member name
  - Current class count
  - Status indicator:
  - "(DEBT)" in red if balance < 0
  - "(WILL GO INTO DEBT)" in yellow if balance = 0
  - Checkmark icon if selected
- Card states:
  - Selected: Purple border, checkmark visible
  - Unselected: Gray border, no checkmark
  - Hover: Slightly darker background

**Sorting:** By member name alphabetically

### 6.4 Debt Warning System
**Trigger:** When clicking "Mark Attendance" if any selected members have balance = 0

**Warning Dialog:**
- Icon: AlertCircle (red)
- Title: "Members Going Into Debt"
- Message: "The following members will go into debt:"
- List: Shows names of affected members (up to 5, then "and X more...")
- Confirmation: "Are you sure you want to mark attendance for these members?"
- Buttons:
  - "Cancel" (gray) - Cancels operation
  - "Mark Anyway" (red) - Proceeds with attendance

**Behavior:**
- Members already in debt: No warning shown
- Mixed selection (some going into debt, some not): Shows warning for those going into debt
- Can still proceed after warning

### 6.5 Mark Attendance Button
**Label:** "Mark Attendance"
**Color:** Purple
**Icon:** Check
**State:**
- Disabled (gray) if: no members selected
- Enabled (purple) if: at least 1 member selected

**On Click:**
1. Check for debt warnings (show dialog if needed)
2. Create attendance record for each selected member
3. Deduct 1 class from each member's balance
4. Show success alert: "Attendance marked for X members"
5. Redirect to dashboard

---

## 7. Sell Package Page (/package)

### 7.1 Year Lock Check
**If year is locked:**
- Show warning message: "Cannot sell packages for read-only year"
- Disable all form elements
- Show "Back to Dashboard" button

### 7.2 Member Selection (if year editable)

**Dropdown Select:**
- Label: "Select Member"
- Placeholder: "Choose a member..."
- Required field
- Options format: "Member Name - X classes"
  - Appends "(IN DEBT)" in red if balance < 0
- Filters: Excludes archived members
- Sorted: By member name alphabetically

**Current Status Display:**
- Shows when member selected
- Card displays:
  - "Current Classes: X"
  - Background color:
  - Red if negative (debt)
  - Yellow if zero
  - Blue if positive

### 7.3 Package Selection

**Visual Package Buttons (2 options):**

**Option 1: 10-Class Package**
- Large card/button
- Shows:
  - "10 Classes" (large text)
  - Price: "500₪" (or configured price)
  - Price per class: "50₪/class" (calculated)
- State:
  - Selected: Purple background, white text, shadow
  - Unselected: White background, gray border

**Option 2: 20-Class Package**
- Large card/button
- Shows:
  - "20 Classes" (large text)
  - Price: "900₪" (or configured price)
  - Price per class: "45₪/class" (calculated)
- State: Same as 10-class

**Default Selection:** 10-class package pre-selected

### 7.4 Transaction Summary

**Summary Box (purple-tinted background):**
- **Package:** "10 Classes" or "20 Classes"
- **Price:** Amount in ₪
- **Current Classes:** Member's current balance
- **New Total:** Current + class count
  - Formula: `current_balance + class_count`
  - Example: "-5 classes + 10 classes = 5 classes"
  - Color: Green if result positive, Red if still negative

**Layout:** Card with 4 rows, clear labels

### 7.5 Sell Button
**Label:** "Sell Package - [PRICE]₪"
**Color:** Purple
**Icon:** Package
**Size:** Large, prominent
**State:**
- Disabled (gray) if: No member selected
- Enabled (purple) if: Member selected

**On Click:**
1. Validate: Member selected, year editable
2. Create PackagePurchase record:
  - memberId, memberName (snapshot)
  - packageType ('10' or '20')
  - price (current setting price)
  - classCount (10 or 20)
  - amountPaid (= price)
  - purchaseDate (now)
  - yearKey (current year)
3. Success alert: "Package sold successfully! Member now has X classes."
4. Redirect to dashboard

---

## 8. Settings Page (/settings)

### 8.1 Package Pricing Configuration

**Form Section:**
- Header: "Package Pricing" (purple, package icon)

**Input Fields:**

1. **10-Class Package Price**
  - Label: "10-Class Package"
  - Type: Number input
  - Min: 0
  - Step: 1
  - Default: 500
  - Suffix: "₪"
  - Shows: Current price

2. **20-Class Package Price**
  - Label: "20-Class Package"
  - Type: Number input
  - Min: 0
  - Step: 1
  - Default: 900
  - Suffix: "₪"
  - Shows: Current price

**Save Button:**
- Label: "Save Settings"
- Color: Green
- Icon: Check
- Feedback: Shows "Saved!" for 3 seconds after successful save
- Updates settings in database

**Business Rule:** Price changes don't affect existing purchases (historical pricing preserved)

### 8.2 Data Export/Import

**Export Section:**
- Header: "Export Data" (green)
- Button: "Export Data" (green, download icon)
- Description: "Download a complete backup of all your data as JSON"
- On Click:
  1. Fetch all data from database
  2. Convert to JSON format
  3. Create downloadable file: `yfit_fin_backup_YYYY-MM-DD.json`
  4. Trigger browser download
  5. Success message: "Data exported successfully!"

**Import Section:**
- Header: "Import Data" (orange)
- Button: "Import Data" (orange, upload icon)
- Description: "Restore data from a previously exported JSON file"
- Warning: "⚠️ This will replace ALL existing data!"
- On Click:
  1. Open file picker (accepts .json only)
  2. Read file contents
  3. Validate JSON structure
  4. Confirmation dialog: "This will replace all existing data. Continue?"
  5. If confirmed: Replace all database records
  6. Success: "Data imported successfully! Reloading page..."
  7. Page reload to show new data

**Error Handling:**
- Invalid JSON: "Failed to import. Invalid file format."
- Missing required fields: "File is missing required data fields."
- Database error: "Import failed. Please try again."

### 8.3 Delete Year Data (Danger Zone)

**Section Header:** "Danger Zone" (red background)

**Delete Year Button:**
- Label: "Delete Year [CURRENT_YEAR] Data"
- Color: Red
- Icon: Trash2
- Description: "Permanently delete all data for year [YEAR]"
- Warning icon: AlertCircle

**Delete Workflow:**
1. **First Confirmation:**
  - Title: "Delete Year Data?"
  - Message: Lists what will be deleted:
    - "All package purchases ([X] records)"
    - "All attendance records ([Y] records)"
    - "All refund transactions ([Z] records)"
    - "All opening balances"
  - Warning: "This action cannot be undone!"
  - Buttons: "Cancel" / "Continue"

2. **Auto-Export:**
  - Before deletion, automatically creates backup
  - Filename: `yfit_fin_[YEAR]_deleted_[TIMESTAMP].json`
  - Downloads to user's computer
  - Shows: "Backup created: [filename]"

3. **Second Confirmation:**
  - Title: "Final Confirmation"
  - Message: "Are you absolutely sure? This will permanently delete all data for year [YEAR]."
  - Input: "Type 'DELETE' to confirm"
  - Buttons: "Cancel" / "Delete Forever"

4. **Deletion:**
  - Delete all records where year_key = current year
  - Delete opening balances for that year
  - Keep members (they may have data in other years)

5. **Post-Deletion:**
  - Success message: "Year [YEAR] data deleted successfully"
  - Auto-switch to most recent available year
  - If no years remain: Create new year for current calendar year
  - Redirect to dashboard

### 8.4 Additional Information

**App Version:**
- Display: "YFit Fin Version 1.0"
- Location: Footer of settings page

**Data Storage Info:**
- Message: "All data is stored securely in the database"
- Recommendation: "Export your data regularly as backup"

---

## 9. Business Logic & Calculations

### 9.1 Class Balance Calculation
**Formula for any member in a specific year:**

```
Balance = Opening Balance
        + Sum(Package Classes Purchased)
        - Count(Attendance Records)
```

**Components:**
1. **Opening Balance:**
  - Value from opening_balances table for (member_id, year_key)
  - If no record exists: defaults to 0
  - Set during year creation from previous year's closing balance

2. **Package Classes:**
  - Sum of `class_count` from all package_purchases
  - WHERE member_id = X AND year_key = Y

3. **Attendance Deductions:**
  - Count of attendance_records
  - WHERE member_id = X AND year_key = Y
  - Each record deducts 1 class

**Example:**
- Opening: 5 classes
- Purchased: 10-class package (10) + 20-class package (20) = 30
- Attended: 18 classes
- Balance: 5 + 30 - 18 = 17 classes

### 9.2 Debt Calculation
**Trigger:** When class balance < 0

**Price Per Class Determination:**
1. Query member's package purchases (ORDER BY purchase_date DESC)
2. Take most recent purchase
3. Calculate: `price_per_class = purchase.price / purchase.class_count`
4. If no purchase history:
  - Fallback: Use 20-class package setting price ÷ 20
  - Reason: Best rate, fair to member

**Debt Amount:**
```
debt_amount = |negative_balance| × price_per_class
```

**Example:**
- Balance: -5 classes
- Most recent purchase: 20-class package at 900₪
- Price per class: 900 ÷ 20 = 45₪
- Debt amount: 5 × 45 = 225₪

### 9.3 Refund Calculation
**Prerequisites:**
- Member must have positive class balance (> 0)
- Year must be editable

**Process:**
1. Get current class balance
2. Determine price per class (same logic as debt calculation)
3. Calculate: `refund_amount = balance × price_per_class`
4. Create RefundTransaction record
5. Member's balance is NOT directly modified (calculation-based system)

**Example:**
- Balance: 8 classes
- Most recent purchase: 10-class at 500₪
- Price per class: 50₪
- Refund amount: 8 × 50 = 400₪
- After refund: Balance becomes 0 (via opening balance adjustment for next year)

**Note:** The system calculates balance dynamically. To "reset to 0", the refund effectively cancels out the remaining classes in calculations.

### 9.4 Year Creation & Opening Balances
**Trigger:** Start of new calendar year OR manual year creation

**Process:**
1. Identify previous year's closing balances for all members
2. For each member:
```
   closing_balance_YYYY = calculate_balance(member_id, YYYY)
   opening_balance_YYYY+1 = closing_balance_YYYY
```
3. Create opening_balance records:
```sql
   INSERT INTO opening_balances (member_id, year_key, classes)
   SELECT member_id, '[NEW_YEAR]', [calculated_balance]
   FROM members
```
4. Only create records for members with non-zero balances
5. Set new year as current_year

**Example:**
- 2024 closing: Member A has 15 classes
- 2025 opens: Member A opening balance = 15 classes
- 2025 transactions start fresh, building on opening balance

### 9.5 Year Locking & Editability Rules

**Current Year:**
- Always editable
- Can mark attendance, sell packages, create refunds

**Previous Year (Year - 1):**
- Editable ONLY in January (month = 1)
- Locked February through December
- Allows adjustments/corrections from prior year

**Older Years (Year - 2 and earlier):**
- Always locked (read-only)
- View-only access for historical data

**Implementation:**
```python
def is_year_editable(year_key: str) -> bool:
    current_year = datetime.now().year
    current_month = datetime.now().month

    year = int(year_key)

    if year == current_year:
        return True
    elif year == current_year - 1 and current_month == 1:
        return True
    else:
        return False
```

**UI Indicators:**
- Locked years show "Read-Only" badge in yellow
- Forms disabled with warning message
- Action buttons hidden or disabled

### 9.6 Member Deletion Cascade
**Trigger:** Delete member action

**Prerequisites:**
- Member balance must = 0 across ALL years
- If any year has non-zero balance: Show error, prevent deletion

**Cascade Logic:**
```
DELETE FROM members WHERE id = X
→ CASCADE DELETE opening_balances WHERE member_id = X
→ CASCADE DELETE package_purchases WHERE member_id = X
→ CASCADE DELETE attendance_records WHERE member_id = X
→ CASCADE DELETE refund_transactions WHERE member_id = X
```

**Database Constraint:** Foreign keys with `ON DELETE CASCADE`

**Verification Before Delete:**
```sql
SELECT year_key, calculated_balance
FROM (all years)
WHERE member_id = X
HAVING calculated_balance != 0
```

If any results: Block deletion, show error with specific years/amounts

---

## 10. User Workflows

### 10.1 New Member Onboarding
**Steps:**
1. Navigate to Members page
2. Click "Add Member" button
3. Modal opens
4. Enter member name (required)
5. Optionally enter phone and date of birth
6. Click "Add Member"
7. Modal closes, member appears in table with:
  - Status: "No Classes" (yellow badge)
  - Balance: 0 classes
  - Member ID: Auto-assigned next sequential number
8. Can immediately:
  - Click member name to view details
  - Click package icon to sell first package
  - Click attendance to mark attendance (will create debt)

### 10.2 Complete Package Sale Flow
**Steps:**
1. Navigate to "Sell Package" page
2. Select member from dropdown
  - See current balance displayed
  - Note if member in debt (red indicator)
3. Choose package type:
  - Click 10-class card OR 20-class card
  - See transaction summary update
4. Review summary:
  - Current classes: [balance]
  - Adding: [10 or 20] classes
  - New total: [calculated result]
5. Click "Sell Package - [PRICE]₪"
6. Success alert appears
7. Redirected to dashboard
8. Verify in dashboard stats:
  - "Packages Sold" count increased
  - "Money Received" increased by package price

### 10.3 Mark Attendance for Multiple Members
**Steps:**
1. Navigate to Attendance page
2. Select class type: Regular or Beginner
3. Select date (default today)
4. Select members using ONE of:
  - **Search:** Type name, click from autocomplete dropdown
  - **Browse:** Scroll member cards, click to select
  - **Multi-select:** Select multiple members
5. Watch counter: "X selected" updates
6. Review selected list (purple-bordered cards)
7. If any member at 0 balance:
  - Warning dialog appears
  - Lists members going into debt
  - Choice: Cancel or "Mark Anyway"
8. Click "Mark Attendance"
9. Success alert: "Attendance marked for X members"
10. Redirected to dashboard
11. Verify:
  - "Total Attendees" increased by X
  - Each member's balance decreased by 1
  - "Members with Debt" may have increased

### 10.4 Process Member Refund
**Steps:**
1. Navigate to Members page
2. Find member with positive balance
3. Note: Refund button (purple dollar icon) visible
4. Click refund button
5. Confirmation dialog shows:
  - "Refund [MEMBER NAME]?"
  - "Classes: [X]"
  - "Refund Amount: [Y]₪"
  - "This will reset their balance to 0."
6. Click "Confirm"
7. Success alert appears
8. Member's row updates:
  - Balance changes to 0
  - Status changes to "No Classes" (yellow)
  - Refund button disappears
9. Verify in dashboard:
  - "Money Received" decreased by refund amount
  - Member no longer in debt (if was negative)

### 10.5 View Member Transaction History
**Steps:**
1. Navigate to Members page
2. Find member in table
3. Click member name OR click eye icon
4. Member detail page loads
5. View current status cards:
  - Classes Remaining (with debt indicator if applicable)
  - Total Packages & Money Paid
6. Scroll to transaction history columns:
  - **Left:** Package purchases (all years)
    - See: Package type, price, date
    - Review historical pricing
  - **Right:** Attendance records (last 10)
    - See: Class type, date
    - Note: "And X more" if more exist
7. Scroll to member info grid:
  - See: Member since date, total attended, total paid, status
8. Take action (if year editable):
  - "Sell Package" → Quick link to package sale
  - "Mark Attendance" → Quick link to attendance
  - "Delete" → Only if balance = 0

### 10.6 Archive and Restore Member
**Archive Process:**
1. Navigate to Members page
2. Find member in active list
3. Click archive button (orange icon)
4. Confirmation: "Archive [MEMBER NAME]?"
5. Click "Confirm"
6. Member row disappears from active view
7. Toggle "Show Archived" button
8. Member appears in archived list (gray badge)

**Restore Process:**
1. In archived view, find member
2. Click unarchive button (green icon)
3. Confirmation: "Restore [MEMBER NAME]?"
4. Click "Confirm"
5. Member returns to active list
6. All data intact (balance, history unchanged)

### 10.7 Year-End Transition
**Automatic Process (Jan 1):**
1. System detects new calendar year
2. For each active member:
  - Calculate closing balance for previous year
  - Create opening_balance record for new year
3. New year becomes current_year
4. Dashboard updates to show new year by default
5. Previous year becomes editable (until Feb 1)

**Manual Review (During January):**
1. Studio owner reviews previous year data
2. Can switch between years using dropdown
3. Make corrections in previous year if needed
4. Verify opening balances look correct
5. After Jan 31: Previous year locks permanently

**Viewing Historical Data:**
1. Use year selector dropdown
2. Select any year
3. Dashboard shows stats for that year
4. All pages filter by selected year
5. Read-only indicator if year is locked
6. No mutation actions available for locked years

### 10.8 Delete Member (with balance validation)
**Scenario 1: Member has balance ≠ 0**
1. Navigate to member detail page
2. Click "Delete" button
3. Error alert: "Cannot delete [NAME]. Member has [X] classes remaining. Refund first." (if positive)
4. OR: "Cannot delete [NAME]. Member has [X]₪ in debt. Clear debt first." (if negative)
5. Button remains red but disabled
6. Must resolve balance before deletion

**Scenario 2: Member has balance = 0**
1. Delete button enabled (red, active)
2. Click "Delete"
3. First confirmation: "Delete [NAME]? This will permanently remove all their records."
4. Click "Confirm"
5. Second confirmation: "This action cannot be undone. All package, attendance, and refund history will be deleted."
6. Click "Delete Forever"
7. Database cascade delete executes
8. Success message
9. Redirect to Members page
10. Member no longer in list

### 10.9 Export and Import Data
**Export Process:**
1. Navigate to Settings page
2. Scroll to "Data Export/Import" section
3. Click "Export Data" (green button)
4. System generates JSON:
  - All members
  - All years data
  - All transactions
  - Current settings
5. Browser download starts
6. File saved: `yfit_fin_backup_2025-04-09.json`
7. Success message: "Data exported successfully!"
8. Store file securely (cloud backup, external drive)

**Import/Restore Process:**
1. Navigate to Settings page
2. Click "Import Data" (orange button)
3. Warning appears: "⚠️ This will replace ALL existing data!"
4. Click "Continue"
5. File picker opens
6. Select previously exported .json file
7. Confirmation: "Replace all data with backup from [DATE]?"
8. Click "Confirm"
9. System validates JSON structure
10. If valid: Database records replaced
11. Success: "Data imported successfully! Reloading..."
12. Page reloads showing imported data
13. Verify: Check member counts, year data, settings

### 10.10 Delete Year Data (with backup)
**Steps:**
1. Navigate to Settings
2. Scroll to "Danger Zone" (red section)
3. Button shows: "Delete Year [CURRENT_YEAR] Data"
4. Click button
5. **First Warning:**
  - Shows exact counts to be deleted
  - "X package purchases, Y attendance records, Z refunds"
  - "Cannot be undone!"
6. Click "Continue"
7. **Auto-Export:**
  - System creates backup file
  - Downloads: `yfit_fin_2024_deleted_20250409_1523.json`
  - Shows: "Backup created successfully"
8. **Final Confirmation:**
  - Input field: "Type 'DELETE' to confirm"
  - Must type exactly "DELETE"
  - Button enabled only after correct input
9. Click "Delete Forever"
10. Database deletion executes
11. System switches to most recent available year
12. If no years remain: Creates current year with empty data
13. Redirect to dashboard
14. Success: "Year 2024 data deleted. Currently viewing: 2025"

---

## 11. API Endpoints (Backend Specification)

### 11.1 Members

**GET /api/members**
- Returns: List of all members
- Query params:
  - `archived` (boolean, optional): Filter by archive status
  - `year` (string, optional): Include balance for specific year
- Response: `Member[]` with optional `balance` field

**GET /api/members/:id**
- Returns: Single member with full details
- Includes: All purchases, attendance, refunds across all years
- Response: `MemberDetail` object

**POST /api/members**
- Body: `{ name, phone?, dateOfBirth? }`
- Validates: Name not empty
- Creates: New member with auto-increment member_id
- Response: Created `Member` object

**PUT /api/members/:id**
- Body: `{ name?, phone?, dateOfBirth?, isArchived? }`
- Updates: Specified fields only
- Response: Updated `Member` object

**DELETE /api/members/:id**
- Validates: Balance = 0 in all years
- Cascade deletes: All related records
- Response: `{ success: true, message: "Member deleted" }`

### 11.2 Packages

**GET /api/packages**
- Query params:
  - `year` (string, required): Filter by year
  - `memberId` (string, optional): Filter by member
- Returns: List of package purchases
- Response: `PackagePurchase[]`

**POST /api/packages**
- Body: `{ memberId, packageType, price, classCount, amountPaid, paymentMethod?, year }`
- Validates:
  - Year is editable
  - Member exists and not archived
  - Price and classCount > 0
- Creates: PackagePurchase record with current timestamp
- Response: Created `PackagePurchase` object

### 11.3 Attendance

**GET /api/attendance**
- Query params:
  - `year` (string, required): Filter by year
  - `memberId` (string, optional): Filter by member
  - `startDate` (date, optional): Filter from date
  - `endDate` (date, optional): Filter to date
- Returns: List of attendance records
- Response: `AttendanceRecord[]`

**POST /api/attendance**
- Body: `{ memberIds: string[], classType, date, time?, year }`
- Validates:
  - Year is editable
  - All members exist
  - Date not in future
- Creates: One attendance record per member
- Checks: Debt warnings (returns list of members going into debt)
- Response: `{ created: AttendanceRecord[], warnings: string[] }`

### 11.4 Refunds

**POST /api/refunds**
- Body: `{ memberId, year }`
- Validates:
  - Year is editable
  - Member exists
  - Member has positive balance
- Calculates: Refund amount using price-per-class logic
- Creates: RefundTransaction record
- Response: `{ refund: RefundTransaction, classesRefunded, refundAmount }`

### 11.5 Years

**GET /api/years**
- Returns: List of all available years with summary stats
- Response: `Year[]` with fields:
  - `yearKey`
  - `isEditable`
  - `isCurrent`
  - `stats: { packagesSold, totalRevenue, totalAttendees }`

**GET /api/years/:year**
- Returns: Complete year data
- Includes: All purchases, attendance, refunds for year
- Response: `YearData` object

**POST /api/years**
- Body: `{ yearKey }`
- Creates: New year with opening balances from previous year
- Validates: Year doesn't already exist
- Response: Created `Year` object

**DELETE /api/years/:year**
- Validates: Not the only remaining year
- Creates: Auto-export backup file
- Deletes: All records where year_key = :year
- Response: `{ success: true, backup: "filename.json" }`

### 11.6 Settings

**GET /api/settings**
- Returns: Current settings
- Response: `Settings` object

**PUT /api/settings**
- Body: `{ package10Price?, package20Price? }`
- Validates: Prices > 0
- Updates: Settings record
- Response: Updated `Settings` object

### 11.7 Dashboard

**GET /api/dashboard/:year**
- Returns: All dashboard statistics for specified year
- Response: `DashboardStats` object with:
  - `totalMembers`
  - `membersWithDebt`
  - `totalDebtAmount`
  - `packagesSold`
  - `moneyReceived`
  - `totalAttendees`
  - `avgAttendeesPerMonth`
  - `avgMoneyPerMonth`
  - `monthlyAttendees: { month, count }[]`
  - `monthlyEarnings: { month, amount }[]`
  - `recentDebtors: Member[]` (top 5)
  - `recentAttendance: AttendanceRecord[]` (last 5)

### 11.8 Export/Import

**GET /api/export**
- Returns: Complete database export as JSON
- Includes: All members, years, transactions, settings
- Response: `AppData` JSON structure

**POST /api/import**
- Body: Complete `AppData` JSON structure
- Validates: JSON structure matches schema
- Replaces: ALL database records
- Response: `{ success: true, counts: { members, years, transactions } }`

### 11.9 Balance Calculation

**GET /api/members/:id/balance/:year**
- Calculates: Real-time balance for member in specific year
- Formula: Opening + Purchases - Attendance
- Returns: `{ memberId, year, balance, breakdown }`
- `breakdown` includes:
  - `openingBalance`
  - `classesPurchased`
  - `classesAttended`
  - `closingBalance`

---

## 12. Database Schema (PostgreSQL)

### 12.1 Tables

```sql
-- Members
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id SERIAL UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_members_archived ON members(is_archived);
CREATE INDEX idx_members_name ON members(name);

-- Package Purchases
CREATE TABLE package_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(10) NOT NULL CHECK (package_type IN ('10', '20')),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    class_count INTEGER NOT NULL CHECK (class_count > 0),
    amount_paid DECIMAL(10, 2) NOT NULL CHECK (amount_paid >= 0),
    purchase_date TIMESTAMP DEFAULT NOW(),
    payment_method VARCHAR(50),
    year_key VARCHAR(4) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_purchases_member ON package_purchases(member_id);
CREATE INDEX idx_purchases_year ON package_purchases(year_key);
CREATE INDEX idx_purchases_member_year ON package_purchases(member_id, year_key);

-- Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    class_type VARCHAR(20) NOT NULL CHECK (class_type IN ('beginner', 'regular')),
    date DATE NOT NULL,
    time VARCHAR(5),
    day_of_week VARCHAR(20),
    year_key VARCHAR(4) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_member ON attendance_records(member_id);
CREATE INDEX idx_attendance_year ON attendance_records(year_key);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_member_year ON attendance_records(member_id, year_key);

-- Refund Transactions
CREATE TABLE refund_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member_name VARCHAR(255) NOT NULL,
    classes_refunded INTEGER NOT NULL CHECK (classes_refunded > 0),
    refund_amount DECIMAL(10, 2) NOT NULL CHECK (refund_amount >= 0),
    refund_date TIMESTAMP DEFAULT NOW(),
    year_key VARCHAR(4) NOT NULL
);

CREATE INDEX idx_refunds_member ON refund_transactions(member_id);
CREATE INDEX idx_refunds_year ON refund_transactions(year_key);
CREATE INDEX idx_refunds_member_year ON refund_transactions(member_id, year_key);

-- Opening Balances
CREATE TABLE opening_balances (
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    year_key VARCHAR(4) NOT NULL,
    classes INTEGER NOT NULL,
    PRIMARY KEY (member_id, year_key)
);

CREATE INDEX idx_opening_year ON opening_balances(year_key);

-- Settings
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Initialize default settings
INSERT INTO settings (key, value) VALUES
('pricing', '{"package_10_price": 500, "package_20_price": 900}');
```

### 12.2 Views (for convenience)

```sql
-- Member balances for current year
CREATE VIEW member_balances AS
SELECT
    m.id,
    m.member_id,
    m.name,
    m.phone,
    m.date_of_birth,
    m.is_archived,
    m.created_at,
    EXTRACT(YEAR FROM CURRENT_DATE)::TEXT as year_key,
    COALESCE(ob.classes, 0) as opening_balance,
    COALESCE(SUM(pp.class_count), 0) as classes_purchased,
    COALESCE(COUNT(ar.id), 0) as classes_attended,
    (COALESCE(ob.classes, 0) + COALESCE(SUM(pp.class_count), 0) - COALESCE(COUNT(ar.id), 0)) as current_balance
FROM members m
LEFT JOIN opening_balances ob ON m.id = ob.member_id
    AND ob.year_key = EXTRACT(YEAR FROM CURRENT_DATE)::TEXT
LEFT JOIN package_purchases pp ON m.id = pp.member_id
    AND pp.year_key = EXTRACT(YEAR FROM CURRENT_DATE)::TEXT
LEFT JOIN attendance_records ar ON m.id = ar.member_id
    AND ar.year_key = EXTRACT(YEAR FROM CURRENT_DATE)::TEXT
GROUP BY m.id, m.member_id, m.name, m.phone, m.date_of_birth,
         m.is_archived, m.created_at, ob.classes;
```

---

## 13. Technical Requirements

### 13.0 Deployment Modes

**Two deployment modes are supported:**

#### Production Mode (Database)
- Uses PostgreSQL for persistence
- Deployed on Railway hosting
- Multi-device access
- Automatic backups
- ACID transactions
- Recommended for production use

#### Development/Localhost Mode (File Storage)
- Uses JSON file storage for persistence
- Runs entirely on localhost
- Single-user access
- Manual backups via export
- File locking for consistency
- Ideal for development, testing, or offline use

**Mode Selection:**
- Controlled via environment variable: `STORAGE_MODE=database` or `STORAGE_MODE=file`
- Backend adapts storage layer based on mode
- Frontend unchanged (same API interface)
- Easy migration: Export from file mode → Import to database mode

---

### 13.1 Backend (Python)

**Framework Options:**
- **FastAPI** (Recommended) - Modern, async, auto-docs
- **Flask** - Lightweight, simple

**Required Libraries:**
```
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary (PostgreSQL driver - production only)
pydantic (data validation)
python-dateutil
pytest (testing)
alembic (migrations - production only)
aiofiles (file I/O - localhost mode)
filelock (file locking - localhost mode)
```

**Architecture:**
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app entry
│   ├── config.py         # Environment config (storage mode)
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── base.py       # Abstract storage interface
│   │   ├── database.py   # PostgreSQL implementation
│   │   └── filestore.py  # JSON file implementation
│   ├── models.py         # SQLAlchemy models (database mode)
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Storage operations (mode-agnostic)
│   ├── api/
│   │   ├── members.py
│   │   ├── packages.py
│   │   ├── attendance.py
│   │   ├── refunds.py
│   │   ├── years.py
│   │   ├── settings.py
│   │   └── dashboard.py
│   └── utils.py          # Helper functions
├── data/                 # JSON files (localhost mode only)
│   ├── members.json
│   ├── packages.json
│   ├── attendance.json
│   ├── refunds.json
│   ├── opening_balances.json
│   └── settings.json
├── tests/
├── alembic/              # Migrations (database mode)
├── requirements.txt
├── requirements-dev.txt  # Localhost mode dependencies
└── .env
```

**Key Features:**
- RESTful API endpoints
- CORS enabled for React frontend
- JWT authentication (optional for future)
- Input validation with Pydantic
- Storage abstraction layer (database OR file)
- Automatic API documentation (Swagger/OpenAPI)
- Error handling middleware
- Logging

**Storage Mode Configuration:**
```python
# config.py
import os
from enum import Enum

class StorageMode(str, Enum):
    DATABASE = "database"
    FILE = "file"

STORAGE_MODE = os.getenv("STORAGE_MODE", "database")
DATABASE_URL = os.getenv("DATABASE_URL", None)
FILE_STORAGE_PATH = os.getenv("FILE_STORAGE_PATH", "./data")
```

### 13.2 Frontend (React + TypeScript)

**Required Libraries:**
```
react
react-dom
react-router-dom
typescript
axios (HTTP client)
recharts (for charts)
lucide-react (icons)
tailwindcss (styling)
date-fns (date formatting)
react-hook-form (form handling)
```

**Architecture:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── MemberCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── AttendanceCard.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Members.tsx
│   │   ├── MemberDetail.tsx
│   │   ├── Attendance.tsx
│   │   ├── Package.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   └── api.ts         # Axios API client
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── hooks/
│   │   ├── useMembers.ts
│   │   ├── useYears.ts
│   │   └── ...
│   ├── utils/
│   │   └── calculations.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── routes.tsx
├── public/
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

**Key Features:**
- TypeScript for type safety
- React Router for navigation
- Custom hooks for data fetching
- Tailwind CSS for responsive design
- Recharts for data visualization
- Form validation
- Loading states
- Error boundaries
- Optimistic UI updates

### 13.3 Storage Layer Abstraction

**Storage Interface (storage/base.py):**
```python
from abc import ABC, abstractmethod
from typing import List, Optional, Dict

class StorageAdapter(ABC):
    """Abstract interface for storage operations"""

    @abstractmethod
    async def get_members(self, archived: Optional[bool] = None) -> List[Dict]:
        pass

    @abstractmethod
    async def get_member(self, member_id: str) -> Optional[Dict]:
        pass

    @abstractmethod
    async def create_member(self, data: Dict) -> Dict:
        pass

    @abstractmethod
    async def update_member(self, member_id: str, data: Dict) -> Dict:
        pass

    @abstractmethod
    async def delete_member(self, member_id: str) -> bool:
        pass

    # Similar methods for packages, attendance, refunds, etc.
```

#### File Storage Implementation (storage/filestore.py)

**Features:**
- JSON files for each entity type
- File locking for concurrent access prevention
- Atomic writes (write to temp file, then rename)
- Auto-backup before destructive operations
- Transaction-like semantics via file locks

**File Structure:**
```
data/
├── members.json          # Array of member objects
├── packages.json         # Array of package purchase objects
├── attendance.json       # Array of attendance records
├── refunds.json          # Array of refund transactions
├── opening_balances.json # Array of opening balance records
├── settings.json         # Single settings object
└── .locks/               # Lock files for concurrent access
    ├── members.lock
    ├── packages.lock
    └── ...
```

**Implementation Example:**
```python
import json
import os
from filelock import FileLock
import uuid
from datetime import datetime

class FileStorageAdapter(StorageAdapter):
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = data_dir
        self.locks_dir = os.path.join(data_dir, ".locks")
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(self.locks_dir, exist_ok=True)

    def _get_lock(self, entity: str) -> FileLock:
        lock_path = os.path.join(self.locks_dir, f"{entity}.lock")
        return FileLock(lock_path, timeout=10)

    def _read_file(self, filename: str) -> List[Dict]:
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return []
        with open(filepath, 'r') as f:
            return json.load(f)

    def _write_file(self, filename: str, data: List[Dict]):
        filepath = os.path.join(self.data_dir, filename)
        temp_path = filepath + '.tmp'
        with open(temp_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        os.replace(temp_path, filepath)  # Atomic rename

    async def create_member(self, data: Dict) -> Dict:
        with self._get_lock('members'):
            members = self._read_file('members.json')
            max_id = max([m['member_id'] for m in members], default=0)
            new_member = {
                'id': str(uuid.uuid4()),
                'member_id': max_id + 1,
                'created_at': datetime.now().isoformat(),
                **data
            }
            members.append(new_member)
            self._write_file('members.json', members)
            return new_member

    async def delete_member(self, member_id: str) -> bool:
        # Cascade delete - lock all files
        locks = [
            self._get_lock('members'),
            self._get_lock('packages'),
            self._get_lock('attendance'),
            self._get_lock('refunds'),
            self._get_lock('opening_balances')
        ]

        for lock in locks:
            lock.acquire()

        try:
            # Delete from all files
            members = self._read_file('members.json')
            packages = self._read_file('packages.json')
            attendance = self._read_file('attendance.json')
            refunds = self._read_file('refunds.json')
            balances = self._read_file('opening_balances.json')

            members = [m for m in members if m['id'] != member_id]
            packages = [p for p in packages if p['member_id'] != member_id]
            attendance = [a for a in attendance if a['member_id'] != member_id]
            refunds = [r for r in refunds if r['member_id'] != member_id]
            balances = [b for b in balances if b['member_id'] != member_id]

            self._write_file('members.json', members)
            self._write_file('packages.json', packages)
            self._write_file('attendance.json', attendance)
            self._write_file('refunds.json', refunds)
            self._write_file('opening_balances.json', balances)

            return True
        finally:
            for lock in locks:
                lock.release()
```

**Benefits:**
- No database setup required
- Works entirely offline
- Easy to version control (git-friendly JSON)
- Simple backup (copy data folder)
- Fast for small datasets (< 1000 members)

**Limitations:**
- Not suitable for concurrent multi-user access
- No built-in query optimization
- Manual file locking required
- Slower for large datasets

---

#### Database Storage Implementation (storage/database.py)

**Uses SQLAlchemy ORM with PostgreSQL**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models

class DatabaseStorageAdapter(StorageAdapter):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_member(self, data: Dict) -> Dict:
        member = models.Member(**data)
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member.__dict__

    async def delete_member(self, member_id: str) -> bool:
        member = await self.session.get(models.Member, member_id)
        if member:
            await self.session.delete(member)  # CASCADE DELETE automatic
            await self.session.commit()
            return True
        return False
```

**Benefits:**
- ACID transactions
- Foreign key constraints with CASCADE DELETE
- Connection pooling
- Automatic migrations via Alembic
- Full-text search capabilities
- Optimal for production use

---

### 13.4 Database (PostgreSQL) - Production Mode Only

**Version:** PostgreSQL 14+

**Connection:**
- Railway provides PostgreSQL addon
- Connection string in environment variable

**Migrations:**
- Alembic for Python backend
- Version-controlled schema changes

**Backup Strategy:**
- Railway automatic backups
- Manual export via API endpoint
- JSON exports stored securely

---

### 13.5 Deployment Options

#### Option A: Localhost (Development/Offline Use)

**Setup:**
```bash
# 1. Clone repository
git clone <repo-url>
cd yfit-fin

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt

# 3. Configure file storage mode
echo "STORAGE_MODE=file" > .env
echo "FILE_STORAGE_PATH=./data" >> .env
echo "CORS_ORIGINS=http://localhost:3000" >> .env

# 4. Start backend
uvicorn app.main:app --reload --port 8000

# 5. Frontend setup (new terminal)
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Data Location:**
- All data stored in: `backend/data/*.json`
- Backup: Copy entire `data/` folder

**Benefits:**
- No internet required
- No database setup
- Easy to run on any machine
- Perfect for development and testing

---

#### Option B: Railway (Production Hosting)

**Services:**
1. **Backend Service:**
  - Python FastAPI application
  - Auto-deploy from Git repo
  - Environment variables for config
  - Public URL endpoint

2. **Frontend Service:**
  - React SPA (build output)
  - Served via static hosting or Node server
  - Environment variable for API URL

3. **PostgreSQL Database:**
  - Railway PostgreSQL addon
  - Connection string auto-provided
  - Automatic backups

**Environment Variables:**
```
# Backend (Production)
STORAGE_MODE=database
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-frontend-url.railway.app

# Frontend
VITE_API_URL=https://your-backend.railway.app
```

**Deployment Steps:**
1. Create Railway account
2. New project → Deploy from GitHub
3. Add PostgreSQL database addon
4. Configure environment variables (set STORAGE_MODE=database)
5. Deploy backend service
6. Deploy frontend service
7. Link frontend to backend API URL
8. Test endpoints
9. Run database migrations

---

### 13.6 Migration Between Storage Modes

**File Storage → Database:**
1. Export data from file mode: `GET /api/export`
2. Switch to database mode: `STORAGE_MODE=database`
3. Run database migrations: `alembic upgrade head`
4. Import data: `POST /api/import` with exported JSON

**Database → File Storage:**
1. Export data: `GET /api/export`
2. Switch to file mode: `STORAGE_MODE=file`
3. Import data: `POST /api/import` with exported JSON
4. Files created in `data/` directory

**Note:** Both storage modes use identical API interfaces, so frontend requires no changes.

---

## 14. Non-Functional Requirements

### 14.0 Storage Mode Comparison

| Feature | File Storage (Localhost) | Database (Production) |
| --- | --- | --- |
| **Setup Complexity** | Low (no database) | Medium (PostgreSQL + migrations) |
| **Data Persistence** | JSON files | PostgreSQL tables |
| **Concurrent Access** | Single-user only | Multi-user capable |
| **Transaction Safety** | File locking | ACID transactions |
| **Backup Strategy** | Copy data folder | Railway auto-backup + export |
| **Query Performance** | Fast (< 100 members) | Optimized with indexes |
| **Cascade Delete** | Manual (all files) | Automatic (foreign keys) |
| **Offline Capability** | ✅ Works offline | ❌ Requires internet |
| **Version Control** | ✅ Git-friendly JSON | ❌ Database dumps |
| **Cost** | Free | ~$15-30/month |
| **Ideal For** | Development, testing, offline | Production, multi-device |
| **Max Recommended Scale** | 500 members | 10,000+ members |

---

### 14.1 Performance
- Dashboard load: < 2 seconds (both modes)
- API response time: < 500ms for simple queries
- Pagination for large datasets (> 100 members)
- Database mode: Indexes on frequently queried fields
- File mode: In-memory filtering for small datasets
- Efficient queries (avoid N+1 problems)

### 14.2 Security
- Input validation on all endpoints
- SQL injection prevention (parameterized queries in database mode)
- Path traversal prevention (file mode)
- CORS configured for frontend domain only
- HTTPS enforced in production (Railway)
- File permissions restricted (file mode: data folder access control)
- Rate limiting on API endpoints (optional)

### 14.3 Scalability
- Database mode: Connection pooling, read replicas
- File mode: Single process, file locking
- Async operations for I/O-bound tasks
- Horizontal scaling: Database mode only (stateless backend)
- CDN for static assets (frontend)

### 14.4 Reliability
- Error handling with meaningful messages
- Transactions: Database mode (ACID), File mode (file locks + atomic writes)
- Rollback on failure
- Comprehensive logging
- Health check endpoints
- Automated backups: Database (Railway), File mode (manual copy)

### 14.5 Usability
- Responsive design (mobile + desktop)
- Loading indicators for async operations
- Clear error messages
- Confirmation dialogs for destructive actions
- Keyboard navigation support
- Accessible UI (WCAG 2.1 AA target)

### 14.6 Maintainability
- Clean code architecture
- Storage abstraction layer (swap modes easily)
- Type safety (TypeScript + Pydantic)
- Comprehensive comments
- API documentation (auto-generated)
- Unit tests for business logic
- Integration tests for API endpoints
- Version control (Git)

---

## 15. Testing Requirements

### 15.1 Backend Testing

**Unit Tests:**
- Business logic functions (balance calculations)
- Date/year validation logic
- Price per class calculations
- Refund amount calculations

**Integration Tests:**
- API endpoint responses
- Database operations (CRUD)
- Cascade delete behavior
- Transaction rollbacks

**Example Tests:**
```python
def test_calculate_member_balance():
    # Given: Member with opening balance, purchases, attendance
    # When: Calculate balance
    # Then: Should return correct total

def test_refund_calculation():
    # Given: Member with 10 classes, last package 500₪ for 10 classes
    # When: Calculate refund
    # Then: Should return 500₪

def test_year_editable():
    # Given: Current year, previous year (January), old year
    # When: Check editability
    # Then: Current=True, Previous=True (Jan only), Old=False

def test_delete_member_with_balance():
    # Given: Member with non-zero balance
    # When: Attempt delete
    # Then: Should raise validation error
```

### 15.2 Frontend Testing

**Component Tests:**
- Render tests for each page
- Form validation
- Button click handlers
- Conditional rendering

**Integration Tests:**
- Navigation flow
- API call mocking
- State management
- User workflows

**E2E Tests (Optional):**
- Playwright or Cypress
- Full user workflows
- Multi-page flows

---

## 16. Future Enhancements (Out of Scope for V1)

1. **Authentication & Multi-User:**
  - User roles: Owner, Instructor, Front Desk
  - Login/logout
  - Permission-based access control

2. **Payment Integration:**
  - Credit card processing
  - Payment receipts
  - Invoice generation

3. **Notifications:**
  - SMS reminders for classes
  - Email receipts
  - Low balance alerts

4. **Scheduling:**
  - Class schedule management
  - Member booking system
  - Capacity limits per class
  - Waitlist management

5. **Mobile App:**
  - React Native app
  - Member self-service
  - QR code check-in

6. **Advanced Analytics:**
  - Revenue projections
  - Member retention rates
  - Custom date range reports
  - Export to Excel/PDF

7. **Inventory & Equipment:**
  - Track studio equipment
  - Maintenance schedules
  - Supply ordering

8. **Member Portal:**
  - Self-service account
  - View attendance history
  - Purchase packages online
  - Update profile information

9. **Automated Billing:**
  - Recurring monthly charges
  - Auto-debit for memberships
  - Subscription management

10. **Integration:**
  - Accounting software (QuickBooks)
  - Marketing tools (Mailchimp)
  - Calendar sync (Google Calendar)

---

## 17. Glossary

- **Member:** Individual enrolled in the fitness studio
- **Package:** Pre-purchased set of class credits (10 or 20 classes)
- **Class Balance:** Number of remaining classes for a member
- **Debt:** Negative class balance (member attended more classes than purchased)
- **Attendance:** Record of member attending a class
- **Refund:** Return of money for unused classes
- **Opening Balance:** Classes carried over from previous year
- **Year Key:** String identifier for a year (e.g., "2024")
- **Archived:** Inactive member (hidden from active lists but data retained)
- **Price Per Class:** Unit price used for debt/refund calculations
- **Year Lock:** Restriction preventing edits to historical year data
- **Cascade Delete:** Automatic deletion of related records when parent deleted

---

## 18. Success Metrics

**Application is considered successful if:**
- ✅ All member operations work reliably (add, delete, archive)
- ✅ Package sales accurately update balances
- ✅ Attendance marking correctly deducts classes
- ✅ Debt calculations are accurate to the ₪
- ✅ Year transitions preserve balances correctly
- ✅ No data loss during operations
- ✅ Dashboard loads in < 2 seconds
- ✅ API responses in < 500ms
- ✅ Mobile-responsive on all pages
- ✅ Data export/import works flawlessly
- ✅ Studio owner can manage 100+ members efficiently

---

## 19. Revision History

- **v1.1** - Added dual storage mode support (April 9, 2026)
  - File storage mode for localhost/development/offline use
  - Database mode for production Railway deployment
  - Storage abstraction layer with unified API
  - Migration path between storage modes
  - Complete setup instructions for both modes

- **v1.0** - Initial specification (April 9, 2026)
  - Complete functional requirements
  - API specification
  - Database schema
  - Rebuild architecture for Python/React/PostgreSQL/Railway

---

**End of Specification**

This document provides complete functional requirements for rebuilding YFit Fin from scratch. All business logic, workflows, calculations, and technical architecture are defined.

**Dual Storage Support:**
- **Localhost Mode:** JSON file storage, no database required, perfect for development and offline use
- **Production Mode:** PostgreSQL with ACID transactions, deployed on Railway
- Both modes use identical API interfaces and frontend code
