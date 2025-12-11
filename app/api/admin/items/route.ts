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

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await checkAdminAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { course, item_type, ...itemData } = body;

    if (!course || !item_type) {
      return NextResponse.json(
        { error: 'course and item_type are required' },
        { status: 400 }
      );
    }

    // Get the max item_order for this course to set the new item at the end
    const { data: maxOrderData, error: maxError } = await supabase
      .from('items')
      .select('item_order')
      .eq('course', course)
      .order('item_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrderData ? maxOrderData.item_order + 1 : 1;

    // Build the insert object with only the fields that are provided
    const insertData: Record<string, any> = {
      course,
      item_type,
      item_order: newOrder,
    };

    // Add fields based on item_type
    if (item_type === 'document') {
      if (itemData.document_title) insertData.document_title = itemData.document_title;
      if (itemData.document_description) insertData.document_description = itemData.document_description;
      if (itemData.document_url) insertData.document_url = itemData.document_url;
    } else if (item_type === 'link') {
      if (itemData.link_title) insertData.link_title = itemData.link_title;
      if (itemData.link_url) insertData.link_url = itemData.link_url;
    } else if (item_type === 'podcast') {
      if (itemData.podcast_title) insertData.podcast_title = itemData.podcast_title;
      if (itemData.podcast_url) insertData.podcast_url = itemData.podcast_url;
    } else if (item_type === 'quiz') {
      if (itemData.quiz) insertData.quiz = itemData.quiz;
    } else if (item_type === 'text') {
      if (itemData.text_title) insertData.text_title = itemData.text_title;
      if (itemData.text_content) insertData.text_content = itemData.text_content;
    } else if (item_type === 'video') {
      if (itemData.video_title) insertData.video_title = itemData.video_title;
      if (itemData.video_url) insertData.video_url = itemData.video_url;
      if (itemData.video_duration) insertData.video_duration = itemData.video_duration;
      if (itemData.video_description) insertData.video_description = itemData.video_description;
    } else if (item_type === 'video_doc') {
      if (itemData.video_title) insertData.video_title = itemData.video_title;
      if (itemData.video_url) insertData.video_url = itemData.video_url;
      if (itemData.video_duration) insertData.video_duration = itemData.video_duration;
      if (itemData.video_description) insertData.video_description = itemData.video_description;
      if (itemData.document_title) insertData.document_title = itemData.document_title;
      if (itemData.document_description) insertData.document_description = itemData.document_description;
      if (itemData.document_url) insertData.document_url = itemData.document_url;
    }

    const { data, error } = await supabase
      .from('items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return NextResponse.json(
        { error: 'An error occurred creating item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in create item API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await checkAdminAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { uuid, ...updateData } = body;

    if (!uuid) {
      return NextResponse.json(
        { error: 'uuid is required' },
        { status: 400 }
      );
    }

    // Remove undefined/null values to avoid overwriting with null
    const cleanedData: Record<string, any> = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== null && updateData[key] !== '') {
        cleanedData[key] = updateData[key];
      }
    });

    const { data, error } = await supabase
      .from('items')
      .update(cleanedData)
      .eq('uuid', uuid)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      return NextResponse.json(
        { error: 'An error occurred updating item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in update item API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await checkAdminAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { course, items } = body; // Array of { uuid, item_order }

    if (!course || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'course and items array are required' },
        { status: 400 }
      );
    }

    // Update all items in this course
    const updates = items.map((item: { uuid: string; item_order: number }) =>
      supabase
        .from('items')
        .update({ item_order: item.item_order })
        .eq('uuid', item.uuid)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error('Error updating item orders:', errors);
      return NextResponse.json(
        { error: 'An error occurred updating item orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reorder items API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await checkAdminAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get('uuid');

    if (!uuid) {
      return NextResponse.json(
        { error: 'uuid parameter is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('uuid', uuid);

    if (error) {
      console.error('Error deleting item:', error);
      return NextResponse.json(
        { error: 'An error occurred deleting item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete item API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
