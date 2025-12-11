import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all categories sorted by category_order
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('category, category_order')
      .order('category_order', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json(
        { error: 'An error occurred fetching categories' },
        { status: 500 }
      );
    }

    // Fetch all courses sorted by seq_order
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('uuid, course_name, category, seq_order')
      .order('category', { ascending: true })
      .order('seq_order', { ascending: true });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'An error occurred fetching courses' },
        { status: 500 }
      );
    }

    // Fetch all items with all fields
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('uuid, item_type, course, item_order, video_title, video_url, video_duration, video_description, document_title, document_description, document_url, link_title, link_url, podcast_title, podcast_url, quiz, text_title, text_content')
      .order('course', { ascending: true })
      .order('item_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return NextResponse.json(
        { error: 'An error occurred fetching items' },
        { status: 500 }
      );
    }

    // Create a map of category to category_order for sorting
    const categoryOrderMap = new Map(
      categories?.map((cat) => [cat.category, cat.category_order]) || []
    );

    // Group courses by category
    const coursesByCategory: Record<string, typeof courses> = {};
    courses?.forEach((course) => {
      if (!coursesByCategory[course.category]) {
        coursesByCategory[course.category] = [];
      }
      coursesByCategory[course.category].push(course);
    });

    // Group items by course
    const itemsByCourse: Record<string, typeof items> = {};
    items?.forEach((item) => {
      if (!itemsByCourse[item.course]) {
        itemsByCourse[item.course] = [];
      }
      itemsByCourse[item.course].push(item);
    });

    // Build hierarchical structure
    const result = categories
      ?.sort((a, b) => a.category_order - b.category_order)
      .map((category) => {
        const categoryCourses = (coursesByCategory[category.category] || [])
          .sort((a, b) => (a.seq_order || 0) - (b.seq_order || 0))
          .map((course) => ({
            ...course,
            items: (itemsByCourse[course.course_name] || [])
              .sort((a, b) => a.item_order - b.item_order),
          }));

        return {
          category: category.category,
          category_order: category.category_order,
          courses: categoryCourses,
        };
      }) || [];

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in items API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
