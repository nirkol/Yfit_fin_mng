# Security Documentation

## Current Security Measures

### 1. Authentication & Authorization
- ✅ **JWT-based authentication** - All API endpoints (except login) require a valid JWT token
- ✅ **Two-level authentication**:
  - System login (for accessing the app)
  - Admin authentication (for accessing advanced settings)
- ✅ **Password hashing** - User passwords are hashed using bcrypt
- ✅ **Token expiration** - JWT tokens expire after 24 hours

### 2. Rate Limiting
- ✅ **Login endpoint rate limiting** - Maximum 5 login attempts per minute per IP address
- This prevents brute force attacks on credentials

### 3. CORS (Cross-Origin Resource Sharing)
- ✅ **Restricted origins** - API only accepts requests from configured frontend URL
- Default: `http://localhost:5173` (development)
- **Note**: CORS only protects against browser-based attacks, not direct API calls via tools like curl/Postman

### 4. API Endpoint Protection
All endpoints require authentication except:
- `/api/auth/login` - Needed for initial authentication (rate limited)
- `/` - Root info endpoint (read-only, no sensitive data)
- `/health` - Health check endpoint (read-only, no sensitive data)

## Security Limitations

### What CORS Does NOT Prevent
While CORS is enabled, someone with network access can still:
1. **Use curl/Postman** to call the API directly (bypassing browser CORS)
2. **Brute force credentials** (mitigated by rate limiting)
3. **Access the API** if they obtain valid credentials

### Why This Happens
- The backend API runs on `http://0.0.0.0:8000` (accessible from the network)
- CORS only prevents **browsers** from making cross-origin requests
- Tools like curl, Postman, or custom scripts bypass CORS entirely

## Recommended Production Security Enhancements

### 1. Network-Level Security (Most Important)
```bash
# Option A: Run on localhost only (most secure for single-machine use)
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Option B: Use firewall rules to restrict access
# Only allow specific IP addresses to access port 8000
```

### 2. HTTPS/SSL
```bash
# Use SSL certificates in production
uvicorn app.main:app --host 0.0.0.0 --port 8000 \
  --ssl-keyfile=/path/to/key.pem \
  --ssl-certfile=/path/to/cert.pem
```

### 3. Reverse Proxy (Nginx/Apache)
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5173;  # Frontend
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;  # Backend

        # Additional security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

### 4. IP Whitelisting
Add to `backend/app/config.py`:
```python
ALLOWED_IPS: List[str] = ["127.0.0.1", "192.168.1.0/24"]
```

### 5. Change Default Credentials
**IMPORTANT**: Change these before production:
1. System login: `admin` / `admin123`
2. Admin area: `koladmin` / `koladmin`
3. JWT Secret key in `backend/app/config.py`

### 6. Environment Variables
Create `.env` file for sensitive data:
```bash
SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=False
CORS_ORIGINS=["https://yourdomain.com"]
```

## Current Protection Status

| Attack Vector | Protected | How |
|--------------|-----------|-----|
| Brute force login | ✅ Yes | Rate limiting (5 attempts/min) |
| Unauthorized API access | ✅ Yes | JWT authentication required |
| SQL injection | ✅ N/A | File-based storage, no SQL |
| XSS | ✅ Yes | React escapes output by default |
| CSRF | ✅ Yes | JWT tokens (not cookies) |
| Direct API calls (curl) | ⚠️ Partial | Requires valid JWT, but accessible if credentials known |
| Man-in-the-middle | ❌ No | Use HTTPS in production |

## For Local/Private Network Use

If this app runs on a local network (e.g., in your gym/studio):

1. **Best Practice**: Run backend on `127.0.0.1` only
2. **Frontend and Backend** on same machine
3. **Access via** `http://localhost:5173` from that machine only
4. **Or** use VPN/SSH tunnel for remote access

## Deployment Checklist

- [ ] Change all default passwords
- [ ] Set strong SECRET_KEY in .env
- [ ] Set DEBUG=False
- [ ] Configure CORS_ORIGINS for production domain
- [ ] Enable HTTPS with SSL certificates
- [ ] Set up firewall rules
- [ ] Configure reverse proxy (optional but recommended)
- [ ] Set up automated backups of `backend/data/` folder
- [ ] Document access credentials securely (password manager)

## Monitoring

Consider adding:
- Logging of failed login attempts
- Alerting on suspicious activity
- Regular backup of data files
