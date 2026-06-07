import React, { useEffect, useState } from 'react';
import { useYear } from '../contexts/YearContext';
import { trainerService } from '../services/trainerService';
import type { Trainer, TrainerStats } from '../types';
import { UserCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Trainers() {
  const { selectedYear } = useYear();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [trainerStats, setTrainerStats] = useState<TrainerStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    username: '',
    password: '',
    role: 'trainer' as 'admin' | 'trainer'
  });

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    if (selectedTrainer) {
      loadTrainerStats(selectedTrainer.id);
    }
  }, [selectedTrainer, selectedYear]);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const data = await trainerService.getTrainers();
      setTrainers(data);
    } catch (error) {
      console.error('Failed to load trainers:', error);
      alert('שגיאה בטעינת מאמנים');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainerStats = async (trainerId: string) => {
    try {
      const stats = await trainerService.getTrainerStats(trainerId, selectedYear);
      setTrainerStats(stats);
    } catch (error) {
      console.error('Failed to load trainer stats:', error);
      setTrainerStats(null);
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.password) {
      alert('נא למלא את כל השדות החובה');
      return;
    }

    try {
      await trainerService.createTrainer(formData);
      alert('מאמן נוסף בהצלחה');
      setShowCreateModal(false);
      resetForm();
      loadTrainers();
    } catch (error: any) {
      console.error('Failed to create trainer:', error);
      alert(error.response?.data?.detail || 'שגיאה ביצירת מאמן');
    }
  };

  const handleUpdateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTrainer) return;

    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        username: formData.username,
        role: formData.role
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await trainerService.updateTrainer(editingTrainer.id, updateData);
      alert('מאמן עודכן בהצלחה');
      setShowEditModal(false);
      setEditingTrainer(null);
      resetForm();
      loadTrainers();
    } catch (error: any) {
      console.error('Failed to update trainer:', error);
      alert(error.response?.data?.detail || 'שגיאה בעדכון מאמן');
    }
  };

  const handleDeleteTrainer = async (trainer: Trainer) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${trainer.name}?`)) {
      return;
    }

    try {
      await trainerService.deleteTrainer(trainer.id);
      alert('מאמן נמחק בהצלחה');
      if (selectedTrainer?.id === trainer.id) {
        setSelectedTrainer(null);
        setTrainerStats(null);
      }
      loadTrainers();
    } catch (error: any) {
      console.error('Failed to delete trainer:', error);
      alert(error.response?.data?.detail || 'שגיאה במחיקת מאמן');
    }
  };

  const openEditModal = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      phone: trainer.phone || '',
      dateOfBirth: trainer.dateOfBirth || '',
      username: trainer.username,
      password: '',
      role: trainer.role
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      dateOfBirth: '',
      username: '',
      password: '',
      role: 'trainer'
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingTrainer(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50" dir="rtl">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">טוען...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">מאמנים</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>הוסף מאמן</span>
            </button>
          </div>

          {/* Trainers Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      טלפון
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריך לידה
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם משתמש
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תפקיד
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      onClick={() => setSelectedTrainer(trainer)}
                      className={`hover:bg-gray-50 transition cursor-pointer ${
                        selectedTrainer?.id === trainer.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{trainer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{trainer.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{trainer.dateOfBirth || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{trainer.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            trainer.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {trainer.role === 'admin' ? 'מנהל' : 'מאמן'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            trainer.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {trainer.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(trainer);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrainer(trainer);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trainer Statistics */}
          {selectedTrainer && trainerStats && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                סטטיסטיקות - {selectedTrainer.name} (שנה: {selectedYear})
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">סה"כ שיעורים בשנה</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {trainerStats.totalClasses}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">סה"כ משתתפים בשנה</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {trainerStats.totalParticipants}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">פירוט לפי חודש</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(() => {
                  const allMonths = [
                    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                  ];

                  // Get current month (0-11)
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  const isCurrentYear = parseInt(selectedYear) === currentYear;

                  // Create a map of existing stats
                  const statsMap = new Map(
                    trainerStats.monthlyStats.map(s => [s.month, s])
                  );

                  // Show all 12 months
                  return allMonths.map((month, index) => {
                    const stat = statsMap.get(month) || { month, classes: 0, participants: 0 };
                    const hasData = stat.classes > 0;
                    const isCurrentMonth = isCurrentYear && index === currentMonth;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition ${
                          isCurrentMonth
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 border-4 shadow-lg'
                            : hasData
                            ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`text-sm font-semibold mb-2 ${
                          isCurrentMonth ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {month}
                          {isCurrentMonth && (
                            <span className="mr-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                              חודש נוכחי
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">שיעורים:</span>
                            <span className={`text-sm font-bold ${
                              isCurrentMonth ? 'text-green-700' : hasData ? 'text-purple-600' : 'text-gray-400'
                            }`}>
                              {stat.classes}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">משתתפים:</span>
                            <span className={`text-sm font-bold ${
                              isCurrentMonth ? 'text-green-700' : hasData ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                              {stat.participants}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Trainer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">הוסף מאמן חדש</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrainer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם מלא *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך לידה
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם משתמש *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as 'admin' | 'trainer' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="trainer">מאמן</option>
                  <option value="admin">מנהל</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  הוסף
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      {showEditModal && editingTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">ערוך מאמן</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTrainer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם מלא *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תאריך לידה
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם משתמש *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סיסמה חדשה (השאר ריק אם לא לשנות)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as 'admin' | 'trainer' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="trainer">מאמן</option>
                  <option value="admin">מנהל</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  עדכן
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
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
