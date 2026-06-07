from fastapi import APIRouter, HTTPException, Depends, status, Request
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.schemas.auth import LoginRequest, LoginResponse, UpdateCredentialsRequest
from app.services.auth_service import AuthService
from app.utils.auth import create_access_token
from app.config import settings
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")  # Max 5 login attempts per minute per IP
async def login(login_request: LoginRequest, request: Request):
    """Login endpoint with rate limiting"""
    storage = get_storage()
    auth_service = AuthService(storage)

    trainer = auth_service.authenticate(login_request.username, login_request.password)
    if not trainer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create access token with role and trainer info
    access_token = create_access_token(
        data={
            "sub": login_request.username,
            "role": trainer["role"],
            "trainerId": trainer["id"],
            "name": trainer["name"]
        },
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

    # If user is admin and current password is empty, skip password verification
    if current_user.get("role") == "admin" and not request.currentPassword:
        # Admin can update credentials without providing current password
        from app.utils.auth import hash_password
        new_hash = hash_password(request.newPassword)
        if not storage.update_credentials(request.newUsername, new_hash):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update credentials"
            )
    else:
        # Regular flow: verify current password
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
