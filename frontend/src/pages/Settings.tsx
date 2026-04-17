import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { settingsService } from '../services/settingsService';
import { authService } from '../services/authService';
import type { Settings, PackageConfig } from '../types';
import { Save, Download, Upload, Key, Package as PackageIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { validateIntegerInput, validateNumericInput, validatePasswordInput } from '../utils/validation';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Package settings
  const [package1, setPackage1] = useState<PackageConfig>({ name: '', classCount: 0, price: 0 });
  const [package2, setPackage2] = useState<PackageConfig>({ name: '', classCount: 0, price: 0 });
  const [package3, setPackage3] = useState<PackageConfig>({ name: '', classCount: 0, price: 0 });
  const [package4, setPackage4] = useState<PackageConfig>({ name: '', classCount: 0, price: 0 });
  const [taxCap, setTaxCap] = useState<number | null>(null);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
      setPackage1(data.package1);
      setPackage2(data.package2);
      setPackage3(data.package3);
      setPackage4(data.package4);
      setTaxCap(data.yearlyTaxCap || null);
    } catch (error) {
      console.error('Failed to load settings:', error);
      alert('שגיאה בטעינת הגדרות');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings({
        package1,
        package2,
        package3,
        package4,
        yearlyTaxCap: taxCap,
      });
      alert('הגדרות נשמרו בהצלחה!');
      loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('שגיאה בשמירת הגדרות');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('הסיסמאות אינן תואמות');
      return;
    }

    if (newPassword.length < 6) {
      alert('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }

    try {
      await authService.updateCredentials(currentPassword, newUsername, newPassword);
      alert('פרטי התחברות עודכנו בהצלחה! יש להתחבר מחדש.');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to update credentials:', error);
      alert('שגיאה בעדכון פרטי התחברות. בדוק את הסיסמה הנוכחית.');
    }
  };

  const handleExport = async () => {
    try {
      const data = await settingsService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yfit-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('הנתונים יוצאו בהצלחה!');
    } catch (error) {
      console.error('Failed to export:', error);
      alert('שגיאה ביצוא נתונים');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('⚠️ אזהרה! פעולה זו תחליף את כל הנתונים הקיימים. האם להמשיך?')) {
      e.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await settingsService.importData(data);
      alert('הנתונים יובאו בהצלחה! העמוד ייטען מחדש.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to import:', error);
      alert('שגיאה ביבוא נתונים. בדוק שהקובץ תקין.');
      e.target.value = '';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>הגדרות</h2>
            <p className="text-sm text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>ניהול מערכת</p>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PackageIcon className="w-5 h-5" />
              הגדרות כרטיסיות
            </h2>

            <div className="space-y-4">
              {/* Package 1 */}
              <div className="border rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-3">כרטיסייה 1</div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="שם"
                    value={package1.name}
                    onChange={(e) => setPackage1({ ...package1, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="שיעורים"
                    value={package1.classCount}
                    onChange={(e) => setPackage1({ ...package1, classCount: parseInt(validateIntegerInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="מחיר ₪"
                    value={package1.price}
                    onChange={(e) => setPackage1({ ...package1, price: parseFloat(validateNumericInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Package 2 */}
              <div className="border rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-3">כרטיסייה 2</div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="שם"
                    value={package2.name}
                    onChange={(e) => setPackage2({ ...package2, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="שיעורים"
                    value={package2.classCount}
                    onChange={(e) => setPackage2({ ...package2, classCount: parseInt(validateIntegerInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="מחיר ₪"
                    value={package2.price}
                    onChange={(e) => setPackage2({ ...package2, price: parseFloat(validateNumericInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Package 3 */}
              <div className="border rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-3">כרטיסייה 3</div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="שם"
                    value={package3.name}
                    onChange={(e) => setPackage3({ ...package3, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="שיעורים"
                    value={package3.classCount}
                    onChange={(e) => setPackage3({ ...package3, classCount: parseInt(validateIntegerInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="מחיר ₪"
                    value={package3.price}
                    onChange={(e) => setPackage3({ ...package3, price: parseFloat(validateNumericInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Package 4 */}
              <div className="border rounded-lg p-4">
                <div className="font-medium text-gray-700 mb-3">כרטיסייה 4</div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="שם"
                    value={package4.name}
                    onChange={(e) => setPackage4({ ...package4, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="שיעורים"
                    value={package4.classCount}
                    onChange={(e) => setPackage4({ ...package4, classCount: parseInt(validateIntegerInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="מחיר ₪"
                    value={package4.price}
                    onChange={(e) => setPackage4({ ...package4, price: parseFloat(validateNumericInput(e.target.value)) || 0 })}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Tax Cap */}
              <div className="border rounded-lg p-4">
                <label className="block font-medium text-gray-700 mb-2">
                  תקרת מס שנתית (₪)
                </label>
                <input
                  type="number"
                  placeholder="לא מוגדר"
                  value={taxCap || ''}
                  onChange={(e) => setTaxCap(e.target.value ? parseFloat(validateNumericInput(e.target.value)) : null)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">השאר ריק אם אין תקרה</p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'שומר...' : 'שמור הגדרות'}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Password Change */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                שינוי פרטי התחברות
              </h2>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition text-gray-700 font-medium"
                >
                  שנה שם משתמש/סיסמה
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סיסמה נוכחית *
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(validatePasswordInput(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שם משתמש חדש *
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(validatePasswordInput(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סיסמה חדשה *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(validatePasswordInput(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      אימות סיסמה *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(validatePasswordInput(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
                    >
                      עדכן והתנתק
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      ביטול
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                ניהול נתונים
              </h2>

              <div className="space-y-3">
                {/* Export */}
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  ייצוא נתונים (Backup)
                </button>

                {/* Import */}
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="block w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    יבוא נתונים (שחזור)
                  </label>
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ אזהרה: יבוא נתונים יחליף את כל הנתונים הקיימים!
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 טיפים</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• גבה את הנתונים באופן קבוע</li>
                <li>• שנה את סיסמת ברירת המחדל</li>
                <li>• עדכן מחירי כרטיסיות בהתאם לעונה</li>
                <li>• תקרת המס היא לצורכי דיווח בלבד</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
