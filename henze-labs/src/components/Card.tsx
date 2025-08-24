import React from "react";
import clsx from "clsx";

type CardVariant = "default" | "elevated" | "muted";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl p-6 border",
        "transition-shadow",
        {
          "bg-white border-blue-100 shadow-md": variant === "default",
          "bg-white border-blue-100 shadow-lg": variant === "elevated",
          "bg-blue-50 border-blue-100 shadow-none text-blue-800":
            variant === "muted",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
