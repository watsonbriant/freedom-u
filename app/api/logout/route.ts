import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie
    cookieStore.delete('freedomu_session');
    
    // Clear the admin session cookie
    cookieStore.delete('freedomu_admin_session');
    
    // Clear the email cookie
    cookieStore.delete('freedomu_email');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

