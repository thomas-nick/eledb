import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: "pill" | "rounded";
  href?: string;
  children: React.ReactNode;
  className?: string;
} & (
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
);

const variants: Record<ButtonVariant, string> = {
  primary: "bg-forest text-ivory hover:bg-forest-light",
  secondary: "bg-clay text-white hover:bg-clay/90",
  outline: "border-2 border-forest text-forest hover:bg-forest hover:text-ivory",
  ghost: "text-forest hover:bg-forest/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const shapes = {
  pill: "rounded-full",
  rounded: "rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  shape = "pill",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    shapes[shape],
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    const linkProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
