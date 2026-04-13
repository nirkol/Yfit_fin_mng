from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    success: bool
    token: str
    expiresIn: int


class UpdateCredentialsRequest(BaseModel):
    currentPassword: str
    newUsername: str
    newPassword: str
