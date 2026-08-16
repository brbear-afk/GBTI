'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createSimpleTest, saveTestSession } from '@/lib/api/tests';

export function StartTestButton() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startTest() {
    setIsStarting(true);
    setError(null);

    try {
      const session = await createSimpleTest();
      saveTestSession(session);
      router.push('/test');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '검사를 시작하지 못했습니다.');
      setIsStarting(false);
    }
  }

  return (
    <div className="start-action">
      <button className="primary-button" disabled={isStarting} onClick={startTest} type="button">
        {isStarting ? '문항을 고르는 중…' : '시작하기'}
        {!isStarting && <span>· BEGIN</span>}
      </button>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </div>
  );
}

