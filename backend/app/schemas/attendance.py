from pydantic import BaseModel
from typing import Optional, List


class AttendanceRecordBase(BaseModel):
    memberId: str
    date: str  # ISO date string
    time: str  # HH:MM format
    classType: Optional[str] = "regular"


class AttendanceRecordCreate(AttendanceRecordBase):
    pass


class AttendanceBulkCreate(BaseModel):
    date: str
    time: str
    memberIds: List[str]
    classType: Optional[str] = "regular"


class AttendanceRecord(AttendanceRecordBase):
    id: str
    memberName: str
    dayOfWeek: Optional[str] = None
    yearKey: str

    class Config:
        from_attributes = True
