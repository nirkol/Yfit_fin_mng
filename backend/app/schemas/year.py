from pydantic import BaseModel
from typing import List, Optional


class OpeningBalance(BaseModel):
    memberId: str
    memberName: Optional[str] = None
    classes: int


class YearBase(BaseModel):
    yearKey: str


class YearCreate(BaseModel):
    yearKey: str
    openingBalances: List[OpeningBalance] = []


class Year(YearBase):
    isCurrent: bool
    isEditable: bool
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


class YearData(BaseModel):
    yearKey: str
    openingBalances: List[OpeningBalance]
    packages: List[dict]
    attendance: List[dict]
    refunds: List[dict]


class SetOpeningBalanceRequest(BaseModel):
    memberId: str
    classes: int
