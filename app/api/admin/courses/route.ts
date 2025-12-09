import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all courses with their categories
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('uuid, course_name, course_description, category, seq_order')
      .order('category', { ascending: true })
      .order('seq_order', { ascending: true });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'An error occurred fetching courses' },
        { status: 500 }
      );
    }

    // Fetch categories to get their order
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

    // Create a map of category to category_order for sorting
    const categoryOrderMap = new Map(
      categories?.map((cat) => [cat.category, cat.category_order]) || []
    );

    // Group courses by category and sort categories by category_order
    const groupedCourses: Record<string, typeof courses> = {};
    courses?.forEach((course) => {
      if (!groupedCourses[course.category]) {
        groupedCourses[course.category] = [];
      }
      groupedCourses[course.category].push(course);
    });

    // Sort categories by category_order
    const sortedCategories = Object.keys(groupedCourses).sort((a, b) => {
      const orderA = categoryOrderMap.get(a) ?? 999;
      const orderB = categoryOrderMap.get(b) ?? 999;
      return orderA - orderB;
    });

    // Build result with sorted categories
    const result = sortedCategories.map((category) => ({
      category,
      courses: groupedCourses[category],
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in courses API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_name, course_description, category } = body;

    if (!course_name || !category) {
      return NextResponse.json(
        { error: 'course_name and category are required' },
        { status: 400 }
      );
    }

    // Get the max seq_order for this category to set the new course at the end
    const { data: maxOrderData, error: maxError } = await supabase
      .from('courses')
      .select('seq_order')
      .eq('category', category)
      .order('seq_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrderData ? maxOrderData.seq_order + 1 : 1;

    const { data, error } = await supabase
      .from('courses')
      .insert({
        course_name,
        course_description: course_description || null,
        category,
        seq_order: newOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json(
        { error: 'An error occurred creating course' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in create course API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, course_name, course_description, category } = body;

    if (!uuid || !course_name || !category) {
      return NextResponse.json(
        { error: 'uuid, course_name, and category are required' },
        { status: 400 }
      );
    }

    // If category changed, we need to update seq_order for the new category
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('category, seq_order')
      .eq('uuid', uuid)
      .single();

    let seqOrder = existingCourse?.seq_order;
    if (existingCourse?.category !== category) {
      // Category changed, get max order for new category
      const { data: maxOrderData } = await supabase
        .from('courses')
        .select('seq_order')
        .eq('category', category)
        .order('seq_order', { ascending: false })
        .limit(1)
        .single();
      seqOrder = maxOrderData ? maxOrderData.seq_order + 1 : 1;
    }

    const { data, error } = await supabase
      .from('courses')
      .update({
        course_name,
        course_description: course_description || null,
        category,
        seq_order: seqOrder,
      })
      .eq('uuid', uuid)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return NextResponse.json(
        { error: 'An error occurred updating course' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in update course API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, courses } = body; // Array of { uuid, seq_order }

    if (!category || !courses || !Array.isArray(courses)) {
      return NextResponse.json(
        { error: 'category and courses array are required' },
        { status: 400 }
      );
    }

    // Update all courses in this category
    const updates = courses.map((course: { uuid: string; seq_order: number }) =>
      supabase
        .from('courses')
        .update({ seq_order: course.seq_order })
        .eq('uuid', course.uuid)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error('Error updating course orders:', errors);
      return NextResponse.json(
        { error: 'An error occurred updating course orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reorder courses API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'uuid parameter is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('uuid', uuid);

    if (error) {
      console.error('Error deleting course:', error);
      return NextResponse.json(
        { error: 'An error occurred deleting course' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete course API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

