# 🚀 Quick Deployment Reference - Render Starter Plan

## Before You Start

```bash
# 1. Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# 2. Push to GitHub
git add .
git commit -m "Add Render production deployment configuration"
git push origin main
```

---

## Backend Service Configuration

**Service Type:** Web Service  
**Plan:** Starter ($7/month)  
**Repository:** nirkol/Yfit_fin_mng

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |

### Environment Variables

```bash
APP_NAME=YFit Fin Management
DEBUG=false
SECRET_KEY=<your-generated-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
STORAGE_MODE=file
FILE_STORAGE_PATH=/opt/render/project/src/backend/data
CORS_ORIGINS=["https://your-frontend-url.onrender.com"]
```

### Persistent Disk

```
Name: yfit-data
Mount Path: /opt/render/project/src/backend/data
Size: 1 GB
```

---

## Frontend Service Configuration

**Service Type:** Static Site  
**Plan:** Free  
**Repository:** nirkol/Yfit_fin_mng

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

### Environment Variables

```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Deployment Order

1. ✅ **Deploy Backend** → Get backend URL
2. ✅ **Deploy Frontend** → Use backend URL in VITE_API_URL
3. ✅ **Update Backend CORS** → Add frontend URL to CORS_ORIGINS
4. ✅ **Test Everything** → Login and verify features

---

## Quick Test URLs

```
Backend Health: https://your-backend.onrender.com/health
Backend API Docs: https://your-backend.onrender.com/docs
Frontend: https://your-frontend.onrender.com
```

---

## Cost: $7/month

- Backend Starter: $7/month ✅ Always-on
- Frontend Static: FREE ✅ Global CDN
- Persistent Disk 1GB: FREE

---

## Important Notes

⚠️ **Update CORS twice:**
1. First deployment: Use temporary value
2. After frontend deployed: Update with real frontend URL

⚠️ **Save your SECRET_KEY** - You'll need it for rollbacks

✅ **Automatic SSL** - Both services get HTTPS automatically

✅ **Auto-deploy** - Push to GitHub = automatic deployment

---

## Support Links

- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

---

_See PRODUCTION_DEPLOYMENT.md for detailed guide_
