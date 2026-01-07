'use client';

import { useState, useEffect } from 'react';
import {
  Landmark,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  PiggyBank,
  Home,
  Building2,
  Wallet,
} from 'lucide-react';

interface Loan {
  id: number;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  totalAmount: number;
  monthlyAmortization: number;
  totalPaid: number;
  balance: number;
  startDate: string;
  endDate: string;
  status: string;
}

const loanIcons: Record<string, any> = {
  'Company Loan': Wallet,
  'SSS Salary Loan': PiggyBank,
  'SSS Calamity Loan': AlertCircle,
  'Pag-IBIG MPL': Home,
  'Pag-IBIG Calamity': Home,
  'Cash Advance': Wallet,
};

const loanColors: Record<string, string> = {
  'Company Loan': 'bg-blue-500',
  'SSS Salary Loan': 'bg-green-500',
  'SSS Calamity Loan': 'bg-green-600',
  'Pag-IBIG MPL': 'bg-yellow-500',
  'Pag-IBIG Calamity': 'bg-yellow-600',
  'Cash Advance': 'bg-purple-500',
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await fetch('/api/loans');
      if (res.ok) {
        const data = await res.json();
        setLoans(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const getProgressPercent = (paid: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((paid / total) * 100, 100);
  };

  const activeLoans = loans.filter(l => l.status === 'Active');
  const completedLoans = loans.filter(l => l.status === 'Completed');
  const totalBalance = activeLoans.reduce((sum, l) => sum + l.balance, 0);
  const totalMonthly = activeLoans.reduce((sum, l) => sum + l.monthlyAmortization, 0);

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
        <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
        <p className="text-gray-600">Track your loan balances and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <Landmark className="w-8 h-8 text-blue-600" />
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {activeLoans.length} active
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-gray-500">Total Outstanding</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              Monthly
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthly)}</p>
          <p className="text-sm text-gray-500">Total Deductions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Paid off
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedLoans.length}</p>
          <p className="text-sm text-gray-500">Completed Loans</p>
        </div>
      </div>

      {/* Active Loans */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Active Loans
          </h3>
        </div>

        {activeLoans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300" />
            <p>No active loans. You're all clear!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activeLoans.map((loan) => {
              const Icon = loanIcons[loan.loanType] || Landmark;
              const progress = getProgressPercent(loan.totalPaid, loan.totalAmount);

              return (
                <div
                  key={loan.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLoan(loan)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${loanColors[loan.loanType] || 'bg-gray-500'} rounded-xl flex items-center justify-center mr-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{loan.loanType}</h4>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(loan.monthlyAmortization)}/month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(loan.balance)}</p>
                      <p className="text-xs text-gray-500">remaining</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(loan.totalPaid)} paid</span>
                    <span>{progress.toFixed(0)}% complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Loans */}
      {completedLoans.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
              Completed Loans
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {completedLoans.map((loan) => {
              const Icon = loanIcons[loan.loanType] || Landmark;

              return (
                <div key={loan.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{loan.loanType}</p>
                      <p className="text-xs text-gray-400">
                        Completed {new Date(loan.endDate).toLocaleDateString('en-PH')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500 line-through">{formatCurrency(loan.totalAmount)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loan Detail Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className={`p-6 ${loanColors[selectedLoan.loanType] || 'bg-gray-500'} text-white rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {(() => {
                    const Icon = loanIcons[selectedLoan.loanType] || Landmark;
                    return <Icon className="w-8 h-8 mr-3" />;
                  })()}
                  <div>
                    <h3 className="font-bold text-lg">{selectedLoan.loanType}</h3>
                    <p className="text-white/80 text-sm">
                      Started {new Date(selectedLoan.startDate).toLocaleDateString('en-PH')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="p-2 hover:bg-white/20 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Principal</p>
                  <p className="font-semibold">{formatCurrency(selectedLoan.principalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="font-semibold">{selectedLoan.interestRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-semibold">{formatCurrency(selectedLoan.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Payment</p>
                  <p className="font-semibold text-red-600">{formatCurrency(selectedLoan.monthlyAmortization)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedLoan.totalPaid)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600">Remaining Balance</span>
                  <span className="font-bold text-xl">{formatCurrency(selectedLoan.balance)}</span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${getProgressPercent(selectedLoan.totalPaid, selectedLoan.totalAmount)}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                  {getProgressPercent(selectedLoan.totalPaid, selectedLoan.totalAmount).toFixed(1)}% paid off
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Target Completion</p>
                  <p className="font-medium">
                    {new Date(selectedLoan.endDate).toLocaleDateString('en-PH', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request New Loan */}
      <div className="bg-blue-50 rounded-xl p-6 text-center">
        <p className="text-blue-800 mb-3">
          Need to apply for a loan? Contact HR for assistance with SSS, Pag-IBIG, or company loans.
        </p>
        <a
          href="/dashboard/documents"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Request Loan Application Form
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}
