import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await context.params;
    // Decode the category name
    const decodedCategory = decodeURIComponent(category);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: courses, error } = await supabase
      .from('courses')
      .select('course_name, course_description, seq_order')
      .eq('category', decodedCategory)
      .order('seq_order', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: courses });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

