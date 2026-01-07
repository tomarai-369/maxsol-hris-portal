'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface LeaveRequest {
  id: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface LeaveBalance {
  leaveType: string;
  totalCredits: number;
  used: number;
  remaining: number;
}

const leaveTypes = [
  'Vacation Leave',
  'Sick Leave',
  'Emergency Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Bereavement Leave',
  'Leave Without Pay',
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  Pending: Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
};

export default function LeavePage() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(searchParams.get('action') === 'new');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, balancesRes] = await Promise.all([
        fetch('/api/leave'),
        fetch('/api/leave/balance'),
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.requests);
      }

      if (balancesRes.ok) {
        const data = await balancesRes.json();
        setBalances(data.balances);
      }
    } catch (error) {
      console.error('Failed to fetch leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalDays: calculateDays(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit request');
        return;
      }

      setShowModal(false);
      setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-600">Manage your leave applications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-mscorp-blue text-white rounded-lg hover:bg-mscorp-dark transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.length > 0 ? (
          balances.map((balance) => (
            <div
              key={balance.leaveType}
              className="bg-white rounded-xl p-5 shadow-sm border"
            >
              <p className="text-sm text-gray-600 mb-1">{balance.leaveType}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {balance.remaining}
                </span>
                <span className="text-sm text-gray-500">
                  / {balance.totalCredits} days
                </span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-mscorp-blue rounded-full transition-all"
                  style={{
                    width: `${(balance.remaining / balance.totalCredits) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl p-6 shadow-sm border text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No leave balances found. Contact HR to set up your leave credits.</p>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-gray-900">Request History</h2>
        </div>

        {requests.length > 0 ? (
          <div className="divide-y">
            {requests.map((request) => {
              const StatusIcon = statusIcons[request.status] || Clock;
              return (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          request.status === 'Approved'
                            ? 'bg-green-100'
                            : request.status === 'Rejected'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                        }`}
                      >
                        <StatusIcon
                          className={`w-5 h-5 ${
                            request.status === 'Approved'
                              ? 'text-green-600'
                              : request.status === 'Rejected'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.leaveType}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.startDate} to {request.endDate} ({request.totalDays} day
                          {request.totalDays > 1 ? 's' : ''})
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {request.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[request.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {request.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        Filed: {request.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No leave requests yet</p>
            <p className="text-sm mt-1">Click "New Request" to file your first leave</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                New Leave Request
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveType: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  required
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  Total: <strong>{calculateDays()}</strong> day
                  {calculateDays() > 1 ? 's' : ''}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent resize-none"
                  placeholder="Please provide a reason for your leave..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-mscorp-blue text-white rounded-lg hover:bg-mscorp-dark transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
