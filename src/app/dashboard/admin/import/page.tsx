'use client';

import { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  Mail,
} from 'lucide-react';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
}

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [sendEmails, setSendEmails] = useState(true);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setError('');

    // Parse CSV for preview
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const data = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });

    setPreview(data);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sendEmails', sendEmails.toString());

      const res = await fetch('/api/admin/import-employees', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Import failed');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('An error occurred during import');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `employee_id,email,first_name,last_name,middle_name,department,position,employment_status,date_hired,birth_date,contact_number,address
EMP001,juan.dela.cruz@email.com,Juan,Dela Cruz,Santos,Manpower,Field Worker,Regular,2024-01-15,1990-05-20,09171234567,"123 Main St, Manila"
EMP002,maria.santos@email.com,Maria,Santos,,Operations,Supervisor,Regular,2024-02-01,1988-12-10,09181234567,"456 Oak Ave, Makati"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Employees</h1>
        <p className="text-gray-600">Bulk import employees from CSV or Excel file</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          CSV File Format
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          Your CSV file should have the following columns (first row as headers):
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700 mb-4">
          <span className="bg-blue-100 px-2 py-1 rounded">employee_id *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">email *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">first_name *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">last_name *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">middle_name</span>
          <span className="bg-blue-100 px-2 py-1 rounded">department *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">position *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">employment_status *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">date_hired *</span>
          <span className="bg-blue-100 px-2 py-1 rounded">birth_date</span>
          <span className="bg-blue-100 px-2 py-1 rounded">contact_number</span>
          <span className="bg-blue-100 px-2 py-1 rounded">address</span>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-mscorp-blue transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">
              {file ? file.name : 'Click to upload CSV file'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or drag and drop your file here
            </p>
          </label>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Preview (first 5 rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).slice(0, 6).map((key) => (
                      <th key={key} className="px-3 py-2 text-left font-medium text-gray-600">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).slice(0, 6).map((val: any, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700">
                          {val || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Options */}
        {file && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendEmails}
                onChange={(e) => setSendEmails(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-mscorp-blue focus:ring-mscorp-blue"
              />
              <Mail className="w-4 h-4 ml-3 mr-2 text-gray-500" />
              <span className="text-sm text-gray-700">
                Send activation emails to all imported employees
              </span>
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Import Button */}
        {file && (
          <button
            onClick={handleImport}
            disabled={importing}
            className="mt-6 w-full py-3 px-4 bg-mscorp-blue text-white font-medium rounded-lg hover:bg-mscorp-dark transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Import Employees
              </>
            )}
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Import Complete
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{result.success}</p>
                <p className="text-sm text-green-700">Successfully imported</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{result.failed}</p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Errors:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-sm p-3 bg-red-50 rounded-lg text-red-700">
                      Row {err.row}: {err.email} - {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
