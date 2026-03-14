import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Output from './Output';
import TermPrompt from './TermPrompt';
import { COMMAND_NAMES, COMMANDS } from '../data/commands';
import { applyTheme, type ThemeName } from './commands/Themes';
import { termContext, type TermContextValue } from './termContext';
import type { ResumeEntry } from './commands/Resume';
import type { ProjectEntry } from './commands/Projects';
import type { BlogEntry } from './commands/Blog';

// ── Types ──────────────────────────────────────────────────
interface TerminalProps {
  resume: ResumeEntry[];
  projects: ProjectEntry[];
  blog: BlogEntry[];
}

type HistoryEntry = {
  id: string;
  raw: string;         // raw input string
  cmd: string;         // first token (the command name)
  args: string[];      // remaining tokens
};

// ── Constants ──────────────────────────────────────────────
const VALID_CMDS = new Set(COMMAND_NAMES);

// ── Unique ID helper ───────────────────────────────────────
let counter = 0;
const uid = () => `cmd-${Date.now()}-${counter++}`;

// ── Terminal ───────────────────────────────────────────────
const Terminal: React.FC<TerminalProps> = ({ resume, projects, blog }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [inputVal, setInputVal] = useState('');
  // Each entry represents a submitted command in order (oldest first)
  const [cmdHistory, setCmdHistory] = useState<HistoryEntry[]>([
    // Auto-run "welcome" on mount
    { id: uid(), raw: 'welcome', cmd: 'welcome', args: [] },
  ]);
  // String list for ↑↓ navigation (most-recent first)
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [navPointer, setNavPointer] = useState(-1);
  // Tab-completion hints
  const [hints, setHints] = useState<string[]>([]);
  // Set to the id of the most recent entry on submit (triggers useEffects in commands)
  const [latestId, setLatestId] = useState<string>('');

  // ── Focus management ─────────────────────────────────────
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.addEventListener('click', focusInput);
    return () => document.removeEventListener('click', focusInput);
  }, [focusInput]);

  // Initial focus
  useEffect(() => { focusInput(); }, []);

  // ── Scroll to bottom after any new output ────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cmdHistory]);

  // ── Restore saved theme on mount ─────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('terminal-theme') as ThemeName | null;
    if (saved) applyTheme(saved);
  }, []);

  // ── Prevent page scrolling on ArrowUp/Down ───────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── clearHistory callback (passed via context to Clear command) ──
  const clearHistory = useCallback(() => {
    setCmdHistory([]);
    setHints([]);
    setNavPointer(-1);
  }, []);

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const raw = inputVal.trim();
    const tokens = raw.split(/\s+/).filter(Boolean);
    const cmd = tokens[0] ?? '';
    const args = tokens.slice(1);
    const id = uid();

    setInputVal('');
    setHints([]);
    setNavPointer(-1);
    setLatestId(id);

    // Add to navigation history (most-recent first)
    if (raw) {
      setNavHistory((prev) => [raw, ...prev]);
    }

    setCmdHistory((prev) => [...prev, { id, raw, cmd, args }]);
  };

  // ── Keyboard: history navigation + tab-complete + Ctrl+L ─
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const ctrlL = e.ctrlKey && e.key.toLowerCase() === 'l';
    const isTab = e.key === 'Tab' || (e.ctrlKey && e.key.toLowerCase() === 'i');

    // Ctrl+L — clear
    if (ctrlL) {
      e.preventDefault();
      clearHistory();
      return;
    }

    // Tab — autocomplete
    if (isTab) {
      e.preventDefault();
      if (!inputVal) return;

      const tokens = inputVal.split(/\s+/);
      // Only autocomplete the command name (first token), not args
      if (tokens.length === 1) {
        // If there's a trailing space, they might be starting tab completion for the next term, but we'll ignore for now unless length > 1
        if (inputVal.endsWith(' ')) {
          // find exactly matching command
          const exactCmd = COMMANDS.find((c) => c.cmd === tokens[0]);
          if (exactCmd?.subCommands) {
            setHints(exactCmd.subCommands);
          }
          return;
        }

        const prefix = tokens[0].toLowerCase();
        const matches = COMMAND_NAMES.filter((c) => c.startsWith(prefix));
        if (matches.length === 1) {
          setInputVal(matches[0] + ' '); // add space to encourage subcommand typing
          setHints([]);
        } else if (matches.length > 1) {
          setHints(matches);
        }
      } else if (tokens.length === 2 && !inputVal.endsWith(' ')) {
        const baseCmd = tokens[0].toLowerCase();
        const prefix = tokens[1].toLowerCase();
        
        const commandInfo = COMMANDS.find((c) => c.cmd === baseCmd);
        if (commandInfo?.subCommands) {
          const matches = commandInfo.subCommands.filter((sub) => sub.startsWith(prefix));
          if (matches.length === 1) {
            setInputVal(`${baseCmd} ${matches[0]} `);
            setHints([]);
          } else if (matches.length > 1) {
            setHints(matches);
          }
        }
      }
      return;
    }

    // ArrowUp — go to older command
    if (e.key === 'ArrowUp') {
      const newPtr = Math.min(navPointer + 1, navHistory.length - 1);
      setNavPointer(newPtr);
      setInputVal(navHistory[newPtr] ?? '');
      // Move caret to end on next tick
      setTimeout(() => {
        const el = inputRef.current;
        if (el) el.setSelectionRange(el.value.length, el.value.length);
      }, 0);
      return;
    }

    // ArrowDown — go to newer command (or clear)
    if (e.key === 'ArrowDown') {
      if (navPointer <= 0) {
        setNavPointer(-1);
        setInputVal('');
      } else {
        const newPtr = navPointer - 1;
        setNavPointer(newPtr);
        setInputVal(navHistory[newPtr] ?? '');
      }
      return;
    }

    // Any other key clears hints
    setHints([]);
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div id="terminal-root" onClick={focusInput}>
      {/* Rendered command history (oldest first) */}
      {cmdHistory.map((entry, index) => {
        const isLatest = entry.id === latestId;
        const isValid = VALID_CMDS.has(entry.cmd);
        const contextValue: TermContextValue = {
          arg: entry.args,
          history: navHistory,
          rerender: isLatest,
          index,
          clearHistory,
        };

        return (
          <div key={entry.id} className="term-output">
            {/* Echo the command that was entered (skip for auto-ran welcome) */}
            {entry.raw !== 'welcome' && (
              <div className="term-input-row" style={{ marginBottom: '0.15rem' }}>
                <TermPrompt />
                <span className="term-cmd-echo">{entry.raw}</span>
              </div>
            )}
            {/* Render the command's output */}
            {entry.raw === '' ? null : isValid ? (
              <termContext.Provider value={contextValue}>
                <Output
                  cmd={entry.cmd}
                  resume={resume}
                  projects={projects}
                  blog={blog}
                />
              </termContext.Provider>
            ) : (
              <div className="term-error">
                command not found: <strong>{entry.cmd}</strong>
                <span className="term-dim">
                  {' '}— type <span className="term-accent3">help</span> for available commands
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Tab-completion hints */}
      {hints.length > 1 && (
        <div className="term-hints">
          {hints.map((h) => <span key={h}>{h}</span>)}
        </div>
      )}

      {/* Active input row */}
      <form onSubmit={handleSubmit} className="term-input-row">
        <TermPrompt />
        <input
          ref={inputRef}
          id="terminal-input"
          className="term-input"
          type="text"
          value={inputVal}
          onChange={(e) => {
            setNavPointer(-1);
            setInputVal(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Terminal input"
        />
      </form>

      {/* Invisible sentinel — scrolled into view after each command */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
};

export default Terminal;
