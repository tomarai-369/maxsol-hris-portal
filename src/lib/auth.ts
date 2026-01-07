import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getEmployeeByEmail, getEmployeeById, type Employee } from './kintone';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  employeeId: number;
  email: string;
  firstName: string;
  lastName: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Generate random token for email verification
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get current user from cookies (server-side)
export async function getCurrentUser(): Promise<Employee | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return getEmployeeById(payload.employeeId);
}

// Authenticate user
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; employee?: Employee; error?: string }> {
  const employee = await getEmployeeByEmail(email);

  if (!employee) {
    return { success: false, error: 'Email not found. Please contact HR.' };
  }

  if (!employee.isVerified || !employee.passwordHash) {
    return { success: false, error: 'Account not activated. Please check your email for activation link.' };
  }

  const isValid = await verifyPassword(password, employee.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid password.' };
  }

  const token = generateToken({
    employeeId: employee.id,
    email: employee.email,
    firstName: employee.firstName,
    lastName: employee.lastName,
  });

  return { success: true, token, employee };
}
