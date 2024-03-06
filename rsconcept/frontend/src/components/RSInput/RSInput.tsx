'use client';

import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import clsx from 'clsx';
import { EditorView } from 'codemirror';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

import Label from '@/components/ui/Label';
import { useRSForm } from '@/context/RSFormContext';
import { useConceptTheme } from '@/context/ThemeContext';
import { generateAlias, getCstTypePrefix, guessCstType } from '@/models/rsformAPI';
import { extractGlobals } from '@/models/rslangAPI';

import { ccBracketMatching } from './bracketMatching';
import { RSLanguage } from './rslang';
import { getSymbolSubstitute, RSTextWrapper } from './textEditing';
import { rsHoverTooltip } from './tooltip';

const editorSetup: BasicSetupOptions = {
  highlightSpecialChars: false,
  history: true,
  drawSelection: true,
  syntaxHighlighting: false,
  defaultKeymap: true,
  historyKeymap: true,

  lineNumbers: false,
  highlightActiveLineGutter: false,
  foldGutter: false,
  dropCursor: true,
  allowMultipleSelections: false,
  indentOnInput: false,
  bracketMatching: false,
  closeBrackets: false,
  autocompletion: false,
  rectangularSelection: false,
  crosshairCursor: false,
  highlightActiveLine: false,
  highlightSelectionMatches: false,
  closeBracketsKeymap: false,
  searchKeymap: false,
  foldKeymap: false,
  completionKeymap: false,
  lintKeymap: false
};

interface RSInputProps
  extends Pick<
    ReactCodeMirrorProps,
    'id' | 'height' | 'minHeight' | 'maxHeight' | 'value' | 'onFocus' | 'onBlur' | 'placeholder' | 'style' | 'className'
  > {
  label?: string;
  disabled?: boolean;
  noTooltip?: boolean;
  onChange?: (newValue: string) => void;
  onAnalyze?: () => void;
}

const RSInput = forwardRef<ReactCodeMirrorRef, RSInputProps>(
  ({ id, label, onChange, onAnalyze, disabled, noTooltip, className, style, ...restProps }, ref) => {
    const { darkMode, colors } = useConceptTheme();
    const { schema } = useRSForm();

    const internalRef = useRef<ReactCodeMirrorRef>(null);
    const thisRef = useMemo(() => (!ref || typeof ref === 'function' ? internalRef : ref), [internalRef, ref]);

    const cursor = useMemo(() => (!disabled ? 'cursor-text' : 'cursor-default'), [disabled]);
    const customTheme: Extension = useMemo(
      () =>
        createTheme({
          theme: darkMode ? 'dark' : 'light',
          settings: {
            fontFamily: 'inherit',
            background: !disabled ? colors.bgInput : colors.bgDefault,
            foreground: colors.fgDefault,
            selection: colors.bgHover,
            caret: colors.fgDefault
          },
          styles: [
            { tag: tags.name, color: colors.fgPurple, cursor: 'default' }, // GlobalID
            { tag: tags.variableName, color: colors.fgGreen }, // LocalID
            { tag: tags.propertyName, color: colors.fgTeal }, // Radical
            { tag: tags.keyword, color: colors.fgBlue }, // keywords
            { tag: tags.literal, color: colors.fgBlue }, // literals
            { tag: tags.controlKeyword, fontWeight: '400' }, // R | I | D
            { tag: tags.unit, fontSize: '0.75rem' }, // indices
            { tag: tags.brace, color: colors.fgPurple, fontWeight: '600' } // braces (curly brackets)
          ]
        }),
      [disabled, colors, darkMode]
    );

    const editorExtensions = useMemo(
      () => [
        EditorView.lineWrapping,
        RSLanguage,
        ccBracketMatching(darkMode),
        ...(noTooltip ? [] : [rsHoverTooltip(schema?.items || [])])
      ],
      [darkMode, schema?.items, noTooltip]
    );

    const handleInput = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!thisRef.current) {
          return;
        }
        const text = new RSTextWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
        if (event.ctrlKey && event.code === 'Space') {
          const selection = text.getSelection();
          if (!selection.empty || !schema) {
            return;
          }
          const hint = text.getText(selection.from - 1, selection.from);
          const type = guessCstType(hint);
          if (hint === getCstTypePrefix(type)) {
            text.setSelection(selection.from - 1, selection.from);
          }
          const takenAliases = [...extractGlobals(thisRef.current.view?.state.doc.toString() ?? '')];
          const newAlias = generateAlias(type, schema, takenAliases);
          text.replaceWith(newAlias);
          event.preventDefault();
          event.stopPropagation();
        } else if (event.altKey) {
          if (text.processAltKey(event.code, event.shiftKey)) {
            event.preventDefault();
            event.stopPropagation();
          }
        } else if (!event.ctrlKey) {
          const newSymbol = getSymbolSubstitute(event.code, event.shiftKey);
          if (newSymbol) {
            text.replaceWith(newSymbol);
            event.preventDefault();
            event.stopPropagation();
          }
        } else if (event.ctrlKey && event.code === 'KeyQ' && onAnalyze) {
          onAnalyze();
          event.preventDefault();
          event.stopPropagation();
        }
      },
      [thisRef, onAnalyze, schema]
    );

    return (
      <div className={clsx('flex flex-col gap-2', className, cursor)} style={style}>
        <Label text={label} htmlFor={id} />
        <CodeMirror
          className='font-math'
          id={id}
          ref={thisRef}
          basicSetup={editorSetup}
          theme={customTheme}
          extensions={editorExtensions}
          indentWithTab={false}
          onChange={onChange}
          editable={!disabled}
          onKeyDown={handleInput}
          {...restProps}
        />
      </div>
    );
  }
);

export default RSInput;
