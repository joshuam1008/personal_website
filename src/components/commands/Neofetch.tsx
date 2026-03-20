import { useState, useEffect } from 'react';

const START_TIME = Date.now();

const LOGO = [
  '     ██████  ',
  '    ██░░░░██ ',
  '   ██░░░░░░██',
  '   ██░░░░░░██',
  '    ██░░░░██ ',
  '     ██████  ',
];

type InfoRow = { label: string; value: string };

const Neofetch = () => {
  const [uptime, setUptime] = useState(() =>
    Math.floor((Date.now() - START_TIME) / 1000)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setUptime(Math.floor((Date.now() - START_TIME) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const uptimeStr =
    uptime < 60
      ? `${uptime}s`
      : uptime < 3600
      ? `${Math.floor(uptime / 60)}m ${uptime % 60}s`
      : `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;

  const info: InfoRow[] = [
    { label: 'visitor', value: '@joshua-mason' },
    { label: '─────────────', value: '─────────────────' },
    { label: 'OS', value: 'JoshuaOS 1.0' },
    { label: 'Host', value: 'Joshua Mason' },
    { label: 'Role', value: 'Applied Scientist & AI Engineer' },
    { label: 'Shell', value: 'portfolioSH 1.0' },
    { label: 'Stack', value: 'Python, TypeScript, React' },
    { label: 'Uptime', value: uptimeStr },
  ];

  return (
    <div style={{ fontFamily: 'inherit', lineHeight: '1.6' }}>
      {LOGO.map((line, i) => {
        const row = info[i];
        return (
          <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ color: 'var(--accent)', whiteSpace: 'pre' }}>
              {line}
            </span>
            {row && (
              <span>
                {i === 0 ? (
                  <>
                    <span style={{ color: 'var(--accent)' }}>visitor</span>
                    <span style={{ color: 'var(--text-dim)' }}>@</span>
                    <span style={{ color: 'var(--accent)' }}>joshua-mason</span>
                  </>
                ) : i === 1 ? (
                  <span style={{ color: 'var(--text-dim)' }}>
                    ─────────────────────────────
                  </span>
                ) : (
                  <>
                    <span
                      style={{
                        color: 'var(--accent2)',
                        display: 'inline-block',
                        width: '8ch',
                        fontSize: '0.85em',
                      }}
                    >
                      {row.label}:
                    </span>
                    <span style={{ color: 'var(--text)', fontSize: '0.85em' }}>
                      {row.value}
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Neofetch;
