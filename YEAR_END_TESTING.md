# Year-End Testing Guide

This guide explains how to test the automatic year-end transition feature in YFit Finance Management System.

## Overview

The system automatically handles year transitions by:
- Creating a new year when the calendar year changes
- Transferring member balances from the previous year as opening balances
- Preserving member information (name, phone, date of birth)
- Starting with fresh transaction data (packages, attendance, refunds)
- Enforcing read-only rules for old years (editable only in January for previous year)

## Test Mode Setup

### 1. Enable Test Mode

Edit `/frontend/src/utils/testMode.ts`:

```typescript
export const TEST_MODE_JAN_2027 = true; // Enable test mode
```

This simulates **January 2, 2027** throughout the entire application.

### 2. Create Test Year (2027)

Run the following command from the project root:

```bash
cd backend && source venv/bin/activate && python3 -c "
import sys
sys.path.insert(0, '.')
from app.storage.file_adapter import FileStorageAdapter
from app.services.year_service import YearService

storage = FileStorageAdapter('./data')
year_service = YearService(storage)

# Create 2027 from 2026's ending balances
try:
    new_year = year_service.create_year_from_previous('2027')
    print('✅ Year 2027 created successfully!')
    print(f'Opening balances transferred: {len(new_year[\"openingBalances\"])} members')

    # Show some details
    for ob in new_year['openingBalances'][:5]:
        member = storage.get_member(ob['memberId'])
        print(f'  - {member[\"name\"]}: {ob[\"classes\"]} classes')
except Exception as e:
    print(f'❌ Error: {e}')
"
```

### 3. Reload Frontend

Restart the frontend development server or refresh your browser to apply the test mode changes.

## What to Test

### Year Selection & Default
- [ ] App defaults to **2027** when opened
- [ ] Year selector shows 2027, 2026, and any other years in database
- [ ] Switching between years works correctly

### Data Verification (2027)
- [ ] Navigate to **Members page** - verify all members are present
- [ ] Check member balances match their ending balance from 2026
- [ ] Navigate to **Finance Dashboard** - verify all stats show zero (fresh start)
- [ ] Navigate to **Attendance Dashboard** - verify all stats show zero
- [ ] Navigate to **Class History** - verify no classes exist yet, defaults to **January 2027**

### Editability Testing

#### Year 2027 (Current Year in Test Mode)
- [ ] Navigate to **מכירת כרטיסייה** (Package Sales)
  - Default date should be **2027-01-02**
  - Form should be fully enabled (no warning banner)
  - Try selling a package - should work
- [ ] Navigate to **רישום נוכחות** (Attendance)
  - Default date should be **2027-01-02**
  - Form should be fully enabled
  - Try recording attendance - should work

#### Year 2026 (Previous Year - Editable in January)
- [ ] Switch to **2026** in year selector
- [ ] Navigate to **מכירת כרטיסייה**
  - Should be fully enabled (no warning banner)
  - Can modify 2026 data in January grace period
- [ ] Navigate to **רישום נוכחות**
  - Should be fully enabled
  - Can record attendance for 2026

#### Year 2025 (Old Year - Read-Only)
- [ ] Create 2025 year if needed for testing
- [ ] Switch to **2025** in year selector
- [ ] Navigate to **מכירת כרטיסייה**
  - ⚠️ Orange warning banner should appear: "שנה זו במצב קריאה בלבד"
  - Message: "ניתן לערוך רק את השנה הנוכחית או את השנה הקודמת בחודש ינואר"
  - Submit button should be disabled
- [ ] Navigate to **רישום נוכחות**
  - Same warning banner should appear
  - Submit button should be disabled
- [ ] Can view data but cannot modify

### Date Defaults
- [ ] **Package Sales** - purchase date defaults to January 2, 2027
- [ ] **Attendance** - date defaults to January 2, 2027
- [ ] **Class History** - month view defaults to January 2027

### Balance Transfer Verification
- [ ] For each member, verify their 2027 opening balance = 2026 ending balance
  - Opening balance = Previous opening + Packages purchased - Classes attended - Refunded classes
- [ ] Members with zero balance in 2026 should not appear in 2027 opening balances
- [ ] Negative balances (debt) should transfer correctly

## Clean Up After Testing

### 1. Disable Test Mode

Edit `/frontend/src/utils/testMode.ts`:

```typescript
export const TEST_MODE_JAN_2027 = false; // Disable test mode
```

### 2. Delete Test Year (Optional)

If you want to remove the 2027 test data:

```bash
rm -f data/years/2027.json data/years/2027.json.lock
```

Or keep it for future reference.

### 3. Reload Frontend

Restart the frontend or refresh browser to return to real current date.

## Expected Behavior in Production

### December 31 → January 1 Transition

When the real calendar year changes (e.g., Dec 31, 2026 → Jan 1, 2027):

1. **Automatic Year Creation**
   - When user first accesses the app in 2027
   - `YearService.ensure_current_year_exists()` runs automatically
   - Creates 2027 with opening balances from 2026

2. **User Experience**
   - App automatically selects 2027 as the default year
   - All member balances transferred seamlessly
   - Users can continue working in 2027 immediately
   - Can still edit 2026 data during January 2027

3. **February 1, 2027**
   - Year 2026 becomes permanently read-only
   - Only 2027 remains editable

## Troubleshooting

### Issue: Year 2027 not appearing in selector
**Solution:** Check that `data/years/2027.json` exists. Run the creation script again.

### Issue: Opening balances don't match
**Solution:** Verify calculation:
```bash
cd backend && source venv/bin/activate && python3 -c "
from app.storage.file_adapter import FileStorageAdapter
from app.services.calculation_service import calculate_member_balance

storage = FileStorageAdapter('./data')
member_id = 'member_001'  # Replace with actual member ID

balance_2026 = calculate_member_balance(member_id, '2026', storage)
print(f'2026 ending balance: {balance_2026}')

year_2027 = storage.get_year_data('2027')
opening = next((ob['classes'] for ob in year_2027['openingBalances'] if ob['memberId'] == member_id), 0)
print(f'2027 opening balance: {opening}')
"
```

### Issue: Test mode not working
**Solution:**
1. Verify `TEST_MODE_JAN_2027 = true` in `/frontend/src/utils/testMode.ts`
2. Clear browser cache
3. Restart frontend dev server
4. Check browser console for errors

### Issue: Can't edit old years even in test mode
**Solution:** This is expected behavior. Only current year and previous year (in January) are editable.

## Related Files

- `/frontend/src/utils/testMode.ts` - Test mode configuration
- `/frontend/src/hooks/useYearEditable.ts` - Year editability logic
- `/backend/app/services/year_service.py` - Year creation and auto-creation
- `/backend/app/services/calculation_service.py` - Editability rules and balance calculation

## Support

For issues or questions, please refer to the main README.md or contact the development team.
