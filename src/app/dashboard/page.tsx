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
  AlertCircle,
  ArrowRight,
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

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Processing: 'bg-blue-100 text-blue-800',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-mscorp-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your HR Portal</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vacation Leave</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data?.leaveBalance.vacation || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">days remaining</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sick Leave</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data?.leaveBalance.sick || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">days remaining</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Leave</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data?.pendingRequests.leave || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">requests</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Documents</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data?.pendingRequests.documents || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">requests</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/leave?action=new"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all card-hover"
        >
          <Calendar className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg">File Leave Request</h3>
          <p className="text-blue-100 text-sm mt-1">
            Submit a new leave application
          </p>
        </Link>

        <Link
          href="/dashboard/documents?action=new"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all card-hover"
        >
          <FileText className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg">Request Document</h3>
          <p className="text-purple-100 text-sm mt-1">
            Request COE, ITR, or other documents
          </p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all card-hover"
        >
          <CheckCircle className="w-8 h-8 mb-3" />
          <h3 className="font-semibold text-lg">Update Profile</h3>
          <p className="text-green-100 text-sm mt-1">
            Keep your information up to date
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-6 border-b">
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
              data.recentLeave.slice(0, 5).map((leave) => (
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
              </div>
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="font-semibold text-gray-900">Announcements</h2>
            <Link
              href="/dashboard/announcements"
              className="text-sm text-mscorp-blue hover:text-mscorp-dark flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y">
            {data?.announcements && data.announcements.length > 0 ? (
              data.announcements.slice(0, 5).map((announcement) => (
                <div key={announcement.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
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
