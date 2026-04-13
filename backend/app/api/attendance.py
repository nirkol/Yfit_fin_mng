from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.attendance import AttendanceRecord, AttendanceBulkCreate
from app.services.calculation_service import is_year_editable
from app.utils.hebrew import get_hebrew_day_of_week
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/years", tags=["attendance"])


@router.post("/{year_key}/attendance", response_model=List[AttendanceRecord], status_code=status.HTTP_201_CREATED)
async def create_attendance(
    year_key: str,
    attendance: AttendanceBulkCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create attendance records for multiple members"""
    storage = get_storage()

    # Check if year exists
    year_data = storage.get_year_data(year_key)
    if not year_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Year not found")

    # Check if year is editable
    if not is_year_editable(year_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add attendance to a year that is not editable"
        )

    # Remove any existing attendance for this class (date+time)
    storage.remove_attendance_for_class(year_key, attendance.date, attendance.time)

    # Get Hebrew day of week
    day_of_week = get_hebrew_day_of_week(attendance.date)

    # Create records for each member
    records = []
    for member_id in attendance.memberIds:
        # Check if member exists
        member = storage.get_member(member_id)
        if not member:
            continue  # Skip invalid members

        records.append({
            "memberId": member_id,
            "memberName": member["name"],
            "date": attendance.date,
            "time": attendance.time,
            "dayOfWeek": day_of_week,
            "classType": attendance.classType
        })

    if not records:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid members provided")

    # Add attendance records
    new_records = storage.add_attendance(year_key, records)

    return new_records
