import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { memberService } from '../services/memberService';
import { yearService } from '../services/yearService';
import type { MemberWithBalance, YearData } from '../types';
import { Search, Eye, Archive, Trash2, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface EnhancedMember extends MemberWithBalance {
  amountPaidThisYear: number;
  attendanceCountThisYear: number;
}

export default function ArchivedMembers() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [members, setMembers] = useState<EnhancedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, [selectedYear]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const [balances, yearData] = await Promise.all([
        yearService.getYearBalances(selectedYear),
        yearService.getYearData(selectedYear)
      ]);

      // Calculate amount paid and attendance for each member
      const enhancedMembers: EnhancedMember[] = balances.map(member => {
        const amountPaid = (yearData.packages || [])
          .filter(pkg => pkg.memberId === member.id)
          .reduce((sum, pkg) => sum + pkg.amountPaid, 0);

        const attendanceCount = (yearData.attendance || [])
          .filter(att => att.memberId === member.id)
          .length;

        return {
          ...member,
          amountPaidThisYear: amountPaid,
          attendanceCountThisYear: attendanceCount
        };
      });

      // Filter only archived members
      const archived = enhancedMembers.filter(m => m.isArchived);
      setMembers(archived);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchiveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך לשחזר את ${memberName}?`)) {
      return;
    }

    try {
      await memberService.updateMember(memberId, { isArchived: false });
      alert(`${memberName} שוחזר בהצלחה`);
      loadMembers();
    } catch (error) {
      console.error('Failed to unarchive member:', error);
      alert('שגיאה בשחזור מתאמן');
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    // Find the member to check their balance
    const member = members.find(m => m.id === memberId);

    if (!member) {
      alert('שגיאה: מתאמן לא נמצא');
      return;
    }

    // Check if member has a balance (positive or negative)
    if (member.classesRemaining !== 0) {
      alert(`❌ לא ניתן למחוק את ${memberName}.\n\nיתרת שיעורים: ${member.classesRemaining}\n\nניתן למחוק מתאמן רק כאשר יתרת השיעורים שלו היא 0.`);
      return;
    }

    if (!confirm(`⚠️ אזהרה! פעולה זו תמחק לצמיתות את ${memberName} וכל הנתונים הקשורים. האם להמשיך?`)) {
      return;
    }

    try {
      await memberService.deleteMember(memberId);
      alert(`${memberName} נמחק בהצלחה`);
      loadMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('שגיאה במחיקת מתאמן');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('he-IL');
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">טוען מתאמנים...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: 'var(--sidebar-bg)' }}>
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>מתאמנים בארכיון</h2>
              <p className="text-sm text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>מתאמנים שהועברו לארכיון</p>
            </div>
            <button
              onClick={() => navigate('/members')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="font-medium">חזרה</span>
            </button>
          </div>

          {/* Statistics Bar */}
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{members.length}</div>
              <div className="text-sm text-gray-600">סה״כ מתאמנים בארכיון</div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="חיפוש לפי שם..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">יתרת כסף</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">יתרת שיעורים</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">שולם השנה</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">נוכחויות השנה</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך לידה</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">טלפון</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      לא נמצאו מתאמנים בארכיון
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, index) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-right"
                        >
                          {member.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-semibold ${
                          member.debtAmount > 0 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {member.debtAmount > 0 ? `-${formatCurrency(member.debtAmount)}` : formatCurrency(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-semibold ${
                          member.classesRemaining < 0 ? 'text-red-600' :
                          member.classesRemaining === 0 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {member.classesRemaining}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(member.amountPaidThisYear)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <span className="font-semibold text-blue-600">
                          {member.attendanceCountThisYear}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(member.dateOfBirth)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {member.phone || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/members/${member.id}`)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="צפייה"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUnarchiveMember(member.id, member.name)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                            title="שחזור"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            title="מחיקה"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
