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

    const { data, error } = await supabase
      .from('quizzes')
      .select('uuid, quiz_name')
      .order('quiz_name', { ascending: true });

    if (error) {
      console.error('Error fetching quizzes:', error);
      return NextResponse.json(
        { error: 'An error occurred fetching quizzes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in quizzes API:', error);
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
    const { uuid, quiz_name } = body;

    if (!uuid || !quiz_name || !quiz_name.trim()) {
      return NextResponse.json(
        { error: 'uuid and quiz_name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quizzes')
      .update({ quiz_name: quiz_name.trim() })
      .eq('uuid', uuid)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz:', error);
      return NextResponse.json(
        { error: 'An error occurred updating quiz' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in update quiz API:', error);
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
    const { quiz_name } = body;

    if (!quiz_name || !quiz_name.trim()) {
      return NextResponse.json(
        { error: 'quiz_name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert({ quiz_name: quiz_name.trim() })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      return NextResponse.json(
        { error: 'An error occurred creating quiz' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in create quiz API:', error);
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

    // First, get the quiz name to delete associated quiz_questions
    const { data: quizData, error: quizFetchError } = await supabase
      .from('quizzes')
      .select('quiz_name')
      .eq('uuid', uuid)
      .single();

    if (quizFetchError || !quizData) {
      console.error('Error fetching quiz:', quizFetchError);
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Delete all associated quiz_questions first
    const { error: questionsDeleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz', quizData.quiz_name);

    if (questionsDeleteError) {
      console.error('Error deleting quiz questions:', questionsDeleteError);
      return NextResponse.json(
        { error: 'An error occurred deleting quiz questions' },
        { status: 500 }
      );
    }

    // Then delete the quiz
    const { error: quizDeleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('uuid', uuid);

    if (quizDeleteError) {
      console.error('Error deleting quiz:', quizDeleteError);
      return NextResponse.json(
        { error: 'An error occurred deleting quiz' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete quiz API:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
