import React from 'react';
import { LogoIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-marketing-slate/30">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <LogoIcon className="h-6 w-6" />
              <span className="font-bold text-lg">Henze Labs Marketing Coplit</span>
            </a>
            <p className="text-marketing-gray-light text-sm max-w-xs">
              Your marketing data, explained like a human.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Pricing</a></li>
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Demo</a></li>
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-marketing-gray-light hover:text-white">About Us</a></li>
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Contact</a></li>
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Docs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-marketing-gray-light hover:text-white">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-marketing-slate/30 text-center text-sm text-marketing-gray-light">
          <p>&copy; {new Date().getFullYear()} Henze Labs Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;