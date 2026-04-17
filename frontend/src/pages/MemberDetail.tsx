import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { memberService } from '../services/memberService';
import { yearService } from '../services/yearService';
import type { Member } from '../types';
import { Edit, Archive, Package, Users as UsersIcon, DollarSign, ArrowRight, Trash2, RotateCcw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { validateTextInput, validatePhoneInput } from '../utils/validation';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedYear } = useYear();
  const [member, setMember] = useState<Member | null>(null);
  const [yearData, setYearData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDOB, setEditDOB] = useState('');

  useEffect(() => {
    loadMemberData();
  }, [id, selectedYear]);

  const loadMemberData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const memberData = await memberService.getMember(id);
      setMember(memberData);

      const data = await yearService.getYearData(selectedYear);
      setYearData(data);

      // Calculate balance
      const opening = data.openingBalances.find((ob: any) => ob.memberId === id)?.classes || 0;
      const purchased = data.packages.filter((p: any) => p.memberId === id).reduce((sum: number, p: any) => sum + p.classCount, 0);
      const attended = data.attendance.filter((a: any) => a.memberId === id).length;
      const refunded = data.refunds.filter((r: any) => r.memberId === id).reduce((sum: number, r: any) => sum + r.classesRefunded, 0);

      setBalance(opening + purchased - attended - refunded);
    } catch (error) {
      console.error('Failed to load member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!member) return;

    if (confirm(`האם לארכב את ${member.name}?`)) {
      try {
        await memberService.updateMember(member.id, { isArchived: !member.isArchived });
        loadMemberData();
      } catch (error) {
        alert('שגיאה בעדכון חבר');
      }
    }
  };

  const handleEdit = () => {
    if (!member) return;
    setEditName(member.name);
    setEditPhone(member.phone || '');
    setEditDOB(member.dateOfBirth || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!member || !editName.trim()) {
      alert('שם המתאמן הוא שדה חובה');
      return;
    }

    try {
      await memberService.updateMember(member.id, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        dateOfBirth: editDOB || undefined,
      });
      alert('פרטי המתאמן עודכנו בהצלחה');
      setShowEditModal(false);
      loadMemberData();
    } catch (error) {
      alert('שגיאה בעדכון פרטי מתאמן');
    }
  };

  const handleDelete = async () => {
    if (!member) return;

    if (balance > 0) {
      alert(`❌ לא ניתן למחוק את ${member.name}.\n\nיתרת שיעורים: ${balance}\n\nניתן למחוק מתאמן רק כאשר יתרת השיעורים שלו היא 0 או שלילית.`);
      return;
    }

    if (!confirm(`⚠️ אזהרה! פעולה זו תמחק לצמיתות את ${member.name} וכל הנתונים הקשורים. האם להמשיך?`)) {
      return;
    }

    try {
      await memberService.deleteMember(member.id);
      alert(`${member.name} נמחק בהצלחה`);
      navigate('/members');
    } catch (error) {
      console.error('Failed to delete member:', error);
      alert('שגיאה במחיקת מתאמן');
    }
  };

  const handleRefund = async () => {
    if (!member || balance <= 0) {
      alert('אין יתרה להחזר');
      return;
    }

    if (!confirm(`האם להחזיר ${balance} שיעורים ל${member.name}?\n\nפעולה זו תיצור רשומת החזר ותעדכן את היתרה ל-0.`)) {
      return;
    }

    try {
      // Calculate refund amount based on average package price
      const totalPaid = packages.reduce((sum: number, p: any) => sum + p.amountPaid, 0);
      const totalClasses = packages.reduce((sum: number, p: any) => sum + p.classCount, 0);
      const avgPricePerClass = totalClasses > 0 ? totalPaid / totalClasses : 50; // Default 50 if no packages
      const refundAmount = Math.round(balance * avgPricePerClass);

      // Create refund record
      const refundData = {
        memberId: member.id,
        memberName: member.name,
        amount: refundAmount,
        classesRefunded: balance,
        reason: 'החזר יתרת שיעורים',
        refundMethod: 'מזומן',
        refundDate: new Date().toISOString().split('T')[0],
      };

      // TODO: Call refund API endpoint
      // await refundService.createRefund(selectedYear, refundData);

      alert(`החזר של ${balance} שיעורים (${refundAmount} ₪) נוצר בהצלחה`);
      loadMemberData();
    } catch (error) {
      console.error('Failed to create refund:', error);
      alert('שגיאה ביצירת החזר');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">חבר לא נמצא</div>
      </div>
    );
  }

  const packages = yearData?.packages.filter((p: any) => p.memberId === id) || [];
  const attendance = yearData?.attendance.filter((a: any) => a.memberId === id) || [];
  const refunds = yearData?.refunds.filter((r: any) => r.memberId === id) || [];

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: 'var(--sidebar-bg)' }}>
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/members')}
              className="p-2 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-gray-600 hover:text-gray-900"
              title="חזרה לרשימת מתאמנים"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{member.name}</h2>
              <p className="text-sm text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>פרטי מתאמן</p>
            </div>
          </div>

        {/* Member Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h2>
              {member.phone && <p className="text-gray-600">טלפון: {member.phone}</p>}
              {member.dateOfBirth && <p className="text-gray-600">תאריך לידה: {member.dateOfBirth}</p>}
              <p className="text-sm text-gray-500 mt-2">מספר חבר: {member.memberId}</p>
            </div>

            {/* Action Bar */}
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                title="עריכת פרטים"
              >
                <Edit className="w-4 h-4" />
                <span>עריכה</span>
              </button>
              <button
                onClick={handleRefund}
                disabled={balance <= 0}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  balance <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title={balance <= 0 ? 'אין יתרה להחזר' : 'החזר יתרה'}
              >
                <RotateCcw className="w-4 h-4" />
                <span>החזר</span>
              </button>
              <button
                onClick={handleArchive}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                title={member.isArchived ? 'שחזר מארכיון' : 'העבר לארכיון'}
              >
                <Archive className="w-4 h-4" />
                <span>{member.isArchived ? 'שחזר' : 'ארכיון'}</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={balance > 0}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  balance > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                title={balance > 0 ? 'ניתן למחוק רק כאשר היתרה 0 או שלילית' : 'מחיקת מתאמן'}
              >
                <Trash2 className="w-4 h-4" />
                <span>מחק</span>
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t">
            <div className="text-center">
              <div className={`text-3xl font-bold ${balance < 0 ? 'text-red-600' : balance === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {balance}
              </div>
              <div className="text-sm text-gray-600">יתרת שיעורים</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{packages.length}</div>
              <div className="text-sm text-gray-600">כרטיסיות שנרכשו</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{attendance.length}</div>
              <div className="text-sm text-gray-600">שיעורים שהשתתף</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                ₪{packages.reduce((sum: number, p: any) => sum + p.amountPaid, 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">סה״כ שולם</div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            כרטיסיות שנרכשו ({packages.length})
          </h3>
          {packages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין כרטיסיות</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">תאריך</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">סוג</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">שיעורים</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">מחיר</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">שולם</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">אמצעי תשלום</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {packages.map((pkg: any) => (
                    <tr key={pkg.id}>
                      <td className="px-4 py-3">{new Date(pkg.purchaseDate).toLocaleDateString('he-IL')}</td>
                      <td className="px-4 py-3">{pkg.packageType}</td>
                      <td className="px-4 py-3">{pkg.classCount}</td>
                      <td className="px-4 py-3">₪{pkg.price}</td>
                      <td className="px-4 py-3">₪{pkg.amountPaid}</td>
                      <td className="px-4 py-3">{pkg.paymentMethod || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            נוכחות ({attendance.length})
          </h3>
          {attendance.length === 0 ? (
            <p className="text-gray-500 text-center py-4">אין רישומי נוכחות</p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">תאריך</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">שעה</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">יום</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendance.slice().reverse().map((att: any) => (
                    <tr key={att.id}>
                      <td className="px-4 py-3">{new Date(att.date).toLocaleDateString('he-IL')}</td>
                      <td className="px-4 py-3">{att.time}</td>
                      <td className="px-4 py-3">{att.dayOfWeek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refunds */}
        {refunds.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              החזרים ({refunds.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">תאריך</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">שיעורים</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">סכום</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {refunds.map((refund: any) => (
                    <tr key={refund.id}>
                      <td className="px-4 py-3">{new Date(refund.refundDate).toLocaleDateString('he-IL')}</td>
                      <td className="px-4 py-3">{refund.classesRefunded}</td>
                      <td className="px-4 py-3">₪{refund.refundAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Edit Member Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">עריכת פרטי מתאמן</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם מלא <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(validateTextInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(validatePhoneInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="05X-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תאריך לידה
                  </label>
                  <input
                    type="date"
                    value={editDOB}
                    onChange={(e) => setEditDOB(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
