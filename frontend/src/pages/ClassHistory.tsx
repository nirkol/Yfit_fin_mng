import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../contexts/YearContext';
import { yearService } from '../services/yearService';
import type { AttendanceRecord } from '../types';
import { Calendar, Users, Clock, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';

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

  useEffect(() => {
    loadClasses();
  }, [selectedYear]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClasses(classes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = classes.filter(cls =>
        cls.date.includes(term) ||
        cls.time.includes(term) ||
        cls.attendees.some(a => a.memberName.toLowerCase().includes(term))
      );
      setFilteredClasses(filtered);
    }
  }, [searchTerm, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const yearData = await yearService.getYear(selectedYear);

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
      alert('שגיאה בטעינת היסטוריית שיעורים');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">היסטוריית שיעורים</h2>
            <p className="text-sm text-gray-500">שנה: {selectedYear}</p>
          </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{classes.length}</div>
            <div className="text-sm text-gray-600">סה״כ שיעורים</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {classes.reduce((sum, cls) => sum + cls.attendees.length, 0)}
            </div>
            <div className="text-sm text-gray-600">סה״כ משתתפים</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {classes.length > 0 ? (classes.reduce((sum, cls) => sum + cls.attendees.length, 0) / classes.length).toFixed(1) : 0}
            </div>
            <div className="text-sm text-gray-600">ממוצע לשיעור</div>
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
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(cls.date)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{cls.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">{cls.attendees.length}</span>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">משתתפים:</h4>
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
              </div>
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
