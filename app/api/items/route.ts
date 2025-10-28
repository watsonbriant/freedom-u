import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseUuid = searchParams.get('course_uuid');

    if (!courseUuid) {
      return NextResponse.json(
        { error: 'course_uuid parameter is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Resolve course name by uuid
    const { data: courseRow, error: courseError } = await supabase
      .from('courses')
      .select('course_name')
      .eq('uuid', courseUuid)
      .single();

    if (courseError || !courseRow) {
      return NextResponse.json(
        { error: courseError?.message || 'Course not found' },
        { status: 404 }
      );
    }

    // Fetch items for this course
    const { data: items, error: itemError } = await supabase
      .from('items')
      .select('uuid, item_type, video_title, video_url, video_description, video_duration, document_title, document_url, document_description, text_title, text_content, quiz, item_order')
      .eq('course', courseRow.course_name)
      .order('item_order', { ascending: true });

    if (itemError) {
      return NextResponse.json(
        { error: itemError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: items || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

