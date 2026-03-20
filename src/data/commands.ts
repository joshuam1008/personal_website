export type CommandInfo = {
  cmd: string;
  desc: string;
  subCommands?: string[];
};

/**
 * Master command registry.
 * Used by Help command for display and by Terminal for tab-completion.
 * Keep this sorted alphabetically for a clean `help` output.
 */
export const COMMANDS: CommandInfo[] = [
  { cmd: 'about',    desc: 'who I am' },
  { cmd: 'blog',     desc: 'read my writing  — try: blog list | blog read <slug>', subCommands: ['list', 'read'] },
  { cmd: 'cat',      desc: 'print file contents — try: cat about.txt' },
  { cmd: 'cd',       desc: 'change directory — try: cd /projects | cd ~' },
  { cmd: 'clear',    desc: 'clear the terminal' },
  { cmd: 'contact',  desc: 'how to reach me' },
  { cmd: 'echo',     desc: 'print text — try: echo <text>' },
  { cmd: 'help',     desc: 'show this help menu' },
  { cmd: 'history',  desc: 'show command history' },
  { cmd: 'ls',       desc: 'list directory contents — try: ls | ls /projects' },
  { cmd: 'neofetch', desc: 'system information' },
  { cmd: 'open',     desc: 'open a window  — try: open <app>', subCommands: ['about', 'projects', 'blog', 'skills', 'contact'] },
  { cmd: 'projects', desc: 'my portfolio  — try: projects list | projects go <n>', subCommands: ['list', 'go'] },
  { cmd: 'pwd',      desc: 'print working directory' },
  { cmd: 'resume',   desc: 'work history  — try: resume | resume experience | resume education', subCommands: ['experience', 'education'] },
  { cmd: 'skills',   desc: 'technologies I work with' },
  { cmd: 'socials',  desc: 'find me online  — try: socials list | socials go <n>', subCommands: ['list', 'go'] },
  { cmd: 'themes',   desc: 'change color theme  — try: themes list | themes set <name>', subCommands: ['list', 'set'] },
  { cmd: 'welcome',  desc: 'show the welcome screen' },
  { cmd: 'whoami',   desc: 'current user' },
];

export const COMMAND_NAMES = COMMANDS.map((c) => c.cmd);
