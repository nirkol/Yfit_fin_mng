from pydantic import BaseModel, Field
from typing import Optional, Literal


PackageType = Literal["package1", "package2", "package3", "package4", "adhoc"]


class PackagePurchaseBase(BaseModel):
    memberId: str
    packageType: PackageType
    price: float = Field(..., gt=0)
    classCount: int = Field(..., gt=0)
    amountPaid: float = Field(..., ge=0)
    purchaseDate: str  # ISO date string
    paymentMethod: Optional[str] = None


class PackagePurchaseCreate(PackagePurchaseBase):
    pass


class PackagePurchase(PackagePurchaseBase):
    id: str
    memberName: str
    yearKey: str

    class Config:
        from_attributes = True
