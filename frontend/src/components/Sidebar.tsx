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
    <aside className="w-64 bg-white shadow-lg border-l flex flex-col h-screen">
      <div className="p-6 border-b flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">YFit Fin Management</h1>
      </div>

      {/* Year Selector */}
      <div className="px-4 py-4 border-b flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 mb-2">בחר שנה:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Dashboards Section */}
      <div className="px-4 py-4 border-b flex-shrink-0">
        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">דשבורדים</h2>
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/finance')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/finance')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">פיננסי</span>
          </button>
          <button
            onClick={() => navigate('/attendance-dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/attendance-dashboard')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">נוכחות</span>
          </button>
        </nav>
      </div>

      {/* Main Actions Section */}
      <div className="px-4 py-4 border-b flex-shrink-0">
        <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">תפריט</h2>
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/members')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/members') || location.pathname.startsWith('/members/')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">מתאמנים</span>
          </button>
          <button
            onClick={() => navigate('/attendance')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/attendance')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">סימון נוכחות</span>
          </button>
          <button
            onClick={() => navigate('/classes')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/classes')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">היסטוריית שיעורים</span>
          </button>
          <button
            onClick={() => navigate('/package')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/package')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">מכירת כרטיסייה</span>
          </button>
        </nav>
      </div>

      {/* Settings & Logout Section */}
      <div className="px-4 py-4 border-t flex-shrink-0 mt-auto">
        <nav className="space-y-2">
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="font-medium">הגדרות</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-700 rounded-lg hover:bg-red-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">התנתק</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
