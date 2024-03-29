'use client';

import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { BiFontFamily, BiListUl } from 'react-icons/bi';
import { FaRegKeyboard } from 'react-icons/fa6';
import { RiNodeTree } from 'react-icons/ri';
import { toast } from 'react-toastify';

import HelpButton from '@/components/man/HelpButton';
import RSInput from '@/components/RSInput';
import { RSTextWrapper } from '@/components/RSInput/textEditing';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { useRSForm } from '@/context/RSFormContext';
import { useConceptTheme } from '@/context/ThemeContext';
import DlgShowAST from '@/dialogs/DlgShowAST';
import useCheckExpression from '@/hooks/useCheckExpression';
import useLocalStorage from '@/hooks/useLocalStorage';
import { HelpTopic } from '@/models/miscellaneous';
import { IConstituenta } from '@/models/rsform';
import { getDefinitionPrefix } from '@/models/rsformAPI';
import { IExpressionParse, IRSErrorDescription, SyntaxTree } from '@/models/rslang';
import { TokenID } from '@/models/rslang';
import { storage } from '@/utils/constants';
import { labelTypification } from '@/utils/labels';

import ParsingResult from './ParsingResult';
import RSEditorControls from './RSEditControls';
import StatusBar from './StatusBar';

interface EditorRSExpressionProps {
  id?: string;
  activeCst?: IConstituenta;
  value: string;
  label: string;
  placeholder?: string;

  disabled?: boolean;
  toggleReset?: boolean;
  showList: boolean;

  setTypification: (typification: string) => void;
  onChange: (newValue: string) => void;
  onToggleList: () => void;
}

function EditorRSExpression({
  activeCst,
  disabled,
  value,
  toggleReset,
  showList,
  setTypification,
  onChange,
  onToggleList,
  ...restProps
}: EditorRSExpressionProps) {
  const model = useRSForm();
  const { mathFont, setMathFont } = useConceptTheme();

  const [isModified, setIsModified] = useState(false);
  const parser = useCheckExpression({ schema: model.schema });
  const { resetParse } = parser;
  const rsInput = useRef<ReactCodeMirrorRef>(null);

  const [syntaxTree, setSyntaxTree] = useState<SyntaxTree>([]);
  const [expression, setExpression] = useState('');
  const [showAST, setShowAST] = useState(false);
  const [showControls, setShowControls] = useLocalStorage(storage.rseditShowControls, true);

  useLayoutEffect(() => {
    setIsModified(false);
    resetParse();
  }, [activeCst, resetParse, toggleReset]);

  function handleChange(newValue: string) {
    onChange(newValue);
    setIsModified(newValue !== activeCst?.definition_formal);
  }

  function handleCheckExpression(callback?: (parse: IExpressionParse) => void) {
    if (!activeCst) {
      return;
    }
    const prefix = getDefinitionPrefix(activeCst);
    const expression = prefix + value;
    parser.checkExpression(expression, activeCst, parse => {
      if (parse.errors.length > 0) {
        onShowError(parse.errors[0]);
      } else {
        rsInput.current?.view?.focus();
      }
      setIsModified(false);
      setTypification(
        labelTypification({
          isValid: parse.parseResult,
          resultType: parse.typification,
          args: parse.args
        })
      );
      if (callback) callback(parse);
    });
  }

  const onShowError = useCallback(
    (error: IRSErrorDescription) => {
      if (!activeCst || !rsInput.current) {
        return;
      }
      const prefix = getDefinitionPrefix(activeCst);
      let errorPosition = error.position - prefix.length;
      if (errorPosition < 0) errorPosition = 0;
      rsInput.current?.view?.dispatch({
        selection: {
          anchor: errorPosition,
          head: errorPosition
        }
      });
      rsInput.current?.view?.focus();
    },
    [activeCst]
  );

  const handleEdit = useCallback((id: TokenID, key?: string) => {
    if (!rsInput.current || !rsInput.current.editor || !rsInput.current.state || !rsInput.current.view) {
      return;
    }
    const text = new RSTextWrapper(rsInput.current as Required<ReactCodeMirrorRef>);
    if (id === TokenID.ID_LOCAL) {
      text.insertChar(key ?? 'unknown_local');
    } else {
      text.insertToken(id);
    }
    rsInput.current?.view?.focus();
    setIsModified(true);
  }, []);

  function handleShowAST() {
    handleCheckExpression(parse => {
      if (!parse.astText) {
        toast.error('Невозможно построить дерево разбора');
      } else {
        setSyntaxTree(parse.ast);
        setExpression(getDefinitionPrefix(activeCst!) + value);
        setShowAST(true);
      }
    });
  }

  function toggleFont() {
    setMathFont(mathFont === 'math' ? 'math2' : 'math');
  }

  return (
    <>
      <AnimatePresence>
        {showAST ? (
          <DlgShowAST expression={expression} syntaxTree={syntaxTree} hideWindow={() => setShowAST(false)} />
        ) : null}
      </AnimatePresence>

      <div>
        <Overlay position='top-[-0.5rem] right-0 flex'>
          <MiniButton
            title='Изменить шрифт'
            onClick={toggleFont}
            icon={<BiFontFamily size='1.25rem' className={mathFont === 'math' ? 'icon-primary' : ''} />}
          />
          {!disabled || model.processing ? (
            <MiniButton
              noHover
              title='Отображение специальной клавиатуры'
              onClick={() => setShowControls(prev => !prev)}
              icon={<FaRegKeyboard size='1.25rem' className={showControls ? 'icon-primary' : ''} />}
            />
          ) : null}
          <MiniButton
            noHover
            title='Отображение списка конституент'
            onClick={onToggleList}
            icon={<BiListUl size='1.25rem' className={showList ? 'icon-primary' : ''} />}
          />
          <MiniButton
            noHover
            title='Дерево разбора выражения'
            onClick={handleShowAST}
            icon={<RiNodeTree size='1.25rem' className='icon-primary' />}
          />
        </Overlay>

        <Overlay position='top-[-0.5rem] pl-[8rem] sm:pl-[4rem] right-1/2 translate-x-1/2 flex'>
          <StatusBar
            processing={parser.loading}
            isModified={isModified}
            constituenta={activeCst}
            parseData={parser.parseData}
            onAnalyze={() => handleCheckExpression()}
          />
          <HelpButton topic={HelpTopic.CONSTITUENTA} offset={4} />
        </Overlay>

        <RSInput
          ref={rsInput}
          value={value}
          minHeight='3.8rem'
          disabled={disabled}
          onChange={handleChange}
          onAnalyze={handleCheckExpression}
          {...restProps}
        />

        <RSEditorControls
          isOpen={showControls && (!disabled || model.processing)}
          disabled={disabled}
          onEdit={handleEdit}
        />

        <ParsingResult
          isOpen={!!parser.parseData && parser.parseData.errors.length > 0}
          data={parser.parseData}
          disabled={disabled}
          onShowError={onShowError}
        />
      </div>
    </>
  );
}

export default EditorRSExpression;
