from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MemberBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    dateOfBirth: Optional[str] = None
    isArchived: bool = False


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    dateOfBirth: Optional[str] = None
    isArchived: Optional[bool] = None


class Member(MemberBase):
    id: str
    memberId: int
    createdAt: str

    class Config:
        from_attributes = True


class MemberWithBalance(Member):
    classesRemaining: int
    debtAmount: float
    status: str
    totalAttended: Optional[int] = 0
    totalPaid: Optional[float] = 0
