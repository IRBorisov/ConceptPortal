import { useLayoutEffect, useState } from 'react';

import Checkbox from '../../components/Common/Checkbox';
import Modal from '../../components/Common/Modal';
import { CstType } from '../../utils/models';
import { getCstTypeLabel } from '../../utils/staticUI';
import { GraphEditorParams } from './EditorTermGraph';

interface DlgGraphOptionsProps {
  hideWindow: () => void
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
        <div className='flex flex-col'>
          <h1>Преобразования</h1>
          <Checkbox
            label='Скрыть текст'
            tooltip='Не отображать термины'
            value={noTerms} 
            onChange={ event => setNoTerms(event.target.checked) }
          />
          <Checkbox
            label='Скрыть несвязанные'
            tooltip='Неиспользуемые конституенты'
            value={noHermits} 
            onChange={ event => setNoHermits(event.target.checked) }
          />
          <Checkbox
            label='Скрыть шаблоны'
            tooltip='Терм-функции и предикат-функции с параметризованными аргументами'
            value={noTemplates} 
            onChange={ event => setNoTemplates(event.target.checked) }
          />
          <Checkbox
            label='Транзитивная редукция'
            tooltip='Удалить связи, образующие транзитивные пути в графе'
            value={noTransitive} 
            onChange={ event => setNoTransitive(event.target.checked) }
          />
        </div>
        <div className='flex flex-col'>
          <h1>Типы конституент</h1>
          <Checkbox
            label={getCstTypeLabel(CstType.BASE)}
            value={allowBase} 
            onChange={ event => setAllowBase(event.target.checked) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.STRUCTURED)}
            value={allowStruct} 
            onChange={ event => setAllowStruct(event.target.checked) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.TERM)}
            value={allowTerm} 
            onChange={ event => setAllowTerm(event.target.checked) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.AXIOM)}
            value={allowAxiom} 
            onChange={ event => setAllowAxiom(event.target.checked) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.FUNCTION)}
            value={allowFunction} 
            onChange={ event => setAllowFunction(event.target.checked) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.PREDICATE)}
            value={allowPredicate} 
            onChange={ event => setAllowPredicate(event.target.checked) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.CONSTANT)}
            value={allowConstant} 
            onChange={ event => setAllowConstant(event.target.checked) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.THEOREM)}
            value={allowTheorem} 
            onChange={ event => setAllowTheorem(event.target.checked) }
          />
        </div>
      </div>
    </Modal>
  );
}

export default DlgGraphOptions;
