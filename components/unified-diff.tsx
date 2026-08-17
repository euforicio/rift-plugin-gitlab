// A dependency-free unified-diff renderer.
//
// GitLab hands the panel raw unified diff text per file (`files[].patch`), so
// there is nothing to fetch and nothing to highlight against a language
// server: parse the hunk headers to recover old/new line numbers, then render
// one row per line. Colors come from the host theme's tokens only, so the
// diff follows light/dark and any custom theme the app is wearing.
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type DiffLineKind = "hunk" | "add" | "del" | "context" | "meta";

export interface DiffLine {
  kind: DiffLineKind;
  /** Line content with its leading diff marker stripped. */
  text: string;
  /** Line number in the pre-image, null for added/hunk/meta rows. */
  oldLine: number | null;
  /** Line number in the post-image, null for removed/hunk/meta rows. */
  newLine: number | null;
}

const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

/**
 * Splits unified diff text into renderable rows. Anything before the first
 * `@@` (a `diff --git` preamble, `---`/`+++` file lines, mode changes) is
 * metadata; inside a hunk the first character decides the row kind, so a
 * removed line whose content is `--` is never mistaken for a file header.
 */
export function parseUnifiedDiff(patch: string): DiffLine[] {
  const normalized = patch.replace(/\r\n/g, "\n").replace(/\n+$/, "");
  if (normalized.length === 0) return [];
  const rows: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;
  let inHunk = false;
  for (const raw of normalized.split("\n")) {
    const header = HUNK_HEADER.exec(raw);
    if (header !== null) {
      oldLine = Number(header[1]);
      newLine = Number(header[2]);
      inHunk = true;
      rows.push({ kind: "hunk", text: raw, oldLine: null, newLine: null });
    } else if (!inHunk || raw.startsWith("\\")) {
      // Preamble, or "\ No newline at end of file".
      rows.push({ kind: "meta", text: raw, oldLine: null, newLine: null });
    } else if (raw.startsWith("+")) {
      rows.push({
        kind: "add",
        text: raw.slice(1),
        oldLine: null,
        newLine: newLine++,
      });
    } else if (raw.startsWith("-")) {
      rows.push({
        kind: "del",
        text: raw.slice(1),
        oldLine: oldLine++,
        newLine: null,
      });
    } else {
      rows.push({
        kind: "context",
        text: raw.startsWith(" ") ? raw.slice(1) : raw,
        oldLine: oldLine++,
        newLine: newLine++,
      });
    }
  }
  return rows;
}

function rowClass(kind: DiffLineKind): string {
  if (kind === "hunk") return "bg-muted/60 text-muted-foreground";
  if (kind === "add") return "bg-primary/10";
  if (kind === "del") return "bg-destructive/10";
  if (kind === "meta") return "text-muted-foreground";
  return "";
}

const GUTTER =
  "w-10 select-none border-r border-border px-1.5 text-right align-top tabular-nums text-muted-foreground";

/** One file's (or one hunk's) unified diff, horizontally scrollable. */
export function UnifiedDiff({
  patch,
  className,
}: {
  patch: string;
  className?: string;
}) {
  const rows = useMemo(() => parseUnifiedDiff(patch), [patch]);
  if (rows.length === 0) return null;
  return (
    <div className={cn("overflow-x-auto font-mono text-xs leading-5", className)}>
      <table className="min-w-full border-collapse">
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={rowClass(row.kind)}>
              {row.kind === "hunk" || row.kind === "meta" ? (
                <td colSpan={4} className="whitespace-pre px-2">
                  {row.text}
                </td>
              ) : (
                <>
                  <td className={GUTTER}>{row.oldLine ?? ""}</td>
                  <td className={GUTTER}>{row.newLine ?? ""}</td>
                  <td
                    aria-hidden="true"
                    className={cn(
                      "w-4 select-none px-1 text-center align-top",
                      row.kind === "add"
                        ? "text-primary"
                        : row.kind === "del"
                          ? "text-destructive"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {row.kind === "add" ? "+" : row.kind === "del" ? "-" : ""}
                  </td>
                  <td className="whitespace-pre px-2 align-top text-foreground">
                    {row.text}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
