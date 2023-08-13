import { EditorState, Extension, StateField } from "@codemirror/state";
import { EditorView, showTooltip } from "@codemirror/view";

function getCursorTooltips(state: EditorState) {
  return state.selection.ranges
    .filter(range => !range.empty)
    .map(range => {
      const line = state.doc.lineAt(range.head);
      const text = `${line.number}:${range.head - line.from}`;
      return {
        pos: (range.to + range.from)/2,
        above: false,
        strictSide: true,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "cm-tooltip-cursor";
          dom.textContent = text;
          return { dom };
        }
      };
    });
}

const cursorTooltipField = StateField.define({
  create: getCursorTooltips,
  update(tooltips, transaction) {
    if (!transaction.docChanged && !transaction.selection) {
      return tooltips;
    }
    return getCursorTooltips(transaction.state);
  },
  provide: field => showTooltip.computeN([field], state => state.field(field))
});

const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    "&.cm-tooltip-arrow:before": {
      borderTopColor: "#66b"
    },
    "&.cm-tooltip-arrow:after": {
      borderTopColor: "transparent"
    }
  }
});

export function cursorTooltip(): Extension {
  return [cursorTooltipField, cursorTooltipBaseTheme];
}
