import React from 'react';
import Button from './Button';
import { LogoIcon } from './Icons';

const Header: React.FC = () => {
  const navLinks = ['Pricing', 'Docs', 'Security', 'Demo'];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between border border-marketing-slate/50 bg-marketing-charcoal/50 backdrop-blur-lg rounded-full px-6 py-2">
          <a href="#" className="flex items-center gap-2">
            <LogoIcon className="h-6 w-6" />
            <span className="font-bold text-lg">Henze Labs Marketing Coplit</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link} href="#" className="text-sm text-marketing-gray-light hover:text-marketing-text-light transition-colors">
                {link}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button href="#" variant="primary" size="sm" className="hidden sm:inline-flex">
              See the Demo
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;