import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import { Decoration, type DecorationSet, type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';

const noSpellcheckMark = Decoration.mark({
  attributes: { spellcheck: 'false' }
});

class NoSpellcheckPlugin {
  decorations: DecorationSet;

  constructor(view: EditorView) {
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
    for (const { from, to } of view.visibleRanges) {
      tree.iterate({
        from,
        to,
        enter: node => {
          if (node.name === 'Variable') {
            builder.add(node.from, node.to, noSpellcheckMark);
          }
        }
      });
    }

    return builder.finish();
  }
}

/** Plugin that adds a no-spellcheck attribute to all variables in the editor. */
export const noSpellcheckForVariables = ViewPlugin.fromClass(NoSpellcheckPlugin, {
  decorations: (plugin: NoSpellcheckPlugin) => plugin.decorations
});
