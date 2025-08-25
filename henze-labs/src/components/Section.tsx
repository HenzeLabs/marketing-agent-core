import React from 'react';

export const Section: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <section className={`py-16 md:py-24 ${className}`}>
    <div className="container mx-auto px-4">{children}</div>
  </section>
);

export default Section;
