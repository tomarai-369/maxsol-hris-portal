// Kintone API wrapper for HRIS Portal

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN || 'ms-corp.cybozu.com';
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN || '';

// App IDs
export const KINTONE_APPS = {
  EMPLOYEES: parseInt(process.env.KINTONE_APP_EMPLOYEES || '303'),
  LEAVE_REQUESTS: parseInt(process.env.KINTONE_APP_LEAVE_REQUESTS || '304'),
  DOCUMENT_REQUESTS: parseInt(process.env.KINTONE_APP_DOCUMENT_REQUESTS || '305'),
  ANNOUNCEMENTS: parseInt(process.env.KINTONE_APP_ANNOUNCEMENTS || '306'),
  LEAVE_BALANCES: parseInt(process.env.KINTONE_APP_LEAVE_BALANCES || '307'),
  DTR: parseInt(process.env.KINTONE_APP_DTR || '308'),
  PAYROLL: parseInt(process.env.KINTONE_APP_PAYROLL || '309'),
  BENEFITS: parseInt(process.env.KINTONE_APP_BENEFITS || '310'),
  LOANS: parseInt(process.env.KINTONE_APP_LOANS || '311'),
  SCHEDULES: parseInt(process.env.KINTONE_APP_SCHEDULES || '312'),
};

interface KintoneResponse {
  records?: any[];
  record?: any;
  id?: string;
  revision?: string;
  totalCount?: string;
}

