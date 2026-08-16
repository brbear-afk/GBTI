import { PaperShell } from '@/components/paper-shell';
import { StartTestButton } from '@/components/start-test-button';

export default function HomePage() {
  return (
    <PaperShell>
      <main className="landing-page">
        <header className="brand-block">
          <p className="overline">EST · MMXXVI</p>
          <h1 className="brand-title">
            글<span>BTI</span>
          </h1>
          <p className="brand-subtitle">The Writer&apos;s Literary Profile</p>
        </header>

        <div className="chapter-divider" aria-hidden="true">
          <span />
          <b>▢</b>
          <span />
        </div>

        <section className="landing-intro">
          <p>당신의 문장에는 당신만의 결이 있습니다.</p>
          <p>네 편의 짧은 글을 통해 반복되는 문체의 성향을 살펴봅니다.</p>
          <p className="english-note">
            Four short writings reveal the quiet temperament of your sentences.
          </p>
        </section>

        <section className="guide-box" aria-labelledby="guide-title">
          <h2 id="guide-title">— 안내 · GUIDE</h2>
          <ul>
            <li>서로 다른 네 가지 글쓰기 문항이 제시됩니다.</li>
            <li>각 문항에 100자 이상 자유롭게 작성해 주세요.</li>
            <li>답변을 마치면 다섯 축의 문체 성향을 확인합니다.</li>
            <li>예상 소요 시간은 약 8~12분입니다.</li>
          </ul>
        </section>

        <StartTestButton />
      </main>
    </PaperShell>
  );
}
