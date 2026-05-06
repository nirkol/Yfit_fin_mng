# Reports System

## Overview
The YFit system includes an automatic report generation and storage system that maintains monthly and year-to-date (YTD) reports.

## Directory Structure
```
backend/
├── reports/
│   ├── 2024/
│   │   ├── yfit_monthly_report_2024-01-31.md
│   │   ├── yfit_ytd_report_2024-01-31.md
│   │   └── ...
│   ├── 2025/
│   └── 2026/
└── scripts/
    └── generate_monthly_reports.py
```

## Features

### 1. Manual Report Generation
Users can generate reports from the Settings page:
- **Monthly Report**: Shows all activity for the current month
- **YTD Report**: Shows all activity from January 1st to today

When generating a report:
- Preview the report before downloading
- **"הורד בלבד"** (Download Only): Downloads without saving
- **"הורד ושמור"** (Download & Save): Downloads and saves to the reports folder

### 2. Saved Reports Access
Click **"דוחות שמורים"** (Saved Reports) to:
- View all saved reports organized by year
- Download any previously saved report
- Delete old reports

### 3. Automatic Report Generation
Reports can be automatically generated at the end of each month using the provided script.

## Setting Up Automatic Reports

### Option 1: Cron Job (Linux/Mac)

Edit your crontab:
```bash
crontab -e
```

Add this line to run at 10:00 PM on the last day of each month:
```bash
0 22 28-31 * * [ $(date -d tomorrow +\%d) -eq 1 ] && cd /path/to/backend && /path/to/backend/venv/bin/python scripts/generate_monthly_reports.py >> /var/log/yfit_reports.log 2>&1
```

**Explanation:**
- `0 22` = 10:00 PM (22:00 in 24-hour format)
- `28-31` = Days 28-31 of the month
- The condition `[ $(date -d tomorrow +\%d) -eq 1 ]` ensures it only runs on the actual last day

### Option 2: Task Scheduler (Windows)

1. Open Task Scheduler
2. Create a new task
3. Set trigger: "Monthly" on the last day at 10:00 PM (22:00)
4. Set action: Run `python.exe` with argument: `C:\path\to\backend\scripts\generate_monthly_reports.py`
5. Set start in: `C:\path\to\backend`

### Option 3: Manual Execution

Run the script manually:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python scripts/generate_monthly_reports.py
```

## Report Contents

### Monthly Report Includes:
- Financial statistics for the month
- Packages sold
- Refunds issued
- Attendance statistics
- Class history with participant lists
- Member balance comparison (beginning vs. end of month)

### YTD Report Includes:
- Financial statistics from January 1st to today
- All packages sold YTD
- Attendance statistics YTD
- Complete member table with current balances
- Package sales history

## API Endpoints

```
GET    /api/reports              - Get list of all reports
GET    /api/reports?year=2024    - Get reports for specific year
GET    /api/reports/{year}/{filename}  - Download a specific report
POST   /api/reports              - Save a new report
DELETE /api/reports/{year}/{filename}  - Delete a report
```

## Notes

- Reports are stored in Markdown (.md) format
- Each report includes the generation date
- Reports are organized by year in subfolders
- The system automatically creates year folders as needed
- Old reports can be manually deleted from the Settings page

## Backup

Reports are stored in the `backend/reports/` directory. Include this directory in your regular backup routine to preserve historical reports.
