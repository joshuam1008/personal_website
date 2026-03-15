export const THEMES = [
  { name: 'green',   label: 'Green on Black (default)', swatch: '#39d353' },
  { name: 'amber',   label: 'Amber on Black',           swatch: '#ffb000' },
  { name: 'dracula', label: 'Dracula',                  swatch: '#bd93f9' },
  { name: 'matrix',  label: 'Matrix',                   swatch: '#00ff41' },
] as const;

export type ThemeName = (typeof THEMES)[number]['name'];

export function applyTheme(name: ThemeName) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', name);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('terminal-theme', name);
  }
}
