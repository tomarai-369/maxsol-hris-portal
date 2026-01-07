import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addRecord, KINTONE_APPS, getEmployeeByEmail } from '@/lib/kintone';
import { generateVerificationToken } from '@/lib/auth';
import { sendActivationEmail } from '@/lib/email';

interface EmployeeRow {
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  department: string;
  position: string;
  employment_status: string;
  date_hired: string;
  birth_date?: string;
  contact_number?: string;
  address?: string;
}

function parseCSV(text: string): EmployeeRow[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse headers
  const headers = lines[0].split(',').map(h => 
    h.trim().toLowerCase().replace(/"/g, '').replace(/ /g, '_')
  );

  // Parse rows
  const rows: EmployeeRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    headers.forEach((header, j) => {
      row[header] = values[j]?.trim().replace(/"/g, '') || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

function validateRow(row: EmployeeRow, rowNum: number): string | null {
  if (!row.employee_id) return `Row ${rowNum}: Missing employee_id`;
  if (!row.email) return `Row ${rowNum}: Missing email`;
  if (!row.first_name) return `Row ${rowNum}: Missing first_name`;
  if (!row.last_name) return `Row ${rowNum}: Missing last_name`;
  if (!row.department) return `Row ${rowNum}: Missing department`;
  if (!row.position) return `Row ${rowNum}: Missing position`;
  if (!row.employment_status) return `Row ${rowNum}: Missing employment_status`;
  if (!row.date_hired) return `Row ${rowNum}: Missing date_hired`;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row.email)) {
    return `Row ${rowNum}: Invalid email format`;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(row.date_hired)) {
    return `Row ${rowNum}: Invalid date_hired format (use YYYY-MM-DD)`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, any logged-in user can import (you may want to restrict this)

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sendEmails = formData.get('sendEmails') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; email: string; error: string }>,
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 because row 1 is header, and we're 0-indexed

      try {
        // Validate row
        const validationError = validateRow(row, rowNum);
        if (validationError) {
          results.errors.push({ row: rowNum, email: row.email || 'unknown', error: validationError });
          results.failed++;
          continue;
        }

        // Check if email already exists
        const existing = await getEmployeeByEmail(row.email.toLowerCase());
        if (existing) {
          results.errors.push({ row: rowNum, email: row.email, error: 'Email already exists' });
          results.failed++;
          continue;
        }

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create employee record
        await addRecord(KINTONE_APPS.EMPLOYEES, {
          employee_id: { value: row.employee_id },
          email: { value: row.email.toLowerCase() },
          first_name: { value: row.first_name },
          last_name: { value: row.last_name },
          middle_name: { value: row.middle_name || '' },
          department: { value: row.department },
          position: { value: row.position },
          employment_status: { value: row.employment_status },
          date_hired: { value: row.date_hired },
          birth_date: { value: row.birth_date || '' },
          contact_number: { value: row.contact_number || '' },
          address: { value: row.address || '' },
          is_verified: { value: 'No' },
          verification_token: { value: verificationToken },
          password_hash: { value: '' },
        });

        // Send activation email if enabled
        if (sendEmails) {
          await sendActivationEmail(row.email, row.first_name, verificationToken);
        }

        results.success++;

      } catch (error: any) {
        results.errors.push({
          row: rowNum,
          email: row.email || 'unknown',
          error: error.message || 'Unknown error',
        });
        results.failed++;
      }
    }

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
