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
       _           _                 
      | |         | |                
      | | ___  ___| |__  _   _  __ _ 
  _   | |/ _ \\/ __| '_ \\| | | |/ _\` |
 | |__| | (_) \\__ \\ | | | |_| | (_| |
  \\____/ \\___/|___/_| |_|\\__,_|\\__,_|
                                     
                                     
                  __  __                       
                |  \\/  |                      
                | \\  / | __ _ ___  ___  _ __  
                | |\\/| |/ _\` / __|/ _ \\| '_ \\ 
                | |  | | (_| \\__ \\ (_) | | | |
                |_|  |_|\\__,_|___/\\___/|_| |_|
                               
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
        Type <span className="term-accent3">help</span> for available commands.
        Use <span className="term-accent3">Tab</span> to autocomplete,{' '}
        <span className="term-accent3">↑↓</span> for history.
      </p>
      <div className="term-sep" style={{ marginTop: '0.5rem' }} />
    </div>
  );
};

export default Welcome;
