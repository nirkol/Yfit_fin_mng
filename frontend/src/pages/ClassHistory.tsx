import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { yearService } from '../services/yearService';
import type { AttendanceRecord } from '../types';
import { Calendar, Users, Clock, Search, ChevronLeft, ChevronRight, Edit, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { validateTimeInput } from '../utils/validation';

interface ClassSession {
  date: string;
  time: string;
  attendees: Array<{ memberId: string; memberName: string }>;
}

export default function ClassHistory() {
  const { selectedYear } = useYear();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editAttendees, setEditAttendees] = useState<Array<{ memberId: string; memberName: string }>>([]);
  const [allMembers, setAllMembers] = useState<Array<{ id: string; name: string }>>([]);

  // Month navigation state - default to current month
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedMonthYear, setSelectedMonthYear] = useState(parseInt(selectedYear));

  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

  useEffect(() => {
    loadClasses();
    loadMembers();
  }, [selectedYear]);

  const loadMembers = async () => {
    try {
      const balances = await yearService.getYearBalances(selectedYear);
      setAllMembers(balances.filter(m => !m.isArchived).map(m => ({ id: m.id, name: m.name })));
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  useEffect(() => {
    // Filter classes by selected month
    const monthFiltered = classes.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate.getMonth() === selectedMonth && classDate.getFullYear() === selectedMonthYear;
    });

    // Apply search filter on top of month filter
    if (searchTerm.trim() === '') {
      setFilteredClasses(monthFiltered);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = monthFiltered.filter(cls =>
        cls.date.includes(term) ||
        cls.time.includes(term) ||
        cls.attendees.some(a => a.memberName.toLowerCase().includes(term))
      );
      setFilteredClasses(filtered);
    }
  }, [searchTerm, classes, selectedMonth, selectedMonthYear]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const yearData = await yearService.getYearData(selectedYear);

      // Group attendance by date and time
      const classMap = new Map<string, ClassSession>();

      // Check if attendance array exists
      if (yearData.attendance && Array.isArray(yearData.attendance)) {
        yearData.attendance.forEach((record: AttendanceRecord) => {
          const key = `${record.date}-${record.time}`;
          if (!classMap.has(key)) {
            classMap.set(key, {
              date: record.date,
              time: record.time,
              attendees: []
            });
          }
          classMap.get(key)!.attendees.push({
            memberId: record.memberId,
            memberName: record.memberName
          });
        });
      }

      // Convert to array and sort by date/time (newest first)
      const classesList = Array.from(classMap.values()).sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeB.getTime() - dateTimeA.getTime();
      });

      setClasses(classesList);
      setFilteredClasses(classesList);
    } catch (error) {
      console.error('Failed to load classes:', error);
      // Only show error if it's a real API error, not just empty data
      if (error instanceof Error && error.message !== 'No data') {
        console.error('Error details:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedMonthYear(selectedMonthYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedMonthYear(selectedMonthYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleEditClass = (cls: ClassSession) => {
    setEditingClass(cls);
    setEditDate(cls.date.split('T')[0]); // Extract date part
    setEditTime(cls.time);
    setEditAttendees([...cls.attendees]);
    setShowEditModal(true);
  };

  const handleToggleAttendee = (memberId: string, memberName: string) => {
    const exists = editAttendees.find(a => a.memberId === memberId);
    if (exists) {
      setEditAttendees(editAttendees.filter(a => a.memberId !== memberId));
    } else {
      setEditAttendees([...editAttendees, { memberId, memberName }]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingClass || editAttendees.length === 0) {
      alert('חייב לבחור לפחות חבר אחד');
      return;
    }

    try {
      // The backend expects date in YYYY-MM-DD format and time in HH:MM format
      // The markAttendance endpoint removes old attendance for the same date/time
      // before adding new records

      await yearService.markAttendance(selectedYear, {
        date: editDate, // Already in YYYY-MM-DD format from the date input
        time: editTime, // Already in HH:MM format from the time input
        memberIds: editAttendees.map(a => a.memberId),
        classType: 'regular'
      });

      alert('שינויים נשמרו בהצלחה');
      setShowEditModal(false);
      await loadClasses(); // Wait for reload to complete
    } catch (error) {
      console.error('Failed to update class:', error);
      alert('שגיאה בעדכון שיעור');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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
            <h2 className="text-2xl font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>היסטוריית שיעורים</h2>
            <p className="text-sm text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>שנה: {selectedYear}</p>
          </div>

        {/* Month Navigation with Inline Stats */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <button
              onClick={handlePreviousMonth}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
              title="חודש קודם"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
              <span className="text-sm text-gray-600">קודם</span>
            </button>

            <h3 className="text-lg font-bold text-gray-900">
              {monthNames[selectedMonth]} {selectedMonthYear}
            </h3>

            <button
              onClick={handleNextMonth}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
              title="חודש הבא"
            >
              <span className="text-sm text-gray-600">הבא</span>
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm border-t pt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-gray-900">{filteredClasses.length}</span>
              <span className="text-gray-600">שיעורים</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-900">
                {filteredClasses.reduce((sum, cls) => sum + cls.attendees.length, 0)}
              </span>
              <span className="text-gray-600">משתתפים</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-gray-900">
                {filteredClasses.length > 0 ? (filteredClasses.reduce((sum, cls) => sum + cls.attendees.length, 0) / filteredClasses.length).toFixed(1) : 0}
              </span>
              <span className="text-gray-600">ממוצע</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="חפש לפי תאריך, שעה או שם חבר..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Classes List */}
        {filteredClasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'לא נמצאו תוצאות' : 'אין שיעורים להצגה'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'נסה לשנות את החיפוש' : 'התחל לסמן נוכחות כדי לראות היסטוריה'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClasses.map((cls, index) => (
              <div key={`${cls.date}-${cls.time}`} className="bg-white rounded-lg shadow hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(cls.date)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{cls.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClass(cls)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="עריכת שיעור"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">{cls.attendees.length}</span>
                        <span className="text-sm text-gray-600">משתתפים</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {cls.attendees.map((attendee) => (
                      <button
                        key={attendee.memberId}
                        onClick={() => navigate(`/members/${attendee.memberId}`)}
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition text-right"
                      >
                        {attendee.memberName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </main>

      {/* Edit Class Modal */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">עריכת שיעור</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תאריך
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שעה
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(validateTimeInput(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Attendees Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  משתתפים ({editAttendees.length})
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {allMembers.map((member) => {
                      const isSelected = editAttendees.some(a => a.memberId === member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => handleToggleAttendee(member.id, member.name)}
                          className={`p-3 border-2 rounded-lg text-sm transition text-right ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-900'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {member.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                שמור שינויים
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
