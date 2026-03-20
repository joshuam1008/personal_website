import { useState } from 'react';
import { WindowManagerProvider } from './WindowManager';
import { BootScreen } from './BootScreen';
import { TopTaskbar } from './TopTaskbar';
import { BottomTaskbar } from './BottomTaskbar';
import { DesktopIcon } from './DesktopIcon';
import { OSWindow } from './OSWindow';
import Terminal from './Terminal';
import { AboutWindow } from './windows/AboutWindow';
import { ProjectsWindow } from './windows/ProjectsWindow';
import { BlogWindow } from './windows/BlogWindow';
import { SkillsWindow } from './windows/SkillsWindow';
import { ContactWindow } from './windows/ContactWindow';
import type { ResumeEntry } from './commands/Resume';
import type { ProjectEntry } from './commands/Projects';
import type { BlogEntry } from './commands/Blog';

type DesktopProps = {
  resume: ResumeEntry[];
  projects: ProjectEntry[];
  blog: BlogEntry[];
};

const ICONS = [
  { id: 'terminal' as const, label: 'Terminal', iconArt: '>' },
  { id: 'about' as const, label: 'About', iconArt: 'i' },
  { id: 'projects' as const, label: 'Projects', iconArt: '[]' },
  { id: 'blog' as const, label: 'Blog', iconArt: '~' },
  { id: 'skills' as const, label: 'Skills', iconArt: '{' },
  { id: 'contact' as const, label: 'Contact', iconArt: '@' },
];

export function Desktop({ resume, projects, blog }: DesktopProps) {
  const [bootComplete, setBootComplete] = useState(false);

  return (
    <WindowManagerProvider>
      <BootScreen onComplete={() => setBootComplete(true)} />

      <div className={`os-desktop-env ${bootComplete ? 'visible' : ''}`}>
        <TopTaskbar />

        <main className="os-desktop">
          <div className="os-desktop-icons">
            {ICONS.map((icon) => (
              <DesktopIcon
                key={icon.id}
                id={icon.id}
                label={icon.label}
                iconArt={icon.iconArt}
              />
            ))}
          </div>

          <OSWindow
            id="terminal"
            title="terminal"
            initialWidth={820}
            initialHeight={520}
            initialLeft={200}
            initialTop={80}
          >
            <Terminal resume={resume} projects={projects} blog={blog} />
          </OSWindow>

          <OSWindow
            id="about"
            title="about"
            initialWidth={560}
            initialHeight={440}
            initialLeft={100}
            initialTop={150}
          >
            <AboutWindow resume={resume} />
          </OSWindow>

          <OSWindow
            id="projects"
            title="projects"
            initialWidth={560}
            initialHeight={440}
            initialLeft={200}
            initialTop={200}
          >
            <ProjectsWindow projects={projects} />
          </OSWindow>

          <OSWindow
            id="blog"
            title="blog"
            initialWidth={560}
            initialHeight={440}
            initialLeft={300}
            initialTop={250}
          >
            <BlogWindow blog={blog} />
          </OSWindow>

          <OSWindow
            id="skills"
            title="skills"
            initialWidth={560}
            initialHeight={440}
            initialLeft={400}
            initialTop={300}
          >
            <SkillsWindow />
          </OSWindow>

          <OSWindow
            id="contact"
            title="contact"
            initialWidth={560}
            initialHeight={440}
            initialLeft={500}
            initialTop={350}
          >
            <ContactWindow />
          </OSWindow>
        </main>

        <BottomTaskbar />
      </div>
    </WindowManagerProvider>
  );
}
