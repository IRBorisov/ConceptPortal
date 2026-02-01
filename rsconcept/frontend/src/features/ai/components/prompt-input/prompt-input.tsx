'use client';

import { forwardRef, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { type Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, {
  type BasicSetupOptions,
  type ReactCodeMirrorProps,
  type ReactCodeMirrorRef
} from '@uiw/react-codemirror';
import clsx from 'clsx';
import { EditorView } from 'codemirror';

import { Label } from '@/components/input';
import { usePreferencesStore } from '@/stores/preferences';
import { APP_COLORS } from '@/styling/colors';

import { PromptVariableType } from '../../models/prompting';

import { variableCompletions } from './completion';
import { markVariables } from './mark-variables';
import { noSpellcheckForVariables } from './no-spellcheck';
import { PromptLanguage } from './parse';
import { variableHoverTooltip } from './tooltip';

const EDITOR_OPTIONS: BasicSetupOptions = {
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

interface PromptInputProps
  extends Pick<
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
  value: string;
  onChange: (newValue: string) => void;
  availableVariables?: string[];

  label?: string;
  disabled?: boolean;
  initialValue?: string;
}

export const PromptInput = forwardRef<ReactCodeMirrorRef, PromptInputProps>(
  (
    {
      id, //
      label,
      disabled,
      onChange,
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
        caret: APP_COLORS.fgDefault
      },
      styles: [
        { tag: tags.name, cursor: 'default' }, // Variable
        { tag: tags.comment, color: APP_COLORS.fgRed } // Error
      ]
    });

    const variables = restProps.availableVariables ?? Object.values(PromptVariableType);
    const autoCompleter = autocompletion({
      override: [variableCompletions(variables)],
      activateOnTyping: true,
      aboveCursor: true,
      icons: false
    });

    const editorExtensions = [
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ spellcheck: 'true' }),
      PromptLanguage,
      variableHoverTooltip(variables),
      autoCompleter,
      noSpellcheckForVariables,
      markVariables(variables)
    ];

    return (
      <div className={clsx('flex flex-col gap-2', cursor)}>
        <Label text={label} />
        <CodeMirror
          id={id}
          ref={thisRef}
          basicSetup={EDITOR_OPTIONS}
          theme={customTheme}
          extensions={editorExtensions}
          indentWithTab={false}
          onChange={onChange}
          editable={!disabled}
          {...restProps}
        />
      </div>
    );
  }
);
