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

    # Validate trainer exists
    trainer = storage.get_trainer(attendance.trainerId)
    if not trainer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid trainer ID"
        )

    # Authorization check for editing existing classes
    existing_class = None
    if year_data.get("attendance"):
        # Check both original (if editing) and new date/time
        check_date = attendance.originalDate if attendance.originalDate else attendance.date
        check_time = attendance.originalTime if attendance.originalTime else attendance.time

        existing_class = next((a for a in year_data["attendance"]
                              if a.get("date") == check_date and a.get("time") == check_time), None)

    # If editing an existing class, check permissions
    if existing_class:
        user_role = current_user.get("role")
        user_trainer_id = current_user.get("trainerId")
        class_trainer_id = existing_class.get("trainerId")

        # Trainers can only edit their own classes
        if user_role == "trainer" and class_trainer_id != user_trainer_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit classes assigned to you"
            )

    # Remove the original class if date/time was changed (or the same class if just editing members)
    remove_date = attendance.originalDate if attendance.originalDate else attendance.date
    remove_time = attendance.originalTime if attendance.originalTime else attendance.time
    storage.remove_attendance_for_class(year_key, remove_date, remove_time)

    # Get Hebrew day of week
    day_of_week = get_hebrew_day_of_week(attendance.date)

    # Create records for each member
    records = []
    no_show_set = set(attendance.noShowMemberIds or [])

    for member_id in attendance.memberIds:
        # Check if member exists
        member = storage.get_member(member_id)
        if not member:
            continue  # Skip invalid members

        is_no_show = member_id in no_show_set

        records.append({
            "memberId": member_id,
            "memberName": member["name"],
            "date": attendance.date,
            "time": attendance.time,
            "dayOfWeek": day_of_week,
            "classType": attendance.classType,
            "trainerId": attendance.trainerId,
            "trainerName": attendance.trainerName,
            "isNoShow": is_no_show
        })

    if not records:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid members provided")

    # Add attendance records
    new_records = storage.add_attendance(year_key, records)

    return new_records
