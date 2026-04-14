'use client';

import { useEffect, useRef, useState } from 'react';
import { type Extension } from '@codemirror/state';
import { EditorView, tooltips } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, {
  type BasicSetupOptions,
  type ReactCodeMirrorProps,
  type ReactCodeMirrorRef
} from '@uiw/react-codemirror';
import clsx from 'clsx';

import { type RSForm } from '@/domain/library';
import { generateAlias, getCstTypePrefix, guessCstType } from '@/domain/library/rsform-api';
import { type AnalysisFull, type RSErrorDescription } from '@/domain/rslang';
import { extractGlobals } from '@/domain/rslang/api';

import { ErrorField, Label } from '@/components/input';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';
import { PARAMETER } from '@/utils/constants';

import { ccBracketMatching } from './bracket-matching';
import { rsNavigation } from './click-navigation';
import { rsErrorRanges } from './error-ranges';
import { RSLanguage } from './parse';
import { getLigatureSymbol, getSymbolSubstitute, isPotentialLigature, RSTextWrapper } from './text-editing';
import { rsHoverTooltip } from './tooltip';

const editorSetup: BasicSetupOptions = {
  highlightSpecialChars: false,
  history: true,
  drawSelection: false,
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

interface RSInputProps extends Pick<
  ReactCodeMirrorProps,
  | 'id' //
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
  schema?: RSForm;
  errors?: readonly RSErrorDescription[] | null;
  noAutoCheck?: boolean;

  errorMessage?: string;
  ref?: React.Ref<ReactCodeMirrorRef>;
  label?: string;
  disabled?: boolean;
  portalHoverTooltips?: boolean;

  onChange?: (newValue: string) => void;
  onAnalyze?: () => void;
  onOpenEdit?: (cstID: number) => void;
}

export function RSInput({
  schema,
  errors,

  label,
  errorMessage,
  disabled,
  portalHoverTooltips,
  noAutoCheck,

  ref,
  className,
  style,
  value,

  onChange,
  onOpenEdit,
  onAnalyze,
  ...restProps
}: RSInputProps) {
  const darkMode = usePreferencesStore(state => state.darkMode);

  const internalRef = useRef<ReactCodeMirrorRef>(null);
  const thisRef = !ref || typeof ref === 'function' ? internalRef : ref;
  const isFirstParse = useRef(true);
  const [localParse, setLocalParse] = useState<AnalysisFull | null>(null);

  const effectiveErrors = errors == null ? (localParse?.errors ?? null) : errors;

  useEffect(
    function scheduleLocalParse() {
      if (noAutoCheck || !schema) {
        return;
      }

      const currentSchema = schema;
      const text = value ?? '';

      function runLocalParse() {
        const nextParse = currentSchema.analyzer.checkFull(text, {
          annotateTypes: true,
          annotateErrors: true
        });
        setLocalParse(nextParse);
      }

      let timerID: number | undefined;
      if (isFirstParse.current) {
        isFirstParse.current = false;
        runLocalParse();
      } else {
        timerID = window.setTimeout(runLocalParse, PARAMETER.rsInputAutoCheckDelay);
      }

      return function clearScheduledParse() {
        if (timerID !== undefined) {
          window.clearTimeout(timerID);
        }
      };
    },
    [noAutoCheck, value, schema]
  );

  function prepareParse(value: string): AnalysisFull | null {
    if (!schema) {
      return null;
    }
    const result = schema.analyzer.checkFull(value, {
      annotateTypes: true,
      annotateErrors: true
    });
    setLocalParse(result);
    return result;
  }

  const cursor = !disabled ? 'cursor-text' : 'cursor-default';
  const customTheme: Extension = createTheme({
    theme: darkMode ? 'dark' : 'light',
    settings: {
      fontFamily: 'inherit',
      background: !disabled ? APP_COLORS.bgInput : APP_COLORS.bgDefault,
      foreground: APP_COLORS.fgDefault,
      caret: APP_COLORS.fgDefault
    },
    styles: [
      { tag: tags.name, color: APP_COLORS.fgPurple, cursor: schema ? 'default' : cursor }, // GlobalID
      { tag: tags.variableName, color: APP_COLORS.fgGreen, cursor: schema ? 'default' : cursor }, // LocalID
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
    ...(effectiveErrors && effectiveErrors.length > 0 ? rsErrorRanges(effectiveErrors) : []),
    ...(portalHoverTooltips
      ? [
          tooltips({
            parent: document.body,
            position: 'fixed'
          })
        ]
      : []),
    ccBracketMatching(),
    ...(!schema || !onOpenEdit ? [] : [rsNavigation(schema, onOpenEdit)]),
    ...(!schema ? [] : [rsHoverTooltip(schema, prepareParse, localParse, effectiveErrors, onOpenEdit !== undefined)])
  ];

  function handleAutoComplete(text: RSTextWrapper): boolean {
    const selection = text.getSelection();
    if (!selection.empty || !schema) {
      return false;
    }
    const wordRange = text.getWord(selection.from);
    if (!wordRange) {
      return false;
    }
    const word = text.getText(wordRange.from, wordRange.to);
    if (word.length > 2 && (word.startsWith('Pr') || word.startsWith('pr'))) {
      text.setSelection(wordRange.from, wordRange.from + 2);
      if (word.startsWith('Pr')) {
        text.replaceWith('pr');
      } else {
        text.replaceWith('Pr');
      }
      return true;
    }
    const hint = text.getText(selection.from - 1, selection.from);
    const type = guessCstType(hint);
    if (hint === getCstTypePrefix(type)) {
      text.setSelection(selection.from - 1, selection.from);
    }
    const takenAliases = [...extractGlobals(thisRef.current?.view?.state.doc.toString() ?? '')];
    const newAlias = generateAlias(type, schema, takenAliases);
    text.replaceWith(newAlias);
    return true;
  }

  function processInput(event: React.KeyboardEvent<HTMLDivElement>): boolean {
    const text = new RSTextWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
    if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
      return handleAutoComplete(text);
    }

    if (event.altKey) {
      return text.processAltKey(event.code, event.shiftKey);
    }

    if (!(event.ctrlKey || event.metaKey)) {
      if (isPotentialLigature(event.key)) {
        const selection = text.getSelection();
        const prevSymbol = text.getText(selection.from - 1, selection.from);
        const newSymbol = getLigatureSymbol(prevSymbol, event.key);
        if (newSymbol) {
          text.setSelection(selection.from - 1, selection.to);
          text.replaceWith(newSymbol);
        }
        return !!newSymbol;
      } else {
        const newSymbol = getSymbolSubstitute(event.code, event.shiftKey);
        if (newSymbol) {
          text.replaceWith(newSymbol);
        }
        return !!newSymbol;
      }
    }

    if (event.code === 'KeyQ' && onAnalyze) {
      onAnalyze();
      return true;
    }
    return false;
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!thisRef.current) {
      return;
    }
    if (processInput(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleChange(value: string) {
    setLocalParse(null);
    if (onChange) {
      onChange(value);
    }
  }

  return (
    <div className={clsx('flex flex-col gap-2', className, cursor)} style={style}>
      <Label text={label} />
      <CodeMirror
        className={clsx('font-math', errorMessage && 'cm-error')}
        ref={thisRef}
        basicSetup={editorSetup}
        theme={customTheme}
        extensions={editorExtensions}
        indentWithTab={false}
        editable={!disabled}
        onKeyDown={handleInput}
        value={value}
        onChange={handleChange}
        {...restProps}
      />
      <ErrorField className='-mt-1' error={errorMessage} />
    </div>
  );
}
