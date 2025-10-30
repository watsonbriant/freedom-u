import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const emailCookie = cookieStore.get('freedomu_email');

    if (emailCookie?.value) {
      return NextResponse.json({ email: emailCookie.value });
    }

    return NextResponse.json(
      { email: null },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { email: null },
      { status: 500 }
    );
  }
}

