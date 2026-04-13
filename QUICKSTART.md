# Quick Start Guide

## Running the Application

### Start Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Login
- Username: `admin`
- Password: `admin123`

## Current Status

### ✅ Fully Implemented
- Backend API (100% complete)
- Authentication system
- Member management
- Year management
- Package sales (API)
- Attendance tracking (API)
- Refunds (API)
- Dashboard statistics (API)
- Settings management (API)
- Data export/import (API)

### ✅ Frontend - Implemented
- Login page
- Financial dashboard
- Members list page
- Year selector
- Authentication flow
- Responsive RTL layout

### 🚧 Frontend - To Be Implemented
- Member detail page
- Package sales UI
- Attendance marking UI
- Classes calendar
- History/transactions page
- Settings UI
- Refund UI
- Charts and visualizations

## Quick Test Flow

1. **Login**: Go to http://localhost:5173 and login with default credentials
2. **View Dashboard**: See financial and attendance statistics
3. **View Members**: Navigate to members page to see all members
4. **Test API**: Visit http://localhost:8000/docs to test API endpoints directly

## Data Location

All data is stored in JSON files:
```
backend/data/
├── members.json      # Member profiles
├── auth.json        # Login credentials (hashed)
├── settings.json    # Package configurations
└── years/
    └── 2026.json    # Current year transactions
```

## API Testing

Use the Swagger UI at http://localhost:8000/docs to:
1. Click "Authorize" button
2. Login to get a token
3. Test any endpoint with the token

## Development Notes

- Backend uses FastAPI with file-based storage
- Frontend uses React + TypeScript + Tailwind CSS
- Hot reload enabled on both servers
- CORS configured for localhost:5173
- Hebrew language support (RTL layout)

## Next Steps

To complete the frontend, implement:
1. Member detail page with transaction history
2. Package sales form
3. Attendance marking interface
4. Settings management UI
5. Charts using Recharts library
6. Toast notifications
7. Loading states
8. Error handling

## Troubleshooting

**Backend won't start**:
- Check Python version (3.9+)
- Ensure virtual environment is activated
- Verify all dependencies installed

**Frontend won't start**:
- Check Node version (18+)
- Run `npm install` if dependencies missing
- Clear node_modules and reinstall if needed

**Can't login**:
- Verify backend is running on port 8000
- Check browser console for errors
- Ensure CORS is configured correctly

**No data showing**:
- Backend creates default files on first run
- Check `backend/data/` directory exists
- View API docs to create test data
