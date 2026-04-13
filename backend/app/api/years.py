from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.year import Year, YearCreate, YearData, SetOpeningBalanceRequest
from app.schemas.member import MemberWithBalance
from app.services.year_service import YearService
from app.services.member_service import MemberService
from app.services.calculation_service import is_year_editable
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/years", tags=["years"])


@router.get("", response_model=List[Year])
async def get_years(current_user: dict = Depends(get_current_user)):
    """Get all years"""
    storage = get_storage()
    year_service = YearService(storage)
    return year_service.get_years_list()


@router.get("/{year_key}", response_model=YearData)
async def get_year_data(
    year_key: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all data for a specific year"""
    storage = get_storage()
    year_data = storage.get_year_data(year_key)
    if not year_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Year not found")
    return year_data


@router.post("", response_model=YearData, status_code=status.HTTP_201_CREATED)
async def create_year(
    year: YearCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new year"""
    storage = get_storage()
    year_service = YearService(storage)

    try:
        # If opening balances are provided, use them directly
        if year.openingBalances:
            new_year = storage.create_year(year.yearKey, [ob.model_dump() for ob in year.openingBalances])
        else:
            # Otherwise, create from previous year
            new_year = year_service.create_year_from_previous(year.yearKey)
        return new_year
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{year_key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_year(
    year_key: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a year"""
    storage = get_storage()

    # Check if year is editable
    if not is_year_editable(year_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a year that is not editable"
        )

    success = storage.delete_year(year_key)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Year not found")

    return None


@router.get("/{year_key}/balances", response_model=List[MemberWithBalance])
async def get_year_balances(
    year_key: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all member balances for a specific year"""
    storage = get_storage()

    # Check if year exists
    year_data = storage.get_year_data(year_key)
    if not year_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Year not found")

    # Get member service
    member_service = MemberService(storage, lambda: storage.get_settings())

    # Get all members with balances
    members_with_balance = member_service.get_all_members_with_balance(year_key, include_archived=False)

    return members_with_balance


@router.post("/{year_key}/opening-balance")
async def set_opening_balance(
    year_key: str,
    request: SetOpeningBalanceRequest,
    current_user: dict = Depends(get_current_user)
):
    """Set opening balance for a member in a year"""
    storage = get_storage()

    # Check if year exists
    year_data = storage.get_year_data(year_key)
    if not year_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Year not found")

    # Check if year is editable
    if not is_year_editable(year_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a year that is not editable"
        )

    # Check if member exists
    member = storage.get_member(request.memberId)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    success = storage.set_opening_balance(year_key, request.memberId, request.classes)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update opening balance")

    return {"success": True, "message": "Opening balance updated"}
