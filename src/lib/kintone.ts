// Kintone API wrapper for HRIS Portal
// All Kintone operations go through this module

const KINTONE_DOMAIN = process.env.KINTONE_DOMAIN!;

// Multiple API tokens (comma-separated for different apps)
const KINTONE_API_TOKEN = process.env.KINTONE_API_TOKEN!;

// App IDs - configure these based on your Kintone setup
export const KINTONE_APPS = {
  EMPLOYEES: parseInt(process.env.KINTONE_APP_EMPLOYEES || '0'),
  LEAVE_REQUESTS: parseInt(process.env.KINTONE_APP_LEAVE_REQUESTS || '0'),
  DOCUMENT_REQUESTS: parseInt(process.env.KINTONE_APP_DOCUMENT_REQUESTS || '0'),
  ANNOUNCEMENTS: parseInt(process.env.KINTONE_APP_ANNOUNCEMENTS || '0'),
  LEAVE_BALANCES: parseInt(process.env.KINTONE_APP_LEAVE_BALANCES || '0'),
};

interface KintoneResponse {
  records?: any[];
  record?: any;
  id?: string;
  revision?: string;
  totalCount?: string;
}

interface KintoneError {
  message: string;
  id: string;
  code: string;
}

// Generic Kintone API call
async function kintoneRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  appToken?: string
): Promise<any> {
  const url = `https://${KINTONE_DOMAIN}/k/v1/${endpoint}`;
  
  // Use provided token or default combined token
  const token = appToken || KINTONE_API_TOKEN;
  
  const headers: Record<string, string> = {
    'X-Cybozu-API-Token': token,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const error = data as KintoneError;
    throw new Error(`Kintone API Error: ${error.message || 'Unknown error'}`);
  }

  return data;
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
  profilePicture?: string;
}

export async function getEmployeeByEmail(email: string): Promise<Employee | null> {
  const query = `email = "${email}"`;
  const response = await getRecords(KINTONE_APPS.EMPLOYEES, query);

  if (!response.records || response.records.length === 0) {
    return null;
  }

  const r = response.records[0];
  return mapEmployeeRecord(r);
}

export async function getEmployeeById(recordId: number): Promise<Employee | null> {
  try {
    const r = await getRecord(KINTONE_APPS.EMPLOYEES, recordId);
    return mapEmployeeRecord(r);
  } catch {
    return null;
  }
}

function mapEmployeeRecord(r: any): Employee {
  return {
    id: parseInt(r.$id.value),
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
    profilePicture: r.profile_picture?.value?.[0]?.fileKey || '',
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
  
  if (data.contactNumber) record.contact_number = { value: data.contactNumber };
  if (data.address) record.address = { value: data.address };
  if (data.emergencyContact) record.emergency_contact = { value: data.emergencyContact };
  if (data.emergencyNumber) record.emergency_number = { value: data.emergencyNumber };

  await updateRecord(KINTONE_APPS.EMPLOYEES, recordId, record);
}

// =====================
// Leave Operations
// =====================

export interface LeaveRequest {
  id: number;
  employeeId: number;
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

export async function getEmployeeLeaveRequests(employeeId: number): Promise<LeaveRequest[]> {
  const query = `employee_id = "${employeeId}" order by created_at desc`;
  const response = await getRecords(KINTONE_APPS.LEAVE_REQUESTS, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    employeeId: parseInt(r.employee_id?.value || '0'),
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
    createdAt: r.created_at?.value || r.$revision?.value || '',
  }));
}

export async function createLeaveRequest(
  employeeId: number,
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
    employee_id: { value: employeeId.toString() },
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

export async function getEmployeeLeaveBalances(employeeId: number): Promise<LeaveBalance[]> {
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
  employeeId: number;
  employeeName: string;
  documentType: string;
  purpose: string;
  quantity: number;
  status: string;
  remarks?: string;
  releaseDate?: string;
  createdAt: string;
}

export async function getEmployeeDocumentRequests(employeeId: number): Promise<DocumentRequest[]> {
  const query = `employee_id = "${employeeId}" order by created_at desc`;
  const response = await getRecords(KINTONE_APPS.DOCUMENT_REQUESTS, query);

  if (!response.records) return [];

  return response.records.map((r: any) => ({
    id: parseInt(r.$id.value),
    employeeId: parseInt(r.employee_id?.value || '0'),
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
  employeeId: number,
  employeeName: string,
  data: {
    documentType: string;
    purpose: string;
    quantity: number;
  }
): Promise<{ id: string }> {
  return addRecord(KINTONE_APPS.DOCUMENT_REQUESTS, {
    employee_id: { value: employeeId.toString() },
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
  const query = `is_active = "Yes" and publish_date <= "${today}" order by priority desc, publish_date desc limit 10`;
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
