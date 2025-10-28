import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .order('category_order', { ascending: true });

    if (categoryError) {
      return NextResponse.json(
        { error: categoryError.message },
        { status: 500 }
      );
    }

    // Get all courses for these categories
    const categoryNames = categories?.map(cat => cat.category) || [];
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('course_name, category')
      .in('category', categoryNames);

    if (courseError) {
      return NextResponse.json(
        { error: courseError.message },
        { status: 500 }
      );
    }

    // Get all items for these courses
    const courseNames = courses?.map(c => c.course_name) || [];
    const { data: items, error: itemError } = await supabase
      .from('items')
      .select('course, item_type, video_url, video_title, document_url, document_title, text_content, text_title, quiz')
      .in('course', courseNames);

    if (itemError) {
      return NextResponse.json(
        { error: itemError.message },
        { status: 500 }
      );
    }

    // Count items by category and type
    const categoriesWithCounts = categories?.map(category => {
      const categoryCourses = courses?.filter(c => c.category === category.category) || [];
      const categoryCourseNames = categoryCourses.map(c => c.course_name);
      const categoryItems = items?.filter(item => 
        categoryCourseNames.includes(item.course)
      ) || [];

      const counts = {
        videos: categoryItems.filter(item => item.video_url || item.video_title).length,
        documents: categoryItems.filter(item => item.document_url || item.document_title).length,
        texts: categoryItems.filter(item => item.text_content || item.text_title).length,
        quizzes: categoryItems.filter(item => item.quiz).length,
      };

      return {
        ...category,
        counts
      };
    });

    return NextResponse.json({ data: categoriesWithCounts });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

