import { useLayoutEffect, useState } from 'react';

import Checkbox from '../components/Common/Checkbox';
import Modal, { ModalProps } from '../components/Common/Modal';
import { CstType } from '../models/rsform';
import { GraphEditorParams } from '../pages/RSFormPage/EditorTermGraph';
import { labelCstType } from '../utils/labels';

interface DlgGraphOptionsProps
extends Pick<ModalProps, 'hideWindow'> {
  initial: GraphEditorParams
  onConfirm: (params: GraphEditorParams) => void
}

function DlgGraphOptions({ hideWindow, initial, onConfirm }:DlgGraphOptionsProps) {
  const [ noHermits, setNoHermits ] = useState(true);
  const [ noTransitive, setNoTransitive ] = useState(false);
  const [ noTemplates, setNoTemplates ] = useState(true);
  const [ noTerms, setNoTerms ] = useState(true);

  const [ allowBase, setAllowBase ] = useState(true);
  const [ allowStruct, setAllowStruct ] = useState(true);
  const [ allowTerm, setAllowTerm ] = useState(true);
  const [ allowAxiom, setAllowAxiom ] = useState(true);
  const [ allowFunction, setAllowFunction ] = useState(true);
  const [ allowPredicate, setAllowPredicate ] = useState(true);
  const [ allowConstant, setAllowConstant ] = useState(true);
  const [ allowTheorem, setAllowTheorem ] = useState(true);

  function getParams() {
    return {
      noHermits: noHermits,
      noTransitive: noTransitive,
      noTemplates: noTemplates,
      noTerms: noTerms,

      allowBase: allowBase,
      allowStruct: allowStruct,
      allowTerm: allowTerm,
      allowAxiom: allowAxiom,
      allowFunction: allowFunction,
      allowPredicate: allowPredicate,
      allowConstant: allowConstant,
      allowTheorem: allowTheorem
    }
  }

  const handleSubmit = () => {
    hideWindow();
    onConfirm(getParams());
  };

  useLayoutEffect(() => {
    setNoHermits(initial.noHermits);
    setNoTransitive(initial.noTransitive);
    setNoTemplates(initial.noTemplates);
    setNoTerms(initial.noTerms);

    setAllowBase(initial.allowBase);
    setAllowStruct(initial.allowStruct);
    setAllowTerm(initial.allowTerm);
    setAllowAxiom(initial.allowAxiom);
    setAllowFunction(initial.allowFunction);
    setAllowPredicate(initial.allowPredicate);
    setAllowConstant(initial.allowConstant);
    setAllowTheorem(initial.allowTheorem);
  }, [initial]);

  return (
    <Modal
      hideWindow={hideWindow}
      title='Настройки графа термов'
      onSubmit={handleSubmit}
      canSubmit
      submitText='Применить'
    >
      <div className='flex gap-2'>
        <div className='flex flex-col gap-1'>
          <h1>Преобразования</h1>
          <Checkbox
            label='Скрыть текст'
            tooltip='Не отображать термины'
            value={noTerms} 
            setValue={ value => setNoTerms(value) }
          />
          <Checkbox
            label='Скрыть несвязанные'
            tooltip='Неиспользуемые конституенты'
            value={noHermits} 
            setValue={ value => setNoHermits(value) }
          />
          <Checkbox
            label='Скрыть шаблоны'
            tooltip='Терм-функции и предикат-функции с параметризованными аргументами'
            value={noTemplates} 
            setValue={ value => setNoTemplates(value) }
          />
          <Checkbox
            label='Транзитивная редукция'
            tooltip='Удалить связи, образующие транзитивные пути в графе'
            value={noTransitive} 
            setValue={ value => setNoTransitive(value) }
          />
        </div>
        <div className='flex flex-col gap-1'>
          <h1>Типы конституент</h1>
          <Checkbox
            label={labelCstType(CstType.BASE)}
            value={allowBase} 
            setValue={ value => setAllowBase(value) }
          />
          <Checkbox
            label={labelCstType(CstType.STRUCTURED)}
            value={allowStruct} 
            setValue={ value => setAllowStruct(value) }
          />
          <Checkbox
            label={labelCstType(CstType.TERM)}
            value={allowTerm} 
            setValue={ value => setAllowTerm(value) }
          />
          <Checkbox
            label={labelCstType(CstType.AXIOM)}
            value={allowAxiom} 
            setValue={ value => setAllowAxiom(value) }
          />
          <Checkbox
            label={labelCstType(CstType.FUNCTION)}
            value={allowFunction} 
            setValue={ value => setAllowFunction(value) }
          />
          <Checkbox
            label={labelCstType(CstType.PREDICATE)}
            value={allowPredicate} 
            setValue={ value => setAllowPredicate(value) }
          />
          <Checkbox
            label={labelCstType(CstType.CONSTANT)}
            value={allowConstant} 
            setValue={ value => setAllowConstant(value) }
          />
          <Checkbox
            label={labelCstType(CstType.THEOREM)}
            value={allowTheorem} 
            setValue ={ value => setAllowTheorem(value) }
          />
        </div>
      </div>
    </Modal>
  );
}

export default DlgGraphOptions;
