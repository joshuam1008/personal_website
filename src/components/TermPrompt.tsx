import React from 'react';
import { formatPath } from '../lib/filesystem';

interface TermPromptProps {
  path?: string;
}

/**
 * Renders the shell prompt prefix.
 * Desktop: visitor@joshua-mason:~$
 * Shows current filesystem path when provided.
 */
const TermPrompt: React.FC<TermPromptProps> = ({ path }) => {
  const displayPath = path ? formatPath(path) : '~';

  return (
    <span className="term-prompt" aria-hidden="true" style={{ whiteSpace: 'nowrap', userSelect: 'none' }}>
      <span className="prompt-user">visitor</span>
      <span className="prompt-at">@</span>
      <span className="prompt-host">joshua-mason</span>
      <span className="prompt-path">:{displayPath}</span>
      <span className="prompt-dollar">$ </span>
    </span>
  );
};

export default TermPrompt;
