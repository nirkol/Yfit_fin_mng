import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useYear } from '../contexts/YearContext';
import { DollarSign, Users, Calendar, TrendingUp, ArrowLeft, Activity, Settings as SettingsIcon } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { selectedYear, setSelectedYear, availableYears } = useYear();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="theme-sidebar w-64 shadow-lg flex flex-col h-screen">
      <div className="p-6 border-b border-white/15 flex-shrink-0">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>YFit Fin Management</h1>
      </div>

      {/* Year Selector */}
      <div className="px-4 py-4 border-b border-white/15 flex-shrink-0">
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>בחר שנה:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full px-3 py-2 rounded-lg outline-none"
          style={{
            border: '2px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)'
          }}
        >
          {availableYears.map((year) => (
            <option key={year} value={year} style={{ background: 'var(--color-card-bg)', color: 'var(--color-text-primary)' }}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Dashboards Section */}
      <div className="px-4 py-4 border-b border-white/15 flex-shrink-0">
        <h2 className="text-xs font-semibold uppercase mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>דשבורדים</h2>
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/finance')}
            className={`theme-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/finance') ? 'active' : ''
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">פיננסי</span>
          </button>
          <button
            onClick={() => navigate('/attendance-dashboard')}
            className={`theme-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/attendance-dashboard') ? 'active' : ''
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">נוכחות</span>
          </button>
        </nav>
      </div>

      {/* Main Actions Section */}
      <div className="px-4 py-4 border-b border-white/15 flex-shrink-0">
        <h2 className="text-xs font-semibold uppercase mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>תפריט</h2>
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/members')}
            className={`theme-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/members') || location.pathname.startsWith('/members/') ? 'active' : ''
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">מתאמנים</span>
          </button>
          <button
            onClick={() => navigate('/attendance')}
            className={`theme-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/attendance') ? 'active' : ''
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">סימון נוכחות</span>
          </button>
          <button
            onClick={() => navigate('/classes')}
            className={`theme-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/classes') ? 'active' : ''
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">היסטוריית שיעורים</span>
          </button>
          <button
            onClick={() => navigate('/package')}
            className={`theme-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/package') ? 'active' : ''
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">מכירת כרטיסייה</span>
          </button>
        </nav>
      </div>

      {/* Settings & Logout Section */}
      <div className="px-4 py-4 border-t border-white/15 flex-shrink-0 mt-auto">
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/settings')}
            className={`theme-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive('/settings') ? 'active' : ''
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-medium">הגדרות</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
            style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">התנתק</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
