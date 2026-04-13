from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.settings import Settings, SettingsUpdate
from app.api.deps import get_storage, get_current_user
import json
from datetime import datetime

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=Settings)
async def get_settings(current_user: dict = Depends(get_current_user)):
    """Get application settings"""
    storage = get_storage()
    settings = storage.get_settings()
    return settings


@router.put("", response_model=Settings)
async def update_settings(
    settings: SettingsUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update application settings"""
    storage = get_storage()

    # Only include fields that were provided
    update_data = settings.model_dump(exclude_unset=True)

    updated_settings = storage.update_settings(update_data)
    return updated_settings


@router.post("/export")
async def export_data(current_user: dict = Depends(get_current_user)):
    """Export all data as JSON"""
    storage = get_storage()

    # Collect all data
    export_data = {
        "exportDate": datetime.now().isoformat(),
        "members": storage.get_members(),
        "settings": storage.get_settings(),
        "years": {}
    }

    # Export all years
    for year in storage.get_years():
        year_key = year["yearKey"]
        year_data = storage.get_year_data(year_key)
        if year_data:
            export_data["years"][year_key] = year_data

    return export_data


@router.post("/import")
async def import_data(
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Import data from JSON (WARNING: overwrites existing data)"""
    storage = get_storage()

    try:
        # Import members
        if "members" in data:
            storage._write_json(storage.members_file, data["members"])

        # Import settings
        if "settings" in data:
            storage._write_json(storage.settings_file, data["settings"])

        # Import years
        if "years" in data:
            for year_key, year_data in data["years"].items():
                year_file = storage._get_year_file(year_key)
                storage._write_json(year_file, year_data)

        return {"success": True, "message": "Data imported successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import data: {str(e)}"
        )
