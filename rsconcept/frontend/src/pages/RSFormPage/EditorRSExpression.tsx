import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '../../components/Common/Button';
import { ConceptLoader } from '../../components/Common/ConceptLoader';
import MiniButton from '../../components/Common/MiniButton';
import { ASTNetworkIcon } from '../../components/Icons';
import RSInput from '../../components/RSInput';
import { RSTextWrapper } from '../../components/RSInput/textEditing';
import { useRSForm } from '../../context/RSFormContext';
import useCheckExpression from '../../hooks/useCheckExpression';
import { IConstituenta } from '../../models/rsform';
import { IExpressionParse, IRSErrorDescription, SyntaxTree } from '../../models/rslang';
import { TokenID } from '../../models/rslang';
import { labelTypification } from '../../utils/labels';
import { getCstExpressionPrefix } from '../../utils/misc';
import ParsingResult from './elements/ParsingResult';
import RSEditorControls from './elements/RSEditorControls';
import StatusBar from './elements/StatusBar';

interface EditorRSExpressionProps {
  id?: string
  activeCst?: IConstituenta
  label: string
  disabled?: boolean
  toggleReset?: boolean
  placeholder?: string
  onShowAST: (expression: string, ast: SyntaxTree) => void
  setTypification: (typificaiton: string) => void
  value: string
  onChange: (newValue: string) => void
}

function EditorRSExpression({
  activeCst, disabled, value, onShowAST, toggleReset,
  setTypification, onChange, ...restProps
}: EditorRSExpressionProps) {
  const { schema } = useRSForm();

  const [isModified, setIsModified] = useState(false);
  const { parseData, checkExpression, resetParse, loading } = useCheckExpression({ schema });
  const rsInput = useRef<ReactCodeMirrorRef>(null);

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
        onShowAST(getCstExpressionPrefix(activeCst!) + value, parse.ast);
      }
    });
  }

  return (
  <div className='flex flex-col items-start w-full'>
    <div className='relative w-full'>
      <div className='absolute top-[-0.2rem] left-[11rem]'>
      <MiniButton
          tooltip='Дерево разбора выражения'
          noHover
          onClick={handleShowAST}
          icon={<ASTNetworkIcon size={5} color='text-primary' />}
        />
      </div>
    </div>
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
    <div className='w-full max-h-[4.5rem] min-h-[4.5rem] flex'>
      <div className='flex flex-col text-sm'>
        <Button noOutline
          text='Проверить'
          tooltip='Проверить формальное определение'
          dimensions='w-[6.75rem] min-h-[3rem] z-pop rounded-none'
          colors='clr-btn-default'
          onClick={() => handleCheckExpression()}
        />
        <StatusBar
          isModified={isModified}
          constituenta={activeCst}
          parseData={parseData}
        />
      </div>
      <div className='w-full overflow-y-auto text-sm border rounded-none'>
        {loading ? <ConceptLoader size={6} /> : null}
        {(!loading && parseData) ? 
        <ParsingResult
          data={parseData}
          disabled={disabled}
          onShowError={onShowError}
        /> : null}
        {(!loading && !parseData) ?
        <input disabled
          className='w-full px-2 py-1 text-base select-none h-fit clr-app'
          placeholder='Результаты проверки выражения'
        /> : null}
      </div>
    </div>
  </div>);
}

export default EditorRSExpression;
