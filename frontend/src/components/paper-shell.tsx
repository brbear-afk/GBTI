import type { ReactNode } from 'react';

interface PaperShellProps {
  children: ReactNode;
  compact?: boolean;
  ornaments?: boolean;
}

export function PaperShell({ children, compact = false, ornaments = true }: PaperShellProps) {
  return (
    <div className="site-frame">
      <section className={`paper-shell${compact ? ' paper-shell--compact' : ''}`}>
        {ornaments && (
          <>
            <span className="paper-ornament paper-ornament--left" aria-hidden="true">
              ❧
            </span>
            <span className="paper-ornament paper-ornament--right" aria-hidden="true">
              ❧
            </span>
          </>
        )}
        <div className="paper-content">{children}</div>
      </section>
      <p className="site-signature" aria-hidden="true">
        — GEULBTI · A LITERARY PROFILE —
      </p>
    </div>
  );
}
