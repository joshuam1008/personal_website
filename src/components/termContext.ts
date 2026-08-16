import { createContext } from 'react';
import type { FileSystemNode } from '../lib/filesystem';
import type { WindowId } from './WindowManager';

export type TermContextValue = {
  arg: string[];        // arguments after the command name
  history: string[];   // full nav history (most-recent first)
  rerender: boolean;   // true on the render triggered by submit
  clearHistory?: () => void;
  openWindow?: (id: WindowId) => void;  // open a window from terminal
  currentPath?: string;                 // virtual filesystem cwd
  setCurrentPath?: (p: string) => void; // used by cd command
  filesystem?: FileSystemNode;          // virtual filesystem root
};

export const termContext = createContext<TermContextValue>({
  arg: [],
  history: [],
  rerender: false,
});
