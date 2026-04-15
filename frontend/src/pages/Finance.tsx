import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { yearService } from '../services/yearService';
import type { PackagePurchase, RefundTransaction, MemberWithBalance } from '../types';
import { DollarSign, Users, TrendingUp, Package, AlertCircle, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import Sidebar from '../components/Sidebar';

interface MonthlyData {
  month: string;
  revenue: number;
  cumulative: number;
}

interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
}

export default function Finance() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PackagePurchase[]>([]);
  const [refunds, setRefunds] = useState<RefundTransaction[]>([]);
  const [members, setMembers] = useState<MemberWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [yearData, balances] = await Promise.all([
        yearService.getYearData(selectedYear),
        yearService.getYearBalances(selectedYear)
      ]);

      setPackages(yearData.packages || []);
      setRefunds(yearData.refunds || []);
      setMembers(balances);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tax cap threshold for self-employed (osek patur)
  const TAX_CAP = 102292; // 2024 Israeli tax cap for עוסק פטור

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate statistics
  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.amountPaid, 0);
  const totalRefunds = refunds.reduce((sum, ref) => sum + ref.amount, 0);
  const netRevenue = totalRevenue - totalRefunds;
  const packagesSold = packages.length;
  const membersInDebt = members.filter(m => m.classesRemaining < 0);
  const totalDebt = membersInDebt.reduce((sum, m) => sum + m.debtAmount, 0);

  // Calculate year-to-date months (current month in the selected year)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 3 = April)

  // If viewing current year, use YTD; otherwise use full year
  const isCurrentYear = parseInt(selectedYear) === currentYear;
  const monthsToDate = isCurrentYear ? currentMonth + 1 : 12; // +1 because currentMonth is 0-indexed

  const avgMonthlyRevenue = totalRevenue / monthsToDate;

  // Monthly revenue data
  const monthlyData: MonthlyData[] = [];
  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  let cumulative = 0;

  for (let i = 0; i < 12; i++) {
    const monthRevenue = packages
      .filter(pkg => {
        const date = new Date(pkg.purchaseDate);
        return date.getMonth() === i;
      })
      .reduce((sum, pkg) => sum + pkg.amountPaid, 0);

    cumulative += monthRevenue;

    monthlyData.push({
      month: monthNames[i],
      revenue: monthRevenue,
      cumulative: cumulative
    });
  }

  // Payment methods distribution
  const paymentMethods: { [key: string]: PaymentMethodData } = {};
  packages.forEach(pkg => {
    if (!paymentMethods[pkg.paymentMethod]) {
      paymentMethods[pkg.paymentMethod] = { method: pkg.paymentMethod, count: 0, amount: 0 };
    }
    paymentMethods[pkg.paymentMethod].count++;
    paymentMethods[pkg.paymentMethod].amount += pkg.amountPaid;
  });
  const paymentMethodsData = Object.values(paymentMethods);

  // Transaction history (packages + refunds)
  const transactions = [
    ...packages.map(pkg => ({
      id: pkg.id,
      type: 'package' as const,
      date: pkg.purchaseDate,
      memberName: pkg.memberName,
      amount: pkg.amountPaid,
      description: `${pkg.packageType} - ${pkg.classCount} שיעורים`,
      paymentMethod: pkg.paymentMethod
    })),
    ...refunds.map(ref => ({
      id: ref.id,
      type: 'refund' as const,
      date: ref.refundDate,
      memberName: ref.memberName,
      amount: -ref.amount,
      description: ref.reason,
      paymentMethod: ref.refundMethod
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: 'var(--sidebar-bg)' }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">דשבורד פיננסי</h2>
            <p className="text-sm text-gray-500">שנה: {selectedYear}</p>
          </div>

          {/* Top Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="הכנסות שנתיות"
              value={formatCurrency(totalRevenue)}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              label="ממוצע חודשי"
              value={formatCurrency(avgMonthlyRevenue)}
              color="green"
            />
            <StatCard
              icon={<Package className="w-6 h-6" />}
              label="כרטיסיות שנמכרו"
              value={packagesSold.toString()}
              color="purple"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              label="סכום בחוב"
              value={formatCurrency(totalDebt)}
              color="red"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label="מתאמנים בחוב"
              value={membersInDebt.length.toString()}
              color="orange"
            />
          </div>

          {/* Monthly Revenue Chart - Full Width */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">הכנסות חודשיות</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="הכנסות" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cumulative Revenue Chart - Full Width */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">הכנסות מצטברות</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <ReferenceLine
                    y={TAX_CAP}
                    stroke="#ef4444"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    label={{
                      value: `תקרת מס: ${formatCurrency(TAX_CAP)}`,
                      position: 'top',
                      fill: '#ef4444',
                      fontWeight: 'bold',
                      fontSize: 14,
                      offset: 10
                    }}
                    isFront={true}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="מצטבר" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Members in Debt */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                מתאמנים בחוב
              </h3>
              {membersInDebt.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין מתאמנים בחוב</p>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">שם</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">יתרה</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">חוב</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {membersInDebt.map(member => (
                        <tr key={member.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/members/${member.id}`)}>
                          <td className="px-4 py-2 text-sm">{member.name}</td>
                          <td className="px-4 py-2 text-sm text-red-600 font-semibold">{member.classesRemaining}</td>
                          <td className="px-4 py-2 text-sm text-red-600 font-semibold">{formatCurrency(member.debtAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Refunds List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">החזרים השנה</h3>
              {refunds.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין החזרים השנה</p>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">תאריך</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">מתאמן</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">סכום</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {refunds.map(refund => (
                        <tr key={refund.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{new Date(refund.refundDate).toLocaleDateString('he-IL')}</td>
                          <td className="px-4 py-2 text-sm">{refund.memberName}</td>
                          <td className="px-4 py-2 text-sm text-red-600 font-semibold">{formatCurrency(refund.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">התפלגות אמצעי תשלום</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={({ cx, cy, midAngle, outerRadius, method, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 25;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#374151"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          style={{ fontSize: '13px', fontWeight: '500' }}
                        >
                          {`${method} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                      );
                    }}
                    outerRadius={90}
                    innerRadius={55}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="method"
                    paddingAngle={2}
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value: string, entry: any) => {
                      const data = entry.payload;
                      return `${value}: ${formatCurrency(data.amount)}`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">פירוט תשלומים</h3>
              <div className="space-y-3">
                {paymentMethodsData.map((method, index) => (
                  <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium">{method.method}</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{formatCurrency(method.amount)}</div>
                      <div className="text-sm text-gray-500">{method.count} עסקאות</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              היסטוריית עסקאות
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">תאריך</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">סוג</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">מתאמן</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">פרטים</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">תשלום</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">סכום</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.slice(0, 50).map(trans => (
                    <tr key={trans.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {new Date(trans.date).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          trans.type === 'package' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trans.type === 'package' ? 'מכירה' : 'החזר'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{trans.memberName}</td>
                      <td className="px-4 py-3 text-sm">{trans.description}</td>
                      <td className="px-4 py-3 text-sm">{trans.paymentMethod}</td>
                      <td className={`px-4 py-3 text-sm font-semibold ${
                        trans.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(trans.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
