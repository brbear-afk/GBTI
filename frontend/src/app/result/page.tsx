'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { PaperShell } from '@/components/paper-shell';
import {
  readAnalysisResult,
  type AnalysisAxis,
  type AnalyzeTestResponse,
} from '@/lib/api/tests';

const traitDefinitions: Array<{ axis: AnalysisAxis; left: string; right: string }> = [
  { axis: 'long', left: 'Short', right: 'Long' },
  { axis: 'repressed', left: 'Expressed', right: 'Repressed' },
  { axis: 'ornate', left: 'Plain', right: 'Ornate' },
  { axis: 'concrete', left: 'Abstract', right: 'Concrete' },
  { axis: 'gloomy', left: 'Bright', right: 'Gloomy' },
];

const sampleScores: Record<AnalysisAxis, number> = {
  long: 83,
  repressed: 62,
  ornate: 71,
  concrete: 56,
  gloomy: 69,
};

export default function ResultPage() {
  const [analysis, setAnalysis] = useState<AnalyzeTestResponse | null>(null);

  useEffect(() => {
    setAnalysis(readAnalysisResult());
  }, []);

  const display = useMemo(() => {
    if (!analysis) {
      return {
        type: 'LROC-G',
        name: '고요한 풍경화가',
        introduction: '풍부한 장면과 긴 호흡 속에 감춰진 감정을 서서히 침잠시키는 글.',
        summary:
          '긴 호흡과 풍부한 장면 속에서 감정을 조용히 드러내는 글입니다. 현재 화면은 Gemini 분석 전에도 확인할 수 있는 샘플 결과입니다.',
        scores: sampleScores,
        strengths: [
          '하나의 장면을 오래 발전시키는 호흡',
          '감정을 행동과 분위기로 전달하는 방식',
          '감각적인 이미지와 구체적인 묘사',
        ],
        isSample: true,
      };
    }

    const details = traitDefinitions.map(({ axis }) => analysis.result.axisAnalysis[axis].summary);
    return {
      type: analysis.result.type,
      name: analysis.result.profile.name,
      introduction: analysis.result.profile.introduction,
      summary: `${details[0]} ${details[1]}`,
      scores: analysis.result.scores,
      strengths: details.slice(0, 3),
      isSample: false,
    };
  }, [analysis]);

  return (
    <PaperShell compact>
      <main className="result-page">
        <header className="result-heading">
          <p className="overline">— YOUR LITERARY TYPE —</p>
          <h1>{display.type}</h1>
          <h2>「{display.name}」</h2>
          <div className="profile-divider" aria-hidden="true" />
          <p className="profile-introduction">{display.introduction}</p>
        </header>

        <div className="quote-mark" aria-hidden="true">“</div>
        <p className="result-summary">{display.summary}</p>

        <section className="traits" aria-labelledby="traits-title">
          <h3 id="traits-title">— TRAITS · 성향 분석 —</h3>
          <div className="trait-list">
            {traitDefinitions.map((trait) => {
              const score = display.scores[trait.axis];
              return (
                <div className="trait" key={trait.axis}>
                  <div className="trait-labels">
                    <span>{trait.left}</span>
                    <b>{score}</b>
                    <span>{trait.right}</span>
                  </div>
                  <div className="trait-track">
                    <span className="trait-midpoint" />
                    <span className="trait-position" style={{ left: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="result-notes">
          <section>
            <h3>ANALYSIS · 분석 요약</h3>
            <ul>
              {display.strengths.map((strength) => <li key={strength}>{strength}</li>)}
            </ul>
          </section>
          <section>
            <h3>PROFILE · 참고</h3>
            <p>{display.isSample ? '현재 표시 중인 결과' : '분석 처리 상태'}</p>
            <strong>{display.isSample ? '샘플 프로필' : 'Gemini 분석 완료'}</strong>
            <small>32개 글BTI 유형 데이터에서 코드에 맞는 프로필을 표시합니다.</small>
          </section>
        </div>

        <div className="chapter-symbol" aria-hidden="true">▢</div>
        <Link className="primary-button" href="/">
          ↻ 다시 하기 <span>· RESTART</span>
        </Link>
      </main>
    </PaperShell>
  );
}
