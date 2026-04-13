from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from app.schemas.member import Member, MemberCreate, MemberUpdate, MemberWithBalance
from app.services.member_service import MemberService
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/members", tags=["members"])


@router.get("", response_model=List[Member])
async def get_members(
    archived: Optional[bool] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all members"""
    storage = get_storage()
    members = storage.get_members(archived=archived) if archived is not None else storage.get_members()
    return members


@router.get("/{member_id}", response_model=Member)
async def get_member(
    member_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific member"""
    storage = get_storage()
    member = storage.get_member(member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return member


@router.post("", response_model=Member, status_code=status.HTTP_201_CREATED)
async def create_member(
    member: MemberCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new member"""
    storage = get_storage()
    new_member = storage.create_member(member.model_dump())
    return new_member


@router.put("/{member_id}", response_model=Member)
async def update_member(
    member_id: str,
    member: MemberUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a member"""
    storage = get_storage()

    # Only include fields that were provided
    update_data = member.model_dump(exclude_unset=True)

    updated_member = storage.update_member(member_id, update_data)
    if not updated_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    return updated_member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a member (only if balance is zero)"""
    storage = get_storage()

    # Check if member exists
    member = storage.get_member(member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    # Check if member has any transactions in any year
    years = storage.get_years()
    for year in years:
        year_data = storage.get_year_data(year["yearKey"])
        if year_data:
            # Check for any transactions
            has_transactions = any([
                any(p["memberId"] == member_id for p in year_data.get("packages", [])),
                any(a["memberId"] == member_id for a in year_data.get("attendance", [])),
                any(r["memberId"] == member_id for r in year_data.get("refunds", [])),
                any(ob["memberId"] == member_id for ob in year_data.get("openingBalances", []))
            ])
            if has_transactions:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete member with existing transactions. Archive instead."
                )

    success = storage.delete_member(member_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    return None
