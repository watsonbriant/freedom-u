import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllowedAdminEmails } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === 'Freedom2002!@!@') {
      // Check if user's email is in the approved admin list
      const cookieStore = await cookies();
      const emailCookie = cookieStore.get('freedomu_email');
      const userEmail = emailCookie?.value?.toLowerCase().trim();

      if (!userEmail) {
        return NextResponse.json(
          { error: 'No email found. Please set your email first.' },
          { status: 403 }
        );
      }

      const allowedEmails = getAllowedAdminEmails();
      if (!allowedEmails.includes(userEmail)) {
        return NextResponse.json(
          { error: 'Your email is not authorized to access the admin panel.' },
          { status: 403 }
        );
      }

      // Create session cookie with 7 day expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      cookieStore.set('freedomu_admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