// Generic Kintone API call
async function kintoneRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const url = `https://${KINTONE_DOMAIN}/k/v1/${endpoint}`;
  
  const headers: Record<string, string> = {
    'X-Cybozu-API-Token': KINTONE_API_TOKEN,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error('Kintone API Error:', {
        endpoint,
        status: response.status,
        error: data
      });
      throw new Error(data.message || `Kintone error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Kintone request failed:', error);
    throw error;
  }
}

// Get records with query
export async function getRecords(
  appId: number,
  query: string = '',
  fields?: string[],
  totalCount: boolean = false
): Promise<KintoneResponse> {
  const params = new URLSearchParams({
    app: appId.toString(),
  });

  if (query) params.append('query', query);
  if (fields) params.append('fields', JSON.stringify(fields));
  if (totalCount) params.append('totalCount', 'true');

  return kintoneRequest(`records.json?${params.toString()}`);
}

// Get single record
export async function getRecord(appId: number, recordId: number): Promise<any> {
  const params = new URLSearchParams({
    app: appId.toString(),
    id: recordId.toString(),
  });

  const response = await kintoneRequest(`record.json?${params.toString()}`);
  return response.record;
}

// Add record
export async function addRecord(appId: number, record: any): Promise<{ id: string; revision: string }> {
  return kintoneRequest('record.json', 'POST', {
    app: appId,
    record,
  });
}

// Update record
export async function updateRecord(
  appId: number,
  recordId: number,
  record: any
): Promise<{ revision: string }> {
  return kintoneRequest('record.json', 'PUT', {
    app: appId,
    id: recordId,
    record,
  });
}

// =====================
// Employee Operations
// =====================

export interface Employee {
  id: number;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  department: string;
  position: string;
  employmentStatus: string;
  dateHired: string;
  birthDate?: string;
  contactNumber?: string;
  address?: string;
  emergencyContact?: string;
  emergencyNumber?: string;
  passwordHash?: string;
  isVerified: boolean;
  verificationToken?: string;
}

export async function getEmployeeByEmail(email: string): Promise<Employee | null> {
  try {
    const query = `email = "${email}"`;
    const response = await getRecords(KINTONE_APPS.EMPLOYEES, query);

    if (!response.records || response.records.length === 0) {
      return null;
    }

    return mapEmployeeRecord(response.records[0]);
  } catch (error) {
    console.error('getEmployeeByEmail error:', error);
    throw error;
  }
}

export async function getEmployeeById(recordId: number): Promise<Employee | null> {
  try {
    const r = await getRecord(KINTONE_APPS.EMPLOYEES, recordId);
    return mapEmployeeRecord(r);
  } catch {
    return null;
  }
}

export async function getEmployeeByEmployeeId(employeeId: string): Promise<Employee | null> {
  try {
    const query = `employee_id = "${employeeId}"`;
    const response = await getRecords(KINTONE_APPS.EMPLOYEES, query);

    if (!response.records || response.records.length === 0) {
      return null;
    }

    return mapEmployeeRecord(response.records[0]);
  } catch (error) {
    console.error('getEmployeeByEmployeeId error:', error);
    return null;
  }
}

function mapEmployeeRecord(r: any): Employee {
  return {
    id: parseInt(r.$id?.value || '0'),
    employeeId: r.employee_id?.value || '',
    email: r.email?.value || '',
    firstName: r.first_name?.value || '',
    lastName: r.last_name?.value || '',
    middleName: r.middle_name?.value || '',
    department: r.department?.value || '',
    position: r.position?.value || '',
    employmentStatus: r.employment_status?.value || '',
    dateHired: r.date_hired?.value || '',
    birthDate: r.birth_date?.value || '',
    contactNumber: r.contact_number?.value || '',
    address: r.address?.value || '',
    emergencyContact: r.emergency_contact?.value || '',
    emergencyNumber: r.emergency_number?.value || '',
    passwordHash: r.password_hash?.value || '',
    isVerified: r.is_verified?.value === 'Yes',
    verificationToken: r.verification_token?.value || '',
  };
}

export async function updateEmployeePassword(
  recordId: number,
  passwordHash: string
): Promise<void> {
  await updateRecord(KINTONE_APPS.EMPLOYEES, recordId, {
    password_hash: { value: passwordHash },
    is_verified: { value: 'Yes' },
    verification_token: { value: '' },
  });
}

export async function setVerificationToken(
  recordId: number,
  token: string
): Promise<void> {
  await updateRecord(KINTONE_APPS.EMPLOYEES, recordId, {
    verification_token: { value: token },
  });
}

export async function updateEmployeeProfile(
  recordId: number,
  data: Partial<Employee>
): Promise<void> {
  const record: any = {};
  
  if (data.contactNumber !== undefined) record.contact_number = { value: data.contactNumber };
  if (data.address !== undefined) record.address = { value: data.address };
  if (data.emergencyContact !== undefined) record.emergency_contact = { value: data.emergencyContact };
  if (data.emergencyNumber !== undefined) record.emergency_number = { value: data.emergencyNumber };

  await updateRecord(KINTONE_APPS.EMPLOYEES, recordId, record);
}

// =====================
// Leave Operations
// =====================

export interface LeaveRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approver?: string;
  approvedDate?: string;
  remarks?: string;
  createdAt: string;
}

export async function getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
  const query = `employee_id = "${employeeId}" order by Created_datetime desc limit 100`;
  const response = await getRecords(KINTONE_APPS.LEAVE_REQUESTS, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    employeeId: r.employee_id?.value || '',
    employeeName: r.employee_name?.value || '',
    leaveType: r.leave_type?.value || '',
    startDate: r.start_date?.value || '',
    endDate: r.end_date?.value || '',
    totalDays: parseFloat(r.total_days?.value || '0'),
    reason: r.reason?.value || '',
    status: r.status?.value || 'Pending',
    approver: r.approver?.value || '',
    approvedDate: r.approved_date?.value || '',
    remarks: r.remarks?.value || '',
    createdAt: r.created_at?.value || '',
  }));
}

export async function createLeaveRequest(
  employeeId: string,
  employeeName: string,
  data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }
): Promise<{ id: string }> {
  return addRecord(KINTONE_APPS.LEAVE_REQUESTS, {
    employee_id: { value: employeeId },
    employee_name: { value: employeeName },
    leave_type: { value: data.leaveType },
    start_date: { value: data.startDate },
    end_date: { value: data.endDate },
    total_days: { value: data.totalDays.toString() },
    reason: { value: data.reason },
    status: { value: 'Pending' },
    created_at: { value: new Date().toISOString().split('T')[0] },
  });
}

// =====================
// Leave Balance Operations
// =====================

export interface LeaveBalance {
  leaveType: string;
  totalCredits: number;
  used: number;
  remaining: number;
}

export async function getEmployeeLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
  const query = `employee_id = "${employeeId}"`;
  const response = await getRecords(KINTONE_APPS.LEAVE_BALANCES, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    leaveType: r.leave_type?.value || '',
    totalCredits: parseFloat(r.total_credits?.value || '0'),
    used: parseFloat(r.used?.value || '0'),
    remaining: parseFloat(r.remaining?.value || '0'),
  }));
}

// =====================
// Document Request Operations
// =====================

export interface DocumentRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  documentType: string;
  purpose: string;
  quantity: number;
  status: string;
  remarks?: string;
  releaseDate?: string;
  createdAt: string;
}

export async function getEmployeeDocumentRequests(employeeId: string): Promise<DocumentRequest[]> {
  const query = `employee_id = "${employeeId}" order by Created_datetime desc limit 100`;
  const response = await getRecords(KINTONE_APPS.DOCUMENT_REQUESTS, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    employeeId: r.employee_id?.value || '',
    employeeName: r.employee_name?.value || '',
    documentType: r.document_type?.value || '',
    purpose: r.purpose?.value || '',
    quantity: parseInt(r.quantity?.value || '1'),
    status: r.status?.value || 'Pending',
    remarks: r.remarks?.value || '',
    releaseDate: r.release_date?.value || '',
    createdAt: r.created_at?.value || '',
  }));
}

export async function createDocumentRequest(
  employeeId: string,
  employeeName: string,
  data: {
    documentType: string;
    purpose: string;
    quantity: number;
  }
): Promise<{ id: string }> {
  return addRecord(KINTONE_APPS.DOCUMENT_REQUESTS, {
    employee_id: { value: employeeId },
    employee_name: { value: employeeName },
    document_type: { value: data.documentType },
    purpose: { value: data.purpose },
    quantity: { value: data.quantity.toString() },
    status: { value: 'Pending' },
    created_at: { value: new Date().toISOString().split('T')[0] },
  });
}

// =====================
// Announcements Operations
// =====================

export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  isActive: boolean;
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const today = new Date().toISOString().split('T')[0];
  const query = `is_active = "Yes" and publish_date <= "${today}" order by priority desc, publish_date desc limit 20`;
  const response = await getRecords(KINTONE_APPS.ANNOUNCEMENTS, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    title: r.title?.value || '',
    content: r.content?.value || '',
    category: r.category?.value || 'General',
    priority: r.priority?.value || 'Normal',
    publishDate: r.publish_date?.value || '',
    expiryDate: r.expiry_date?.value || '',
    isActive: r.is_active?.value === 'Yes',
  }));
}

// =====================
// DTR Operations
// =====================

export interface DTRRecord {
  id: number;
  employeeId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  lunchOut?: string;
  lunchIn?: string;
  totalHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  status: string;
  remarks?: string;
}

export async function getEmployeeDTR(employeeId: string, month?: string): Promise<DTRRecord[]> {
  let query = `employee_id = "${employeeId}"`;
  if (month) {
    const [year, m] = month.split('-');
    const startDate = `${year}-${m}-01`;
    const endDate = `${year}-${m}-31`;
    query += ` and date >= "${startDate}" and date <= "${endDate}"`;
  }
  query += ' order by date desc limit 100';
  
  const response = await getRecords(KINTONE_APPS.DTR, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    employeeId: r.employee_id?.value || '',
    date: r.date?.value || '',
    timeIn: r.time_in?.value || '',
    timeOut: r.time_out?.value || '',
    lunchOut: r.lunch_out?.value || '',
    lunchIn: r.lunch_in?.value || '',
    totalHours: parseFloat(r.total_hours?.value || '0'),
    overtimeHours: parseFloat(r.overtime_hours?.value || '0'),
    lateMinutes: parseInt(r.late_minutes?.value || '0'),
    status: r.status?.value || 'Present',
    remarks: r.remarks?.value || '',
  }));
}

export async function getTodayDTR(employeeId: string): Promise<DTRRecord | null> {
  const today = new Date().toISOString().split('T')[0];
  const query = `employee_id = "${employeeId}" and date = "${today}"`;
  const response = await getRecords(KINTONE_APPS.DTR, query);

  if (!response.records || response.records.length === 0) {
    return null;
  }

  const r = response.records[0];
  return {
    id: parseInt(r.$id.value),
    employeeId: r.employee_id?.value || '',
    date: r.date?.value || '',
    timeIn: r.time_in?.value || '',
    timeOut: r.time_out?.value || '',
    lunchOut: r.lunch_out?.value || '',
    lunchIn: r.lunch_in?.value || '',
    totalHours: parseFloat(r.total_hours?.value || '0'),
    overtimeHours: parseFloat(r.overtime_hours?.value || '0'),
    lateMinutes: parseInt(r.late_minutes?.value || '0'),
    status: r.status?.value || 'Present',
    remarks: r.remarks?.value || '',
  };
}

export async function clockIn(employeeId: string, employeeName: string, location?: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  await addRecord(KINTONE_APPS.DTR, {
    employee_id: { value: employeeId },
    employee_name: { value: employeeName },
    date: { value: today },
    time_in: { value: timeNow },
    status: { value: 'Present' },
    remarks: { value: location ? `GPS: ${location}` : '' },
  });
}

export async function clockOut(recordId: number): Promise<void> {
  const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  
  await updateRecord(KINTONE_APPS.DTR, recordId, {
    time_out: { value: timeNow },
  });
}

// =====================
// Payroll Operations
// =====================

export interface PayrollRecord {
  id: number;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  basicPay: number;
  overtimePay: number;
  holidayPay: number;
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

export async function getEmployeePayroll(employeeId: string, year?: number): Promise<PayrollRecord[]> {
  let query = `employee_id = "${employeeId}"`;
  if (year) {
    query += ` and pay_period_start >= "${year}-01-01" and pay_period_start <= "${year}-12-31"`;
  }
  query += ' order by pay_period_start desc limit 50';
  
  const response = await getRecords(KINTONE_APPS.PAYROLL, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    employeeId: r.employee_id?.value || '',
    periodStart: r.pay_period_start?.value || '',
    periodEnd: r.pay_period_end?.value || '',
    basicPay: parseFloat(r.basic_pay?.value || '0'),
    overtimePay: parseFloat(r.overtime_pay?.value || '0'),
    holidayPay: parseFloat(r.holiday_pay?.value || '0'),
    allowances: parseFloat(r.allowances?.value || '0'),
    grossPay: parseFloat(r.gross_pay?.value || '0'),
    sssDeduction: parseFloat(r.sss_deduction?.value || '0'),
    philhealthDeduction: parseFloat(r.philhealth_deduction?.value || '0'),
    pagibigDeduction: parseFloat(r.pagibig_deduction?.value || '0'),
    taxDeduction: parseFloat(r.tax_deduction?.value || '0'),
    loanDeduction: parseFloat(r.loan_deduction?.value || '0'),
    otherDeductions: parseFloat(r.other_deductions?.value || '0'),
    totalDeductions: parseFloat(r.total_deductions?.value || '0'),
    netPay: parseFloat(r.net_pay?.value || '0'),
    status: r.status?.value || '',
    payDate: r.pay_date?.value || '',
  }));
}

// =====================
// Benefits Operations
// =====================

export interface Benefits {
  employeeId: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
  tinNumber: string;
  hmoProvider: string;
  hmoPlan: string;
  hmoCardNumber: string;
  hmoDependents: number;
  bankName: string;
  bankAccount: string;
  lifeInsurancePolicy: string;
}

export async function getEmployeeBenefits(employeeId: string): Promise<Benefits | null> {
  const query = `employee_id = "${employeeId}"`;
  const response = await getRecords(KINTONE_APPS.BENEFITS, query);

  if (!response.records || response.records.length === 0) {
    return null;
  }

  const r = response.records[0];
  return {
    employeeId: r.employee_id?.value || '',
    sssNumber: r.sss_number?.value || '',
    philhealthNumber: r.philhealth_number?.value || '',
    pagibigNumber: r.pagibig_number?.value || '',
    tinNumber: r.tin_number?.value || '',
    hmoProvider: r.hmo_provider?.value || '',
    hmoPlan: r.hmo_plan?.value || '',
    hmoCardNumber: r.hmo_card_number?.value || '',
    hmoDependents: parseInt(r.hmo_dependents?.value || '0'),
    bankName: r.bank_name?.value || '',
    bankAccount: r.bank_account?.value || '',
    lifeInsurancePolicy: r.life_insurance_policy?.value || '',
  };
}

// =====================
// Loans Operations
// =====================

export interface Loan {
  id: number;
  employeeId: string;
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

export async function getEmployeeLoans(employeeId: string): Promise<Loan[]> {
  const query = `employee_id = "${employeeId}" order by start_date desc`;
  const response = await getRecords(KINTONE_APPS.LOANS, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    employeeId: r.employee_id?.value || '',
    loanType: r.loan_type?.value || '',
    principalAmount: parseFloat(r.principal_amount?.value || '0'),
    interestRate: parseFloat(r.interest_rate?.value || '0'),
    totalAmount: parseFloat(r.total_amount?.value || '0'),
    monthlyAmortization: parseFloat(r.monthly_amortization?.value || '0'),
    totalPaid: parseFloat(r.total_paid?.value || '0'),
    balance: parseFloat(r.balance?.value || '0'),
    startDate: r.start_date?.value || '',
    endDate: r.end_date?.value || '',
    status: r.status?.value || '',
  }));
}
