import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { yearService } from '../services/yearService';
import type { MemberWithBalance } from '../types';
import { Users, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Members() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [members, setMembers] = useState<MemberWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [selectedYear, showArchived]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const balances = await yearService.getYearBalances(selectedYear);
      setMembers(balances);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchived = showArchived || !member.isArchived;
    return matchesSearch && matchesArchived;
  });

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
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">ניהול מתאמנים</h2>
            <p className="text-sm text-gray-500">רשימת כל המתאמנים במערכת</p>
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">הצג ארכיון</span>
            </label>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">טלפון</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">יתרת שיעורים</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">חוב</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    לא נמצאו מתאמנים
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {member.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          member.status
                        )}`}
                      >
                        {getStatusText(member.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.debtAmount > 0 ? (
                        <span className="text-red-600 font-semibold">
                          ₪{member.debtAmount.toFixed(0)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredMembers.length}</div>
              <div className="text-sm text-gray-600">סה״כ מתאמנים</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredMembers.filter((m) => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">פעילים</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredMembers.filter((m) => m.status === 'in_debt').length}
              </div>
              <div className="text-sm text-gray-600">בחוב</div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
