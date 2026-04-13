# Testing Guide - Complete Workflow

Follow this guide to test all features of the YFit Fin Management application.

## Prerequisites

1. **Backend running** on http://localhost:8000
2. **Frontend running** on http://localhost:5173
3. **Year 2026 created** (already done)
4. **Test member created** (already done)

## Test Scenario: Complete Member Journey

### Step 1: Login
```
1. Go to http://localhost:5173
2. Enter username: admin
3. Enter password: admin123
4. Click "התחברות" (Login)
5. ✅ You should see the Finance Dashboard
```

### Step 2: View Members
```
1. Click "חברים" (Members) button
2. ✅ You should see "דני כהן" in the list
3. ✅ Balance should be 0 (green)
4. Click on "דני כהן"
5. ✅ You should see member detail page
6. ✅ All sections should show "empty" state
7. Click back arrow
```

### Step 3: Sell a Package
```
1. From Finance dashboard, click "מכירת כרטיסייה" (Package Sales)
2. Select member: "דני כהן"
3. Click on "כרטיסיה 20" package (₪900, 20 classes)
4. Keep payment method as "מזומן" (Cash)
5. Keep amount paid as ₪900
6. Click "מכור כרטיסייה" (Sell Package)
7. ✅ You should see success message
8. ✅ Form should reset

Expected result: דני כהן now has 20 classes in balance
```

### Step 4: Verify Purchase
```
1. Go to "חברים" (Members)
2. ✅ דני's balance should show 20 (green)
3. Click on דני
4. ✅ Should show balance: 20
5. ✅ Should show 1 package purchase in the table
6. ✅ Package details should show correctly
```

### Step 5: Mark Attendance
```
1. Go back to Finance
2. Click "נוכחות" (Attendance)
3. Keep today's date
4. Keep time 18:00
5. Click on "דני כהן" to select
6. ✅ Checkbox should be checked
7. ✅ Counter should show "1"
8. ✅ Balance shows 20 (green)
9. Click "רשום נוכחות" (Mark Attendance)
10. ✅ Success message appears

Expected result: Attendance recorded, balance decreases by 1
```

### Step 6: Verify Attendance
```
1. Go to Members > דני כהן
2. ✅ Balance should now be 19
3. ✅ Should show 1 attendance record
4. ✅ Attendance should show today's date and time
```

### Step 7: Mark Multiple Attendance
```
1. Go to Attendance page
2. Change time to 19:00
3. Select דני again
4. Mark attendance
5. Go back to member detail
6. ✅ Balance should be 18
7. ✅ Should show 2 attendance records
```

### Step 8: Create More Members
```
Using API (or create UI later):

curl -X POST http://localhost:8000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "שרה לוי",
    "phone": "0507654321",
    "isArchived": false
  }'

Repeat for:
- מיכל אברהם (0523456789)
- יוסי דוד (0541234567)
- רחל כהן (0509876543)
```

### Step 9: Sell Multiple Packages
```
1. Sell כרטיסיה 10 (₪500) to שרה לוי
2. Sell נוער 20 (₪700) to מיכל אברהם
3. Sell כרטיסיה 20 (₪900) to יוסי דוד
4. Go to Finance Dashboard
5. ✅ Total Revenue should show ₪3,100
6. ✅ Packages Sold should show 4
```

### Step 10: Mark Attendance for Multiple Members
```
1. Go to Attendance
2. Select today, 20:00
3. Select: דני, שרה, מיכל
4. Click Mark Attendance
5. ✅ Success message for 3 members
6. Go to Finance Dashboard
7. ✅ Total Attendees should increase
```

### Step 11: Test Debt Scenario
```
1. Go to Attendance
2. Select member דני (balance: 17)
3. Mark attendance 17 times (change time each time)
4. On 18th attempt:
   ✅ Should show "חוב!" (Debt!) warning in red
   ✅ Alert should warn about debt
5. Continue anyway
6. Go to member detail
7. ✅ Balance should show negative number in red
8. ✅ Finance dashboard should show members with debt
```

### Step 12: Test Dashboard
```
1. Go to Finance Dashboard
2. Verify all stats are calculating correctly:
   ✅ Total Revenue (sum of all packages)
   ✅ Net Revenue (revenue - refunds)
   ✅ Packages Sold (count)
   ✅ Active Members (non-archived)
   ✅ Total Classes (unique date+time)
   ✅ Total Attendees (count)
   ✅ Top Attendees list
```

### Step 13: Test Search and Filter
```
Members Page:
1. Type "דני" in search
2. ✅ Only דני should show
3. Clear search
4. ✅ All members show
5. Check "הצג ארכיון" (Show Archive)
6. ✅ Archived members appear (if any)
```

### Step 14: Test Archive
```
1. Go to שרה's member detail
2. Click "העבר לארכיון" (Archive)
3. ✅ Confirm dialog appears
4. Confirm
5. Go to Members list
6. ✅ שרה should not appear
7. Check "הצג ארכיון"
8. ✅ שרה appears with gray status
```

### Step 15: Test Custom Package
```
1. Go to Package Sales
2. Select מיכל
3. Click "אחר" (Other)
4. Enter 5 classes, ₪200
5. Change payment to "Paybox"
6. Sell package
7. ✅ Success
8. Go to מיכל's detail
9. ✅ Should show 2 packages
10. ✅ Balance should increase by 5
```

## API Testing

### Get Dashboard Stats
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')

curl -s http://localhost:8000/api/dashboard/2026 \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

### Export All Data
```bash
curl -s -X POST http://localhost:8000/api/settings/export \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool > backup.json
```

## Expected Results Summary

After completing all steps:

### Members
- 5 members created
- 1 archived
- Various balance states (positive, zero, negative)

### Transactions
- 5 packages sold
- ~25 attendance records
- 0 refunds (not implemented in UI yet)

### Dashboard
- Total Revenue: ~₪3,100
- Packages Sold: 5
- Total Attendees: ~25
- Members with Debt: 1 (דני)

### Data Files
Check `backend/data/`:
- `members.json` - 5 members
- `years/2026.json` - All transactions
- `settings.json` - Package configs
- `auth.json` - Credentials

## Troubleshooting

### Login doesn't work
- Check backend is running: http://localhost:8000/health
- Check console for errors
- Try hard refresh: Cmd+Shift+R

### White screen
- Check console errors
- Check server logs
- Try restarting frontend

### 404 errors
- Make sure year 2026 exists
- Create year using API if needed

### No data showing
- Check you're on year 2026
- Check backend data files exist

## Next: Build Settings Page!

After testing, the last major feature to build is the Settings page for:
- Editing package prices
- Changing admin password
- Configuring tax cap
- Exporting/importing data

---

Happy Testing! 🎉
