import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Writing' },
  { href: '/about', label: 'About' },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/';

  const isActive = (href: string) => {
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return normalizedHref === '/' ? currentPath === '/' : currentPath.startsWith(normalizedHref);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-200 transition hover:border-white/30 hover:text-white md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-64 transform border-l border-white/10 bg-surface/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-6">
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="mb-8 self-end rounded-full p-2 text-neutral-400 transition hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Nav Items */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-base font-medium transition ${
                  isActive(item.href)
                    ? 'bg-white/20 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-neutral-200 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
