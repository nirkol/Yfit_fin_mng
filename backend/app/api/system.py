from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/system", tags=["system"])


class AdminAuthRequest(BaseModel):
    username: str
    password: str


class AdminAuthResponse(BaseModel):
    success: bool
    message: str


class UpdateAdminCredsRequest(BaseModel):
    username: str
    password: str


@router.post("/admin-auth", response_model=AdminAuthResponse)
async def authenticate_admin(
    request: AdminAuthRequest,
    current_user: dict = Depends(get_current_user)
):
    """Authenticate admin for accessing advanced settings (requires system login first)"""
    storage = get_storage()
    admin_creds = storage.get_admin_credentials()

    if request.username == admin_creds["username"] and request.password == admin_creds["password"]:
        return AdminAuthResponse(success=True, message="Authentication successful")
    else:
        return AdminAuthResponse(success=False, message="Invalid credentials")


@router.post("/admin-credentials")
async def update_admin_credentials(
    request: UpdateAdminCredsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update admin credentials (requires system login)"""
    storage = get_storage()

    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    success = storage.update_admin_credentials(request.username, request.password)

    if success:
        return {"success": True, "message": "Admin credentials updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update admin credentials")


@router.post("/reset-all-data")
async def reset_all_data(current_user: dict = Depends(get_current_user)):
    """
    Reset all system data - delete all members, years, packages, attendance, refunds.
    This is a destructive operation that cannot be undone.
    """
    storage = get_storage()

    try:
        # Reset members
        storage.data['members'] = []
        storage.data['member_counter'] = 0

        # Reset years
        storage.data['years'] = {}

        # Save the reset data
        storage._save_members()
        storage._save_years()

        return {
            "success": True,
            "message": "All data has been reset successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset data: {str(e)}"
        )
