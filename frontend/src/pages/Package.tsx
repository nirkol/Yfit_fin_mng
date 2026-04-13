import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { memberService } from '../services/memberService';
import { yearService } from '../services/yearService';
import { settingsService } from '../services/settingsService';
import type { Member, Settings, PackageType } from '../types';
import { Package, CreditCard } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function PackageSales() {
  const navigate = useNavigate();
  const { selectedYear } = useYear();
  const [members, setMembers] = useState<Member[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedMember, setSelectedMember] = useState('');
  const [packageType, setPackageType] = useState<PackageType | 'adhoc'>('package1');
  const [classCount, setClassCount] = useState(20);
  const [price, setPrice] = useState(900);
  const [amountPaid, setAmountPaid] = useState(900);
  const [paymentMethod, setPaymentMethod] = useState('מזומן');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

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
      alert('בחר חבר');
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

      // Reset form
      setSelectedMember('');
      setPackageType('package1');
      handlePackageTypeChange('package1');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
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
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">מכירת כרטיסייה</h2>
            <p className="text-sm text-gray-500">שנה: {selectedYear}</p>
          </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">פרטי כרטיסייה</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                בחר חבר *
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">-- בחר חבר --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.phone || 'ללא טלפון'})
                  </option>
                ))}
              </select>
            </div>

            {/* Package Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג כרטיסייה *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {settings && Object.entries(settings).filter(([key]) => key.startsWith('package')).map(([key, pkg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePackageTypeChange(key as PackageType)}
                    className={`p-4 border-2 rounded-lg transition ${
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
                  className={`p-4 border-2 rounded-lg transition ${
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר שיעורים *
                  </label>
                  <input
                    type="number"
                    value={classCount}
                    onChange={(e) => setClassCount(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מחיר (₪) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPrice(val);
                      setAmountPaid(val);
                    }}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Amount Paid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סכום ששולם (₪) *
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              {amountPaid < price && (
                <p className="text-sm text-orange-600 mt-1">
                  חוב: ₪{(price - amountPaid).toFixed(2)}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                אמצעי תשלום
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תאריך רכישה *
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={submitting}
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
