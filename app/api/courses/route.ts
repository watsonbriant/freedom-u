import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryUuid = searchParams.get('category_uuid');

    if (!categoryUuid) {
      return NextResponse.json(
        { error: 'category_uuid parameter is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Resolve category name by uuid
    const { data: categoryRow, error: categoryError } = await supabase
      .from('categories')
      .select('category')
      .eq('uuid', categoryUuid)
      .single();

    if (categoryError || !categoryRow) {
      return NextResponse.json(
        { error: categoryError?.message || 'Category not found' },
        { status: 404 }
      );
    }

    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('category', categoryRow.category)
      .order('seq_order', { ascending: true });

    if (courseError) {
      return NextResponse.json(
        { error: courseError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: courses || [], categoryName: categoryRow.category });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

