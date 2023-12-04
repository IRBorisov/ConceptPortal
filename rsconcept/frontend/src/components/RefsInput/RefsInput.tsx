
import { Extension } from '@codemirror/state';
import { tags } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import CodeMirror, { BasicSetupOptions, ReactCodeMirrorProps, ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { RefObject, useCallback, useMemo, useRef, useState } from 'react';

import { useRSForm } from '../../context/RSFormContext';
import { useConceptTheme } from '../../context/ThemeContext';
import DlgEditReference from '../../dialogs/DlgEditReference';
import useResolveText from '../../hooks/useResolveText';
import { ReferenceType } from '../../models/language';
import { IConstituenta } from '../../models/rsform';
import { CodeMirrorWrapper } from '../../utils/codemirror';
import Label from '../Common/Label';
import Modal from '../Common/Modal';
import PrettyJson from '../Common/PrettyJSON';
import { NaturalLanguage, ReferenceTokens } from './parse';
import { RefEntity } from './parse/parser.terms';
import { refsHoverTooltip } from './tooltip';

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

interface RefsInputInputProps 
extends Pick<ReactCodeMirrorProps, 
  'id'| 'height' | 'value' | 'className' | 'onFocus' | 'onBlur' | 'placeholder'
> {
  label?: string
  innerref?: RefObject<ReactCodeMirrorRef> | undefined
  onChange?: (newValue: string) => void
  items?: IConstituenta[]
  disabled?: boolean
  
  initialValue?: string
  value?: string
  resolved?: string
}

function RefsInput({ 
  id, label, innerref, disabled, items,
  initialValue, value, resolved,
  onFocus, onBlur, onChange,
  ...restProps 
}: RefsInputInputProps) {
  const { darkMode, colors } = useConceptTheme();
  const { schema } = useRSForm();

  const { resolveText, refsData } = useResolveText({schema: schema});

  const [showResolve, setShowResolve] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [showEditor, setShowEditor] = useState(false);
  const [currentType, setCurrentType] = useState<ReferenceType>(ReferenceType.ENTITY);
  const [refText, setRefText] = useState('');
  const [hintText, setHintText] = useState('');
  const [basePosition, setBasePosition] = useState(0);
  const [mainRefs, setMainRefs] = useState<string[]>([]);

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
      { tag: tags.name, color: colors.fgPurple, cursor: 'default' }, // EntityReference
      { tag: tags.literal, color: colors.fgTeal, cursor: 'default' }, // SyntacticReference
      { tag: tags.comment, color: colors.fgRed }, // Error
    ]
  }), [disabled, colors, darkMode]);

  const editorExtensions = useMemo(
  () => [
    EditorView.lineWrapping,
    NaturalLanguage,
    refsHoverTooltip(schema?.items || [], colors)
  ], [schema?.items, colors]);

  function handleChange(newValue: string) {
    if (onChange) onChange(newValue);
  }

  function handleFocusIn(event: React.FocusEvent<HTMLDivElement>) {
    setIsFocused(true);
    if (onFocus) onFocus(event);
  }

  function handleFocusOut(event: React.FocusEvent<HTMLDivElement>) {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  }

  const handleInput = useCallback(
  (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!thisRef.current?.view) {
      event.preventDefault();
      return;
    }
    if (event.altKey) {
      if (event.key === 'r' && value) {
        event.preventDefault();
        resolveText(value, () => {
          setShowResolve(true);
        });
        return;
      }
    }
    if (event.ctrlKey && event.code === 'Space') {
      const wrap = new CodeMirrorWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
      wrap.fixSelection(ReferenceTokens);
      const nodes = wrap.getEnvelopingNodes(ReferenceTokens);
      if (nodes.length !== 1) {
        setCurrentType(ReferenceType.ENTITY);
        setRefText('');
        setHintText(wrap.getSelectionText());
      } else {
        setCurrentType(nodes[0].type.id === RefEntity ? ReferenceType.ENTITY : ReferenceType.SYNTACTIC);
        setRefText(wrap.getSelectionText());
      }

      const selection = wrap.getSelection();
      const mainNodes = wrap.getAllNodes([RefEntity]).filter(node => node.from >= selection.to || node.to <= selection.from);
      setMainRefs(mainNodes.map(node => wrap.getText(node.from, node.to)));
      setBasePosition(mainNodes.filter(node => node.to <= selection.from).length);

      setShowEditor(true);
    }
  }, [thisRef, resolveText, value]);

  const handleInputReference = useCallback(
  (referenceText: string) => {
    if (!thisRef.current?.view) {
      return;
    }
    thisRef.current.view.focus();
    const wrap = new CodeMirrorWrapper(thisRef.current as Required<ReactCodeMirrorRef>);
    wrap.replaceWith(referenceText);
  }, [thisRef]);

  return (
  <>
    {showEditor ?
    <DlgEditReference
      hideWindow={() => setShowEditor(false)}
      items={items ?? []}
      initial={{
        type: currentType,
        refRaw: refText,
        text: hintText,
        basePosition: basePosition,
        mainRefs: mainRefs
      }}
      onSave={handleInputReference}
    /> : null}
    {showResolve ?
    <Modal
      readonly
      hideWindow={() => setShowResolve(false)}
    >
      <div className='max-h-[60vh] max-w-[80vw] overflow-auto'>
        <PrettyJson data={refsData} />
      </div>
    </Modal> : null}
    <div className={`flex flex-col  w-full ${cursor}`}>
    {label ? 
    <Label
      text={label}
      htmlFor={id}
      className='mb-2'
    /> : null}
    <CodeMirror id={id} ref={thisRef}
      basicSetup={editorSetup}
      theme={customTheme}
      extensions={editorExtensions}

      value={isFocused ? value : (value !== initialValue || showEditor ? value : resolved)}

      indentWithTab={false}
      onChange={handleChange}
      editable={!disabled}
      onKeyDown={handleInput}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
      // spellCheck= // TODO: figure out while automatic spellcheck doesnt work or implement with extension
      {...restProps}
    />
    </div>
  </>);
}

export default RefsInput;
