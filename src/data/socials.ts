export type Social = {
  id: number;
  name: string;
  url: string;
  label: string;
};

export const SOCIALS: Social[] = [
  { id: 1, name: 'GitHub',   url: 'https://github.com/joshuam1008',                 label: 'github.com/joshuam1008' },
  { id: 2, name: 'LinkedIn', url: 'https://www.linkedin.com/in/joshuam1008/',       label: 'linkedin.com/in/joshuam1008' },
  { id: 3, name: 'Email',    url: 'mailto:joshuamason1008@gmail.com',               label: 'joshuamason1008@gmail.com' },
  { id: 4, name: 'Resume',   url: '/Joshua-Mason-Resume.pdf',                       label: 'Joshua-Mason-Resume.pdf' },
];
