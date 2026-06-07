# Deployment Day Plan - Starter Plan ($7/month)

## Total Time Estimate: 45-60 minutes

---

## Pre-Deployment (10 minutes)

### ☐ Step 1: Generate SECRET_KEY (1 min)
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
**Save this key securely** - you'll need it multiple times.

### ☐ Step 2: Backup Local Data (2 min)
```bash
cd backend
tar -czf data_backup_$(date +%Y%m%d).tar.gz data/
```

### ☐ Step 3: Commit & Push (2 min)
```bash
git status
git add .
git commit -m "Add Render production deployment configuration"
git push origin main
```

### ☐ Step 4: Create Render Account (5 min)
- Go to https://render.com
- Sign up (if not already)
- Connect GitHub account
- Add payment method (for $7/month plan)

**Checkpoint:** GitHub connected, ready to deploy ✅

---

## Backend Deployment (20 minutes)

### ☐ Step 5: Create Backend Service (5 min)

1. Dashboard → "New +" → "Web Service"
2. Select repository: `nirkol/Yfit_fin_mng`
3. Fill in configuration:

| Field | Value |
|-------|-------|
| Name | `yfit-backend` |
| Region | Oregon (US West) or closest |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Python 3 |
| Instance Type | **Starter ($7/month)** |

4. Build & Start:
```
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### ☐ Step 6: Add Environment Variables (3 min)

Click "Advanced" → Add these variables:

```bash
APP_NAME=YFit Fin Management
DEBUG=false
SECRET_KEY=<paste-your-generated-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
STORAGE_MODE=file
FILE_STORAGE_PATH=/opt/render/project/src/backend/data
CORS_ORIGINS=["https://yfit-frontend.onrender.com"]
```

*Note: You'll update CORS_ORIGINS later with actual frontend URL*

### ☐ Step 7: Add Persistent Disk (2 min)

Scroll to "Disks" section:
```
Name: yfit-data
Mount Path: /opt/render/project/src/backend/data
Size: 1 GB
```

### ☐ Step 8: Deploy Backend (5 min)

1. Click "Create Web Service"
2. Wait for deployment (3-5 minutes)
3. Watch logs for any errors
4. Wait for "Live" status

### ☐ Step 9: Test Backend (2 min)

1. Copy your backend URL: `https://yfit-backend-xxxx.onrender.com`
2. Test health: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"healthy"}`
3. Test docs: `https://your-backend-url.onrender.com/docs`
   - Should show API documentation

### ☐ Step 10: Enable Health Check (3 min)

1. Go to Settings → Health & Alerts
2. Health Check Path: `/health`
3. Save changes

**Checkpoint:** Backend is live and healthy ✅

**Your Backend URL:** _________________________________

---

## Frontend Deployment (15 minutes)

### ☐ Step 11: Create Frontend Service (3 min)

1. Dashboard → "New +" → "Static Site"
2. Select repository: `nirkol/Yfit_fin_mng`
3. Fill in configuration:

| Field | Value |
|-------|-------|
| Name | `yfit-frontend` |
| Branch | `main` |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

### ☐ Step 12: Add Environment Variable (1 min)

Click "Advanced" → Add:
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```
(Use the backend URL from Step 9)

### ☐ Step 13: Deploy Frontend (5 min)

1. Click "Create Static Site"
2. Wait for deployment (2-3 minutes)
3. Wait for "Live" status

### ☐ Step 14: Test Frontend (2 min)

1. Copy your frontend URL: `https://yfit-frontend-xxxx.onrender.com`
2. Visit URL in browser
3. Check if page loads

**Checkpoint:** Frontend is live ✅

**Your Frontend URL:** _________________________________

---

## Post-Deployment Configuration (10 minutes)

### ☐ Step 15: Update Backend CORS (3 min)

**Important:** Update with real frontend URL

1. Go to backend service in Render
2. Click "Environment" tab
3. Find `CORS_ORIGINS` variable
4. Update value:
   ```json
   ["https://your-frontend-url.onrender.com"]
   ```
   (Use exact URL from Step 14)
5. Click "Save Changes"
6. Backend will auto-redeploy (~2 minutes)

