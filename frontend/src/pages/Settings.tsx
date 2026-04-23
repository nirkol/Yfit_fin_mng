import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useYear } from '../contexts/YearContext';
import { settingsService } from '../services/settingsService';
import { authService } from '../services/authService';
import { yearService } from '../services/yearService';
import { memberService } from '../services/memberService';
import { reportService } from '../services/reportService';
import { systemService } from '../services/systemService';
import type { Settings, PackageConfig, MemberWithBalance } from '../types';
import { Save, Download, Upload, Key, Package as PackageIcon, FileText, Calendar, Users, Shield, FolderOpen, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { validateIntegerInput, validateNumericInput, validatePasswordInput } from '../utils/validation';

interface Report {
  filename: string;
  year: string;
  reportType: string;
  size: number;
  createdAt: string;
  path: string;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { selectedYear } = useYear();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportPreview, setReportPreview] = useState<string | null>(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportFileName, setReportFileName] = useState<string>('');

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

  // Advanced admin section
  const [showAdvancedAdmin, setShowAdvancedAdmin] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPasswordChange, setShowAdminPasswordChange] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('koladmin');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmNewAdminPassword, setConfirmNewAdminPassword] = useState('');
  const [showMemberBalanceEdit, setShowMemberBalanceEdit] = useState(false);
  const [membersWithBalance, setMembersWithBalance] = useState<MemberWithBalance[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberWithBalance | null>(null);
  const [editedClassBalance, setEditedClassBalance] = useState<number>(0);
  const [editedMoneyBalance, setEditedMoneyBalance] = useState<number>(0);
  const [savingBalance, setSavingBalance] = useState(false);

  // Reports section
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

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

  const handleResetAllData = async () => {
    const confirmation = confirm(
      '🚨 אזהרה קריטית! 🚨\n\n' +
      'פעולה זו תמחק לצמיתות את כל הנתונים במערכת:\n' +
      '• כל המתאמנים\n' +
      '• כל השנים\n' +
      '• כל החבילות\n' +
      '• כל הנוכחויות\n' +
      '• כל ההחזרים\n\n' +
      'לא ניתן לשחזר את הנתונים לאחר המחיקה!\n\n' +
      'האם אתה בטוח לחלוטין שברצונך להמשיך?'
    );

    if (!confirmation) return;

    const doubleConfirmation = confirm(
      '⚠️ אישור סופי!\n\n' +
      'זוהי ההזדמנות האחרונה שלך לבטל!\n' +
      'כל הנתונים יימחקו ללא אפשרות שחזור.\n\n' +
      'האם להמשיך עם המחיקה?'
    );

    if (!doubleConfirmation) return;

    try {
      await systemService.resetAllData();
      alert('✅ כל הנתונים נמחקו בהצלחה!\n\nהעמוד ייטען מחדש.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset data:', error);
      alert('❌ שגיאה באיפוס הנתונים');
    }
  };

  const loadMembersWithBalance = async () => {
    try {
      const balances = await yearService.getYearBalances(selectedYear);
      setMembersWithBalance(balances.filter(m => !m.isArchived));
    } catch (error) {
      console.error('Failed to load members:', error);
      alert('שגיאה בטעינת רשימת מתאמנים');
    }
  };

  const handleOpenMemberBalanceEdit = async () => {
    await loadMembersWithBalance();
    setShowMemberBalanceEdit(true);
  };

  const handleAdminAuth = async () => {
    try {
      const result = await systemService.authenticateAdmin(adminUsername.trim(), adminPassword.trim());

      if (result.success) {
        setAdminAuthenticated(true);
        setAdminUsername('');
        setAdminPassword('');
      } else {
        alert('שם משתמש או סיסמה שגויים');
        setAdminPassword('');
      }
    } catch (error) {
      console.error('Admin auth error:', error);
      alert('שגיאה באימות מנהל');
      setAdminPassword('');
    }
  };

  const handleToggleAdvancedAdmin = () => {
    if (!showAdvancedAdmin) {
      // Opening - reset authentication
      setAdminAuthenticated(false);
      setAdminUsername('');
      setAdminPassword('');
    }
    setShowAdvancedAdmin(!showAdvancedAdmin);
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newAdminPassword.length < 6) {
      alert('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }

    if (newAdminPassword !== confirmNewAdminPassword) {
      alert('הסיסמאות אינן תואמות');
      return;
    }

    try {
      await systemService.updateAdminCredentials(newAdminUsername, newAdminPassword);
      alert('פרטי מנהל עודכנו בהצלחה!');
      setShowAdminPasswordChange(false);
      setNewAdminUsername('koladmin');
      setNewAdminPassword('');
      setConfirmNewAdminPassword('');

      // Close admin section and require re-authentication
      setAdminAuthenticated(false);
      setShowAdvancedAdmin(false);
    } catch (error) {
      console.error('Failed to update admin credentials:', error);
      alert('שגיאה בעדכון פרטי מנהל');
    }
  };

  const handleSelectMemberForEdit = (member: MemberWithBalance) => {
    setSelectedMember(member);
    setEditedClassBalance(member.classesRemaining);
    setEditedMoneyBalance(member.moneyBalance);
  };

  const handleSaveMemberBalance = async () => {
    if (!selectedMember) return;

    try {
      setSavingBalance(true);

      // Update opening balance with both class balance and money balance
      await yearService.setOpeningBalance(
        selectedYear,
        selectedMember.id,
        editedClassBalance,
        editedMoneyBalance
      );

      alert('יתרת המתאמן עודכנה בהצלחה!');

      // Reload members
      await loadMembersWithBalance();
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to update member balance:', error);
      alert('שגיאה בעדכון יתרת מתאמן');
    } finally {
      setSavingBalance(false);
    }
  };

  const handleGenerateMonthlyReport = async () => {
    try {
      setGeneratingReport(true);

      // Fetch all required data
      const yearData = await yearService.getYearData(selectedYear);
      const members = await memberService.getMembers();
      const membersWithBalance = await yearService.getYearBalances(selectedYear);
      const activeMembers = members.filter(m => !m.isArchived);

      // Get current date and calculate month range
      const now = new Date();
      const currentYear = parseInt(selectedYear);
      const currentMonth = now.getMonth(); // 0-indexed
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = now;

      // Calculate beginning of month date (for balance comparison)
      const monthStartForBalance = new Date(currentYear, currentMonth, 1);

      // Filter packages for this month
      const allPackages = yearData.packages || [];
      const monthlyPackages = allPackages.filter((pkg: any) => {
        const pkgDate = new Date(pkg.purchaseDate);
        return pkgDate >= monthStart && pkgDate <= monthEnd;
      });

      // Filter refunds for this month
      const allRefunds = yearData.refunds || [];
      const monthlyRefunds = allRefunds.filter((ref: any) => {
        const refDate = new Date(ref.refundDate);
        return refDate >= monthStart && refDate <= monthEnd;
      });

      // Filter attendance for this month
      const allAttendance = yearData.attendance || [];
      const monthlyAttendance = allAttendance.filter((att: any) => {
        const attDate = new Date(att.date);
        return attDate >= monthStart && attDate <= monthEnd;
      });

      // Calculate finance statistics
      const totalRevenue = monthlyPackages.reduce((sum: number, pkg: any) => sum + (pkg.amountPaid || 0), 0);
      const totalRefunds = monthlyRefunds.reduce((sum: number, ref: any) => sum + (ref.amount || 0), 0);
      const netRevenue = totalRevenue - totalRefunds;

      // Payment methods breakdown
      const paymentMethods = monthlyPackages.reduce((acc: any, pkg: any) => {
        const method = pkg.paymentMethod || 'אחר';
        acc[method] = (acc[method] || 0) + (pkg.amountPaid || 0);
        return acc;
      }, {});

      // Calculate attendance statistics
      const uniqueMembersSet = new Set<string>();
      monthlyAttendance.forEach((att: any) => {
        uniqueMembersSet.add(att.memberId);
      });
      const uniqueMembers = uniqueMembersSet.size;

      // Group attendance by class (date+time)
      const classesMap = new Map<string, { date: string; time: string; members: Array<{ id: string; name: string }> }>();
      monthlyAttendance.forEach((att: any) => {
        const classKey = `${att.date}-${att.time}`;
        if (!classesMap.has(classKey)) {
          classesMap.set(classKey, { date: att.date, time: att.time, members: [] });
        }
        const member = members.find((m: any) => m.id === att.memberId);
        if (member) {
          classesMap.get(classKey)!.members.push({ id: member.id, name: member.name });
        }
      });

      const uniqueClassCount = classesMap.size;
      const totalAttendance = monthlyAttendance.length;
      const avgAttendeesPerClass = uniqueClassCount > 0
        ? totalAttendance / uniqueClassCount
        : 0;

      // Calculate beginning of month balances
      // Get all transactions up to the beginning of this month
      const packagesUntilMonthStart = allPackages.filter((pkg: any) => {
        const pkgDate = new Date(pkg.purchaseDate);
        return pkgDate < monthStart;
      });
      const attendanceUntilMonthStart = allAttendance.filter((att: any) => {
        const attDate = new Date(att.date);
        return attDate < monthStart;
      });

      // Calculate beginning of month balance per member
      const beginningBalances = new Map<string, { classesRemaining: number; debtAmount: number }>();

      // Get settings for price per class calculation
      const settingsData = await settingsService.getSettings();
      const pricePerClass = settingsData?.package1?.price && settingsData?.package1?.classCount
        ? settingsData.package1.price / settingsData.package1.classCount
        : 50; // Default price per class

      // Start with opening balances
      const openingBalances = yearData.openingBalances || [];
      openingBalances.forEach((ob: any) => {
        const classesRemaining = ob.classesRemaining || 0;
        const debtAmount = classesRemaining < 0 ? Math.abs(classesRemaining) * pricePerClass : 0;
        beginningBalances.set(ob.memberId, { classesRemaining, debtAmount });
      });

      // Add packages purchased before this month
      packagesUntilMonthStart.forEach((pkg: any) => {
        const current = beginningBalances.get(pkg.memberId) || { classesRemaining: 0, debtAmount: 0 };
        current.classesRemaining += (pkg.classCount || 0);
        // Recalculate debt
        current.debtAmount = current.classesRemaining < 0 ? Math.abs(current.classesRemaining) * pricePerClass : 0;
        beginningBalances.set(pkg.memberId, current);
      });

      // Subtract attendance before this month
      attendanceUntilMonthStart.forEach((att: any) => {
        const current = beginningBalances.get(att.memberId) || { classesRemaining: 0, debtAmount: 0 };
        current.classesRemaining -= 1;
        // Recalculate debt
        current.debtAmount = current.classesRemaining < 0 ? Math.abs(current.classesRemaining) * pricePerClass : 0;
        beginningBalances.set(att.memberId, current);
      });

      // Build markdown report
      const monthName = now.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
      let markdown = `# YFit - דוח חודשי ${monthName}\n\n`;
      markdown += `**תאריך הפקה:** ${now.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
      markdown += `**תקופת הדוח:** ${monthStart.toLocaleDateString('he-IL')} - ${monthEnd.toLocaleDateString('he-IL')}\n\n`;
      markdown += `---\n\n`;

      // Finance Statistics
      markdown += `## 💰 סטטיסטיקות פיננסיות - ${monthName}\n\n`;
      markdown += `| מדד | ערך |\n`;
      markdown += `|-----:|:-----|\n`;
      markdown += `| **סה"כ הכנסות** | ₪${totalRevenue.toLocaleString()} |\n`;
      markdown += `| **סה"כ זיכויים** | ₪${totalRefunds.toLocaleString()} |\n`;
      markdown += `| **הכנסות נטו** | ₪${netRevenue.toLocaleString()} |\n`;
      markdown += `| **כרטיסיות שנמכרו** | ${monthlyPackages.length} |\n`;
      markdown += `| **זיכויים שבוצעו** | ${monthlyRefunds.length} |\n\n`;

      // Payment methods
      if (Object.keys(paymentMethods).length > 0) {
        markdown += `### התפלגות אמצעי תשלום\n\n`;
        markdown += `| אמצעי תשלום | סכום |\n`;
        markdown += `|------------:|:------|\n`;
        Object.entries(paymentMethods).forEach(([method, amount]: [string, any]) => {
          markdown += `| ${method} | ₪${amount.toLocaleString()} |\n`;
        });
        markdown += `\n`;
      }

      // Packages sold this month
      markdown += `## 📦 כרטיסיות שנמכרו החודש\n\n`;
      if (monthlyPackages.length === 0) {
        markdown += `*לא נמכרו כרטיסיות החודש*\n\n`;
      } else {
        markdown += `| תאריך | שם מתאמן | כרטיסייה | מספר שיעורים | מחיר | אמצעי תשלום |\n`;
        markdown += `|-------:|:-----------:|:-----------:|:---------------:|:------:|:-------------|\n`;
        monthlyPackages.sort((a: any, b: any) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        monthlyPackages.forEach((pkg: any) => {
          const member = members.find((m: any) => m.id === pkg.memberId);
          const purchaseDate = new Date(pkg.purchaseDate).toLocaleDateString('he-IL');
          const packageName = settings && pkg.packageType in settings
            ? settings[pkg.packageType as keyof Settings].name
            : pkg.packageType;
          markdown += `| ${purchaseDate} | ${member?.name || pkg.memberName || 'לא ידוע'} | ${packageName || '-'} | ${pkg.classCount || 0} | ₪${(pkg.amountPaid || 0).toLocaleString()} | ${pkg.paymentMethod || '-'} |\n`;
        });
        markdown += `\n`;
      }

      // Refunds this month
      if (monthlyRefunds.length > 0) {
        markdown += `## 💸 זיכויים שבוצעו החודש\n\n`;
        markdown += `| תאריך | שם מתאמן | סכום | סיבה | אמצעי זיכוי |\n`;
        markdown += `|-------:|:-----------:|:------:|:------:|:------------|\n`;
        monthlyRefunds.sort((a: any, b: any) => new Date(b.refundDate).getTime() - new Date(a.refundDate).getTime());
        monthlyRefunds.forEach((ref: any) => {
          const refundDate = new Date(ref.refundDate).toLocaleDateString('he-IL');
          markdown += `| ${refundDate} | ${ref.memberName || 'לא ידוע'} | ₪${(ref.amount || 0).toLocaleString()} | ${ref.reason || '-'} | ${ref.refundMethod || '-'} |\n`;
        });
        markdown += `\n`;
      }

      // Attendance Statistics
      markdown += `## 👥 סטטיסטיקות נוכחות - ${monthName}\n\n`;
      markdown += `| מדד | ערך |\n`;
      markdown += `|-----:|:-----|\n`;
      markdown += `| **סה"כ שיעורים שהתקיימו** | ${uniqueClassCount} |\n`;
      markdown += `| **סה"כ מתאמנים ייחודיים** | ${uniqueMembers} |\n`;
      markdown += `| **סה"כ השתתפויות** | ${totalAttendance} |\n`;
      markdown += `| **ממוצע משתתפים לשיעור** | ${avgAttendeesPerClass.toFixed(1)} |\n\n`;

      // Class History - All classes this month with attendees
      markdown += `## 📅 היסטוריית שיעורים - ${monthName}\n\n`;
      if (uniqueClassCount === 0) {
        markdown += `*לא התקיימו שיעורים החודש*\n\n`;
      } else {
        const sortedClasses = Array.from(classesMap.entries()).sort((a, b) => {
          const dateA = new Date(`${a[1].date} ${a[1].time}`);
          const dateB = new Date(`${b[1].date} ${b[1].time}`);
          return dateB.getTime() - dateA.getTime();
        });

        sortedClasses.forEach(([key, classData], index) => {
          const classDate = new Date(classData.date);
          const hebrewDate = classDate.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          const memberNames = classData.members.map(m => m.name).join(', ');
          markdown += `### ${hebrewDate} - ${classData.time}\n\n`;
          markdown += `**מספר משתתפים:** ${classData.members.length}\n\n`;
          markdown += `**משתתפים:** ${memberNames}\n\n`;
          // Add separator line between classes (except after the last one)
          if (index < sortedClasses.length - 1) {
            markdown += `---\n\n`;
          }
        });
      }

      // Member Balance Comparison Table
      markdown += `## 📊 השוואת יתרות מתאמנים\n\n`;
      markdown += `| מזהה | שם | יתרת שיעורים תחילת חודש | יתרת שיעורים נוכחית | שינוי שיעורים | יתרת כסף תחילת חודש (₪) | יתרת כסף נוכחית (₪) | שיעורים החודש | סטטוס |\n`;
      markdown += `|------:|:-----------:|:------------------------:|:---------------------:|:---------------:|:-------------------------:|:--------------------:|:----------------:|:--------|\n`;

      activeMembers.forEach((member: any) => {
        const memberBalance = membersWithBalance.find((m: any) => m.id === member.id);
        const currentClassBalance = memberBalance?.classesRemaining || 0;
        const currentDebtAmount = memberBalance?.debtAmount || 0;

        const beginningData = beginningBalances.get(member.id) || { classesRemaining: 0, debtAmount: 0 };
        const beginningClassBalance = beginningData.classesRemaining;
        const beginningDebtAmount = beginningData.debtAmount;

        const balanceChange = currentClassBalance - beginningClassBalance;

        // Count classes attended this month
        const classesThisMonth = monthlyAttendance.filter((att: any) => att.memberId === member.id).length;

        // Determine status
        let status = 'פעיל';
        if (member.isArchived) status = 'מבוטל';
        else if (currentClassBalance < 0) status = 'חוב';
        else if (currentClassBalance === 0) status = 'אין שיעורים';

        const changeIndicator = balanceChange > 0 ? `+${balanceChange}` : balanceChange.toString();

        markdown += `| ${member.memberId || member.id} | ${member.name} | ${beginningClassBalance} | ${currentClassBalance} | ${changeIndicator} | ${beginningDebtAmount.toLocaleString()} | ${currentDebtAmount.toLocaleString()} | ${classesThisMonth} | ${status} |\n`;
      });
      markdown += `\n`;

      markdown += `---\n\n`;
      markdown += `*דוח זה הופק אוטומטית ממערכת YFit לניהול פיננסי*\n`;

      // Show preview popup
      const fullDate = now.toISOString().split('T')[0];
      setReportFileName(`yfit_monthly_report_${fullDate}.md`);
      setReportPreview(markdown);
      setShowReportPreview(true);
    } catch (error) {
      console.error('Failed to generate monthly report:', error);
      alert('שגיאה ביצירת דוח חודשי');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleGenerateYTDReport = async () => {
    try {
      setGeneratingReport(true);

      // Fetch all required data
      const yearData = await yearService.getYearData(selectedYear);
      const members = await memberService.getMembers();
      const membersWithBalance = await yearService.getYearBalances(selectedYear);
      const activeMembers = members.filter(m => !m.isArchived);

      // Get current date and start of year for YTD filtering
      const now = new Date();
      const currentYear = parseInt(selectedYear);
      const yearStart = new Date(currentYear, 0, 1); // January 1st of selected year

      // Only filter for YTD if viewing current year, otherwise show full year
      const isCurrentYear = currentYear === now.getFullYear();

      // Filter packages for YTD (from start of year to today)
      const allPackages = yearData.packages || [];
      const packages = isCurrentYear
        ? allPackages.filter((pkg: any) => {
            const pkgDate = new Date(pkg.purchaseDate);
            return pkgDate >= yearStart && pkgDate <= now;
          })
        : allPackages;

      // Filter refunds for YTD
      const allRefunds = yearData.refunds || [];
      const refunds = isCurrentYear
        ? allRefunds.filter((ref: any) => {
            const refDate = new Date(ref.refundDate);
            return refDate >= yearStart && refDate <= now;
          })
        : allRefunds;

      // Calculate finance statistics
      const totalRevenue = packages.reduce((sum: number, pkg: any) => sum + (pkg.amountPaid || 0), 0);
      const totalRefunds = refunds.reduce((sum: number, ref: any) => sum + (ref.amount || 0), 0);
      const netRevenue = totalRevenue - totalRefunds;

      // Payment methods breakdown
      const paymentMethods = packages.reduce((acc: any, pkg: any) => {
        const method = pkg.paymentMethod || 'אחר';
        acc[method] = (acc[method] || 0) + (pkg.amountPaid || 0);
        return acc;
      }, {});

      // Filter attendance for YTD
      const allAttendance = yearData.attendance || [];
      const attendance = isCurrentYear
        ? allAttendance.filter((att: any) => {
            const attDate = new Date(att.date);
            return attDate >= yearStart && attDate <= now;
          })
        : allAttendance;

      // Calculate attendance statistics - FIXED
      const totalClasses = attendance.length;

      // Count unique members who attended
      const uniqueMembersSet = new Set<string>();
      attendance.forEach((att: any) => {
        uniqueMembersSet.add(att.memberId);
      });
      const uniqueMembers = uniqueMembersSet.size;

      // Total attendance count
      const totalAttendance = attendance.length;

      // Average attendees per class - need to group by date+time
      const classesMap = new Map<string, Set<string>>();
      attendance.forEach((att: any) => {
        const classKey = `${att.date}-${att.time}`;
        if (!classesMap.has(classKey)) {
          classesMap.set(classKey, new Set());
        }
        classesMap.get(classKey)!.add(att.memberId);
      });

      const uniqueClassCount = classesMap.size;
      const avgAttendeesPerClass = uniqueClassCount > 0
        ? Array.from(classesMap.values()).reduce((sum, set) => sum + set.size, 0) / uniqueClassCount
        : 0;

      // Calculate monthly active members
      const monthlyActive: { [key: string]: Set<string> } = {};
      attendance.forEach((att: any) => {
        const month = new Date(att.date).toISOString().substring(0, 7);
        if (!monthlyActive[month]) monthlyActive[month] = new Set();
        monthlyActive[month].add(att.memberId);
      });
      const avgActivePerMonth = Object.keys(monthlyActive).length > 0
        ? Object.values(monthlyActive).reduce((sum, set) => sum + set.size, 0) / Object.keys(monthlyActive).length
        : 0;

      // Build markdown report
      const reportTitle = isCurrentYear
        ? `# YFit - דוח מצטבר ${selectedYear} (מתחילת השנה עד ${now.toLocaleDateString('he-IL')})`
        : `# YFit - דוח שנתי ${selectedYear}`;
      let markdown = `${reportTitle}\n\n`;
      markdown += `**תאריך הפקה:** ${new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
      markdown += `---\n\n`;

      // Finance Statistics
      markdown += `## 📊 סטטיסטיקות פינסיות\n\n`;
      markdown += `| מדד | ערך |\n`;
      markdown += `|-----|-----|\n`;
      markdown += `| **סה"כ הכנסות** | ₪${totalRevenue.toLocaleString()} |\n`;
      markdown += `| **סה"כ זיכויים** | ₪${totalRefunds.toLocaleString()} |\n`;
      markdown += `| **הכנסות נטו** | ₪${netRevenue.toLocaleString()} |\n`;
      markdown += `| **מספר כרטיסיות** | ${packages.length} |\n`;
      markdown += `| **מספר זיכויים** | ${refunds.length} |\n\n`;

      // Payment methods
      markdown += `### התפלגות אמצעי תשלום\n\n`;
      markdown += `| אמצעי תשלום | סכום |\n`;
      markdown += `|------------|------|\n`;
      Object.entries(paymentMethods).forEach(([method, amount]: [string, any]) => {
        markdown += `| ${method} | ₪${amount.toLocaleString()} |\n`;
      });
      markdown += `\n`;

      // Attendance Statistics
      markdown += `## 👥 סטטיסטיקות נוכחות\n\n`;
      markdown += `| מדד | ערך |\n`;
      markdown += `|-----|-----|\n`;
      markdown += `| **סה"כ שיעורים שהתקיימו** | ${uniqueClassCount} |\n`;
      markdown += `| **סה"כ מתאמנים ייחודיים** | ${uniqueMembers} |\n`;
      markdown += `| **סה"כ השתתפויות** | ${totalAttendance} |\n`;
      markdown += `| **ממוצע מתאמנים אקטיבים בחודש** | ${avgActivePerMonth.toFixed(1)} |\n`;
      markdown += `| **ממוצע משתתפים לשיעור** | ${avgAttendeesPerClass.toFixed(1)} |\n\n`;

      // Calculate per-member YTD statistics
      const memberStats = new Map<string, { attendanceCount: number; amountPaid: number }>();

      // Count attendance per member (YTD)
      attendance.forEach((att: any) => {
        if (!memberStats.has(att.memberId)) {
          memberStats.set(att.memberId, { attendanceCount: 0, amountPaid: 0 });
        }
        memberStats.get(att.memberId)!.attendanceCount++;
      });

      // Calculate amount paid per member (YTD)
      packages.forEach((pkg: any) => {
        if (!memberStats.has(pkg.memberId)) {
          memberStats.set(pkg.memberId, { attendanceCount: 0, amountPaid: 0 });
        }
        memberStats.get(pkg.memberId)!.amountPaid += (pkg.amountPaid || 0);
      });

      // Members Table - Include all fields plus YTD stats
      markdown += `## 📋 טבלת מתאמנים\n\n`;
      markdown += `| מזהה | שם | טלפון | תאריך לידה | גיל | יתרת שיעורים נוכחית | יתרת כסף נוכחית (₪) | סכום ששולם השנה (₪) | שיעורים שהשתתף השנה | סטטוס | תאריך הצטרפות |\n`;
      markdown += `|------|-----|--------|------------|-----|---------------------|---------------------|---------------------|---------------------|--------|----------------|\n`;

      activeMembers.forEach((member: any) => {
        const birthDate = member.dateOfBirth ? new Date(member.dateOfBirth) : null;
        const age = birthDate
          ? new Date().getFullYear() - birthDate.getFullYear()
          : '-';
        const formattedDate = birthDate
          ? birthDate.toLocaleDateString('he-IL')
          : '-';
        const createdDate = member.createdAt
          ? new Date(member.createdAt).toLocaleDateString('he-IL')
          : '-';

        // Get balance info from membersWithBalance
        const memberBalance = membersWithBalance.find((m: any) => m.id === member.id);
        const classesRemaining = memberBalance?.classesRemaining || 0;
        const debtAmount = memberBalance?.debtAmount || 0;

        // Determine status
        let status = 'פעיל';
        if (member.isArchived) status = 'מבוטל';
        else if (classesRemaining < 0) status = 'חוב';
        else if (classesRemaining === 0) status = 'אין שיעורים';

        // Get YTD stats
        const stats = memberStats.get(member.id) || { attendanceCount: 0, amountPaid: 0 };

        markdown += `| ${member.memberId || member.id} | ${member.name} | ${member.phone || '-'} | ${formattedDate} | ${age} | ${classesRemaining} | ${debtAmount > 0 ? debtAmount.toLocaleString() : '0'} | ${stats.amountPaid.toLocaleString()} | ${stats.attendanceCount} | ${status} | ${createdDate} |\n`;
      });
      markdown += `\n`;

      // Package Sales History
      markdown += `## 💳 היסטוריית מכירות כרטיסיות\n\n`;
      markdown += `| תאריך רכישה | שם מתאמן | כרטיסייה | מספר שיעורים | מחיר | אמצעי תשלום |\n`;
      markdown += `|-------------|-----------|-----------|---------------|------|-------------|\n`;

      packages.sort((a: any, b: any) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      packages.forEach((pkg: any) => {
        const member = members.find((m: any) => m.id === pkg.memberId);
        const purchaseDate = new Date(pkg.purchaseDate).toLocaleDateString('he-IL');
        // Get package name from settings if available
        const packageName = settings && pkg.packageType in settings
          ? settings[pkg.packageType as keyof Settings].name
          : pkg.packageType;
        markdown += `| ${purchaseDate} | ${member?.name || pkg.memberName || 'לא ידוע'} | ${packageName || '-'} | ${pkg.classCount || 0} | ₪${(pkg.amountPaid || 0).toLocaleString()} | ${pkg.paymentMethod || '-'} |\n`;
      });
      markdown += `\n`;

      markdown += `---\n\n`;
      markdown += `*דוח זה הופק אוטומטית ממערכת YFit לניהול פיננסי*\n`;

      // Show preview popup
      const fullDate = new Date().toISOString().split('T')[0];
      setReportFileName(`yfit_ytd_report_${fullDate}.md`);
      setReportPreview(markdown);
      setShowReportPreview(true);
    } catch (error) {
      console.error('Failed to generate YTD report:', error);
      alert('שגיאה ביצירת דוח מצטבר');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportPreview) return;

    const blob = new Blob([reportPreview], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowReportPreview(false);
    setReportPreview(null);
    setReportFileName('');
    alert('דוח הורד בהצלחה!');
  };

  const handleDownloadAndSaveReport = async () => {
    if (!reportPreview) return;

    try {
      // Save to server
      const reportType = reportFileName.includes('monthly') ? 'monthly' : 'ytd';
      const fullDate = new Date().toISOString().split('T')[0];
      await reportService.saveReport(selectedYear, reportType, reportPreview, fullDate);

      // Also download
      const blob = new Blob([reportPreview], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = reportFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowReportPreview(false);
      setReportPreview(null);
      setReportFileName('');
      alert('דוח נשמר והורד בהצלחה!');
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('שגיאה בשמירת הדוח. הדוח יורד בלבד.');
      handleDownloadReport();
    }
  };

  const loadSavedReports = async () => {
    try {
      setLoadingReports(true);
      const reports = await reportService.getReports();
      setSavedReports(reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      alert('שגיאה בטעינת דוחות שמורים');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleOpenReportsModal = async () => {
    await loadSavedReports();
    setShowReportsModal(true);
  };

  const handleDownloadSavedReport = async (report: Report) => {
    try {
      await reportService.downloadReport(report.year, report.filename);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('שגיאה בהורדת הדוח');
    }
  };

  const handleDeleteSavedReport = async (report: Report) => {
    if (!confirm(`האם למחוק את הדוח "${report.filename}"?`)) {
      return;
    }

    try {
      await reportService.deleteReport(report.year, report.filename);
      alert('הדוח נמחק בהצלחה');
      await loadSavedReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('שגיאה במחיקת הדוח');
    }
  };

  const handleClosePreview = () => {
    setShowReportPreview(false);
    setReportPreview(null);
    setReportFileName('');
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
            {/* Reports */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                דוחות
              </h2>

              <div className="space-y-3">
                {/* Monthly Report */}
                <button
                  onClick={handleGenerateMonthlyReport}
                  disabled={generatingReport}
                  className="w-full px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Calendar className="w-5 h-5" />
                  {generatingReport ? 'מייצר דוח...' : 'דוח חודשי'}
                </button>

                {/* Year-To-Date Report */}
                <button
                  onClick={handleGenerateYTDReport}
                  disabled={generatingReport}
                  className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FileText className="w-5 h-5" />
                  {generatingReport ? 'מייצר דוח...' : 'דוח מצטבר (YTD)'}
                </button>

                {/* Saved Reports */}
                <button
                  onClick={handleOpenReportsModal}
                  className="w-full px-4 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition font-medium flex items-center justify-center gap-2"
                >
                  <FolderOpen className="w-5 h-5" />
                  דוחות שמורים
                </button>
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

        {/* Advanced Admin Section */}
        <div className="mt-8 border-t-4 border-red-500 pt-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-red-900">הגדרות מתקדמות למנהל</h2>
                  <p className="text-sm text-red-700">⚠️ אזור מוגבל - שימוש זהיר בלבד</p>
                </div>
              </div>
              <button
                onClick={handleToggleAdvancedAdmin}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  showAdvancedAdmin
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white hover:bg-red-50 text-red-600 border-2 border-red-600'
                }`}
              >
                {showAdvancedAdmin ? 'סגור' : 'פתח הגדרות מתקדמות'}
              </button>
            </div>
          </div>

          {showAdvancedAdmin && !adminAuthenticated && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto border-2 border-red-300">
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">אימות מנהל נדרש</h3>
                <p className="text-sm text-gray-600">הזן שם משתמש וסיסמת מנהל כדי לגשת לאזור זה</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם משתמש מנהל
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="הזן שם משתמש"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סיסמת מנהל
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    placeholder="••••••"
                  />
                </div>

                <button
                  onClick={handleAdminAuth}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
                >
                  כניסה
                </button>
              </div>
            </div>
          )}

          {showAdvancedAdmin && adminAuthenticated && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Admin Password Change */}
              <div className="bg-white rounded-lg shadow p-6 border-2 border-orange-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-orange-600" />
                  שינוי סיסמת מנהל
                </h2>

                {!showAdminPasswordChange ? (
                  <button
                    onClick={() => setShowAdminPasswordChange(true)}
                    className="w-full px-4 py-3 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium"
                  >
                    שנה שם משתמש/סיסמה מנהל
                  </button>
                ) : (
                  <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        שם משתמש מנהל חדש *
                      </label>
                      <input
                        type="text"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(validatePasswordInput(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        סיסמת מנהל חדשה *
                      </label>
                      <input
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(validatePasswordInput(e.target.value))}
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
                        value={confirmNewAdminPassword}
                        onChange={(e) => setConfirmNewAdminPassword(validatePasswordInput(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
                      >
                        עדכן והתנתק
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdminPasswordChange(false);
                          setNewAdminUsername('koladmin');
                          setNewAdminPassword('');
                          setConfirmNewAdminPassword('');
                        }}
                        className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        ביטול
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* System Login Credentials */}
              <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  פרטי התחברות למערכת
                </h2>

                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    שנה שם משתמש/סיסמה למערכת
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

                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
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
                        className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        ביטול
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Data Management */}
              <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-600" />
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
                    <p className="text-xs text-red-600 mt-2 text-center">
                      ⚠️ אזהרה: יחליף את כל הנתונים!
                    </p>
                  </div>

                  {/* Reset All Data */}
                  <div className="pt-4 border-t">
                    <button
                      onClick={handleResetAllData}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      איפוס מלא של כל הנתונים
                    </button>
                    <p className="text-xs text-red-600 mt-2 text-center font-semibold">
                      🚨 מחיקה סופית - לא ניתן לשחזר!
                    </p>
                  </div>
                </div>
              </div>

              {/* Advanced User Management */}
              <div className="bg-white rounded-lg shadow p-6 border-2 border-purple-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  ניהול משתמשים מתקדם
                </h2>

                <div className="space-y-3">
                  <button
                    onClick={handleOpenMemberBalanceEdit}
                    className="w-full px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium flex items-center justify-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    עריכה ידנית של יתרות
                  </button>
                  <p className="text-xs text-gray-600 text-center">
                    עדכן ידנית יתרות שיעורים של מתאמנים
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Member Balance Edit Modal */}
      {showMemberBalanceEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-purple-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  הגדרת סטטוס מתאמנים
                </h3>
                <p className="text-sm text-gray-600 mt-1">עדכן ידנית יתרות שיעורים (להעברת נתונים ממערכת קודמת)</p>
              </div>
              <button
                onClick={() => {
                  setShowMemberBalanceEdit(false);
                  setSelectedMember(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Members List */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">בחר מתאמן</h4>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {membersWithBalance.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleSelectMemberForEdit(member)}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                          selectedMember?.id === member.id ? 'bg-purple-50 border-purple-300' : ''
                        }`}
                      >
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          יתרה נוכחית: <span className={`font-semibold ${member.classesRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {member.classesRemaining} שיעורים
                          </span>
                        </div>
                        {member.classesRemaining < 0 && (
                          <div className="text-sm text-red-600">
                            חוב: ₪{member.debtAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Form */}
                <div>
                  {selectedMember ? (
                    <div className="border rounded-lg p-6 bg-gray-50">
                      <h4 className="font-semibold text-gray-700 mb-4">הגדרת סטטוס מתאמן</h4>
                      <p className="text-sm text-gray-600 mb-4">עדכן את יתרת השיעורים של המתאמן (שימוש להעברת נתונים ממערכת קודמת)</p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            שם מתאמן
                          </label>
                          <input
                            type="text"
                            value={selectedMember.name}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                          />
                        </div>

                        <div className="border-t pt-4">
                          <h5 className="font-semibold text-gray-700 mb-3">סטטוס נוכחי</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded border">
                              <div className="text-xs text-gray-500 mb-1">יתרת שיעורים</div>
                              <div className={`text-xl font-bold ${selectedMember.classesRemaining < 0 ? 'text-red-600' : selectedMember.classesRemaining > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                {selectedMember.classesRemaining}
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded border">
                              <div className="text-xs text-gray-500 mb-1">חוב כספי</div>
                              <div className={`text-xl font-bold ${selectedMember.debtAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₪{selectedMember.debtAmount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h5 className="font-semibold text-gray-700 mb-3">הגדרת יתרה חדשה</h5>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                יתרת שיעורים *
                              </label>
                              <input
                                type="number"
                                value={editedClassBalance}
                                onChange={(e) => setEditedClassBalance(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-center text-lg font-semibold"
                                placeholder="הזן יתרת שיעורים"
                              />
                              <div className="mt-2 text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600">✓</span>
                                  <span className="text-gray-600">מספר חיובי = יתרת שיעורים זמינים (לדוגמה: 10)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">✓</span>
                                  <span className="text-gray-600">אפס = אין שיעורים זמינים (0)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600">✓</span>
                                  <span className="text-gray-600">מספר שלילי = חוב בשיעורים (לדוגמה: -5)</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                יתרת כסף (₪) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={editedMoneyBalance}
                                onChange={(e) => setEditedMoneyBalance(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-center text-lg font-semibold"
                                placeholder="הזן יתרת כסף"
                              />
                              <div className="mt-2 text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600">✓</span>
                                  <span className="text-gray-600">מספר חיובי = זכות כספית (לדוגמה: 500)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">✓</span>
                                  <span className="text-gray-600">אפס = אין יתרה כספית (0)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600">✓</span>
                                  <span className="text-gray-600">מספר שלילי = חוב כספי (לדוגמה: -250)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <span className="text-blue-600">ℹ️</span>
                            <div className="text-xs text-blue-800">
                              <strong>שים לב:</strong> עדכון יתרות אלה ישמש להעברת נתונים ממערכת קודמת.
                              <br />
                              יתרת הכסף מייצגת חשבון פריפייד - כל השתתפות בשיעור תנכה את עלות השיעור מהיתרה.
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleSaveMemberBalance}
                          disabled={savingBalance}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                        >
                          {savingBalance ? 'שומר...' : 'עדכן יתרת מתאמן'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-lg p-12 bg-gray-50 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>בחר מתאמן מהרשימה כדי לעדכן את היתרה שלו</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowMemberBalanceEdit(false);
                  setSelectedMember(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-green-600" />
                דוחות שמורים
              </h3>
              <button
                onClick={() => setShowReportsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingReports ? (
                <div className="text-center py-12">
                  <div className="text-gray-600">טוען דוחות...</div>
                </div>
              ) : savedReports.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">אין דוחות שמורים</p>
                  <p className="text-sm text-gray-400 mt-2">צור דוח חדש ושמור אותו כדי לראותו כאן</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group by year */}
                  {Object.entries(
                    savedReports.reduce((acc, report) => {
                      if (!acc[report.year]) acc[report.year] = [];
                      acc[report.year].push(report);
                      return acc;
                    }, {} as Record<string, Report[]>)
                  )
                    .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                    .map(([year, reports]) => (
                      <div key={year}>
                        <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          שנת {year}
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {reports.map((report) => (
                            <div
                              key={report.filename}
                              className="border rounded-lg p-4 hover:bg-gray-50 transition flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <div className="font-medium text-gray-800">{report.filename}</div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      <span className="inline-flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                          report.reportType === 'חודשי' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                          {report.reportType}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(report.createdAt).toLocaleDateString('he-IL')}</span>
                                        <span>•</span>
                                        <span>{(report.size / 1024).toFixed(1)} KB</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownloadSavedReport(report)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="הורד דוח"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSavedReport(report)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="מחק דוח"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowReportsModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {showReportPreview && reportPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">תצוגה מקדימה של הדוח</h3>
              <button
                onClick={handleClosePreview}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border border-gray-200 text-right">
                {reportPreview}
              </pre>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={handleClosePreview}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                סגור
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                הורד בלבד
              </button>
              <button
                onClick={handleDownloadAndSaveReport}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                הורד ושמור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
