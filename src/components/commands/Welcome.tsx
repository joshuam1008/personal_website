import React from 'react';

interface WelcomeProps {}

const BANNER_DESKTOP = `
     ██╗ ██████╗ ███████╗██╗  ██╗██╗   ██╗ █████╗ 
     ██║██╔═══██╗██╔════╝██║  ██║██║   ██║██╔══██╗
     ██║██║   ██║███████╗███████║██║   ██║███████║
██   ██║██║   ██║╚════██║██╔══██║██║   ██║██╔══██║
╚█████╔╝╚██████╔╝███████║██║  ██║╚██████╔╝██║  ██║
 ╚════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
                                    ███╗   ███╗ █████╗ ███████╗ ██████╗ ███╗   ██╗
                                    ████╗ ████║██╔══██╗██╔════╝██╔═══██╗████╗  ██║
                                    ██╔████╔██║███████║███████╗██║   ██║██╔██╗ ██║
                                    ██║╚██╔╝██║██╔══██║╚════██║██║   ██║██║╚██╗██║
                                    ██║ ╚═╝ ██║██║  ██║███████║╚██████╔╝██║ ╚████║
                                    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝`;

const BANNER_MOBILE = `
   ___  _____ _____ _   _ _   _  ___  
  |_  ||  _  /  ___| | | | | | |/ _ \\ 
    | || | | \\ \`--.| |_| | | | / /_\\ \\
    | || | | |\`--. \\  _  | | | |  _  |
/\\__/ /\\ \\_/ /\\__/ / | | | |_| | | | |
\\____/  \\___/\\____/\\_| |_/\\___/\\_| |_/
                                      
                                      
                                     
                                     
            ___  ___  ___   _____  _____ _   _ 
            |  \\/  | / _ \\ /  ___||  _  | \\ | |
            | .  . |/ /_\\ \\\\ \`--. | | | |  \\| |
            | |\\/| ||  _  | \`--. \\| | | | . \` |
            | |  | || | | |/\\__/ /\\ \\_/ / |\\  |
            \\_|  |_/\\_| |_/\\____/  \\___/\\_| \\_/
                                   `;

const Welcome: React.FC<WelcomeProps> = () => {
  return (
    <div data-testid="welcome">
      <pre className="term-ascii">{BANNER_DESKTOP}</pre>
      <pre className="term-ascii-mobile">{BANNER_MOBILE}</pre>
      <div className="term-sep" />
      <p>
        <span className="term-accent">Applied Scientist & AI Engineer</span>
        <span className="term-dim"> · </span>
        <span className="term-accent2">Agents & Search</span>
        <span className="term-dim"> · </span>
        <span>Thomson Reuters</span>
      </p>
      <p className="term-dim" style={{ marginTop: '0.25rem' }}>
        Click desktop icons or type <span className="term-accent3">help</span> for commands.
        Use <span className="term-accent3">Tab</span> to autocomplete,{' '}
        <span className="term-accent3">↑↓</span> for history.
      </p>
      <div className="term-sep" style={{ marginTop: '0.5rem' }} />
    </div>
  );
};

export default Welcome;
