from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import Response
from typing import List, Optional
from pydantic import BaseModel
from app.services.report_service import ReportService
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


class ReportInfo(BaseModel):
    filename: str
    year: str
    reportType: str
    size: int
    createdAt: str
    path: str


class SaveReportRequest(BaseModel):
    year: str
    reportType: str
    content: str
    date: Optional[str] = None


report_service = ReportService()


@router.get("", response_model=List[ReportInfo])
async def get_reports(
    year: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get list of all reports"""
    return report_service.get_reports_list(year)


@router.get("/{year}/{filename}")
async def get_report(
    year: str,
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Download a specific report"""
    try:
        content = report_service.get_report_content(year, filename)
        return Response(
            content=content,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")


@router.post("", status_code=status.HTTP_201_CREATED)
async def save_report(
    request: SaveReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """Save a report"""
    filepath = report_service.save_report(
        request.year,
        request.reportType,
        request.content,
        request.date
    )
    return {"message": "Report saved successfully", "path": filepath}


@router.delete("/{year}/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    year: str,
    filename: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a report"""
    success = report_service.delete_report(year, filename)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return None
