import React from 'react';
import type { ResumeEntry } from './commands/Resume';
import type { ProjectEntry } from './commands/Projects';
import type { BlogEntry } from './commands/Blog';

// Lazy imports for all command components
import Welcome from './commands/Welcome';
import Help from './commands/Help';
import About from './commands/About';
import Resume from './commands/Resume';
import Projects from './commands/Projects';
import Blog from './commands/Blog';
import Socials from './commands/Socials';
import Skills from './commands/Skills';
import Contact from './commands/Contact';
import Themes from './commands/Themes';
import Echo from './commands/Echo';
import Clear from './commands/Clear';
import History from './commands/History';
import Whoami from './commands/Whoami';

interface OutputProps {
  cmd: string;
  resume: ResumeEntry[];
  projects: ProjectEntry[];
  blog: BlogEntry[];
}

/**
 * Routes a validated command string to the appropriate command component.
 * Data props are forwarded from the terminal to data-hungry commands.
 * Commands that only need context (history, args) read from termContext directly.
 */
const Output: React.FC<OutputProps> = ({ cmd, resume, projects, blog }) => {
  switch (cmd) {
    case 'welcome':  return <Welcome />;
    case 'help':     return <Help />;
    case 'about':    return <About />;
    case 'resume':   return <Resume resume={resume} />;
    case 'projects': return <Projects projects={projects} />;
    case 'blog':     return <Blog blog={blog} />;
    case 'socials':  return <Socials />;
    case 'skills':   return <Skills />;
    case 'contact':  return <Contact />;
    case 'themes':   return <Themes />;
    case 'echo':     return <Echo />;
    case 'clear':    return <Clear />;
    case 'history':  return <History />;
    case 'whoami':   return <Whoami />;
    default:
      return (
        <div className="term-error">
          command not found: <strong>{cmd}</strong>
          <span className="term-dim"> — type <span className="term-accent3">help</span> for available commands</span>
        </div>
      );
  }
};

export default Output;
