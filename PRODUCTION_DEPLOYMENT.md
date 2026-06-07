# Production Deployment Guide - Paid Tier ($7/month)

## What You Get with Starter Plan

**Backend Service ($7/month):**
- Always-on (no cold starts)
- 512 MB RAM
- Shared CPU
- Automatic SSL
- Custom domain support
- Better performance

**Frontend (Static Site - FREE):**
- Free forever
- Global CDN
- Automatic SSL
- Custom domain support

**Total Cost: $7/month**

---

## Optimized Deployment Steps

### 1. Commit and Push to GitHub

```bash
cd /Users/i807291/Documents/Dev/Yfit_fin_mng
git add .
git commit -m "Add Render production deployment configuration"
git push origin main
```

### 2. Deploy Backend (Starter Plan)

**Go to Render Dashboard:** https://dashboard.render.com

**Create Web Service:**
1. Click "New +" → "Web Service"
2. Connect GitHub → Select `nirkol/Yfit_fin_mng`
3. Configure:
   ```
   Name: yfit-backend
   Region: Oregon (US West) or closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Instance Type: Starter ($7/month) ← SELECT THIS
   ```

4. **Build & Start:**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. **Environment Variables** (click "Advanced"):
   ```
   APP_NAME=YFit Fin Management
   DEBUG=false
   SECRET_KEY=<generate-strong-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   STORAGE_MODE=file
   FILE_STORAGE_PATH=/opt/render/project/src/backend/data
   CORS_ORIGINS=["https://yfit-frontend.onrender.com"]
   ```

   **Generate SECRET_KEY:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

6. **Add Persistent Disk** (scroll down):
   ```
   Name: yfit-data
   Mount Path: /opt/render/project/src/backend/data
   Size: 1 GB (upgrade if needed)
   ```

7. Click **"Create Web Service"**

8. **Wait 3-5 minutes** for deployment

9. **Copy your backend URL:** `https://yfit-backend-xxxx.onrender.com`

10. **Test:** Visit `https://your-backend-url.onrender.com/health`
    - Should return: `{"status":"healthy"}`

### 3. Deploy Frontend (Static Site - FREE)

**Create Static Site:**
1. Click "New +" → "Static Site"
2. Select repository: `nirkol/Yfit_fin_mng`
3. Configure:
   ```
   Name: yfit-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   (Use the URL from Step 2)

5. Click **"Create Static Site"**

6. **Wait 2-3 minutes** for deployment

7. **Copy your frontend URL:** `https://yfit-frontend-xxxx.onrender.com`

### 4. Update Backend CORS

**Important:** Now that you have your frontend URL, update backend:

1. Go to backend service in Render
2. Click "Environment" tab
3. Update `CORS_ORIGINS`:
   ```
   ["https://yfit-frontend-xxxx.onrender.com"]
   ```
   (Use your actual frontend URL)
4. Click "Save Changes"
5. Backend will auto-redeploy (takes ~2 minutes)

### 5. Initialize Your Data

You have two options:

**Option A: Copy existing data (Recommended)**

If you have existing data in `backend/data/`:

1. Go to backend service → "Shell" tab
2. Navigate to data directory:
   ```bash
   cd /opt/render/project/src/backend/data
   ```
3. Upload your files using Render's file upload feature
4. Or use the API to create initial data through the frontend

**Option B: Start fresh**

1. Visit your frontend URL
2. Log in with default credentials (from your .env)
3. Set up initial data through the UI

### 6. Test Everything

**Health Check:**
- ✅ Backend: `https://your-backend-url.onrender.com/health`
- ✅ API Docs: `https://your-backend-url.onrender.com/docs`

**Frontend Test:**
1. Visit: `https://your-frontend-url.onrender.com`
2. Test login
3. Test member management
4. Test attendance tracking
5. Test reports
6. Test settings

**Performance Check:**
- No cold starts (always-on)
- Fast response times
- Smooth navigation

---

## Production Best Practices

### Security Checklist

- [ ] Strong SECRET_KEY generated
- [ ] DEBUG set to false
- [ ] Default admin password changed
- [ ] CORS restricted to your frontend URL only
- [ ] HTTPS enabled (automatic on Render)
- [ ] Environment variables set correctly

### Monitoring Setup

**Enable Health Checks:**
1. Go to backend service → "Settings"
2. Health Check Path: `/health`
3. Save changes

