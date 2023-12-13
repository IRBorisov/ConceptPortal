'use client';

import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import { ASTNetworkIcon } from '@/components/Icons';
import RSInput from '@/components/RSInput';
import { RSTextWrapper } from '@/components/RSInput/textEditing';
import { useRSForm } from '@/context/RSFormContext';
import DlgShowAST from '@/dialogs/DlgShowAST';
import useCheckExpression from '@/hooks/useCheckExpression';
import { IConstituenta } from '@/models/rsform';
import { IExpressionParse, IRSErrorDescription, SyntaxTree } from '@/models/rslang';
import { TokenID } from '@/models/rslang';
import { labelTypification } from '@/utils/labels';
import { getCstExpressionPrefix } from '@/utils/misc';

import RSAnalyzer from './RSAnalyzer';
import RSEditorControls from './RSEditControls';

interface EditorRSExpressionProps {
  id?: string
  activeCst?: IConstituenta
  label: string
  disabled?: boolean
  toggleReset?: boolean
  placeholder?: string
  setTypification: (typificaiton: string) => void
  value: string
  onChange: (newValue: string) => void
}

function EditorRSExpression({
  activeCst, disabled, value, toggleReset,
  setTypification, onChange, ...restProps
}: EditorRSExpressionProps) {
  const { schema } = useRSForm();

  const [isModified, setIsModified] = useState(false);
  const { parseData, checkExpression, resetParse, loading } = useCheckExpression({ schema });
  const rsInput = useRef<ReactCodeMirrorRef>(null);

  const [syntaxTree, setSyntaxTree] = useState<SyntaxTree>([]);
  const [expression, setExpression] = useState('');
  const [showAST, setShowAST] = useState(false);

  useLayoutEffect(() => {
    setIsModified(false);
    resetParse();
  }, [activeCst, resetParse, toggleReset]);

  function handleChange(newvalue: string) {
    onChange(newvalue);
    setIsModified(newvalue !== activeCst?.definition_formal);
  }
  
  function handleCheckExpression(callback?: (parse: IExpressionParse) => void) {
    if (!activeCst) {
      return;
    }
    const prefix = getCstExpressionPrefix(activeCst);
    const expression = prefix + value;
    checkExpression(expression, activeCst, parse => {
      if (parse.errors.length > 0) {
        onShowError(parse.errors[0]);
      } else {
        rsInput.current?.view?.focus();
      }
      setIsModified(false);
      setTypification(labelTypification({
        isValid: parse.parseResult,
        resultType: parse.typification,
        args: parse.args
      }));
      if (callback) callback(parse);
    });
  }

  const onShowError = useCallback(
  (error: IRSErrorDescription) => {
    if (!activeCst || !rsInput.current) {
      return;
    }
    const prefix = getCstExpressionPrefix(activeCst);
    let errorPosition = error.position - prefix.length;
    if (errorPosition < 0) errorPosition = 0;
    rsInput.current?.view?.dispatch({
      selection: {
        anchor: errorPosition,
        head: errorPosition
      }
    });
    rsInput.current?.view?.focus();
  }, [activeCst]);

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
    handleCheckExpression(
    (parse) => {
      if (!parse.astText) {
        toast.error('Невозможно построить дерево разбора');
      } else {
        setSyntaxTree(parse.ast);
        setExpression(getCstExpressionPrefix(activeCst!) + value);
        setShowAST(true);
      }
    });
  }

  return (
  <div className='flex flex-col items-start w-full'>
    {showAST ? 
    <DlgShowAST
      expression={expression}
      syntaxTree={syntaxTree}
      hideWindow={() => setShowAST(false)}
    /> : null}
    <Overlay position='top-[-0.2rem] left-[11rem]'>
      <MiniButton noHover
        tooltip='Дерево разбора выражения'
        onClick={handleShowAST}
        icon={<ASTNetworkIcon size={5} color='text-primary' />}
      />
     </Overlay>

    <RSInput innerref={rsInput}
      value={value}
      minHeight='3.8rem'
      disabled={disabled}
      onChange={handleChange}
      {...restProps}
    />

    <RSEditorControls 
      disabled={disabled}
      onEdit={handleEdit}
    />
    
    <RSAnalyzer 
      parseData={parseData}
      processing={loading}
      isModified={isModified}
      activeCst={activeCst}
      onCheckExpression={handleCheckExpression}
      onShowError={onShowError}
    />
  </div>);
}

export default EditorRSExpression;
