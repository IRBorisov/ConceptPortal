
import { Extension } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { RefObject, useCallback, useMemo, useRef } from 'react';

import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import { TokenID } from '../../utils/enums';
import Label from '../Common/Label';
import { ccBracketMatching } from './bracketMatching';
import { RSLanguage } from './rslang';
import { getSymbolSubstitute,TextWrapper } from './textEditing';
import { rshoverTooltip as rsHoverTooltip } from './tooltip';

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
  dropCursor: false,
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
extends Omit<ReactCodeMirrorProps, 'onChange'| 'onKeyDown'> {
  label?: string
  innerref?: RefObject<ReactCodeMirrorRef> | undefined
  onChange?: (newValue: string) => void
}

function RSInput({ 
  id, label, innerref, onChange, editable,
  ...props 
}: RSInputProps) {
  const { darkMode, colors } = useConceptTheme();
  const { schema } = useRSForm();

  const internalRef = useRef<ReactCodeMirrorRef>(null);
  const thisRef = useMemo(
  () => {
    return innerref ?? internalRef;
  }, [internalRef, innerref]);

  const cursor = useMemo(() => editable ? 'cursor-text': 'cursor-default', [editable]);
  const lightTheme: Extension = useMemo(
  () => createTheme({
    theme: 'light',
    settings: {
      fontFamily: 'inherit',
      background: editable ? colors.bgInput : colors.bgDefault,
      foreground: colors.fgDefault,
      selection: colors.bgHover
    },
    styles: [
      { tag: t.name, class: 'text-[#b266ff] cursor-default' }, // GlobalID
      { tag: t.variableName, class: 'text-[#24821a]' }, // LocalID
      { tag: t.propertyName, class: '' }, // Radical
      { tag: t.keyword, class: 'text-[#001aff]' }, // keywords
      { tag: t.literal, class: 'text-[#001aff]' }, // literals
      { tag: t.controlKeyword, class: 'font-semibold'}, // R | I | D
      { tag: t.unit, class: 'text-[0.75rem]' }, // indicies
    ]
  }), [editable, colors]);
  
  const darkTheme: Extension = useMemo(
  () => createTheme({
    theme: 'dark',
    settings: {
      fontFamily: 'inherit',
      background: editable ? colors.bgInput : colors.bgDefault,
      foreground: colors.fgDefault,
      selection: colors.bgHover
    },
    styles: [
      { tag: t.name, class: 'text-[#dfbfff] cursor-default' }, // GlobalID
      { tag: t.variableName, class: 'text-[#69bf60]' }, // LocalID
      { tag: t.propertyName, class: '' }, // Radical
      { tag: t.keyword, class: 'text-[#808dff]' }, // keywords
      { tag: t.literal, class: 'text-[#808dff]' }, // literals
      { tag: t.controlKeyword, class: 'font-semibold'}, // R | I | D
      { tag: t.unit, class: 'text-[0.75rem]' }, // indicies
    ]
  }), [editable, colors]);

  const editorExtensions = useMemo(
  () => [
    EditorView.lineWrapping,
    RSLanguage,
    ccBracketMatching(darkMode),
    rsHoverTooltip(schema?.items || []),
  ], [darkMode, schema?.items]);

  const handleInput = useCallback(
  (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!thisRef.current) {
      return;
    }
    const text = new TextWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
    if (event.shiftKey && event.key === '*' && !event.altKey) {
      text.insertToken(TokenID.DECART);
    } else if (event.altKey) {
      if (!text.processAltKey(event.key)) {
        return;
      }
    } else if (!event.ctrlKey) {
      const newSymbol = getSymbolSubstitute(event.key);
      if (!newSymbol) {
        return;
      }
      text.replaceWith(newSymbol);
    } else {
      return;
    }
    event.preventDefault();
  }, [thisRef]);

  return (
    <div className={`flex flex-col w-full ${cursor}`}>
    {label && 
    <Label
      text={label}
      required={false}
      htmlFor={id}
      className='mb-2'
    />}
    <CodeMirror id={id}
      ref={thisRef}
      basicSetup={editorSetup}
      theme={darkMode ? darkTheme : lightTheme}
      extensions={editorExtensions}
      indentWithTab={false}
      onChange={onChange}
      editable={editable}
      onKeyDown={handleInput}
      {...props}
    />
    </div>
  );
}

export default RSInput;
