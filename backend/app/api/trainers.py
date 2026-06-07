from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.trainer import (
    Trainer, TrainerCreate, TrainerUpdate, TrainerStats, UpdateTrainerCredentials
)
from app.services.trainer_service import TrainerService
from app.api.deps import get_storage, get_current_user, require_admin

router = APIRouter(prefix="/api/trainers", tags=["trainers"])


@router.get("", response_model=List[Trainer])
async def get_trainers(
    active_only: bool = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all trainers (requires authentication)"""
    storage = get_storage()
    trainer_service = TrainerService(storage)
    trainers = trainer_service.get_all_trainers(active_only=active_only)
    return trainers


@router.get("/{trainer_id}", response_model=Trainer)
async def get_trainer(
    trainer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get trainer by ID (requires authentication)"""
    storage = get_storage()
    trainer_service = TrainerService(storage)
    trainer = trainer_service.get_trainer(trainer_id)

    if not trainer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainer not found"
        )

    return trainer


@router.post("", response_model=Trainer, status_code=status.HTTP_201_CREATED)
async def create_trainer(
    trainer_data: TrainerCreate,
    current_user: dict = Depends(require_admin)
):
    """Create a new trainer (admin only)"""
    storage = get_storage()
    trainer_service = TrainerService(storage)

    try:
        trainer = trainer_service.create_trainer(trainer_data.dict())
        return trainer
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{trainer_id}", response_model=Trainer)
async def update_trainer(
    trainer_id: str,
    trainer_data: TrainerUpdate,
    current_user: dict = Depends(require_admin)
):
    """Update trainer (admin only)"""
    storage = get_storage()
    trainer_service = TrainerService(storage)

    try:
        # Only update fields that are provided
        update_data = {k: v for k, v in trainer_data.dict().items() if v is not None}
        trainer = trainer_service.update_trainer(trainer_id, update_data)

        if not trainer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trainer not found"
            )

        return trainer
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{trainer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trainer(
    trainer_id: str,
    current_user: dict = Depends(require_admin)
):
    """Delete trainer (admin only)"""
    storage = get_storage()
    trainer_service = TrainerService(storage)

    try:
        success = trainer_service.delete_trainer(trainer_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trainer not found"
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{trainer_id}/credentials")
async def update_trainer_credentials(
    trainer_id: str,
    credentials: UpdateTrainerCredentials,
    current_user: dict = Depends(require_admin)
):
    """Update trainer credentials (admin only)"""
    storage = get_storage()
    trainer_service = TrainerService(storage)

    try:
        success = trainer_service.update_credentials(
            trainer_id,
            credentials.username,
            credentials.password
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trainer not found"
            )

        return {"success": True, "message": "Credentials updated successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{trainer_id}/stats/{year_key}", response_model=TrainerStats)
async def get_trainer_stats(
    trainer_id: str,
    year_key: str,
    current_user: dict = Depends(get_current_user)
):
    """Get trainer statistics for a year"""
    storage = get_storage()
    trainer_service = TrainerService(storage)

    stats = trainer_service.get_trainer_stats(trainer_id, year_key)
    return stats
