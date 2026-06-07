# Render Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.

## Pre-Deployment Checklist

- [ ] All changes committed to Git
- [ ] All changes pushed to GitHub (`git push origin main`)
- [ ] Render account created (https://render.com)
- [ ] GitHub connected to Render
- [ ] Strong SECRET_KEY generated: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

## Backend Deployment (Step 1)

- [ ] Created new Web Service in Render
- [ ] Selected correct repository and branch
- [ ] Set Root Directory: `backend`
- [ ] Set Build Command: `pip install -r requirements.txt`
- [ ] Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Added all environment variables:
  - [ ] APP_NAME
  - [ ] DEBUG=false
  - [ ] SECRET_KEY (strong random key)
  - [ ] ALGORITHM=HS256
  - [ ] ACCESS_TOKEN_EXPIRE_MINUTES=1440
  - [ ] STORAGE_MODE=file
  - [ ] FILE_STORAGE_PATH=/opt/render/project/src/backend/data
  - [ ] CORS_ORIGINS (temporary value, will update later)
- [ ] Added Persistent Disk:
  - [ ] Name: yfit-data
  - [ ] Mount Path: `/opt/render/project/src/backend/data`
  - [ ] Size: 1 GB
- [ ] Backend deployed successfully
- [ ] Copied backend URL: `_________________________________`
- [ ] Tested health endpoint: `/health`

## Frontend Deployment (Step 2)

- [ ] Created new Static Site in Render
- [ ] Selected correct repository and branch
- [ ] Set Root Directory: `frontend`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Publish Directory: `dist`
- [ ] Added environment variable:
  - [ ] VITE_API_URL (with backend URL from Step 1)
- [ ] Frontend deployed successfully
- [ ] Copied frontend URL: `_________________________________`

## Post-Deployment Configuration (Step 3)

- [ ] Updated backend CORS_ORIGINS with frontend URL
- [ ] Backend redeployed automatically
- [ ] Visited frontend URL in browser
- [ ] Tested login functionality
- [ ] Verified API connection works
- [ ] Created initial data (if needed)

## Production Readiness (Optional)

- [ ] Changed default admin credentials
- [ ] Verified all features work in production
- [ ] Set up custom domain (if desired)
- [ ] Configured monitoring/alerts
- [ ] Documented production URLs
- [ ] Set up backup strategy
- [ ] Load tested application
- [ ] Updated team with new URLs

## Troubleshooting

If something goes wrong, check:
- [ ] Render service logs (in dashboard)
- [ ] Browser console for frontend errors
- [ ] Environment variables are set correctly
- [ ] CORS settings match frontend URL exactly
- [ ] Persistent disk is mounted correctly
- [ ] Build/start commands are correct

## Useful Commands

Generate SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Test backend locally:
```bash
cd backend
uvicorn app.main:app --reload
```

Test frontend locally:
```bash
cd frontend
npm run dev
```

## Deployment URLs

Backend: `_________________________________`
Frontend: `_________________________________`
Health Check: `_________________________________/health`
API Docs: `_________________________________/docs`

## Notes

Free tier limitations:
- Services spin down after 15 minutes of inactivity
- Cold start takes 30-50 seconds on first request
- Consider upgrading to paid tier ($7/month) for production use

---
Date deployed: __________
Deployed by: __________
