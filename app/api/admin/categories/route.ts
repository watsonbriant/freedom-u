import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('uuid, category, category_description, category_order')
      .order('category_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'An error occurred fetching categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, category_description } = body;

    if (!category) {
      return NextResponse.json(
        { error: 'category is required' },
        { status: 400 }
      );
    }

    // Get the max category_order to set the new category at the end
    const { data: maxOrderData, error: maxError } = await supabase
      .from('categories')
      .select('category_order')
      .order('category_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrderData ? maxOrderData.category_order + 1 : 1;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        category,
        category_description: category_description || null,
        category_order: newOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { error: 'An error occurred creating category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in create category API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, category, category_description } = body;

    if (!uuid || !category) {
      return NextResponse.json(
        { error: 'uuid and category are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .update({
        category,
        category_description: category_description || null,
      })
      .eq('uuid', uuid)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return NextResponse.json(
        { error: 'An error occurred updating category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in update category API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body; // Array of { uuid, category_order }

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'categories array is required' },
        { status: 400 }
      );
    }

    // Update all categories in a transaction-like manner
    const updates = categories.map((cat: { uuid: string; category_order: number }) =>
      supabase
        .from('categories')
        .update({ category_order: cat.category_order })
        .eq('uuid', cat.uuid)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('Error updating category orders:', errors);
      return NextResponse.json(
        { error: 'An error occurred updating category orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reorder categories API:', error);
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
      .from('categories')
      .delete()
      .eq('uuid', uuid);

    if (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json(
        { error: 'An error occurred deleting category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete category API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

