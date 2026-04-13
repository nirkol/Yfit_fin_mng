from fastapi import Header, HTTPException, status
from typing import Optional
from app.utils.auth import verify_token
from app.config import settings
from app.storage.file_adapter import FileStorageAdapter

# Initialize storage adapter (singleton)
_storage = None


def get_storage():
    """Get storage adapter instance"""
    global _storage
    if _storage is None:
        if settings.STORAGE_MODE == "file":
            _storage = FileStorageAdapter(settings.FILE_STORAGE_PATH)
        else:
            raise ValueError(f"Unknown storage mode: {settings.STORAGE_MODE}")
    return _storage


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency to get current authenticated user"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload
