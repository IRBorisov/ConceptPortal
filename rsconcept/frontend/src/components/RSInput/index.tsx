
import { Extension } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { Ref, useMemo } from 'react';

import { useConceptTheme } from '../../context/ThemeContext';
import { ccBracketMatching } from './bracketMatching';
import { RSLanguage } from './rslang';
//import { cursorTooltip } from './tooltip';

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
extends Omit<ReactCodeMirrorProps, 'onChange'> {
  innerref?: Ref<ReactCodeMirrorRef> | undefined
  onChange: (newValue: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

function RSInput({ 
  innerref, onChange, editable,
  ...props 
}: RSInputProps) {
  const { darkMode } = useConceptTheme();

  const cursor = useMemo(() => editable ? 'cursor-text': 'cursor-default', [editable]);
  const lightTheme: Extension = useMemo(
  () => createTheme({
    theme: 'light',
    settings: {
      fontFamily: 'inherit',
      background: editable ? '#ffffff' : '#f0f2f7',
      foreground: '#000000',
      selection: '#aacef2',
      caret: '#5d00ff',
    },
    styles: [
      { tag: t.name, class: 'text-[#b266ff]' }, // GlobalID
      { tag: t.variableName, class: 'text-[#24821a]' }, // LocalID
      { tag: t.propertyName, class: '' }, // Radical
      { tag: t.keyword, class: 'text-[#001aff]' }, // keywords
      { tag: t.literal, class: 'text-[#001aff]' }, // literals
      { tag: t.controlKeyword, class: 'font-semibold'}, // R | I | D
      { tag: t.unit, class: 'text-[0.75rem]' }, // indicies
    ]
  }), [editable]);
  
  const darkTheme: Extension = useMemo(
  () => createTheme({
    theme: 'dark',
    settings: {
      fontFamily: 'inherit',
      background: editable ? '#070b12' : '#374151',
      foreground: '#e4e4e7',
      selection: '#8c6000',
      caret: '#ffaa00'
    },
    styles: [
      { tag: t.name, class: 'text-[#dfbfff]' }, // GlobalID
      { tag: t.variableName, class: 'text-[#69bf60]' }, // LocalID
      { tag: t.propertyName, class: '' }, // Radical
      { tag: t.keyword, class: 'text-[#808dff]' }, // keywords
      { tag: t.literal, class: 'text-[#808dff]' }, // literals
      { tag: t.controlKeyword, class: 'font-semibold'}, // R | I | D
      { tag: t.unit, class: 'text-[0.75rem]' }, // indicies
    ]
  }), [editable]);

  const editorExtensions = useMemo(
  () => [
    EditorView.lineWrapping,
    RSLanguage,
    ccBracketMatching(darkMode),
    //cursorTooltip(),
  ], [darkMode]);

  return (
    <div className={`w-full ${cursor} text-lg`}>
    <CodeMirror
      ref={innerref}
      basicSetup={editorSetup}
      theme={darkMode ? darkTheme : lightTheme}
      extensions={editorExtensions}
      indentWithTab={false}
      onChange={value => onChange(value)}
      editable={editable}
      {...props}
    />
    </div>
  );
}

export default RSInput;
