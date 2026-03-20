import { SOCIALS } from '../../data/socials';
import type { Social } from '../../data/socials';

export function ContactWindow() {
  return (
    <div className="info-window-body">
      <div className="info-card">
        <div className="info-card-title">Get in Touch</div>
        {SOCIALS.map((social: Social) => (
          <div key={social.id} className="contact-row">
            <div className="contact-label">{social.name}</div>
            <a href={social.url} target="_blank" rel="noopener noreferrer">
              {social.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
