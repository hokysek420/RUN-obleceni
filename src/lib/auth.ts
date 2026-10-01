import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'run_customer_default_secret_2026';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'run_admin_default_secret_2026';

export interface CustomerPayload {
  userId: number;
  email: string;
  name: string;
}

export interface AdminPayload {
  adminId: number;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'CONTENT_MANAGER';
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function comparePassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

export function signCustomerToken(payload: CustomerPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyCustomerToken(token: string): CustomerPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerPayload;
  } catch {
    return null;
  }
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function getCustomerSession(): CustomerPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get('run_customer_token')?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function getAdminSession(): AdminPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get('run_admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
