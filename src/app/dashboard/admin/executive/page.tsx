'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Building,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface DashboardStats {
  totalEmployees: number;
  employeesByDepartment: Record<string, number>;
  employeesByStatus: Record<string, number>;
  leaveStats: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  documentStats: {
    pending: number;
    processing: number;
    ready: number;
    released: number;
    total: number;
  };
  recentLeaveRequests: Array<{
    id: number;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
    totalDays: number;
  }>;
  recentDocumentRequests: Array<{
    id: number;
    employeeName: string;
    documentType: string;
    status: string;
    createdAt: string;
  }>;
}

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Processing: 'bg-blue-100 text-blue-800',
  Ready: 'bg-purple-100 text-purple-800',
  Released: 'bg-gray-100 text-gray-800',
};

export default function ExecutiveDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [departmentFilter]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (departmentFilter !== 'all') {
        params.append('department', departmentFilter);
      }
      
      const res = await fetch(`/api/admin/executive-dashboard?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const exportToCSV = () => {
    // Export leave requests to CSV
    if (!stats) return;
    
    const headers = ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status'];
    const rows = stats.recentLeaveRequests.map(r => [
      r.employeeName,
      r.leaveType,
      r.startDate,
      r.endDate,
      r.totalDays,
      r.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const departments = stats ? Object.keys(stats.employeesByDepartment) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-600">Consolidated HR analytics and reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.totalEmployees || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Leave Requests</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {stats?.leaveStats.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved This Month</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats?.leaveStats.approved || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Documents</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {stats?.documentStats.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employees by Department */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Employees by Department
          </h3>
          <div className="space-y-3">
            {stats && Object.entries(stats.employeesByDepartment).map(([dept, count]) => (
              <div key={dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{dept}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(count / (stats.totalEmployees || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Request Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Leave Request Summary
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-700">{stats?.leaveStats.pending}</p>
              <p className="text-xs text-yellow-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-700">{stats?.leaveStats.approved}</p>
              <p className="text-xs text-green-600">Approved</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-700">{stats?.leaveStats.rejected}</p>
              <p className="text-xs text-red-600">Rejected</p>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            Total: {stats?.leaveStats.total} requests
          </div>
        </div>
      </div>

      {/* Document Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Document Request Pipeline
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded bg-yellow-500 mr-2"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold">{stats?.documentStats.pending}</p>
            </div>
            <div className="text-2xl text-gray-300 mx-4">→</div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Processing</span>
              </div>
              <p className="text-2xl font-bold">{stats?.documentStats.processing}</p>
            </div>
            <div className="text-2xl text-gray-300 mx-4">→</div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded bg-purple-500 mr-2"></div>
                <span className="text-sm text-gray-600">Ready</span>
              </div>
              <p className="text-2xl font-bold">{stats?.documentStats.ready}</p>
            </div>
            <div className="text-2xl text-gray-300 mx-4">→</div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Released</span>
              </div>
              <p className="text-2xl font-bold">{stats?.documentStats.released}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-gray-900">Recent Leave Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentLeaveRequests.slice(0, 10).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{request.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.totalDays}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status] || 'bg-gray-100'}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Document Requests */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-gray-900">Recent Document Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentDocumentRequests.slice(0, 10).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{request.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.documentType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status] || 'bg-gray-100'}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employees by Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
          Employment Status Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats && Object.entries(stats.employeesByStatus).map(([status, count]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
