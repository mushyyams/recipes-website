import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseNotesMarkdown } from "@/lib/notes";

type NotesContentProps = {
  content: string;
  className?: string;
};

export function NotesContent({ content, className }: NotesContentProps) {
  const blocks = parseNotesMarkdown(content);
  if (blocks.length === 0) return null;

  return (
    <div className={className ?? "prose-recipe"}>
      {blocks.map((block, index) => {
        if (block.type === "header") {
          return <h2 key={index}>{block.text}</h2>;
        }

        if (block.type === "section") {
          return <h3 key={index}>{block.text}</h3>;
        }

        return (
          <ReactMarkdown key={index} remarkPlugins={[remarkGfm]}>
            {block.text}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
