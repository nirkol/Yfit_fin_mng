from pydantic import BaseModel, Field
from typing import Optional


class PackageConfig(BaseModel):
    name: str
    classCount: int = Field(..., gt=0)
    price: float = Field(..., gt=0)


class Settings(BaseModel):
    package1: PackageConfig
    package2: PackageConfig
    package3: PackageConfig
    package4: PackageConfig
    yearlyTaxCap: Optional[float] = None
    updatedAt: Optional[str] = None


class SettingsUpdate(BaseModel):
    package1: Optional[PackageConfig] = None
    package2: Optional[PackageConfig] = None
    package3: Optional[PackageConfig] = None
    package4: Optional[PackageConfig] = None
    yearlyTaxCap: Optional[float] = None
