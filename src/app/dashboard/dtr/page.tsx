'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Coffee,
  Moon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react';

interface DTRRecord {
  id: number;
  date: string;
  timeIn: string;
  timeOut: string;
  lunchOut: string;
  lunchIn: string;
  totalHours: number;
  overtimeHours: number;
  lateMinutes: number;
  undertimeMinutes: number;
  status: string;
}

interface ClockStatus {
  isClockedIn: boolean;
  isOnLunch: boolean;
  timeIn: string | null;
  lunchOut: string | null;
  lunchIn: string | null;
}

export default function DTRPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockStatus, setClockStatus] = useState<ClockStatus>({
    isClockedIn: false,
    isOnLunch: false,
    timeIn: null,
    lunchOut: null,
    lunchIn: null,
  });
  const [records, setRecords] = useState<DTRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDTRRecords();
    checkTodayStatus();
    getLocation();
  }, [selectedMonth]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        () => setLocation('Location unavailable')
      );
    }
  };

  const fetchDTRRecords = async () => {
    try {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      const res = await fetch(`/api/dtr?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch DTR:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayStatus = async () => {
    try {
      const res = await fetch('/api/dtr/today');
      if (res.ok) {
        const data = await res.json();
        setClockStatus(data);
      }
    } catch (error) {
      console.error('Failed to check today status:', error);
    }
  };

  const handleClock = async (action: 'in' | 'out' | 'lunch_out' | 'lunch_in') => {
    setClocking(true);
    try {
      const res = await fetch('/api/dtr/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, location }),
      });

      if (res.ok) {
        await checkTodayStatus();
        await fetchDTRRecords();
      }
    } catch (error) {
      console.error('Clock action failed:', error);
    } finally {
      setClocking(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const changeMonth = (delta: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setSelectedMonth(newMonth);
  };

  const statusColors: Record<string, string> = {
    Present: 'bg-green-100 text-green-800',
    Absent: 'bg-red-100 text-red-800',
    Leave: 'bg-blue-100 text-blue-800',
    Holiday: 'bg-purple-100 text-purple-800',
    'Rest Day': 'bg-gray-100 text-gray-800',
  };

  // Calculate summary
  const summary = {
    present: records.filter(r => r.status === 'Present').length,
    absent: records.filter(r => r.status === 'Absent').length,
    leave: records.filter(r => r.status === 'Leave').length,
    totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
    overtimeHours: records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0),
    lateMinutes: records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Time & Attendance</h1>
        <p className="text-gray-600">Clock in/out and view your DTR</p>
      </div>

      {/* Clock Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="text-center">
          <p className="text-blue-100 mb-2">{formatDate(currentTime)}</p>
          <p className="text-5xl font-bold font-mono mb-6">{formatTime(currentTime)}</p>
          
          {location && (
            <p className="text-blue-200 text-sm flex items-center justify-center mb-6">
              <MapPin className="w-4 h-4 mr-1" />
              {location}
            </p>
          )}

          {/* Clock Status */}
          <div className="flex items-center justify-center gap-4 mb-6 text-sm">
            {clockStatus.timeIn && (
              <span className="bg-white/20 px-3 py-1 rounded-full">
                In: {clockStatus.timeIn}
              </span>
            )}
            {clockStatus.lunchOut && (
              <span className="bg-white/20 px-3 py-1 rounded-full">
                Lunch: {clockStatus.lunchOut}
              </span>
            )}
            {clockStatus.lunchIn && (
              <span className="bg-white/20 px-3 py-1 rounded-full">
                Back: {clockStatus.lunchIn}
              </span>
            )}
          </div>

          {/* Clock Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {!clockStatus.isClockedIn ? (
              <button
                onClick={() => handleClock('in')}
                disabled={clocking}
                className="flex items-center px-8 py-4 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Clock In
              </button>
            ) : (
              <>
                {!clockStatus.isOnLunch && !clockStatus.lunchIn && (
                  <button
                    onClick={() => handleClock('lunch_out')}
                    disabled={clocking}
                    className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <Coffee className="w-5 h-5 mr-2" />
                    Lunch Out
                  </button>
                )}
                {clockStatus.isOnLunch && (
                  <button
                    onClick={() => handleClock('lunch_in')}
                    disabled={clocking}
                    className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    <Coffee className="w-5 h-5 mr-2" />
                    Lunch In
                  </button>
                )}
                <button
                  onClick={() => handleClock('out')}
                  disabled={clocking}
                  className="flex items-center px-8 py-4 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Clock Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-green-600">{summary.present}</p>
          <p className="text-xs text-gray-500">Present</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
          <p className="text-xs text-gray-500">Absent</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-blue-600">{summary.leave}</p>
          <p className="text-xs text-gray-500">Leave</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-gray-900">{summary.totalHours.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Total Hours</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-purple-600">{summary.overtimeHours.toFixed(1)}</p>
          <p className="text-xs text-gray-500">OT Hours</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-orange-600">{summary.lateMinutes}</p>
          <p className="text-xs text-gray-500">Late (mins)</p>
        </div>
      </div>

      {/* DTR Records */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Daily Time Record
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium min-w-[140px] text-center">
              {selectedMonth.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No records for this month
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-PH', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{record.timeIn || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{record.timeOut || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {record.totalHours?.toFixed(1) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-600">
                      {record.overtimeHours > 0 ? `+${record.overtimeHours.toFixed(1)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-orange-600">
                      {record.lateMinutes > 0 ? `${record.lateMinutes}m` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[record.status] || 'bg-gray-100'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
