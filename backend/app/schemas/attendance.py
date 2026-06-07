from pydantic import BaseModel
from typing import Optional, List


class AttendanceRecordBase(BaseModel):
    memberId: str
    date: str  # ISO date string
    time: str  # HH:MM format
    classType: Optional[str] = "regular"
    isNoShow: Optional[bool] = False


class AttendanceRecordCreate(AttendanceRecordBase):
    pass


class AttendanceBulkCreate(BaseModel):
    date: str
    time: str
    memberIds: List[str]
    classType: Optional[str] = "regular"
    trainerId: str
    trainerName: str
    noShowMemberIds: Optional[List[str]] = []
    originalDate: Optional[str] = None  # For editing: the original date to remove
    originalTime: Optional[str] = None  # For editing: the original time to remove


class AttendanceRecord(AttendanceRecordBase):
    id: str
    memberName: str
    dayOfWeek: Optional[str] = None
    yearKey: str
    trainerId: Optional[str] = None
    trainerName: Optional[str] = None
    isNoShow: Optional[bool] = False

    class Config:
        from_attributes = True
