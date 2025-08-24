import React from "react";
import clsx from "clsx";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Section({ children, className, ...props }: SectionProps) {
  return (
    <section
      className={clsx(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
