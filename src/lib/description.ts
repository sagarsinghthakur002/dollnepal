const BULLET = /^\s*(?:[•\-*·]\s*)/;

/** Description is stored as newline-separated plain lines (one per bullet). */
export function descriptionLines(description: string): string[] {
  return (description ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(BULLET, "").trim())
    .filter(Boolean);
}

/** Plain-text version (for meta tags / JSON-LD). */
export function descriptionPlain(description: string): string {
  return descriptionLines(description).join(". ");
}

export function descriptionToEditorText(description: string): string {
  const lines = descriptionLines(description);
  return lines.length ? lines.map((l) => `• ${l}`).join("\n") : "";
}

export function editorTextToDescription(text: string): string {
  return descriptionLines(text).join("\n");
}
