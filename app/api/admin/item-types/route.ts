import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/admin';

export async function GET() {
  try {
    // Check admin authentication
    if (!(await checkAdminAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('item_types')
      .select('item_type')
      .order('item_type', { ascending: true });

    if (error) {
      console.error('Error fetching item types:', error);
      return NextResponse.json(
        { error: 'An error occurred fetching item types' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in item types API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
