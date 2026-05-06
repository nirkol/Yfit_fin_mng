#!/usr/bin/env python3
"""
Automatic Report Generator
Run this script at the end of each month to automatically generate reports.
Can be scheduled using cron or task scheduler.

Example cron entry (runs at 10:00 PM on last day of month):
0 22 28-31 * * [ $(date -d tomorrow +\%d) -eq 1 ] && /path/to/generate_monthly_reports.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.storage.file_adapter import FileStorageAdapter
from app.services.report_service import ReportService
from app.config import settings as app_settings


def is_last_day_of_month():
    """Check if today is the last day of the month"""
    today = datetime.now()
    tomorrow = today + timedelta(days=1)
    return tomorrow.day == 1


def generate_monthly_report(storage, year_key: str, report_service: ReportService):
    """Generate monthly report markdown content"""
    print(f"Generating monthly report for {year_key}...")
    # This would call the same logic as the frontend
    # For now, just create a placeholder
    content = f"# Monthly Report - {year_key}\n\nAutomatically generated on {datetime.now().isoformat()}\n"
    report_service.save_report(year_key, "monthly", content)
    print(f"Monthly report saved for {year_key}")


def generate_ytd_report(storage, year_key: str, report_service: ReportService):
    """Generate YTD report markdown content"""
    print(f"Generating YTD report for {year_key}...")
    # This would call the same logic as the frontend
    # For now, just create a placeholder
    content = f"# YTD Report - {year_key}\n\nAutomatically generated on {datetime.now().isoformat()}\n"
    report_service.save_report(year_key, "ytd", content)
    print(f"YTD report saved for {year_key}")


def main():
    """Main function"""
    if not is_last_day_of_month():
        print("Not the last day of the month. Exiting.")
        return

    print("Last day of month detected. Generating reports...")

    # Initialize services
    storage = FileStorageAdapter()
    report_service = ReportService()

    # Get current year
    current_year = str(datetime.now().year)

    try:
        # Generate both reports
        generate_monthly_report(storage, current_year, report_service)
        generate_ytd_report(storage, current_year, report_service)
        print("Reports generated successfully!")
    except Exception as e:
        print(f"Error generating reports: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
