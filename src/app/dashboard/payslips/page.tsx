'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calculator,
  X,
} from 'lucide-react';

interface PayrollRecord {
  id: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  basicPay: number;
  daysWorked: number;
  overtimePay: number;
  holidayPay: number;
  nightDiff: number;
  allowances: number;
  grossPay: number;
  sssDeduction: number;
  philhealthDeduction: number;
  pagibigDeduction: number;
  taxDeduction: number;
  loanDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  status: string;
  payDate: string;
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    fetchPayslips();
  }, [selectedYear]);

  const fetchPayslips = async () => {
    try {
      const res = await fetch(`/api/payroll?year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setPayslips(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
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

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Calculate YTD totals
  const ytdTotals = {
    grossPay: payslips.reduce((sum, p) => sum + p.grossPay, 0),
    netPay: payslips.reduce((sum, p) => sum + p.netPay, 0),
    totalDeductions: payslips.reduce((sum, p) => sum + p.totalDeductions, 0),
    sss: payslips.reduce((sum, p) => sum + p.sssDeduction, 0),
    philhealth: payslips.reduce((sum, p) => sum + p.philhealthDeduction, 0),
    pagibig: payslips.reduce((sum, p) => sum + p.pagibigDeduction, 0),
    tax: payslips.reduce((sum, p) => sum + p.taxDeduction, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="text-gray-600">View your salary and deduction history</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-lg min-w-[60px] text-center">{selectedYear}</span>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={selectedYear >= new Date().getFullYear()}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">YTD</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(ytdTotals.grossPay)}</p>
          <p className="text-green-100 text-sm">Gross Earnings</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">YTD</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(ytdTotals.netPay)}</p>
          <p className="text-blue-100 text-sm">Net Pay</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">YTD</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(ytdTotals.totalDeductions)}</p>
          <p className="text-red-100 text-sm">Total Deductions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calculator className="w-8 h-8 opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">YTD</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(ytdTotals.tax)}</p>
          <p className="text-purple-100 text-sm">Withholding Tax</p>
        </div>
      </div>

      {/* Contributions Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">YTD Government Contributions</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(ytdTotals.sss)}</p>
            <p className="text-sm text-gray-500">SSS</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(ytdTotals.philhealth)}</p>
            <p className="text-sm text-gray-500">PhilHealth</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(ytdTotals.pagibig)}</p>
            <p className="text-sm text-gray-500">Pag-IBIG</p>
          </div>
        </div>
      </div>

      {/* Payslips List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Payslip History
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : payslips.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payslips found for {selectedYear}</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payslips.map((payslip) => (
              <div
                key={payslip.id}
                className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => setSelectedPayslip(payslip)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {formatPeriod(payslip.payPeriodStart, payslip.payPeriodEnd)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Paid: {new Date(payslip.payDate).toLocaleDateString('en-PH')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(payslip.netPay)}</p>
                  <p className="text-xs text-gray-500">Gross: {formatCurrency(payslip.grossPay)}</p>
                </div>
                <button className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payslip Detail Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="font-bold text-gray-900">Payslip Details</h3>
                <p className="text-sm text-gray-500">
                  {formatPeriod(selectedPayslip.payPeriodStart, selectedPayslip.payPeriodEnd)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Earnings */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Pay ({selectedPayslip.daysWorked} days)</span>
                    <span className="font-medium">{formatCurrency(selectedPayslip.basicPay)}</span>
                  </div>
                  {selectedPayslip.overtimePay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overtime Pay</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.overtimePay)}</span>
                    </div>
                  )}
                  {selectedPayslip.holidayPay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Holiday Pay</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.holidayPay)}</span>
                    </div>
                  )}
                  {selectedPayslip.nightDiff > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Night Differential</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.nightDiff)}</span>
                    </div>
                  )}
                  {selectedPayslip.allowances > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Allowances</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.allowances)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Gross Pay</span>
                    <span className="text-green-600">{formatCurrency(selectedPayslip.grossPay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SSS</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.sssDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PhilHealth</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.philhealthDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pag-IBIG</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.pagibigDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Withholding Tax</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.taxDeduction)}</span>
                  </div>
                  {selectedPayslip.loanDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loan Deductions</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.loanDeduction)}</span>
                    </div>
                  )}
                  {selectedPayslip.otherDeductions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Deductions</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.otherDeductions)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total Deductions</span>
                    <span className="text-red-600">-{formatCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-900">NET PAY</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedPayslip.netPay)}
                  </span>
                </div>
              </div>

              <button
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
