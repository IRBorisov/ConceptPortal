import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';

const invalidVarMark = Decoration.mark({
  class: 'text-destructive'
});

const validMark = Decoration.mark({
  class: 'text-(--acc-fg-purple)'
});

class MarkVariablesPlugin {
  decorations: DecorationSet;
  allowed: string[];

  constructor(view: EditorView, allowed: string[]) {
    this.allowed = allowed;
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const tree = syntaxTree(view.state);
    const doc = view.state.doc;

    tree.iterate({
      enter: node => {
        if (node.name === 'Variable') {
          // Extract inner text from the Variable node ({{my_var}})
          const text = doc.sliceString(node.from, node.to);
          const match = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/.exec(text);
          const varName = match?.[1];

          if (!varName || !this.allowed.includes(varName)) {
            builder.add(node.from, node.to, invalidVarMark);
          } else {
            builder.add(node.from, node.to, validMark);
          }
        }
      }
    });

    return builder.finish();
  }
}

/** Returns a ViewPlugin that marks invalid variables in the editor. */
export function markVariables(allowed: string[]) {
  return ViewPlugin.fromClass(
    class extends MarkVariablesPlugin {
      constructor(view: EditorView) {
        super(view, allowed);
      }
    },
    {
      decorations: plugin => plugin.decorations
    }
  );
}
