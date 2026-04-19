import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const step = searchParams.get('step'); // 'step1', 'step2ck', 'mixed', 'all'
  const specialty = searchParams.get('specialty'); // e.g., 'Cardiology', 'all'
  const difficulty = searchParams.get('difficulty'); // 'Easy', 'Medium', 'Hard', 'all'
  const limit = parseInt(searchParams.get('limit') || '40', 10);

  try {
    let questions: Record<string, unknown>[] = [];
    const dataDir = path.join(process.cwd(), 'data', 'usmle-questions');

    const loadStep1 = step === 'step1' || step === 'mixed' || step === 'all' || !step;
    const loadStep2 = step === 'step2ck' || step === 'mixed' || step === 'all';

    if (loadStep1 && fs.existsSync(path.join(dataDir, 'step1.json'))) {
      const step1Data = JSON.parse(fs.readFileSync(path.join(dataDir, 'step1.json'), 'utf-8'));
      questions = questions.concat(step1Data);
    }

    if (loadStep2 && fs.existsSync(path.join(dataDir, 'step2ck.json'))) {
      const step2Data = JSON.parse(fs.readFileSync(path.join(dataDir, 'step2ck.json'), 'utf-8'));
      questions = questions.concat(step2Data);
    }

    // Filter by specialty
    if (specialty && specialty !== 'all' && specialty !== 'Mixed') {
      questions = questions.filter(q => q.specialty === specialty);
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'all' && difficulty !== 'Mixed') {
      questions = questions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle and limit
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const limited = shuffled.slice(0, limit);

    return NextResponse.json({ questions: limited, totalAvailable: questions.length });
  } catch (error) {
    console.error('Error fetching USMLE questions:', error);
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
  }
}
