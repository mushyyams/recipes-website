export type NoteHeader = {
  type: "header";
  text: string;
};

export type NoteSection = {
  type: "section";
  text: string;
};

export type NoteParagraph = {
  type: "paragraph";
  text: string;
};

export type RecipeNoteBlock = NoteParagraph | NoteHeader | NoteSection;

export function isNoteHeader(block: RecipeNoteBlock): block is NoteHeader {
  return block.type === "header";
}

export function isNoteSection(block: RecipeNoteBlock): block is NoteSection {
  return block.type === "section";
}

export function isNoteParagraph(block: RecipeNoteBlock): block is NoteParagraph {
  return block.type === "paragraph";
}

export function emptyNoteParagraph(): NoteParagraph {
  return { type: "paragraph", text: "" };
}

export function emptyNoteHeader(): NoteHeader {
  return { type: "header", text: "" };
}

export function emptyNoteSection(): NoteSection {
  return { type: "section", text: "" };
}

export function parseNotesMarkdown(markdown: string): RecipeNoteBlock[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  return trimmed.split(/\n\n+/).map((chunk) => {
    const lines = chunk.split("\n");
    const firstLine = lines[0] ?? "";

    if (/^###\s+/.test(firstLine) && lines.length === 1) {
      return {
        type: "section" as const,
        text: firstLine.replace(/^###\s+/, ""),
      };
    }

    if (/^##\s+/.test(firstLine) && lines.length === 1) {
      return {
        type: "header" as const,
        text: firstLine.replace(/^##\s+/, ""),
      };
    }

    return { type: "paragraph" as const, text: chunk };
  });
}

export function serializeNotesMarkdown(blocks: RecipeNoteBlock[]): string {
  return blocks
    .filter((block) => block.text.trim())
    .map((block) => {
      switch (block.type) {
        case "header":
          return `## ${block.text.trim()}`;
        case "section":
          return `### ${block.text.trim()}`;
        case "paragraph":
          return block.text.trim();
      }
    })
    .join("\n\n")
    .trim();
}

export function hasNoteContent(blocks: RecipeNoteBlock[]): boolean {
  return blocks.some((block) => block.text.trim());
}
