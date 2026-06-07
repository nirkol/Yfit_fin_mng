from pydantic import BaseModel
from typing import Optional


class TrainerBase(BaseModel):
    name: str
    phone: Optional[str] = ""
    dateOfBirth: Optional[str] = ""


class TrainerCreate(TrainerBase):
    username: str
    password: str
    role: Optional[str] = "trainer"


class TrainerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dateOfBirth: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    isActive: Optional[bool] = None
    role: Optional[str] = None


class Trainer(TrainerBase):
    id: str
    username: str
    role: str
    isActive: bool
    createdAt: str


class TrainerStats(BaseModel):
    totalClasses: int
    totalParticipants: int
    monthlyStats: list


class UpdateTrainerCredentials(BaseModel):
    username: str
    password: str
