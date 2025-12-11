import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await checkAdminAuth())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const emailSearch = searchParams.get('email') || '';

    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('lp_completion')
      .select('*', { count: 'exact' })
      .order('email', { ascending: true });

    // Apply email search filter if provided
    if (emailSearch) {
      query = query.ilike('email', `%${emailSearch}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'An error occurred fetching users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

