'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  FileText,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Wallet,
  Shield,
  MapPin,
  Landmark,
  User,
} from 'lucide-react';

interface DashboardData {
  leaveBalance: {
    vacation: number;
    sick: number;
    emergency: number;
  };
  pendingRequests: {
    leave: number;
    documents: number;
  };
  recentLeave: Array<{
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  announcements: Array<{
    id: number;
    title: string;
    category: string;
    priority: string;
    publishDate: string;
  }>;
}

interface ClockStatus {
  isClockedIn: boolean;
  timeIn?: string;
  hasLunchOut?: boolean;
}

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Processing: 'bg-blue-100 text-blue-800',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockStatus, setClockStatus] = useState<ClockStatus>({ isClockedIn: false });
  const [clocking, setClocking] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchClockStatus();
    
    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClockStatus = async () => {
    try {
      const res = await fetch('/api/dtr/today');
      if (res.ok) {
        const result = await res.json();
        setClockStatus(result);
      }
    } catch (error) {
      console.error('Failed to fetch clock status:', error);
    }
  };

  const handleClock = async (action: 'in' | 'out') => {
    setClocking(true);
    try {
      // Get GPS location
      let location = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = `${pos.coords.latitude},${pos.coords.longitude}`;
        } catch (e) {
          console.log('GPS not available');
        }
      }

      const res = await fetch('/api/dtr/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, location }),
      });

      if (res.ok) {
        await fetchClockStatus();
      }
    } catch (error) {
      console.error('Clock error:', error);
    } finally {
      setClocking(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-mscorp-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Clock Widget */}
      <div className="bg-gradient-to-r from-mscorp-dark via-mscorp-blue to-mscorp-light rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-blue-200 text-sm mb-1">{formatDate(currentTime)}</p>
            <p className="text-4xl md:text-5xl font-bold font-mono tracking-wider">
              {formatTime(currentTime)}
            </p>
            {clockStatus.isClockedIn && clockStatus.timeIn && (
              <p className="text-blue-200 text-sm mt-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Clocked in at {clockStatus.timeIn}
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            {!clockStatus.isClockedIn ? (
              <button
                onClick={() => handleClock('in')}
                disabled={clocking}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {clocking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
                Clock In
              </button>
            ) : (
              <button
                onClick={() => handleClock('out')}
                disabled={clocking}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {clocking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
                Clock Out
              </button>
            )}
            <Link
              href="/dashboard/dtr"
              className="px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all flex items-center gap-2"
            >
              View DTR
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {data?.leaveBalance.vacation || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Vacation Leave</p>
          <p className="text-xs text-gray-400">days remaining</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {data?.leaveBalance.sick || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Sick Leave</p>
          <p className="text-xs text-gray-400">days remaining</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {data?.pendingRequests.leave || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Pending Leaves</p>
          <p className="text-xs text-gray-400">awaiting approval</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {data?.pendingRequests.documents || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Pending Docs</p>
          <p className="text-xs text-gray-400">being processed</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Link
          href="/dashboard/leave?action=new"
          className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-blue-300 transition-all text-center group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="font-medium text-gray-900 text-sm">File Leave</p>
        </Link>

        <Link
          href="/dashboard/documents?action=new"
          className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-purple-300 transition-all text-center group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <p className="font-medium text-gray-900 text-sm">Request Doc</p>
        </Link>

        <Link
          href="/dashboard/payslips"
          className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-green-300 transition-all text-center group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <p className="font-medium text-gray-900 text-sm">View Payslips</p>
        </Link>

        <Link
          href="/dashboard/benefits"
          className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-cyan-300 transition-all text-center group"
        >
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-cyan-200 transition-colors">
            <Shield className="w-6 h-6 text-cyan-600" />
          </div>
          <p className="font-medium text-gray-900 text-sm">My Benefits</p>
        </Link>

        <Link
          href="/dashboard/loans"
          className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-orange-300 transition-all text-center group"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
            <Landmark className="w-6 h-6 text-orange-600" />
          </div>
          <p className="font-medium text-gray-900 text-sm">My Loans</p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md hover:border-gray-300 transition-all text-center group"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <p className="font-medium text-gray-900 text-sm">My Profile</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-gray-900">Recent Leave Requests</h2>
            <Link
              href="/dashboard/leave"
              className="text-sm text-mscorp-blue hover:text-mscorp-dark flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y">
            {data?.recentLeave && data.recentLeave.length > 0 ? (
              data.recentLeave.slice(0, 4).map((leave) => (
                <div key={leave.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{leave.type}</p>
                      <p className="text-sm text-gray-500">
                        {leave.startDate} - {leave.endDate}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[leave.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No leave requests yet</p>
                <Link 
                  href="/dashboard/leave?action=new"
                  className="text-mscorp-blue text-sm hover:underline mt-2 inline-block"
                >
                  File your first leave request
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-semibold text-gray-900">Company Announcements</h2>
            <Link
              href="/dashboard/announcements"
              className="text-sm text-mscorp-blue hover:text-mscorp-dark flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y">
            {data?.announcements && data.announcements.length > 0 ? (
              data.announcements.slice(0, 4).map((announcement) => (
                <div key={announcement.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        announcement.priority === 'High'
                          ? 'bg-red-500'
                          : announcement.priority === 'Medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {announcement.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {announcement.category} • {announcement.publishDate}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No announcements</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
