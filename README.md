# YFit Fin Management

A comprehensive financial management system for fitness studios, built with FastAPI (Python) backend and React (TypeScript) frontend.

## 🚀 Features

### Backend (FastAPI + Python)
- **Authentication**: JWT-based secure login system
- **Member Management**: CRUD operations for member profiles
- **Package Sales**: Track package purchases with multiple package types
- **Attendance Tracking**: Record and manage class attendance
- **Financial Dashboard**: Real-time revenue, refunds, and debt tracking
- **Year Management**: Support for multiple fiscal years with opening balances
- **Data Export/Import**: Backup and restore functionality
- **File-based Storage**: JSON file storage with atomic writes and file locking

### Frontend (React + TypeScript + Tailwind CSS)
- **Login Page**: Secure authentication
- **Financial Dashboard**: Visual overview of revenue, packages sold, and debts
- **Attendance Dashboard**: Class and member attendance statistics
- **Members List**: Searchable, filterable member directory with balance tracking
- **Member Details**: Individual member transaction history
- **RTL Support**: Full Hebrew language support with right-to-left layout
- **Responsive Design**: Mobile-friendly interface

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

## 🛠️ Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

5. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL (optional):
```bash
# Create .env.local if it doesn't exist
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

4. Start the development server:
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🔐 Default Credentials

- **Username**: admin
- **Password**: admin123

**⚠️ Important**: Change these credentials in production via the Settings page!

## 📁 Project Structure

```
Yfit_fin_mng/
├── backend/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   ├── schemas/          # Pydantic data models
│   │   ├── services/         # Business logic
│   │   ├── storage/          # Storage layer (file/database)
│   │   ├── utils/            # Utility functions
│   │   ├── config.py         # Configuration
│   │   └── main.py           # FastAPI app entry point
│   ├── data/                 # JSON data storage
│   │   ├── members.json
│   │   ├── settings.json
│   │   ├── auth.json
│   │   └── years/
│   │       └── 2026.json
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── contexts/         # React contexts
    │   ├── pages/            # Page components
    │   ├── services/         # API service layer
    │   ├── types/            # TypeScript interfaces
    │   ├── App.tsx           # Root component
    │   └── main.tsx          # Entry point
    ├── package.json
    └── .env.local
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/update-credentials` - Update credentials

### Members
- `GET /api/members` - List members
- `GET /api/members/{id}` - Get member details
- `POST /api/members` - Create member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member

### Years
- `GET /api/years` - List years
- `GET /api/years/{year}` - Get year data
- `POST /api/years` - Create new year
- `DELETE /api/years/{year}` - Delete year
- `GET /api/years/{year}/balances` - Get member balances
- `POST /api/years/{year}/opening-balance` - Set opening balance

### Transactions
- `POST /api/years/{year}/packages` - Sell package
- `POST /api/years/{year}/attendance` - Mark attendance
- `POST /api/years/{year}/refunds` - Process refund

### Dashboard
- `GET /api/dashboard/{year}` - Get dashboard statistics

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/export` - Export all data
- `POST /api/settings/import` - Import data

## 💾 Data Storage

The application uses JSON file storage by default:

```
backend/data/
├── members.json          # All members
├── settings.json         # Package configurations
├── auth.json            # Credentials (hashed)
└── years/
    ├── 2025.json        # 2025 transactions
    └── 2026.json        # 2026 transactions
```

Each year file contains:
- Opening balances
- Package purchases
- Attendance records
- Refunds

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- File locking for concurrent access
- Atomic file writes
- CORS protection
- Input validation with Pydantic

## 🎨 UI Features

- **RTL Layout**: Full Hebrew language support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Color-coded Status**: Visual indicators for member status
  - 🟢 Green: Active members
  - 🔴 Red: Members in debt
  - 🟡 Yellow: No remaining classes
  - ⚪ Gray: Archived members
- **Real-time Updates**: Dashboard refreshes with year selection
- **Search & Filter**: Quick member lookup
- **Visual Statistics**: Charts and metrics (planned)

## 📊 Business Logic

### Member Balance Calculation
```
Balance = Opening Balance + Purchased Classes - Attended Classes - Refunded Classes
```

### Debt Calculation
```
Debt = |Negative Balance| × Price per Class
```

### Year Editability Rules
- Current year: Always editable
- Previous year: Editable only in January
- Older years: Read-only

## 🚀 Deployment (Future)

### Phase 2: Production Deployment

1. **Database Migration**
   - Migrate from JSON to PostgreSQL
   - Use Alembic for schema migrations

2. **Backend Deployment (Railway)**
   - Deploy FastAPI app
   - Add PostgreSQL addon
   - Configure environment variables

3. **Frontend Deployment (Vercel/Netlify)**
   - Build production bundle
   - Configure API URL
   - Deploy static site

4. **Scheduled Tasks**
   - Weekly backups
   - Monthly reports
   - Email notifications

## 🧪 Testing

### Manual Testing Checklist

- [ ] Login with valid/invalid credentials
- [ ] View financial dashboard
- [ ] View members list
- [ ] Search and filter members
- [ ] View member details
- [ ] Create/edit/delete members
- [ ] Sell packages
- [ ] Mark attendance
- [ ] Process refunds
- [ ] Change year
- [ ] Export/import data
- [ ] Update settings

## 🐛 Known Issues

- Charts on dashboard are placeholders (recharts integration pending)
- Member detail page not yet implemented
- Package sales page not yet implemented
- Attendance marking page not yet implemented
- Classes calendar not yet implemented
- History page not yet implemented
- Settings page not yet implemented

## 📝 License

Private project - All rights reserved

## 👥 Support

For questions or issues, please contact the development team.

---

**Version**: 1.0.0
**Last Updated**: April 13, 2026
**Status**: Beta - Active Development
