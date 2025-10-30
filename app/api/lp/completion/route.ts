import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'email parameter is required' },
        { status: 400 }
      );
    }

    // Fetch completion record for this email
    const { data: completion, error } = await supabase
      .from('lp_completion')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows found" - return empty data, not an error
      console.error('Error fetching completion:', error);
      return NextResponse.json(
        { error: 'An error occurred fetching completion status' },
        { status: 500 }
      );
    }

    // If no record found, return empty object
    if (!completion) {
      return NextResponse.json({ data: null });
    }

    // Return the completion data (excluding email and uuid for security)
    // We'll return all the boolean columns which are the lp_identifiers
    const { uuid, email: emailField, ...completionData } = completion;
    return NextResponse.json({ data: completionData });
  } catch (error) {
    console.error('Error in completion:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

