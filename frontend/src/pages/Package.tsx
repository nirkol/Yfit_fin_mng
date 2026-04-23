import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { memberService } from '../services/memberService';
import { yearService } from '../services/yearService';
import { settingsService } from '../services/settingsService';
import type { Member, Settings, PackageType } from '../types';
import { Package, CreditCard, Lock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { validateIntegerInput, validateNumericInput } from '../utils/validation';
import { useYearEditable } from '../hooks/useYearEditable';
import { getCurrentDate } from '../utils/testMode';

export default function PackageSales() {
  const navigate = useNavigate();
  const { selectedYear } = useYear();
  const isEditable = useYearEditable(selectedYear);
  const [members, setMembers] = useState<Member[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedMember, setSelectedMember] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [packageType, setPackageType] = useState<PackageType | 'adhoc'>('package1');
  const [classCount, setClassCount] = useState(20);
  const [price, setPrice] = useState(900);
  const [amountPaid, setAmountPaid] = useState(900);
  const [paymentMethod, setPaymentMethod] = useState('ביט');
  const [purchaseDate, setPurchaseDate] = useState(getCurrentDate().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.member-search-container')) {
        setShowMemberDropdown(false);
      }
    };

    if (showMemberDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMemberDropdown]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, settingsData] = await Promise.all([
        memberService.getMembers(false),
        settingsService.getSettings()
      ]);
      setMembers(membersData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageTypeChange = (type: PackageType | 'adhoc') => {
    setPackageType(type);
    if (type !== 'adhoc' && settings) {
      const pkg = settings[type as PackageType];
      setClassCount(pkg.classCount);
      setPrice(pkg.price);
      setAmountPaid(pkg.price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      alert('בחר מתאמן');
      return;
    }

    try {
      setSubmitting(true);
      await yearService.sellPackage(selectedYear, {
        memberId: selectedMember,
        packageType: packageType,
        price: price,
        classCount: classCount,
        amountPaid: amountPaid,
        purchaseDate: new Date(purchaseDate).toISOString(),
        paymentMethod: paymentMethod
      });

      alert('כרטיסייה נמכרה בהצלחה!');

      // Navigate back to members page
      navigate('/members');
    } catch (error) {
      console.error('Failed to sell package:', error);
      alert('שגיאה במכירת כרטיסייה');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" dir="rtl" style={{ background: 'var(--sidebar-bg)' }}>
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>מכירת כרטיסייה</h2>
            <p className="text-sm text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>שנה: {selectedYear}</p>
          </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">פרטי כרטיסייה</h2>
          </div>

          {!isEditable && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
              <Lock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-orange-800 font-semibold">שנה זו במצב קריאה בלבד</p>
                <p className="text-orange-700 text-sm">ניתן לערוך רק את השנה הנוכחית או את השנה הקודמת בחודש ינואר</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40 flex-shrink-0">
                בחר מתאמן *
              </label>
              <div className="flex-1 relative member-search-container">
                <input
                  type="text"
                  value={memberSearchTerm}
                  onChange={(e) => {
                    setMemberSearchTerm(e.target.value);
                    setShowMemberDropdown(true);
                    setSelectedMember('');
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  placeholder="הקלד לחיפוש מתאמן..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required={!selectedMember}
                />
                {showMemberDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {members
                      .filter(m =>
                        !m.isArchived &&
                        m.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
                      )
                      .map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(member.id);
                            setMemberSearchTerm(member.name);
                            setShowMemberDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-right hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{member.name}</div>
                          {member.phone && (
                            <div className="text-sm text-gray-500">{member.phone}</div>
                          )}
                        </button>
                      ))}
                    {members.filter(m => !m.isArchived && m.name.toLowerCase().includes(memberSearchTerm.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        לא נמצאו מתאמנים
                      </div>
                    )}
                  </div>
                )}
                {selectedMember && (
                  <input type="hidden" name="memberId" value={selectedMember} required />
                )}
              </div>
            </div>

            {/* Package Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג כרטיסייה *
              </label>
              <div className="flex gap-3">
                {settings && Object.entries(settings).filter(([key]) => key.startsWith('package')).map(([key, pkg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePackageTypeChange(key as PackageType)}
                    className={`flex-1 p-4 border-2 rounded-lg transition ${
                      packageType === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{pkg.name}</div>
                    <div className="text-sm text-gray-600">{pkg.classCount} שיעורים</div>
                    <div className="text-lg font-bold text-blue-600 mt-2">₪{pkg.price}</div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handlePackageTypeChange('adhoc')}
                  className={`flex-1 p-4 border-2 rounded-lg transition ${
                    packageType === 'adhoc'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">אחר</div>
                  <div className="text-sm text-gray-600">מותאם אישית</div>
                </button>
              </div>
            </div>

            {/* Custom Package Details */}
            {packageType === 'adhoc' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">
                      מספר שיעורים *
                    </label>
                    <input
                      type="number"
                      value={classCount}
                      onChange={(e) => setClassCount(parseInt(validateIntegerInput(e.target.value)) || 0)}
                      min="1"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">
                      סכום ששולם (₪) *
                    </label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => {
                        const val = parseFloat(validateNumericInput(e.target.value)) || 0;
                        setAmountPaid(val);
                        setPrice(val);
                      }}
                      min="0"
                      step="0.01"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Payment Method */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40 flex-shrink-0">
                אמצעי תשלום
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="מזומן">מזומן</option>
                <option value="Paybox">Paybox</option>
                <option value="העברה בנקאית">העברה בנקאית</option>
                <option value="ביט">ביט</option>
                <option value="אשראי">אשראי</option>
                <option value="אחר">אחר</option>
              </select>
            </div>

            {/* Purchase Date */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40 flex-shrink-0">
                תאריך רכישה *
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting || !isEditable}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                {submitting ? 'מבצע מכירה...' : 'מכור כרטיסייה'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/finance')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
  );
}
