import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
}

export function Logo({ className, size = "md", variant = "default" }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  const colorClasses = {
    default: "text-primary",
    white: "text-white"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-lg bg-gradient-primary flex items-center justify-center font-bold text-white",
        sizeClasses[size]
      )}>
        B
      </div>
      <span className={cn(
        "font-bold tracking-tight",
        textSizeClasses[size],
        colorClasses[variant]
      )}>
        uizzment
      </span>
    </div>
  );
}