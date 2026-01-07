'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Plus,
  X,
  Clock,
  CheckCircle,
  Package,
  Loader2,
} from 'lucide-react';

interface DocumentRequest {
  id: number;
  documentType: string;
  purpose: string;
  quantity: number;
  status: string;
  releaseDate?: string;
  remarks?: string;
  createdAt: string;
}

const documentTypes = [
  'Certificate of Employment (COE)',
  'Certificate of Employment with Compensation',
  'Income Tax Return (ITR / BIR 2316)',
  'Payslip Copy',
  'Certificate of Contributions (SSS/PHIC/HDMF)',
  'Service Record',
  'Employment Certificate for Visa',
  'Other',
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  'Ready for Pickup': 'bg-green-100 text-green-800',
  Released: 'bg-gray-100 text-gray-800',
  Rejected: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  Pending: Clock,
  Processing: Package,
  'Ready for Pickup': CheckCircle,
  Released: CheckCircle,
};

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(searchParams.get('action') === 'new');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    documentType: '',
    purpose: '',
    quantity: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit request');
        return;
      }

      setShowModal(false);
      setFormData({ documentType: '', purpose: '', quantity: 1 });
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
          <h1 className="text-2xl font-bold text-gray-900">Document Requests</h1>
          <p className="text-gray-600">Request certificates and other HR documents</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-mscorp-blue text-white rounded-lg hover:bg-mscorp-dark transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      {/* Document Types Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">Available Documents</h3>
        <p className="text-sm text-blue-700">
          You can request COE, ITR/BIR 2316, payslip copies, contribution certificates, and more.
          Processing time is typically 3-5 working days.
        </p>
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
                          request.status === 'Ready for Pickup' || request.status === 'Released'
                            ? 'bg-green-100'
                            : request.status === 'Rejected'
                            ? 'bg-red-100'
                            : request.status === 'Processing'
                            ? 'bg-blue-100'
                            : 'bg-yellow-100'
                        }`}
                      >
                        <StatusIcon
                          className={`w-5 h-5 ${
                            request.status === 'Ready for Pickup' || request.status === 'Released'
                              ? 'text-green-600'
                              : request.status === 'Rejected'
                              ? 'text-red-600'
                              : request.status === 'Processing'
                              ? 'text-blue-600'
                              : 'text-yellow-600'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.documentType}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {request.quantity} • Purpose: {request.purpose}
                        </p>
                        {request.remarks && (
                          <p className="text-sm text-gray-400 mt-1">
                            Note: {request.remarks}
                          </p>
                        )}
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
                        {request.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No document requests yet</p>
            <p className="text-sm mt-1">Click "New Request" to request a document</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                New Document Request
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
                  Document Type
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) =>
                    setFormData({ ...formData, documentType: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  required
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  placeholder="e.g., Bank loan application, Visa application"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Copies
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mscorp-blue focus:border-transparent"
                  required
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="font-medium mb-1">Processing Time</p>
                <p>Standard documents: 3-5 working days</p>
                <p>Documents with signature: 5-7 working days</p>
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