### ☐ Step 16: Test Integration (5 min)

1. Visit frontend URL
2. Try to login with admin credentials
3. Check if API connection works
4. Should see login page loading correctly

If you get CORS errors:
- Check CORS_ORIGINS matches exactly
- Wait for backend redeploy to complete
- Clear browser cache
- Try incognito/private window

### ☐ Step 17: Document URLs (2 min)

Save these URLs for reference:

```
Backend: _________________________________
Frontend: _________________________________
Health Check: _________________________________/health
API Docs: _________________________________/docs
```

**Checkpoint:** Both services connected and working ✅

---

## Initial Data Setup (10-15 minutes)

### ☐ Step 18: Login and Configure (10 min)

1. **Login:**
   - Use admin credentials from your .env file
   - Change password immediately

2. **Configure Settings:**
   - Business name
   - Package prices
   - Attendance rules

3. **Add Initial Data:**
   - Add trainers (from your local data)
   - Add a test member
   - Create a test package

4. **Test Core Features:**
   - Record attendance
   - View dashboard
   - Generate a report
   - Test member detail page

### ☐ Step 19: Verify Data Persistence (5 min)

1. Add some test data
2. Go to backend service in Render
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Wait for redeploy
5. Check if your data is still there

**Checkpoint:** Data persists across deploys ✅

---

## Final Checks (5 minutes)

### ☐ Step 20: Security Checklist

- [ ] DEBUG is set to false
- [ ] Strong SECRET_KEY is set
- [ ] Admin password changed from default
- [ ] CORS restricted to frontend URL only
- [ ] HTTPS working (automatic)

### ☐ Step 21: Performance Check

- [ ] Pages load quickly (no cold start)
- [ ] API responses are fast
- [ ] Navigation is smooth
- [ ] No console errors

### ☐ Step 22: Feature Verification

- [ ] Login/Logout works
- [ ] Member management works
- [ ] Trainer management works
- [ ] Attendance tracking works
- [ ] Dashboard displays correctly
- [ ] Reports generate properly
- [ ] Settings save correctly

---

## Success Criteria ✅

Your deployment is successful if:
- ✅ Backend returns healthy status
- ✅ Frontend loads without errors
- ✅ Login works
- ✅ Can add/edit members
- ✅ Can track attendance
- ✅ Data persists across redeploys
- ✅ No CORS errors
- ✅ All pages accessible

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| CORS errors | Update CORS_ORIGINS with exact frontend URL |
| 401 Unauthorized | Check admin credentials, verify SECRET_KEY |
| Data not persisting | Check disk mount path, verify FILE_STORAGE_PATH |
| Slow first load | Normal for first request, should be fast after |
| Build fails | Check logs, verify Node/Python versions |
| Health check fails | Check /health endpoint, review backend logs |

---

## After Deployment

### Immediate (Today)
- [ ] Share URLs with team/users
- [ ] Document admin credentials securely
- [ ] Set up monitoring alerts

### This Week
- [ ] Enter all real data
- [ ] Test with real users
- [ ] Monitor for issues
- [ ] Set up backup routine

### This Month
- [ ] Review usage and performance
- [ ] Consider custom domain
- [ ] Plan scaling if needed
- [ ] Document any issues/lessons learned

---

## Cost Tracking

**Monthly Cost:** $7/month

**Included:**
- Backend Starter (always-on)
- Frontend Static Site (free)
- 1GB Persistent Disk (free)
- Automatic SSL (free)
- Auto-deploy from GitHub (free)

**Potential Additional Costs:**
- Extra disk space: ~$0.25/GB/month
- Higher tier: $25/month (if needed)
- Custom domain: Your domain registrar cost

---

## Emergency Contacts

- **Render Status:** https://status.render.com
- **Render Support:** support@render.com
- **Render Docs:** https://render.com/docs

---

## Completion Time

**Actual time spent:** _____ minutes

**Issues encountered:** _____________________________

**Notes:** _____________________________

---

**Deployment Status:** ⬜ In Progress | ⬜ Complete ✅

**Deployed by:** _____________________________

**Date:** _____________________________

---

_Good luck with your deployment! 🚀_
