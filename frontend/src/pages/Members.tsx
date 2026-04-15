import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { memberService } from '../services/memberService';
import { yearService } from '../services/yearService';
import type { MemberWithBalance, YearData } from '../types';
import { Users, Search, Plus, X, Eye, Archive, Trash2, MoreVertical } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface EnhancedMember extends MemberWithBalance {
  amountPaidThisYear: number;
  attendanceCountThisYear: number;
}

export default function Members() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [members, setMembers] = useState<EnhancedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [archivedCount, setArchivedCount] = useState(0);

  // New member form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberDOB, setNewMemberDOB] = useState('');

  useEffect(() => {
    loadMembers();
  }, [selectedYear]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const [balances, yearData, allMembers] = await Promise.all([
        yearService.getYearBalances(selectedYear),
        yearService.getYearData(selectedYear),
        memberService.getMembers() // Fetch all members to get archived count
      ]);

      console.log('All members fetched:', allMembers);
      console.log('Archived members:', allMembers.filter(m => m.isArchived));

      // Calculate amount paid and attendance for each member
      const enhancedMembers: EnhancedMember[] = balances.map(member => {
        // Sum amount paid from packages
        const amountPaid = (yearData.packages || [])
          .filter(pkg => pkg.memberId === member.id)
          .reduce((sum, pkg) => sum + pkg.amountPaid, 0);

        // Count attendance
        const attendanceCount = (yearData.attendance || [])
          .filter(att => att.memberId === member.id)
          .length;

        return {
          ...member,
          amountPaidThisYear: amountPaid,
          attendanceCountThisYear: attendanceCount
        };
      });

      setMembers(enhancedMembers);

      // Calculate archived count from all members (not just balances)
      const archived = allMembers.filter(m => m.isArchived).length;
      console.log('Setting archived count to:', archived);
      setArchivedCount(archived);
    } catch (error) {
      console.error('Failed to load members:', error);
      // Set archived count to 0 on error
      setArchivedCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMemberName.trim()) {
      alert('שם המתאמן הוא שדה חובה');
      return;
    }

    try {
      setCreating(true);
      await memberService.createMember({
        name: newMemberName.trim(),
        phone: newMemberPhone.trim() || undefined,
        dateOfBirth: newMemberDOB || undefined,
        isArchived: false
      });

      alert('מתאמן נוסף בהצלחה!');
      setShowCreateModal(false);
      setNewMemberName('');
      setNewMemberPhone('');
      setNewMemberDOB('');
      loadMembers();
    } catch (error) {
      console.error('Failed to create member:', error);
      alert('שגיאה ביצירת מתאמן');
    } finally {
      setCreating(false);
    }
  };

  const handleArchiveMember = async (memberId: string, memberName: string, isArchived: boolean) => {
    const action = isArchived ? 'שחזור' : 'העברה לארכיון';
    if (!confirm(`האם אתה בטוח שברצונך ל${action} את ${memberName}?`)) {
      return;
    }

    try {
      await memberService.updateMember(memberId, { isArchived: !isArchived });
      alert(`${memberName} ${isArchived ? 'שוחזר' : 'הועבר לארכיון'} בהצלחה`);
      loadMembers();
    } catch (error) {
      console.error('Failed to archive member:', error);
      alert('שגיאה בביצוע הפעולה');
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

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Only show non-archived members
    return matchesSearch && !member.isArchived;
  });

  const activeMembers = members.filter(m => !m.isArchived);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in_debt':
        return 'bg-red-100 text-red-800';
      case 'no_classes':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'in_debt':
        return 'בחוב';
      case 'no_classes':
        return 'אין שיעורים';
      case 'archived':
        return 'ארכיון';
      default:
        return status;
    }
  };

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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ניהול מתאמנים</h2>
              <p className="text-sm text-gray-500">רשימת כל המתאמנים במערכת</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/archived-members')}
                disabled={archivedCount === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  archivedCount === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
                title={archivedCount === 0 ? 'אין מתאמנים בארכיון' : 'צפה במתאמנים בארכיון'}
              >
                <Archive className="w-5 h-5" />
                <span className="font-medium">ארכיון ({archivedCount})</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">מתאמן חדש</span>
              </button>
            </div>
          </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
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
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">#</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">שם</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">יתרת כסף</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">יתרת שיעורים</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">שולם השנה</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">נוכחויות השנה</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">תאריך לידה</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">טלפון</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">סטטוס</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    לא נמצאו מתאמנים
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => navigate(`/members/${member.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {member.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`font-semibold ${
                        member.debtAmount > 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {member.debtAmount > 0 ? `-${formatCurrency(member.debtAmount)}` : formatCurrency(0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`font-semibold ${
                          member.classesRemaining < 0
                            ? 'text-red-600'
                            : member.classesRemaining === 0
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {member.classesRemaining}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(member.amountPaidThisYear)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span className="font-semibold text-blue-600">
                        {member.attendanceCountThisYear}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                      {formatDate(member.dateOfBirth)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                      {member.phone || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {getStatusText(member.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap relative text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => navigate(`/members/${member.id}`)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="צפייה"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveMember(member.id, member.name, member.isArchived)}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded transition"
                          title={member.isArchived ? 'שחזור' : 'ארכיון'}
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

        {/* Archived Members Button */}
        {archivedCount > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/members/archived')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <Archive className="w-5 h-5" />
              <span className="font-medium">מתאמנים בארכיון ({archivedCount})</span>
            </button>
          </div>
        )}

        {/* Create Member Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">מתאמן חדש</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewMemberName('');
                    setNewMemberPhone('');
                    setNewMemberDOB('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם מלא *
                  </label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                    placeholder="הזן שם מלא"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    טלפון
                  </label>
                  <input
                    type="tel"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="05X-XXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תאריך לידה
                  </label>
                  <input
                    type="date"
                    value={newMemberDOB}
                    onChange={(e) => setNewMemberDOB(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {creating ? 'יוצר...' : 'צור מתאמן'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewMemberName('');
                      setNewMemberPhone('');
                      setNewMemberDOB('');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
