import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import Button from '../../components/Common/Button';
import Label from '../../components/Common/Label';
import { Loader } from '../../components/Common/Loader';
import { useRSForm } from '../../context/RSFormContext';
import useCheckExpression from '../../hooks/useCheckExpression';
import { TokenID } from '../../utils/enums';
import { IRSErrorDescription, SyntaxTree } from '../../utils/models';
import { getCstExpressionPrefix } from '../../utils/staticUI';
import ParsingResult from './elements/ParsingResult';
import RSLocalButton from './elements/RSLocalButton';
import RSTokenButton from './elements/RSTokenButton';
import StatusBar from './elements/StatusBar';
import { getSymbolSubstitute, TextWrapper } from './elements/textEditing';

interface EditorRSExpressionProps {
  id: string
  label: string
  isActive: boolean
  disabled?: boolean
  placeholder?: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onShowAST: (expression: string, ast: SyntaxTree) => void
  toggleEditMode: () => void
  setTypification: (typificaiton: string) => void
  setValue: (expression: string) => void
}

function EditorRSExpression({
  id, label, disabled, isActive, placeholder, value, setValue, onShowAST, 
  toggleEditMode, setTypification, onChange
}: EditorRSExpressionProps) {
  const { schema, activeCst } = useRSForm();
  const [isModified, setIsModified] = useState(false);
  const { parseData, checkExpression, resetParse, loading } = useCheckExpression({ schema });
  const expressionCtrl = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    setIsModified(false);
    resetParse();
  }, [activeCst, resetParse]);

  function handleFocusIn() {
    toggleEditMode()
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(event);
    setIsModified(true);
  }
  
  function handleCheckExpression() {
    if (!activeCst) {
      return;
    }
    const prefix = getCstExpressionPrefix(activeCst);
    const expression = prefix + value;
    checkExpression(expression, parse => {
      if (parse.errors.length > 0) {
        const errorPosition = parse.errors[0].position - prefix.length
        expressionCtrl.current!.selectionStart = errorPosition;
        expressionCtrl.current!.selectionEnd = errorPosition;
      }
      expressionCtrl.current!.focus();
      setIsModified(false);
      setTypification(parse.typification);
    });
  }

  const onShowError = useCallback(
  (error: IRSErrorDescription) => {
      if (!activeCst || !expressionCtrl.current) {
        return;
      }
      const errorPosition = error.position -  getCstExpressionPrefix(activeCst).length
      expressionCtrl.current.selectionStart = errorPosition;
      expressionCtrl.current.selectionEnd = errorPosition;
      expressionCtrl.current.focus();
  }, [activeCst]);

  const handleEdit = useCallback((id: TokenID, key?: string) => {
    if (!expressionCtrl.current) {
      toast.error('Нет доступа к полю редактирования формального выражения');
      return;
    }
    const text = new TextWrapper(expressionCtrl.current);
    if (id === TokenID.ID_LOCAL) {
      text.insertChar(key ?? 'unknown_local');
    } else {
      text.insertToken(id);
    }
    text.finalize();
    text.focus();
    setValue(text.value);
    setIsModified(true);
  }, [setValue]);
  
  const handleInput = useCallback(
  (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!expressionCtrl.current) {
      return;
    }
    const text = new TextWrapper(expressionCtrl.current);
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
    text.finalize();
    setValue(text.value);
    setIsModified(true);
  }, [expressionCtrl, setValue]);

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
    <div className='flex flex-col items-start [&:not(:first-child)]:mt-3 w-full'>
      <Label
        text={label}
        required={false}
        htmlFor={id}
      />
      <textarea id={id} ref={expressionCtrl}
          className='w-full px-3 py-2 mt-2 leading-tight border shadow dark:bg-gray-800'
          rows={6}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocusIn}
          onKeyDown={handleInput}
          disabled={disabled}
          spellCheck={false}
      />
      <div className='flex w-full gap-4 py-1 mt-1 justify-stretch'>
        <div className='flex flex-col gap-2'>
          {isActive && <StatusBar
            isModified={isModified}
            constituenta={activeCst}
            parseData={parseData}
          />}
          <Button
            tooltip='Проверить формальное выражение'
            text='Проверить'
            onClick={handleCheckExpression}
          />
        </div>
        {isActive && EditButtons}
        {!isActive && <StatusBar
            isModified={isModified}
            constituenta={activeCst}
            parseData={parseData}
        />}
      </div>
      { (loading || parseData) && 
      <div className='w-full overflow-y-auto border mt-2 max-h-[14rem] min-h-[7rem]'>
        { loading && <Loader />}
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
