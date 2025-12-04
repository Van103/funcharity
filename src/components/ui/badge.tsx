import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "text-foreground border-border",
        success:
          "border-transparent bg-success text-success-foreground",
        warning:
          "border-transparent bg-warning text-warning-foreground",
        accent:
          "border-transparent bg-accent text-accent-foreground",
        muted:
          "border-transparent bg-muted text-muted-foreground",
        // Luxury & Role badges
        gold:
          "border-secondary/30 bg-gradient-to-r from-secondary-dark via-secondary to-secondary-light text-secondary-foreground",
        purple:
          "border-transparent bg-primary text-primary-foreground",
        donor:
          "border-secondary/30 bg-gradient-to-r from-secondary to-secondary-light text-secondary-foreground",
        volunteer:
          "border-primary-light/30 bg-gradient-to-r from-primary to-primary-light text-primary-foreground",
        ngo:
          "border-transparent bg-gradient-to-r from-success to-secondary text-success-foreground",
        verified:
          "border-secondary/30 bg-secondary/20 text-secondary",
        trending:
          "border-secondary/20 bg-secondary/10 text-secondary",
        blockchain:
          "border-primary/30 bg-primary/10 text-primary font-mono",
        urgent:
          "border-destructive/30 bg-destructive/10 text-destructive animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
