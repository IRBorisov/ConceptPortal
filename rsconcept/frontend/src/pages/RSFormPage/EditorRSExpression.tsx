import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import Button from '../../components/Common/Button';
import { Loader } from '../../components/Common/Loader';
import RSInput from '../../components/RSInput';
import { TextWrapper } from '../../components/RSInput/textEditing';
import { useRSForm } from '../../context/RSFormContext';
import useCheckExpression from '../../hooks/useCheckExpression';
import { TokenID } from '../../utils/enums';
import { IConstituenta, IRSErrorDescription, SyntaxTree } from '../../utils/models';
import { getCstExpressionPrefix, getTypificationLabel } from '../../utils/staticUI';
import ParsingResult from './elements/ParsingResult';
import RSLocalButton from './elements/RSLocalButton';
import RSTokenButton from './elements/RSTokenButton';
import StatusBar from './elements/StatusBar';

interface EditorRSExpressionProps {
  id: string
  activeCst?: IConstituenta
  label: string
  isActive: boolean
  disabled?: boolean
  placeholder?: string
  onShowAST: (expression: string, ast: SyntaxTree) => void
  toggleEditMode: () => void
  setTypification: (typificaiton: string) => void
  value: string
  onChange: (newValue: string) => void
  setValue: (expression: string) => void
}

function EditorRSExpression({
  activeCst, disabled, isActive, value, onShowAST, 
  toggleEditMode, setTypification, onChange, ... props
}: EditorRSExpressionProps) {
  const { schema } = useRSForm();

  const [isModified, setIsModified] = useState(false);
  const { parseData, checkExpression, resetParse, loading } = useCheckExpression({ schema });
  const rsInput = useRef<ReactCodeMirrorRef>(null);

  useLayoutEffect(() => {
    setIsModified(false);
    resetParse();
  }, [activeCst, resetParse]);

  function handleFocusIn() {
    toggleEditMode()
  }

  function handleChange(newvalue: string) {
    onChange(newvalue);
    setIsModified(true);
  }
  
  function handleCheckExpression() {
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
      setTypification(getTypificationLabel({
        isValid: parse.parseResult,
        resultType: parse.typification,
        args: parse.args
      }));
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
    const text = new TextWrapper(rsInput.current as Required<ReactCodeMirrorRef>);
    if (id === TokenID.ID_LOCAL) {
      text.insertChar(key ?? 'unknown_local');
    } else {
      text.insertToken(id);
    }
    rsInput.current?.view?.focus();
    setIsModified(true);
  }, []);

  const EditButtons = useMemo(() => {
    return (<div className='flex items-center justify-between w-full'>
    <div className='text-sm w-fit'>
      <div className='flex justify-start'>
        <RSTokenButton id={TokenID.NT_DECLARATIVE_EXPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NT_IMPERATIVE_EXPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NT_RECURSIVE_FULL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.BIGPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SMALLPR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.FILTER} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.REDUCE} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.CARD} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.BOOL} onInsert={handleEdit}/>

      </div>
      <div className='flex justify-start'>
        <RSTokenButton id={TokenID.BOOLEAN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_PL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.INTERSECTION} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.LIT_EMPTYSET} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.FORALL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOT} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.IN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SUBSET_OR_EQ} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.AND} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.IMPLICATION} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SET_MINUS} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_ITERATE} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SUBSET} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.DEBOOL} onInsert={handleEdit}/>
      </div>
      <div className='flex justify-start'>
        <RSTokenButton id={TokenID.DECART} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_SL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.UNION} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.LIT_INTSET} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.EXISTS} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOTEQUAL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOTIN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.NOTSUBSET} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.OR} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.EQUIVALENT} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.SYMMINUS} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.PUNC_ASSIGN} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.EQUAL} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.GREATER_OR_EQ} onInsert={handleEdit}/>
        <RSTokenButton id={TokenID.LESSER_OR_EQ} onInsert={handleEdit}/>
      </div>
    </div>
    <div className='text-xs w-fit'>
      <div className='flex justify-start'>
        <RSLocalButton text='μ' tooltip='q' onInsert={handleEdit}/>
        <RSLocalButton text='ω' tooltip='w' onInsert={handleEdit}/>
        <RSLocalButton text='ε' tooltip='e' onInsert={handleEdit}/>
        <RSLocalButton text='ρ' tooltip='r' onInsert={handleEdit}/>
        <RSLocalButton text='τ' tooltip='t' onInsert={handleEdit}/>
        <RSLocalButton text='π' tooltip='y' onInsert={handleEdit}/>
      </div>
      <div className='flex justify-start'>
        <RSLocalButton text='α' tooltip='a' onInsert={handleEdit}/>
        <RSLocalButton text='σ' tooltip='s' onInsert={handleEdit}/>
        <RSLocalButton text='δ' tooltip='d' onInsert={handleEdit}/>
        <RSLocalButton text='φ' tooltip='f' onInsert={handleEdit}/>
        <RSLocalButton text='γ' tooltip='g' onInsert={handleEdit}/>
        <RSLocalButton text='λ' tooltip='h' onInsert={handleEdit}/>
      </div>
      <div className='flex justify-start'>
        <RSLocalButton text='ζ' tooltip='z' onInsert={handleEdit}/>
        <RSLocalButton text='ξ' tooltip='x' onInsert={handleEdit}/>
        <RSLocalButton text='ψ' tooltip='c' onInsert={handleEdit}/>
        <RSLocalButton text='θ' tooltip='v' onInsert={handleEdit}/>
        <RSLocalButton text='β' tooltip='b' onInsert={handleEdit}/>
        <RSLocalButton text='η' tooltip='n' onInsert={handleEdit}/>
      </div>
    </div>
    </div>);
  }, [handleEdit]);

  return (
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3 w-full min-h-[15.75rem]'>
      <div className='relative w-full'>
      <div className='absolute top-[-0.1rem] right-0'>
      <StatusBar
        isModified={isModified}
        constituenta={activeCst}
        parseData={parseData}
      />
      </div>
      </div>
      <RSInput innerref={rsInput}
        className='mt-2 text-lg'
        height='10.1rem'
        value={value}
        editable={!disabled}
        onChange={handleChange}
        onFocus={handleFocusIn}
        {...props}
      />
      <div className='flex w-full gap-4 py-1 mt-1 justify-stretch'>
        <div className='flex flex-col gap-2'>
          <Button
            tooltip='Проверить формальное выражение'
            text='Проверить'
            widthClass='h-full w-fit'
            colorClass='clr-btn-default'
            onClick={handleCheckExpression}
          />
        </div>
        {isActive && !disabled && EditButtons}
      </div>
      { (isActive || loading || parseData) && 
      <div className='w-full overflow-y-auto border mt-2 max-h-[14rem] min-h-[4.2rem]'>
        { loading && <Loader size={6} />}
        { !loading && parseData && 
        <ParsingResult 
          data={parseData} 
          onShowAST={ast => onShowAST(value, ast)}
          onShowError={onShowError}
        />}
      </div>}
    </div>
  );
}

export default EditorRSExpression;
