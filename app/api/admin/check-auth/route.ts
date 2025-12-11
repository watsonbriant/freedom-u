import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllowedAdminEmails } from '@/lib/admin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('freedomu_admin_session');
    const emailCookie = cookieStore.get('freedomu_email');
    const userEmail = emailCookie?.value?.toLowerCase().trim();

    // Check both session cookie and email authorization
    if (session?.value === 'authenticated' && userEmail) {
      const allowedEmails = getAllowedAdminEmails();
      if (allowedEmails.includes(userEmail)) {
        return NextResponse.json({ authenticated: true });
      }
    }

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
