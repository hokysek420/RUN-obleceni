import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ admin: null }, { status: 401 });
  }

  return NextResponse.json({
    admin: {
      id: session.adminId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
