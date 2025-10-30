import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, lp_identifier } = await request.json();

    if (!email || !lp_identifier) {
      return NextResponse.json(
        { error: 'email and lp_identifier are required' },
        { status: 400 }
      );
    }

    // Check if email exists in lp_completion
    const { data: existingUser, error: checkError } = await supabase
      .from('lp_completion')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" - if user doesn't exist, return error
      // Otherwise it's a real error
      console.error('Error checking email:', checkError);
      return NextResponse.json(
        { error: 'An error occurred checking email' },
        { status: 500 }
      );
    }

    // If user doesn't exist, we can't mark completion
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Email not found. Please register your email first.' },
        { status: 404 }
      );
    }

    // Update the specific lp_identifier column to TRUE
    // We use a dynamic update where lp_identifier is the column name
    const updateData: Record<string, boolean> = {};
    updateData[lp_identifier] = true;

    const { error: updateError } = await supabase
      .from('lp_completion')
      .update(updateData)
      .eq('email', email.toLowerCase().trim());

    if (updateError) {
      console.error('Error updating completion:', updateError);
      return NextResponse.json(
        { error: 'An error occurred updating completion status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in mark-complete:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

