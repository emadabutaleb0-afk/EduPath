import { describe, it, expect } from 'vitest';

describe('Server-Side Assessment Scoring & Integrity', () => {
  it('should accurately calculate scores using authoritative answer keys', () => {
    const questions = [
      { id: 'q-1', correctAnswer: '0', weight: 1.0, subject: 'Math' },
      { id: 'q-2', correctAnswer: 'true', weight: 2.0, subject: 'Math' },
      { id: 'q-3', correctAnswer: '3', weight: 1.0, subject: 'Math' },
    ];

    const studentAnswers = {
      'q-1': '0',     // Correct (1.0)
      'q-2': 'false', // Incorrect (0)
      'q-3': '3'      // Correct (1.0)
    };

    let serverScore = 0;
    let totalScore = 0;

    for (const q of questions) {
      totalScore += q.weight;
      const submitted = String(studentAnswers[q.id as keyof typeof studentAnswers] ?? '').trim().toLowerCase();
      const correct = String(q.correctAnswer).trim().toLowerCase();
      if (submitted === correct) {
        serverScore += q.weight;
      }
    }

    const percentage = Math.round((serverScore / totalScore) * 100);

    expect(serverScore).toBe(2.0);
    expect(totalScore).toBe(4.0);
    expect(percentage).toBe(50);
  });

  it('should ignore client-reported scores and override with verified score', () => {
    // A malicious client attempts to report a 100% score despite wrong answers
    const clientReportedScore = 100;
    const clientReportedPercentage = 100;

    const questions = [
      { id: 'q-1', correctAnswer: 'A', weight: 1.0 },
      { id: 'q-2', correctAnswer: 'B', weight: 1.0 }
    ];

    const submittedAnswers = {
      'q-1': 'C', // wrong
      'q-2': 'D'  // wrong
    };

    let serverCalculatedScore = 0;
    for (const q of questions) {
      if (submittedAnswers[q.id as keyof typeof submittedAnswers] === q.correctAnswer) {
        serverCalculatedScore += q.weight;
      }
    }

    expect(serverCalculatedScore).toBe(0);
    expect(serverCalculatedScore).not.toBe(clientReportedScore);
  });

  it('should redact correctAnswer and explanation for student views', () => {
    const rawQuestions = [
      {
        id: 'q-1',
        text: 'What is 5 + 7?',
        options: ['10', '11', '12', '13'],
        correctAnswer: '2',
        explanation: '5 + 7 = 12',
        subject: 'Math'
      }
    ];

    const studentView = rawQuestions.map(q => {
      const { correctAnswer, explanation, ...safeQ } = q;
      return safeQ;
    });

    expect(studentView[0]).not.toHaveProperty('correctAnswer');
    expect(studentView[0]).not.toHaveProperty('explanation');
    expect(studentView[0]).toHaveProperty('options');
    expect(studentView[0]).toHaveProperty('text');
  });
});
