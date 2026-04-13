from fastapi import APIRouter, HTTPException, Depends, status
from datetime import timedelta
from app.schemas.auth import LoginRequest, LoginResponse, UpdateCredentialsRequest
from app.services.auth_service import AuthService
from app.utils.auth import create_access_token
from app.config import settings
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login endpoint"""
    storage = get_storage()
    auth_service = AuthService(storage)

    if not auth_service.authenticate(request.username, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": request.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return LoginResponse(
        success=True,
        token=access_token,
        expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    )


@router.post("/update-credentials")
async def update_credentials(
    request: UpdateCredentialsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user credentials"""
    storage = get_storage()
    auth_service = AuthService(storage)

    if not auth_service.update_credentials(
        request.currentPassword,
        request.newUsername,
        request.newPassword
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    return {"success": True, "message": "Credentials updated successfully"}