**Set Up Alerts:**
1. Go to "Notifications" in service settings
2. Add email for deployment failures
3. Add email for health check failures

**View Logs:**
- Backend logs: Service → "Logs" tab
- Real-time monitoring available
- Set up log retention

### Backup Strategy

**Automatic Backups:**
```bash
# Option 1: Use Render's disk snapshots (in dashboard)
# Option 2: Set up automated exports via API
```

**Manual Backup:**
1. Go to backend service → "Shell"
2. Download data:
   ```bash
   cd /opt/render/project/src/backend/data
   tar -czf backup.tar.gz *.json years/
   ```
3. Use Render's file download feature

**Recommended:** Set up weekly automated backups

### Performance Optimization

**Backend (Already Optimized):**
- ✅ Starter plan (always-on)
- ✅ Persistent disk for data
- ✅ Rate limiting configured

**Frontend:**
- ✅ Static site on global CDN
- ✅ Automatic compression
- ✅ Fast worldwide delivery

**If you need more performance:**
- Upgrade to Standard plan ($25/month) for more RAM/CPU
- Add Redis for caching (if needed later)
- Consider database upgrade from file storage

---

## Custom Domain (Optional)

### Backend Custom Domain

1. Go to backend service → "Settings"
2. Click "Custom Domain"
3. Add: `api.yourdomain.com`
4. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: <render-provided-value>
   ```

### Frontend Custom Domain

1. Go to frontend service → "Settings"
2. Click "Custom Domain"
3. Add: `app.yourdomain.com`
4. Update DNS:
   ```
   Type: CNAME
   Name: app
   Value: <render-provided-value>
   ```

**After adding custom domains:**
- Update backend CORS_ORIGINS to include custom domain
- Update frontend VITE_API_URL to use custom backend domain
- Both services will auto-redeploy

---

## Maintenance

### Deploying Updates

**Automatic (Recommended):**
```bash
git add .
git commit -m "Your update message"
git push origin main
```
Render automatically detects and deploys.

**Manual Deploy:**
1. Go to service in dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### Rollback

If something breaks:
1. Go to service → "Deploys" tab
2. Find last working deployment
3. Click "Rollback to this version"

### Scaling

If you need more resources:
1. Go to service → "Settings"
2. Change instance type:
   - Standard: $25/month (1 GB RAM)
   - Pro: $85/month (4 GB RAM)
3. Save and redeploy

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Backend | Starter | $7/month |
| Frontend | Static Site | FREE |
| Persistent Disk (1GB) | Included | FREE |
| **Total** | | **$7/month** |

**Additional costs only if you add:**
- Extra disk space: ~$0.25/GB/month
- Custom domain: Free (you pay domain registrar)
- Higher tier: $25-85/month

---

## Troubleshooting

### Backend Issues

**Service won't start:**
- Check logs for Python errors
- Verify all environment variables set
- Check build command succeeded

**Data not persisting:**
- Verify disk mounted at `/opt/render/project/src/backend/data`
- Check FILE_STORAGE_PATH variable
- Ensure write permissions

### Frontend Issues

**Can't connect to backend:**
- Check VITE_API_URL is correct
- Verify CORS_ORIGINS includes frontend URL
- Check browser console for errors

**Build fails:**
- Check Node.js version compatibility
- Verify package.json dependencies
- Check build logs for specific errors

### Common Issues

**401 Unauthorized:**
- Check admin credentials
- Verify SECRET_KEY matches between deploys
- Check token expiration settings

**CORS errors:**
- Ensure exact match (no trailing slash)
- Include https:// protocol
- Check for typos in URLs

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Status:** https://status.render.com
- **Community:** https://community.render.com

---

## Your Production URLs

Fill these in after deployment:

```
Backend URL: ________________________________________
Frontend URL: ________________________________________
Health Check: ________________________________________/health
API Docs: ________________________________________/docs

Admin Username: ________________________________________
Admin Password: ________________________________________ (changed from default)

Deployed on: ________________________________________
```

---

## Next Steps After Deployment

1. ✅ Test all features thoroughly
2. ✅ Change default admin credentials
3. ✅ Set up monitoring alerts
4. ✅ Configure backup strategy
5. ⬜ Add custom domain (optional)
6. ⬜ Load test your application
7. ⬜ Update documentation with production URLs
8. ⬜ Share URLs with your team

---

**Status:** Ready for Production ✅  
**Cost:** $7/month  
**Uptime:** 99.9% SLA (Starter plan)
