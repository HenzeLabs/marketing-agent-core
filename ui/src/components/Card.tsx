// src/components/Card.tsx
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg bg-gray-800 p-6 shadow-md ${className}`}>
      {children}
    </div>
  );
}
