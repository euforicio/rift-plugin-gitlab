import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageBody({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl space-y-4", className)}>
      {children}
    </div>
  );
}
