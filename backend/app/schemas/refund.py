from pydantic import BaseModel, Field


class RefundTransactionBase(BaseModel):
    memberId: str
    classesRefunded: int = Field(..., gt=0)
    refundAmount: float = Field(..., gt=0)
    refundDate: str  # ISO date string


class RefundTransactionCreate(RefundTransactionBase):
    pass


class RefundTransaction(RefundTransactionBase):
    id: str
    memberName: str
    yearKey: str

    class Config:
        from_attributes = True
