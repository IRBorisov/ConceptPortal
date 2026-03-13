/**
 * Module for text formatting
 */

const DEFAULT_LINE_WIDTH = 80;

/**
 * A Doc node representing a pretty-printable document tree.
 * - "text": a literal string
 * - "line": a possible newline or space, depending on group flattening
 * - "concat": concatenation of several document nodes
 * - "group": a grouping boundary for flattening/break decisions
 * - "indent": node whose children are indented when line breaks occur
 */
export type Doc =
  | { type: "text"; value: string; }
  | { type: "line"; }
  | { type: "concat"; parts: Doc[]; }
  | { type: "group"; content: Doc; }
  | { type: "indent"; content: Doc; };

/** Creates a Doc node containing literal text */
export const text = (value: string): Doc => ({ type: "text", value });

/** A Doc node indicating a possible line break (or space) */
export const line: Doc = { type: "line" };

/** Creates a Doc node by concatenating several Docs */
export const concat = (...parts: Doc[]): Doc => ({
  type: "concat",
  parts,
});

/** Wraps a Doc in a group, enabling flattening for pretty-printing */
export const group = (content: Doc): Doc => ({
  type: "group",
  content,
});

/** Indents a Doc node when a line break occurs inside it */
export const indent = (content: Doc): Doc => ({
  type: "indent",
  content,
});

/**
 * Joins an array of Docs with a separator Doc.
 * For example, join(line, [text("a"), text("b")]) → concat(text("a"), line, text("b"))
 */
export function join(sep: Doc, docs: Doc[]): Doc {
  if (docs.length === 0) return text("");
  const result: Doc[] = [docs[0]];

  for (let i = 1; i < docs.length; i++) {
    result.push(sep, docs[i]);
  }

  return concat(...result);
}

/**
 * Internal command structure for pretty-printer's stack-based evaluation.
 */
interface Cmd {
  indent: number;
  mode: "flat" | "break";
  doc: Doc;
}

/**
 * Pretty-prints a Doc node to a string, breaking lines as needed to fit `width`.
 * Handles group flattening and indentation.
 */
export function render(doc: Doc, width = DEFAULT_LINE_WIDTH): string {
  let output = "";
  let pos = 0;

  const stack: Cmd[] = [{ indent: 0, mode: "break", doc }];

  /**
   * Checks if the given set of commands will fit within the `limit`, without actual output.
   * Used to determine if group can be rendered in "flat" mode.
   */
  function fits(limit: number, cmds: Cmd[]): boolean {
    let remaining = limit;
    const test = [...cmds];

    while (remaining >= 0 && test.length > 0) {
      const { doc } = test.pop()!;

      switch (doc.type) {
        case "text":
          remaining -= doc.value.length;
          break;
        case "line":
          return true;
        case "concat":
          for (let i = doc.parts.length - 1; i >= 0; i--) {
            test.push({ indent: 0, mode: "flat", doc: doc.parts[i] });
          }
          break;
        case "group":
          test.push({ indent: 0, mode: "flat", doc: doc.content });
          break;
        case "indent":
          test.push({ indent: 0, mode: "flat", doc: doc.content });
          break;
      }
    }

    return remaining >= 0;
  }

  // Main pretty-printing loop: processes each Doc node in a stack-based manner
  while (stack.length) {
    const cmd = stack.pop()!;
    const { indent: ind, mode, doc } = cmd;

    switch (doc.type) {
      case "text":
        output += doc.value;
        pos += doc.value.length;
        break;

      case "line":
        if (mode === "flat") {
          output += " ";
          pos += 1;
        } else {
          output += "\n" + " ".repeat(ind);
          pos = ind;
        }
        break;

      case "concat":
        for (let i = doc.parts.length - 1; i >= 0; i--) {
          stack.push({ indent: ind, mode, doc: doc.parts[i] });
        }
        break;

      case "indent":
        stack.push({ indent: ind + 2, mode, doc: doc.content });
        break;

      case "group": {
        const flatCmd = { indent: ind, mode: "flat" as const, doc: doc.content };
        if (fits(width - pos, [flatCmd])) {
          stack.push(flatCmd);
        } else {
          stack.push({ indent: ind, mode: "break", doc: doc.content });
        }
        break;
      }
    }
  }

  return output;
}