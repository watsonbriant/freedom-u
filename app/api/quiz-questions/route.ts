import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quizName = searchParams.get('quiz_name');

    if (!quizName) {
      return NextResponse.json(
        { error: 'quiz_name parameter is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch quiz questions for this quiz, ordered by quiz_order
    const { data: questions, error: questionError } = await supabase
      .from('quiz_questions')
      .select('id, question, options, correct_answer, quiz_order')
      .eq('quiz', quizName)
      .order('quiz_order', { ascending: true });

    if (questionError) {
      return NextResponse.json(
        { error: questionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: questions || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
