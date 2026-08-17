import { cn } from "@/lib/utils";

// A full-region centered zero state (column layout, generous padding,
// text-sm) — the panel's shape for "nothing here", "nothing matches", and
// hard load errors alike.
export function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
