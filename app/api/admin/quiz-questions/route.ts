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
    const quizName = searchParams.get('quiz_name');

    if (!quizName) {
      return NextResponse.json(
        { error: 'quiz_name parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, question, options, correct_answer, quiz_order')
      .eq('quiz', quizName)
      .order('quiz_order', { ascending: true });

    if (error) {
      console.error('Error fetching quiz questions:', error);
      return NextResponse.json(
        { error: 'An error occurred fetching quiz questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in quiz questions API:', error);
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
    const { id, question, options, correct_answer } = body;

    if (!id || !question || !options || !Array.isArray(options) || typeof correct_answer !== 'number') {
      return NextResponse.json(
        { error: 'id, question, options (array), and correct_answer (number) are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quiz_questions')
      .update({
        question,
        options,
        correct_answer,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz question:', error);
      return NextResponse.json(
        { error: 'An error occurred updating quiz question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in update quiz question API:', error);
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
    const { quiz_name, question, options, correct_answer } = body;

    if (!quiz_name || !question || !options || !Array.isArray(options) || typeof correct_answer !== 'number') {
      return NextResponse.json(
        { error: 'quiz_name, question, options (array), and correct_answer (number) are required' },
        { status: 400 }
      );
    }

    if (options.length < 2 || options.length > 10) {
      return NextResponse.json(
        { error: 'options must have between 2 and 10 items' },
        { status: 400 }
      );
    }

    if (correct_answer < 0 || correct_answer >= options.length) {
      return NextResponse.json(
        { error: 'correct_answer must be a valid index within the options array' },
        { status: 400 }
      );
    }

    // Get the max quiz_order for this quiz to set the new question at the end
    const { data: maxOrderData, error: maxError } = await supabase
      .from('quiz_questions')
      .select('quiz_order')
      .eq('quiz', quiz_name)
      .order('quiz_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrderData ? maxOrderData.quiz_order + 1 : 1;

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz: quiz_name,
        question,
        options,
        correct_answer,
        quiz_order: newOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz question:', error);
      return NextResponse.json(
        { error: 'An error occurred creating quiz question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in create quiz question API:', error);
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quiz question:', error);
      return NextResponse.json(
        { error: 'An error occurred deleting quiz question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete quiz question API:', error);
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
    const { quiz_name, questions } = body; // Array of { id, quiz_order }

    if (!quiz_name || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'quiz_name and questions array are required' },
        { status: 400 }
      );
    }

    // Update all questions' quiz_order for this quiz
    const updates = questions.map((q: { id: string; quiz_order: number }) =>
      supabase
        .from('quiz_questions')
        .update({ quiz_order: q.quiz_order })
        .eq('id', q.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      console.error('Error updating question orders:', errors);
      return NextResponse.json(
        { error: 'An error occurred updating question orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in reorder quiz questions API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
