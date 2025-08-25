import React from "react";
import clsx from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={clsx("card p-6", className)} {...props}>
      {children}
    </div>
  );
}
