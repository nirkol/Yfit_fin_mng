import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { dashboardService } from '../services/dashboardService';
import type { AttendanceStats } from '../types';
import { Users, Calendar, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';

export default function AttendanceDashboard() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard(selectedYear);
      setAttendance(data.attendance);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">טוען נתונים...</div>
      </div>
    );
  }

  // Prepare chart data for top attendees
  const topAttendeesChartData = attendance?.topAttendees.slice(0, 10).map(a => ({
    name: a.memberName,
    attendances: a.attendanceCount
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">דשבורד נוכחות</h2>
            <p className="text-sm text-gray-500">סקירת נוכחות ומשתתפים</p>
          </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="מתאמנים פעילים"
            value={attendance?.totalActiveMembers.toString() || '0'}
            color="blue"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="סה״כ אימונים"
            value={attendance?.totalClasses.toString() || '0'}
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="סה״כ משתתפים"
            value={attendance?.totalAttendees.toString() || '0'}
            color="purple"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="ממוצע לאימון"
            value={attendance?.avgAttendeesPerClass.toFixed(1) || '0'}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8">
          {/* Top Attendees Bar Chart */}
          {topAttendeesChartData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                מובילי נוכחות
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topAttendeesChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendances" fill="#8b5cf6" name="אימונים" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Attendees List */}
          {attendance && attendance.topAttendees.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">רשימת מובילים מלאה</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendance.topAttendees.map((attendee, index) => (
                  <div key={attendee.memberId} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-medium text-gray-700">
                      {index + 1}. {attendee.memberName}
                    </span>
                    <span className="text-blue-600 font-semibold">{attendee.attendanceCount} אימונים</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
