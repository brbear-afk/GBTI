'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PaperShell } from '@/components/paper-shell';
import {
  analyzeTest,
  createSimpleTest,
  readTestSession,
  saveAnalysisResult,
  saveTestSession,
  type TestSession,
} from '@/lib/api/tests';

export default function TestPage() {
  const router = useRouter();
  const [session, setSession] = useState<TestSession | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadSession(forceNew = false) {
    setIsLoading(true);
    setError(null);

    try {
      const loaded = forceNew ? null : readTestSession();
      const nextSession = loaded ?? (await createSimpleTest());
      if (!loaded) saveTestSession(nextSession);
      setSession(nextSession);
      setAnswers(nextSession.questions.map(() => ''));
      setCurrent(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '문항을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSession();
  }, []);

  if (isLoading) {
    return (
      <PaperShell ornaments={false}>
        <main className="state-page" aria-live="polite">
          <p className="overline">PREPARING YOUR QUESTIONS</p>
          <div className="loading-glyph" aria-hidden="true">❧</div>
          <h1>당신을 위한 문항을 고르고 있습니다.</h1>
        </main>
      </PaperShell>
    );
  }

  if (error || !session) {
    return (
      <PaperShell ornaments={false}>
        <main className="state-page">
          <p className="overline">A MOMENT, PLEASE</p>
          <h1>문항을 불러오지 못했습니다.</h1>
          <p className="state-message" role="alert">{error}</p>
          <button className="primary-button" onClick={() => void loadSession(true)} type="button">
            다시 시도
          </button>
        </main>
      </PaperShell>
    );
  }

  const activeSession = session;
  const { questions, recommendedLength } = activeSession;
  const question = questions[current];
  const answer = answers[current] ?? '';
  const canContinue = answer.trim().length >= recommendedLength.minChars;

  function updateAnswer(value: string) {
    setAnswers((previous) => {
      const next = [...previous];
      next[current] = value.slice(0, recommendedLength.maxChars);
      return next;
    });
  }

  async function goNext() {
    if (!canContinue) return;
    if (current === questions.length - 1) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const result = await analyzeTest(activeSession, answers);
        saveAnalysisResult(result);
        router.push('/result');
      } catch (cause) {
        setSubmitError(cause instanceof Error ? cause.message : '분석을 완료하지 못했습니다.');
        setIsSubmitting(false);
      }
      return;
    }
    setCurrent((value) => value + 1);
  }

  return (
    <PaperShell ornaments={false}>
      <main className="test-page">
        <header className="test-status">
          <div>
            <p className="overline">
              QUESTION {String(current + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
            </p>
            <p className="category-label">{question.category}</p>
          </div>
          <div className="progress-marks" aria-label={`${questions.length}문항 중 ${current + 1}번째`}>
            {questions.map(({ id }, index) => (
              <span className={index <= current ? 'is-active' : ''} key={id} />
            ))}
          </div>
        </header>

        <div className="question-divider" aria-hidden="true">❧</div>

        <section className="question-copy">
          <h1>{question.prompt}</h1>
          <p>— 정답은 없습니다. 떠오르는 장면을 자유롭게 써주세요.</p>
        </section>

        <label className="sr-only" htmlFor="writing-answer">
          {current + 1}번 문항 답안
        </label>
        <textarea
          id="writing-answer"
          className="writing-area"
          maxLength={recommendedLength.maxChars}
          onChange={(event) => updateAnswer(event.target.value)}
          placeholder="이곳에 당신의 문장을 적어 주세요…"
          value={answer}
        />

        <div className="writing-meta">
          <p className={canContinue ? 'is-valid' : ''}>
            최소 {recommendedLength.minChars}자 이상 작성해 주세요.
          </p>
          <p>{answer.length} / {recommendedLength.maxChars}</p>
        </div>

        <nav className="test-navigation" aria-label="문항 이동">
          <button
            className="secondary-button"
            disabled={current === 0}
            onClick={() => setCurrent((value) => value - 1)}
            type="button"
          >
            ← 이전
          </button>
          <button
            className="primary-button"
            disabled={!canContinue || isSubmitting}
            onClick={() => void goNext()}
            type="button"
          >
            {isSubmitting
              ? '분석 중…'
              : current === questions.length - 1
                ? '분석하기'
                : '다음'}{' '}
            {!isSubmitting && <span>→</span>}
          </button>
        </nav>
        {submitError && <p className="submit-error" role="alert">{submitError}</p>}
      </main>
    </PaperShell>
  );
}
