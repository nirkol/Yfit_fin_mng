# Render Deployment Guide for YFit Fin Management

This guide walks you through deploying the YFit Fin Management application to Render.

## Architecture Overview

The application consists of:
- **Backend**: FastAPI application (Python)
- **Frontend**: React + Vite application (Static Site)
- **Storage**: File-based JSON storage (data/ directory)

## Prerequisites

1. GitHub account with your repository: https://github.com/nirkol/Yfit_fin_mng.git
2. Render account (sign up at https://render.com)
3. Push all your local changes to GitHub

## Deployment Steps

### Step 1: Push Changes to GitHub

```bash
# Make sure all files are committed
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Deploy Backend (FastAPI)

1. **Log into Render**: Go to https://dashboard.render.com

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your repository: `nirkol/Yfit_fin_mng`

3. **Configure Backend Service**:
   - **Name**: `yfit-backend` (or any name you prefer)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Select **Starter ($7/month)** for always-on service

4. **Set Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   APP_NAME=YFit Fin Management
   DEBUG=false
   SECRET_KEY=<generate-a-strong-random-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   STORAGE_MODE=file
   FILE_STORAGE_PATH=/opt/render/project/src/backend/data
   CORS_ORIGINS=["https://your-frontend-url.onrender.com"]
   ```

   **Important**: 
   - Generate a secure SECRET_KEY using: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - Update CORS_ORIGINS after deploying frontend (Step 3)

5. **Add Persistent Disk** (IMPORTANT for file storage):
   - Scroll to "Disks" section
   - Click "Add Disk"
   - **Name**: `yfit-data`
   - **Mount Path**: `/opt/render/project/src/backend/data`
   - **Size**: 1 GB (adjust as needed)
   - This ensures your data persists between deployments

6. **Create Web Service**: Click "Create Web Service"

7. **Wait for Deployment**: First deployment takes 3-5 minutes

8. **Copy Backend URL**: Once deployed, copy the URL (e.g., `https://yfit-backend.onrender.com`)

9. **Test Backend**: Visit `https://your-backend-url.onrender.com/health` - should return `{"status":"healthy"}`

### Step 3: Deploy Frontend (React + Vite)

1. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Select your repository: `nirkol/Yfit_fin_mng`

2. **Configure Frontend Service**:
   - **Name**: `yfit-frontend` (or any name you prefer)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Set Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (use URL from Step 2)

4. **Create Static Site**: Click "Create Static Site"

5. **Wait for Deployment**: Takes 2-3 minutes

6. **Copy Frontend URL**: Copy the URL (e.g., `https://yfit-frontend.onrender.com`)

### Step 4: Update Backend CORS Settings

1. Go back to your **Backend Service** in Render dashboard
2. Click "Environment" in the left sidebar
3. Find the `CORS_ORIGINS` variable
4. Update it with your frontend URL:
   ```
   ["https://yfit-frontend.onrender.com"]
   ```
5. Click "Save Changes"
6. Backend will automatically redeploy

### Step 5: Initialize Data

Your data files need to be uploaded to the persistent disk:

**Option 1: Use the API to create initial data**
- Visit your frontend URL
- Use the application to create initial settings, members, etc.

**Option 2: Upload data via Render Shell**
1. Go to your backend service in Render
2. Click "Shell" tab
3. Upload your data files to `/opt/render/project/src/backend/data/`

### Step 6: Test Your Application

1. **Visit your frontend URL**: `https://yfit-frontend.onrender.com`
2. **Test login** with your admin credentials
3. **Verify all features** work correctly

## Important Notes

### Paid Starter Plan Benefits ($7/month)
- ✅ Always-on service (no cold starts)
- ✅ Faster response times
- ✅ 512 MB RAM (vs 512 MB on free tier)
- ✅ Better for production use
- ✅ Supports more concurrent users
- ✅ No 15-minute spin-down

### Data Persistence
- Data is stored in the persistent disk at `/opt/render/project/src/backend/data/`
- Backups are NOT automatic - set up regular backups
- Consider exporting data regularly via the API

### Security Considerations
1. **Change default credentials** in production
2. **Use strong SECRET_KEY** for JWT tokens
3. **Enable HTTPS** (automatic on Render)
4. **Review CORS settings** to only allow your frontend domain
5. **Set DEBUG=false** in production

### Custom Domain (Optional)
1. Go to your service settings
2. Click "Custom Domain"
3. Add your domain and update DNS records

## Monitoring

### Backend Health Check
- Render automatically monitors `/health` endpoint
- Configure alerts in service settings

### Logs
- View logs in real-time: Service → "Logs" tab
- Set up log retention in service settings

### Performance
- Monitor response times in Render dashboard
- Consider upgrading instance type if needed

## Troubleshooting

### Backend won't start
- Check logs for errors
- Verify all environment variables are set correctly
- Ensure persistent disk is mounted correctly

### Frontend shows connection errors
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Check browser console for specific errors

### Data not persisting
- Verify persistent disk is mounted at correct path
- Check `FILE_STORAGE_PATH` environment variable
- Ensure disk has sufficient space

### Cold Start Issues (Free Tier)
- First request after 15 min inactivity is slow
- Consider using a service like UptimeRobot to ping every 10 minutes
- Or upgrade to paid tier for always-on service

## Updating Your Application

### To Deploy Updates:
1. Push changes to GitHub: `git push origin main`
2. Render automatically detects changes and redeploys
3. You can also trigger manual deploys in the dashboard

### To Rollback:
1. Go to service in Render dashboard
2. Click "Deploys" tab
3. Find previous successful deploy
4. Click "Rollback to this version"

## Cost Estimates

### Free Tier
- Backend: Free (with cold starts)
- Frontend: Free
- Total: $0/month

### Paid Tier (Recommended for Production)
- Backend: $7/month (Starter)
- Frontend: $0 (static sites are free)
- Total: $7/month

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Your application docs: See README.md

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Render
3. ✅ Update CORS settings
4. ✅ Initialize data
5. ⬜ Set up custom domain (optional)
6. ⬜ Configure backup strategy
7. ⬜ Set up monitoring/alerts
8. ⬜ Load test your application
9. ⬜ Update documentation with production URLs

---

**Last Updated**: June 2026
**Deployment Status**: Ready for deployment
