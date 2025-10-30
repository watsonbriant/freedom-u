import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists in lp_completion
    const { data: existingUser, error: checkError } = await supabase
      .from('lp_completion')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error checking email:', checkError);
      return NextResponse.json(
        { error: 'An error occurred checking email' },
        { status: 500 }
      );
    }

    // If user doesn't exist, create a new record
    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('lp_completion')
        .insert([
          {
            email: email.toLowerCase().trim(),
            uuid: randomUUID(),
            intro_vid: false,
            track1_a: false,
            track1_b: false,
            track1_bonus: false,
            track1_quiz: false,
            track2_a: false,
            track2_b: false,
            track2_bonus: false,
            track2_quiz: false,
            track3_a: false,
            track3_b: false,
            track3_bonus: false,
            track3_quiz: false,
            track4_a: false,
            track4_b: false,
            track4_bonus: false,
            track4_quiz: false,
            bonustrack_vid: false,
          },
        ]);

      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json(
          { error: 'An error occurred creating user record' },
          { status: 500 }
        );
      }
    }

    // Set email in session cookie with 30 day expiry
    const cookieStore = await cookies();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    cookieStore.set('freedomu_email', email.toLowerCase().trim(), {
      httpOnly: false, // Set to false so client can read it for the pill
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in register-email:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

