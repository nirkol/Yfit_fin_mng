from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.package import PackagePurchase, PackagePurchaseCreate
from app.services.calculation_service import is_year_editable
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/years", tags=["packages"])


@router.post("/{year_key}/packages", response_model=PackagePurchase, status_code=status.HTTP_201_CREATED)
async def create_package_purchase(
    year_key: str,
    purchase: PackagePurchaseCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a package purchase"""
    storage = get_storage()

    # Check if year exists
    year_data = storage.get_year_data(year_key)
    if not year_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Year not found")

    # Check if year is editable
    if not is_year_editable(year_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add purchases to a year that is not editable"
        )

    # Check if member exists
    member = storage.get_member(purchase.memberId)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    # Add member name to purchase
    purchase_data = purchase.model_dump()
    purchase_data["memberName"] = member["name"]

    # Create purchase
    new_purchase = storage.add_package_purchase(year_key, purchase_data)

    return new_purchase
