import { bracketMatching } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { Ref, useMemo } from 'react';

import { useConceptTheme } from '../../context/ThemeContext';

const editorSetup: BasicSetupOptions = {
  highlightSpecialChars: true,
  history: true,
  drawSelection: true,
  syntaxHighlighting: true,
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

const editorExtensions = [
  EditorView.lineWrapping,
  bracketMatching()
];

interface RSInputProps 
extends Omit<ReactCodeMirrorProps, 'onChange'> {
  innerref?: Ref<ReactCodeMirrorRef> | undefined
  onChange: (newValue: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

function RSInput({ 
  innerref, onChange, editable,
  height='10rem',
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
      selection: '#036dd626',
      selectionMatch: '#036dd626',
      caret: '#5d00ff',
    },
    styles: [
      // { tag: t.comment, color: '#787b8099' },
      // { tag: t.variableName, color: '#0080ff' },
      // { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
      // { tag: t.definition(t.typeName), color: '#5c6166' },
    ]
  }), [editable]);
  
  const darkTheme: Extension = useMemo(
  () => createTheme({
    theme: 'dark',
    settings: {
      fontFamily: 'inherit',
      background: editable ? '#070b12' : '#374151',
      foreground: '#e4e4e7',
      selection: '#ffae00b0',
      selectionMatch: '#ffae00b0',
      caret: '#ffaa00'
    },
    styles: [
      // { tag: t.comment, color: '#787b8099' },
      // { tag: t.variableName, color: '#0080ff' },
      // { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
      // { tag: t.definition(t.typeName), color: '#5c6166' },
    ]
  }), [editable]);

  return (
    <div className={`w-full h-[${height}] ${cursor}`}>
    <CodeMirror
      ref={innerref}
      basicSetup={editorSetup}
      extensions={editorExtensions}
      height={height}
      indentWithTab={false}
      theme={darkMode ? darkTheme : lightTheme}
      onChange={value => onChange(value)}
      editable={editable}
      {...props}
    />
    </div>
  );
}

export default RSInput;
