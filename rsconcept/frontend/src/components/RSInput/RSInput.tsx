
import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { RefObject, useCallback, useMemo, useRef } from 'react';

import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import Label from '../Common/Label';
import { ccBracketMatching } from './bracketMatching';
import { RSLanguage } from './rslang';
import { getSymbolSubstitute,RSTextWrapper } from './textEditing';
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

interface RSInputProps 
extends Pick<ReactCodeMirrorProps, 
  'id' | 'height' | 'minHeight' | 'maxHeight' | 'value' | 'className' | 'onFocus' | 'onBlur' | 'placeholder'
> {
  label?: string
  dimensions?: string
  disabled?: boolean
  noTooltip?: boolean
  innerref?: RefObject<ReactCodeMirrorRef> | undefined
  onChange?: (newValue: string) => void
}

function RSInput({ 
  id, label, innerref, onChange,
  disabled, noTooltip,
  dimensions = 'w-full',
  ...restProps 
}: RSInputProps) {
  const { darkMode, colors } = useConceptTheme();
  const { schema } = useRSForm();

  const internalRef = useRef<ReactCodeMirrorRef>(null);
  const thisRef = useMemo(
  () => {
    return innerref ?? internalRef;
  }, [internalRef, innerref]);

  const cursor = useMemo(() => !disabled ? 'cursor-text': 'cursor-default', [disabled]);
  const customTheme: Extension = useMemo(
  () => createTheme({
    theme: darkMode ? 'dark' : 'light',
    settings: {
      fontFamily: 'inherit',
      background: !disabled ? colors.bgInput : colors.bgDefault,
      foreground: colors.fgDefault,
      selection: colors.bgHover
    },
    styles: [
      { tag: tags.name, color: colors.fgPurple, cursor: 'default' }, // GlobalID
      { tag: tags.variableName, color: colors.fgGreen }, // LocalID
      { tag: tags.propertyName, color: colors.fgTeal }, // Radical
      { tag: tags.keyword, color: colors.fgBlue }, // keywords
      { tag: tags.literal, color: colors.fgBlue }, // literals
      { tag: tags.controlKeyword, fontWeight: '500'}, // R | I | D
      { tag: tags.unit, fontSize: '0.75rem' }, // indicies
      { tag: tags.brace, color:colors.fgPurple, fontWeight: '500' }, // braces (curly brackets)
    ]
  }), [disabled, colors, darkMode]);

  const editorExtensions = useMemo(
  () => [
    EditorView.lineWrapping,
    RSLanguage,
    ccBracketMatching(darkMode),
    ... noTooltip ? [] : [rsHoverTooltip(schema?.items || [])],
  ], [darkMode, schema?.items, noTooltip]);

  const handleInput = useCallback(
  (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!thisRef.current) {
      return;
    }
    const text = new RSTextWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
    if (event.altKey) {
      if (text.processAltKey(event.code, event.shiftKey)) {
        event.preventDefault();
      }
    } else if (!event.ctrlKey) {
      const newSymbol = getSymbolSubstitute(event.code, event.shiftKey);
      if (newSymbol) {
        text.replaceWith(newSymbol);
        event.preventDefault();
      }
    }
  }, [thisRef]);

  return (
  <div className={`flex flex-col gap-2 ${dimensions} ${cursor}`}>
    {label ?
    <Label
      text={label}
      htmlFor={id}
    /> : null}
    <CodeMirror id={id}
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
  </div>);
}

export default RSInput;
