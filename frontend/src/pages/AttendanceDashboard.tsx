import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { yearService } from '../services/yearService';
import type { AttendanceRecord } from '../types';
import { Users, Calendar, TrendingUp, Activity, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';

interface MonthlyAttendanceData {
  month: string;
  attendance: number;
  uniqueMembers: number;
}

interface MemberAttendance {
  memberId: string;
  memberName: string;
  attendanceCount: number;
}

export default function AttendanceDashboard() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const yearData = await yearService.getYearData(selectedYear);
      setAttendance(yearData.attendance || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const uniqueMembers = new Set(attendance.map(a => a.memberId));
  const totalActiveMembers = uniqueMembers.size;

  // Count unique classes (date + time combinations)
  const uniqueClasses = new Set(attendance.map(a => `${a.date}-${a.time}`));
  const totalClasses = uniqueClasses.size;

  const totalAttendance = attendance.length;
  const avgAttendancePerClass = totalClasses > 0 ? (totalAttendance / totalClasses) : 0;
  const avgAttendancePerMonth = totalAttendance / 12;

  // Calculate unique active members per month
  const monthlyUniqueMembers: { [key: number]: Set<string> } = {};
  for (let i = 0; i < 12; i++) {
    monthlyUniqueMembers[i] = new Set();
  }

  attendance.forEach(record => {
    const month = new Date(record.date).getMonth();
    monthlyUniqueMembers[month].add(record.memberId);
  });

  const avgUniqueActivePerMonth = Object.values(monthlyUniqueMembers).reduce((sum, set) => sum + set.size, 0) / 12;

  // Monthly attendance data
  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  const monthlyData: MonthlyAttendanceData[] = [];

  for (let i = 0; i < 12; i++) {
    const monthAttendance = attendance.filter(a => new Date(a.date).getMonth() === i);
    const uniqueMembersInMonth = monthlyUniqueMembers[i].size;

    monthlyData.push({
      month: monthNames[i],
      attendance: monthAttendance.length,
      uniqueMembers: uniqueMembersInMonth
    });
  }

  // Member attendance ranking
  const memberAttendanceMap: { [key: string]: MemberAttendance } = {};
  attendance.forEach(record => {
    if (!memberAttendanceMap[record.memberId]) {
      memberAttendanceMap[record.memberId] = {
        memberId: record.memberId,
        memberName: record.memberName,
        attendanceCount: 0
      };
    }
    memberAttendanceMap[record.memberId].attendanceCount++;
  });

  const rankedMembers = Object.values(memberAttendanceMap).sort((a, b) => b.attendanceCount - a.attendanceCount);

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

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">דשבורד נוכחות</h2>
            <p className="text-sm text-gray-500">שנה: {selectedYear}</p>
          </div>

          {/* Top Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="מתאמנים פעילים"
              value={totalActiveMembers.toString()}
              color="blue"
            />
            <StatCard
              icon={<Calendar className="w-6 h-6" />}
              label="סה״כ שיעורים"
              value={totalClasses.toString()}
              color="green"
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="סה״כ נוכחות"
              value={totalAttendance.toString()}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="ממוצע לשיעור"
              value={avgAttendancePerClass.toFixed(1)}
              color="orange"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="ממוצע חודשי"
              value={avgAttendancePerMonth.toFixed(1)}
              color="indigo"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="ממוצע ייחודיים/חודש"
              value={avgUniqueActivePerMonth.toFixed(1)}
              color="pink"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Attendance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">נוכחות חודשית</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendance" fill="#8b5cf6" name="סה״כ נוכחות" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Unique Active Members per Month */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">מתאמנים ייחודיים לחודש</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uniqueMembers" stroke="#3b82f6" strokeWidth={2} name="מתאמנים ייחודיים" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Ranking */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              דירוג נוכחות
            </h3>
            {rankedMembers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין נתוני נוכחות</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">דירוג</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">שם</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">נוכחויות</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">אחוז</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">גרף</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rankedMembers.map((member, index) => {
                      const percentage = totalClasses > 0 ? (member.attendanceCount / totalClasses * 100) : 0;
                      const isTop3 = index < 3;

                      return (
                        <tr
                          key={member.memberId}
                          className={`hover:bg-gray-50 cursor-pointer ${isTop3 ? 'bg-yellow-50' : ''}`}
                          onClick={() => navigate(`/members/${member.memberId}`)}
                        >
                          <td className="px-4 py-3 text-sm font-semibold">
                            {isTop3 ? (
                              <span className="flex items-center gap-1">
                                <Award className={`w-4 h-4 ${
                                  index === 0 ? 'text-yellow-500' :
                                  index === 1 ? 'text-gray-400' :
                                  'text-amber-600'
                                }`} />
                                {index + 1}
                              </span>
                            ) : (
                              index + 1
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{member.memberName}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="font-semibold text-blue-600">{member.attendanceCount}</span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="font-semibold">{percentage.toFixed(1)}%</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo' | 'pink';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
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
