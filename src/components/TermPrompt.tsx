import React from 'react';

interface TermPromptProps {
  compact?: boolean; // true on mobile — hides host/path
}

/**
 * Renders the shell prompt prefix.
 * Desktop: visitor@joshua-mason:~$
 * Mobile:  ~$
 */
const TermPrompt: React.FC<TermPromptProps> = () => {
  return (
    <span className="term-prompt" aria-hidden="true" style={{ whiteSpace: 'nowrap', userSelect: 'none' }}>
      <span className="prompt-user">visitor</span>
      <span className="prompt-at">@</span>
      <span className="prompt-host">joshua-mason</span>
      <span className="prompt-path">:~</span>
      <span className="prompt-dollar">$ </span>
    </span>
  );
};

export default TermPrompt;
