'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Heart,
  Home,
  Building2,
  CreditCard,
  Users,
  FileText,
  ExternalLink,
  Copy,
  CheckCircle,
} from 'lucide-react';

interface BenefitsInfo {
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  tinNumber: string;
  hmoProvider: string;
  hmoPlan: string;
  hmoCardNumber: string;
  hmoDependents: number;
  lifeInsurancePolicy: string;
  bankName: string;
  bankAccount: string;
}

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<BenefitsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const res = await fetch('/api/benefits');
      if (res.ok) {
        const data = await res.json();
        setBenefits(data);
      }
    } catch (error) {
      console.error('Failed to fetch benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(value, field)}
      className="p-1 hover:bg-gray-200 rounded transition-colors"
    >
      {copied === field ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Benefits</h1>
        <p className="text-gray-600">Government IDs, HMO, and other benefits information</p>
      </div>

      {/* Government Contributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SSS */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">SSS</h3>
                <p className="text-sm text-gray-500">Social Security System</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <span className="font-mono text-lg">{benefits?.sssNumber || '—'}</span>
            {benefits?.sssNumber && <CopyButton value={benefits.sssNumber} field="sss" />}
          </div>
          <a
            href="https://www.sss.gov.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-sm text-blue-600 hover:underline flex items-center"
          >
            Visit SSS Portal <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        {/* PhilHealth */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">PhilHealth</h3>
                <p className="text-sm text-gray-500">Philippine Health Insurance</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <span className="font-mono text-lg">{benefits?.philhealthNumber || '—'}</span>
            {benefits?.philhealthNumber && <CopyButton value={benefits.philhealthNumber} field="philhealth" />}
          </div>
          <a
            href="https://www.philhealth.gov.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-sm text-green-600 hover:underline flex items-center"
          >
            Visit PhilHealth Portal <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        {/* Pag-IBIG */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                <Home className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pag-IBIG Fund</h3>
                <p className="text-sm text-gray-500">Home Development Mutual Fund</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <span className="font-mono text-lg">{benefits?.pagibigNumber || '—'}</span>
            {benefits?.pagibigNumber && <CopyButton value={benefits.pagibigNumber} field="pagibig" />}
          </div>
          <a
            href="https://www.pagibigfund.gov.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-sm text-yellow-600 hover:underline flex items-center"
          >
            Visit Pag-IBIG Portal <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>

        {/* TIN */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">TIN</h3>
                <p className="text-sm text-gray-500">Tax Identification Number</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <span className="font-mono text-lg">{benefits?.tinNumber || '—'}</span>
            {benefits?.tinNumber && <CopyButton value={benefits.tinNumber} field="tin" />}
          </div>
          <a
            href="https://www.bir.gov.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-sm text-purple-600 hover:underline flex items-center"
          >
            Visit BIR Portal <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>

      {/* HMO */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-red-500 to-pink-500 text-white">
          <div className="flex items-center">
            <Heart className="w-8 h-8 mr-3" />
            <div>
              <h3 className="font-semibold text-lg">Health Maintenance Organization</h3>
              <p className="text-red-100">{benefits?.hmoProvider || 'Not enrolled'}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {benefits?.hmoProvider ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan Type</p>
                <p className="font-medium text-gray-900">{benefits.hmoPlan || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Card Number</p>
                <p className="font-mono text-gray-900">{benefits.hmoCardNumber || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dependents Covered</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {benefits.hmoDependents || 0} dependents
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No HMO enrollment found. Contact HR for more information.
            </p>
          )}
        </div>
      </div>

      {/* Bank Account */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
            <CreditCard className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bank Account</h3>
            <p className="text-sm text-gray-500">Salary crediting account</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
          <div>
            <p className="text-sm text-gray-500">Bank Name</p>
            <p className="font-medium text-gray-900">{benefits?.bankName || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Number</p>
            <div className="flex items-center">
              <p className="font-mono text-gray-900">{benefits?.bankAccount || '—'}</p>
              {benefits?.bankAccount && (
                <CopyButton value={benefits.bankAccount} field="bank" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Life Insurance */}
      {benefits?.lifeInsurancePolicy && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Life Insurance</h3>
              <p className="text-sm text-gray-500">Policy Number: {benefits.lifeInsurancePolicy}</p>
            </div>
          </div>
        </div>
      )}

      {/* Update Request */}
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <p className="text-blue-800 mb-3">
          Need to update your benefits information?
        </p>
        <a
          href="/dashboard/documents"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          Request Update via HR
        </a>
      </div>
    </div>
  );
}
