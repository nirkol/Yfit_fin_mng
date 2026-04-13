import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { yearService } from '../services/yearService';
import type { MemberWithBalance } from '../types';
import { Check, Users, AlertTriangle, PartyPopper, Cake } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Attendance() {
  const navigate = useNavigate();
  const { selectedYear } = useYear();
  const [members, setMembers] = useState<MemberWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, [selectedYear]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const balances = await yearService.getYearBalances(selectedYear);
      // Sort by name
      balances.sort((a, b) => a.name.localeCompare(b.name, 'he'));
      setMembers(balances);
    } catch (error) {
      console.error('Failed to load members:', error);
      alert('שגיאה בטעינת מתאמנים');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMembers.size === 0) {
      alert('בחר לפחות חבר אחד');
      return;
    }

    // Check for members in debt
    const membersInDebt = members.filter(m =>
      selectedMembers.has(m.id) && m.classesRemaining < 0
    );

    if (membersInDebt.length > 0) {
      const names = membersInDebt.map(m => m.name).join(', ');
      if (!confirm(`שים לב! המתאמנים הבאים בחוב:\n${names}\n\nהאם להמשיך?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      await yearService.markAttendance(selectedYear, {
        date: new Date(date).toISOString(),
        time: time,
        memberIds: Array.from(selectedMembers),
        classType: 'regular'
      });

      alert(`נוכחות נרשמה בהצלחה עבור ${selectedMembers.size} מתאמנים!`);

      // Reset selection
      setSelectedMembers(new Set());
      loadMembers(); // Reload to update balances
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert('שגיאה ברישום נוכחות');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = members.filter(m =>
    !m.isArchived && m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate upcoming birthdays
  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const membersWithBirthdays = members
      .filter(m => !m.isArchived && m.dateOfBirth)
      .map(m => {
        const birthDate = new Date(m.dateOfBirth!);
        const birthMonth = birthDate.getMonth();
        const birthDay = birthDate.getDate();

        // Calculate this year's birthday
        const thisYearBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
        thisYearBirthday.setHours(0, 0, 0, 0);
        const todayNormalized = new Date(today);
        todayNormalized.setHours(0, 0, 0, 0);

        // If birthday already passed this year, use next year
        let nextBirthday = thisYearBirthday;
        if (thisYearBirthday < todayNormalized) {
          nextBirthday = new Date(today.getFullYear() + 1, birthMonth, birthDay);
        }

        const daysUntil = Math.floor((nextBirthday.getTime() - todayNormalized.getTime()) / (1000 * 60 * 60 * 24));

        return {
          member: m,
          daysUntil,
          date: nextBirthday,
          birthMonth,
          birthDay,
          isToday: daysUntil === 0,
          isTomorrow: daysUntil === 1
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    return membersWithBirthdays;
  };

  const upcomingBirthdays = getUpcomingBirthdays();

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">רישום נוכחות</h2>
            <p className="text-sm text-gray-500">שנה: {selectedYear}</p>
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">פרטי אימון</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תאריך *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שעה *
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">מתאמנים נבחרו:</span>
                    <span className="text-2xl font-bold text-blue-600">{selectedMembers.size}</span>
                  </div>

                  {selectedMembers.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMembers(new Set())}
                      className="w-full text-sm text-red-600 hover:text-red-700 py-2"
                    >
                      נקה בחירה
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || selectedMembers.size === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {submitting ? 'שומר...' : 'רשום נוכחות'}
                </button>
              </form>
            </div>

            {/* Upcoming Birthdays Widget */}
            {upcomingBirthdays.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Cake className="w-5 h-5 text-pink-500" />
                  ימי הולדת קרובים
                </h3>
                <div className="space-y-3">
                  {upcomingBirthdays.map(({ member, daysUntil, date, isToday, isTomorrow }) => (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg border-2 transition ${
                        isToday || isTomorrow
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {(isToday || isTomorrow) && (
                              <PartyPopper className="w-4 h-4 text-green-600" />
                            )}
                            <span className="font-medium text-gray-900">{member.name}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {isToday ? (
                              <span className="text-green-700 font-semibold">🎉 יום הולדת היום!</span>
                            ) : isTomorrow ? (
                              <span className="text-green-600 font-semibold">🎈 יום הולדת מחר!</span>
                            ) : (
                              <span>בעוד {daysUntil} ימים</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Members List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  בחר משתתפים
                </h2>
                <input
                  type="text"
                  placeholder="חפש חבר..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredMembers.map((member) => {
                  const isSelected = selectedMembers.has(member.id);
                  const hasDebt = member.classesRemaining < 0;
                  const noClasses = member.classesRemaining === 0;

                  return (
                    <div
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            {member.phone && (
                              <div className="text-sm text-gray-500">{member.phone}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {hasDebt && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-semibold">חוב!</span>
                            </div>
                          )}
                          {noClasses && !hasDebt && (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-semibold">אין שיעורים</span>
                            </div>
                          )}
                          <div
                            className={`text-lg font-bold ${
                              hasDebt
                                ? 'text-red-600'
                                : noClasses
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {member.classesRemaining}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  לא נמצאו מתאמנים
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
