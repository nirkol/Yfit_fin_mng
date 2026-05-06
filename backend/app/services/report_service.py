import os
from datetime import datetime
from typing import List, Dict
from pathlib import Path


class ReportService:
    def __init__(self, reports_dir: str = "reports"):
        self.reports_dir = Path(reports_dir)
        self.reports_dir.mkdir(exist_ok=True)

    def get_year_folder(self, year: str) -> Path:
        """Get or create year folder"""
        year_folder = self.reports_dir / year
        year_folder.mkdir(exist_ok=True)
        return year_folder

    def save_report(self, year: str, report_type: str, content: str, date: str = None) -> str:
        """Save a report to the filesystem"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")

        year_folder = self.get_year_folder(year)
        filename = f"yfit_{report_type}_report_{date}.md"
        filepath = year_folder / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        return str(filepath)

    def get_reports_list(self, year: str = None) -> List[Dict]:
        """Get list of all reports, optionally filtered by year"""
        reports = []

        if year:
            # Get reports for specific year
            year_folder = self.reports_dir / year
            if year_folder.exists():
                for filepath in sorted(year_folder.glob("*.md"), reverse=True):
                    reports.append(self._get_report_info(filepath, year))
        else:
            # Get all reports from all years
            for year_folder in sorted(self.reports_dir.iterdir(), reverse=True):
                if year_folder.is_dir():
                    year_name = year_folder.name
                    for filepath in sorted(year_folder.glob("*.md"), reverse=True):
                        reports.append(self._get_report_info(filepath, year_name))

        return reports

    def _get_report_info(self, filepath: Path, year: str) -> Dict:
        """Extract report information from filepath"""
        filename = filepath.name
        file_size = filepath.stat().st_size
        created_time = datetime.fromtimestamp(filepath.stat().st_ctime)

        # Determine report type
        if "monthly" in filename:
            report_type = "חודשי"
        elif "ytd" in filename:
            report_type = "מצטבר"
        else:
            report_type = "אחר"

        return {
            "filename": filename,
            "year": year,
            "reportType": report_type,
            "size": file_size,
            "createdAt": created_time.isoformat(),
            "path": str(filepath)
        }

    def get_report_content(self, year: str, filename: str) -> str:
        """Get report content"""
        filepath = self.reports_dir / year / filename
        if not filepath.exists():
            raise FileNotFoundError(f"Report not found: {filename}")

        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

    def delete_report(self, year: str, filename: str) -> bool:
        """Delete a report"""
        filepath = self.reports_dir / year / filename
        if filepath.exists():
            filepath.unlink()
            return True
        return False
