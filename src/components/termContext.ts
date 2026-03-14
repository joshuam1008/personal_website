import { createContext } from 'react';

export type TermContextValue = {
  arg: string[];        // arguments after the command name
  history: string[];   // full nav history (most-recent first)
  rerender: boolean;   // true on the render triggered by submit
  index: number;       // position in the rendered history list
  clearHistory?: () => void;
};

export const termContext = createContext<TermContextValue>({
  arg: [],
  history: [],
  rerender: false,
  index: 0,
});
