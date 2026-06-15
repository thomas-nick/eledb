import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      className={cn(
        "bg-card rounded-2xl border border-border p-6",
        hover && "transition-shadow duration-200 hover:shadow-lg hover:shadow-forest/5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
