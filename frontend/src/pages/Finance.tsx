import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useYear } from '../contexts/YearContext';
import { dashboardService } from '../services/dashboardService';
import type { FinancialStats } from '../types';
import { DollarSign, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Sidebar from '../components/Sidebar';

export default function Finance() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [financial, setFinancial] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard(selectedYear);
      setFinancial(data.financial);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Revenue breakdown for pie chart
  const revenueData = [
    { name: 'הכנסות', value: financial?.netRevenue || 0 },
    { name: 'החזרים', value: financial?.totalRefunds || 0 },
  ];

  // Payment methods breakdown (placeholder - would need backend data)
  const paymentMethodsData = [
    { name: 'מזומן', value: 45 },
    { name: 'אשראי', value: 30 },
    { name: 'העברה', value: 15 },
    { name: 'Paybox', value: 10 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">דשבורד פיננסי</h2>
            <p className="text-sm text-gray-500">סקירת הכנסות והוצאות</p>
          </div>
        {/* Financial Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">סטטיסטיקות פיננסיות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="הכנסות כוללות"
              value={formatCurrency(financial?.totalRevenue || 0)}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="הכנסות נטו"
              value={formatCurrency(financial?.netRevenue || 0)}
              color="green"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="החזרים"
              value={formatCurrency(financial?.totalRefunds || 0)}
              color="red"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="כרטיסיות שנמכרו"
              value={financial?.packagesSold.toString() || '0'}
              color="purple"
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              התפלגות הכנסות
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              התפלגות אמצעי תשלום
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="אחוז" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debts */}
        {financial && financial.membersWithDebt > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">חובות</h3>
            <p className="text-red-700">
              {financial.membersWithDebt} מתאמנים בחוב | סה״כ חוב: {formatCurrency(financial.totalDebt)}
            </p>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
