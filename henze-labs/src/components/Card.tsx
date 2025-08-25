import React from "react";

export type CardProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  className = "",
  children,
}) => (
  <div
    className={`bg-marketing-slate-60 border border-marketing-slate-30 rounded-2xl p-6 flex flex-col items-start gap-4 shadow-md ${className}`}
  >
    {icon && <div className="text-marketing-primary text-3xl">{icon}</div>}
    <h3 className="font-semibold text-lg mb-1">{title}</h3>
    <p className="text-marketing-gray-light text-sm">{description}</p>
    {children}
  </div>
);

export default Card;
