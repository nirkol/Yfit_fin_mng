# Data Migration Guide for Render Deployment

## Overview

Your current data structure:
```
backend/data/
├── admin_auth.json (54B)
├── auth.json (110B)
├── members.json (1.1KB)
├── settings.json (443B)
├── trainers.json (642B)
└── years/
    └── 2026.json (9.2KB)
```

**Total size:** ~12KB (well within 1GB limit)

---

## Migration Options

### Option 1: Start Fresh (Recommended for Testing)

Deploy without migrating data, then create initial data through the UI.

**Pros:**
- Clean start
- Verifies all features work
- No file transfer needed

**Cons:**
- Need to re-enter data
- Loses historical data

**Steps:**
1. Deploy backend and frontend
2. Log in with admin credentials
3. Create initial settings
4. Add members, trainers, packages
5. Start tracking attendance

---

### Option 2: Migrate Existing Data (Recommended for Production)

Transfer your local data to Render after deployment.

**Method A: Via Render Shell (Easiest)**

1. Deploy backend and frontend (they will create empty data files)
2. Go to your backend service in Render Dashboard
3. Click "Shell" tab
4. In the shell, navigate to data directory:
   ```bash
   cd /opt/render/project/src/backend/data
   ls -la
   ```
5. Use Render's file upload feature to upload each file:
   - `admin_auth.json`
   - `auth.json`
   - `members.json`
   - `settings.json`
   - `trainers.json`
6. Create years directory if needed:
   ```bash
   mkdir -p years
   ```
7. Upload `2026.json` to `years/` directory
8. Verify files:
   ```bash
   ls -la
   ls -la years/
   ```
9. Restart the service (in Render dashboard)

**Method B: Via API (More Technical)**

1. Create a migration script locally
2. Use the FastAPI endpoints to POST data
3. Verify through the frontend

---

### Option 3: Git-Based Migration (Not Recommended)

**Why not recommended:**
- Data files should not be in git (security risk)
- Contains user credentials and sensitive info
- Better to use persistent disk only

If you absolutely must:
1. Remove `.gitignore` entries for data files (NOT RECOMMENDED)
2. Commit data files
3. Push to GitHub
4. Render will deploy with data
5. **Immediately** change all passwords and credentials

**Security Risk:** Your GitHub repo becomes public record of all data

---

## Recommended Approach: Fresh Start + Manual Entry

Since your data is minimal, I recommend:

### Initial Setup After Deployment

1. **Deploy both services** (backend + frontend)

2. **Access frontend** → Login with admin credentials

3. **Configure Settings:**
   - Set up business name: "YFit"
   - Configure packages and prices
   - Set attendance rules

4. **Add Trainers:**
   ```
   - Copy from your current trainers.json
   - Add through UI
   ```

5. **Add Members:**
   ```
   - Copy from your current members.json
   - Add through UI
   - Or import via API if you have many
   ```

6. **Verify:**
   - Check all members visible
   - Check packages assigned
   - Test attendance tracking
   - Run reports

---

## Backup Your Local Data First

Before deploying, backup your current data:

```bash
cd /Users/i807291/Documents/Dev/Yfit_fin_mng/backend
tar -czf data_backup_$(date +%Y%m%d).tar.gz data/
```

Keep this backup safe in case you need to reference it.

---

## After Deployment: Export Production Data

Set up regular backups from production:

### Manual Export via Shell

```bash
# In Render Shell
cd /opt/render/project/src/backend/data
tar -czf backup_$(date +%Y%m%d).tar.gz *.json years/
# Download via Render interface
```

### Automated Backup (Future Enhancement)

Consider adding a backup endpoint to your API:
- `/admin/export` - Downloads all data as ZIP
- Schedule weekly downloads
- Store in secure location

---

## Important Notes

### Security Considerations

⚠️ **Never commit data files to git** - They contain:
- User credentials (hashed passwords)
- Personal information (names, contacts)
- Financial data (payments, balances)
- Admin credentials

✅ **Do this instead:**
- Use Render's persistent disk
- Backup via secure methods (Shell, API)
- Keep production data separate from code

### Data Privacy

- Render's persistent disk is encrypted
- Data stays in your selected region
- Not accessible except through your service
- Use strong admin passwords

### Compliance

If handling real user data:
- Review Render's privacy policy
- Ensure GDPR compliance (if applicable)
- Document data handling procedures
- Implement data retention policies

---

## Migration Checklist

Before deployment:
- [ ] Backup local data
- [ ] Document current settings
- [ ] List all active members and trainers
- [ ] Note any custom configurations

After deployment:
- [ ] Verify backend health endpoint
- [ ] Test frontend login
- [ ] Re-create settings
- [ ] Add initial data
- [ ] Test all features
- [ ] Verify data persists across redeploys

---

## Troubleshooting

**Data not persisting:**
- Check persistent disk is mounted
- Verify FILE_STORAGE_PATH is correct
- Check write permissions in Render logs

**Files missing after redeploy:**
- Verify disk mount path matches FILE_STORAGE_PATH
- Check disk is attached to service
- Review deploy logs for errors

**Cannot access data via Shell:**
- Wait for service to fully deploy
- Check shell connection status
- Verify mount path: `/opt/render/project/src/backend/data`

---

## Recommendation

**For your first deployment:** Start fresh

1. Deploy services
2. Test all features with minimal data
3. Once stable, manually add your real data through UI
4. This ensures everything works correctly
5. You still have local backup if needed

Total time: ~30 minutes to deploy + 15 minutes to enter data

---

_Last Updated: June 2026_
