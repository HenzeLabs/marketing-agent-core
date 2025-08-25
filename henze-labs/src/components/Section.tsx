import React from "react";
import clsx from "clsx";

type SectionProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function Section({
  title,
  subtitle,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={clsx("section", className)}>
      <div className="container">
        {(title || subtitle) && (
          <div className="mb-10">
            {title && (
              <h2 className="text-2xl md:text-3xl text-content">{title}</h2>
            )}
            {subtitle && <p className="text-content-muted mt-2">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
