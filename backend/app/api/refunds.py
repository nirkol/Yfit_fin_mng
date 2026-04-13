from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.refund import RefundTransaction, RefundTransactionCreate
from app.services.calculation_service import is_year_editable
from app.api.deps import get_storage, get_current_user

router = APIRouter(prefix="/api/years", tags=["refunds"])


@router.post("/{year_key}/refunds", response_model=RefundTransaction, status_code=status.HTTP_201_CREATED)
async def create_refund(
    year_key: str,
    refund: RefundTransactionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a refund transaction"""
    storage = get_storage()

    # Check if year exists
    year_data = storage.get_year_data(year_key)
    if not year_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Year not found")

    # Check if year is editable
    if not is_year_editable(year_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add refunds to a year that is not editable"
        )

    # Check if member exists
    member = storage.get_member(refund.memberId)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    # Add member name to refund
    refund_data = refund.model_dump()
    refund_data["memberName"] = member["name"]

    # Create refund
    new_refund = storage.add_refund(year_key, refund_data)

    return new_refund
