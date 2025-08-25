import React from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ComponentPropsWithoutRef<"a"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-marketing-charcoal";

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "text-marketing-navy bg-marketing-cyan hover:brightness-110 shadow-lg hover:shadow-marketing-cyan-40 focus:ring-marketing-cyan",
    secondary:
      "text-marketing-text-light bg-marketing-slate-20 border border-marketing-slate-50 hover:bg-marketing-slate-40 focus:ring-marketing-slate",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-base",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <a className={combinedClasses} {...props}>
      {children}
    </a>
  );
};

export default Button;
