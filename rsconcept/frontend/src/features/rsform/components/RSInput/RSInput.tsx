'use client';

import { forwardRef, useRef } from 'react';
import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import clsx from 'clsx';
import { EditorView } from 'codemirror';

import { Label } from '@/components/Input';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';

import { IRSForm } from '../../models/rsform';
import { generateAlias, getCstTypePrefix, guessCstType } from '../../models/rsformAPI';
import { extractGlobals } from '../../models/rslangAPI';

import { ccBracketMatching } from './bracketMatching';
import { rsNavigation } from './clickNavigation';
import { RSLanguage } from './rslang';
import { getSymbolSubstitute, RSTextWrapper } from './textEditing';
import { rsHoverTooltip } from './tooltip';

interface RSInputProps
  extends Pick<
    ReactCodeMirrorProps,
    | 'id' // prettier: split-lines
    | 'height'
    | 'minHeight'
    | 'maxHeight'
    | 'value'
    | 'onFocus'
    | 'onBlur'
    | 'placeholder'
    | 'style'
    | 'className'
  > {
  label?: string;
  disabled?: boolean;
  noTooltip?: boolean;
  onChange?: (newValue: string) => void;
  onAnalyze?: () => void;
  schema?: IRSForm;
  onOpenEdit?: (cstID: number) => void;
}

export const RSInput = forwardRef<ReactCodeMirrorRef, RSInputProps>(
  (
    {
      id, //
      label,
      disabled,
      noTooltip,

      schema,
      onOpenEdit,

      className,
      style,

      onChange,
      onAnalyze,
      ...restProps
    },
    ref
  ) => {
    const darkMode = usePreferencesStore(state => state.darkMode);

    const internalRef = useRef<ReactCodeMirrorRef>(null);
    const thisRef = !ref || typeof ref === 'function' ? internalRef : ref;

    const cursor = !disabled ? 'cursor-text' : 'cursor-default';
    const customTheme: Extension = createTheme({
      theme: darkMode ? 'dark' : 'light',
      settings: {
        fontFamily: 'inherit',
        background: !disabled ? APP_COLORS.bgInput : APP_COLORS.bgDefault,
        foreground: APP_COLORS.fgDefault,
        selection: APP_COLORS.bgHover,
        caret: APP_COLORS.fgDefault
      },
      styles: [
        { tag: tags.name, color: APP_COLORS.fgPurple, cursor: schema ? 'default' : cursor }, // GlobalID
        { tag: tags.variableName, color: APP_COLORS.fgGreen }, // LocalID
        { tag: tags.propertyName, color: APP_COLORS.fgTeal }, // Radical
        { tag: tags.keyword, color: APP_COLORS.fgBlue }, // keywords
        { tag: tags.literal, color: APP_COLORS.fgBlue }, // literals
        { tag: tags.controlKeyword, fontWeight: '400' }, // R | I | D
        { tag: tags.unit, fontSize: '0.75rem' }, // indices
        { tag: tags.brace, color: APP_COLORS.fgPurple, fontWeight: '600' } // braces (curly brackets)
      ]
    });

    const editorExtensions = [
      EditorView.lineWrapping,
      RSLanguage,
      ccBracketMatching(),
      ...(!schema || !onOpenEdit ? [] : [rsNavigation(schema, onOpenEdit)]),
      ...(noTooltip || !schema ? [] : [rsHoverTooltip(schema, onOpenEdit !== undefined)])
    ];

    function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
      if (!thisRef.current) {
        return;
      }
      const text = new RSTextWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
      if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
        const selection = text.getSelection();
        if (!selection.empty || !schema) {
          return;
        }
        const wordRange = text.getWord(selection.from);
        if (wordRange) {
          const word = text.getText(wordRange.from, wordRange.to);
          if (word.length > 2 && (word.startsWith('Pr') || word.startsWith('pr'))) {
            text.setSelection(wordRange.from, wordRange.from + 2);
            if (word.startsWith('Pr')) {
              text.replaceWith('pr');
            } else {
              text.replaceWith('Pr');
            }
            event.preventDefault();
            event.stopPropagation();
            return;
          }
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
      } else if (!(event.ctrlKey || event.metaKey)) {
        const newSymbol = getSymbolSubstitute(event.code, event.shiftKey);
        if (newSymbol) {
          text.replaceWith(newSymbol);
          event.preventDefault();
          event.stopPropagation();
        }
      } else if (event.code === 'KeyQ' && onAnalyze) {
        onAnalyze();
        event.preventDefault();
        event.stopPropagation();
      }
    }

    return (
      <div className={clsx('flex flex-col gap-2', className, cursor)} style={style}>
        <Label text={label} />
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

// ======= Internal ==========
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
