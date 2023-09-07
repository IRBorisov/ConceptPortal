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
        <div className='flex flex-col'>
          <h1>Типы конституент</h1>
          <Checkbox
            label={getCstTypeLabel(CstType.BASE)}
            value={allowBase} 
            setValue={ value => setAllowBase(value) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.STRUCTURED)}
            value={allowStruct} 
            setValue={ value => setAllowStruct(value) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.TERM)}
            value={allowTerm} 
            setValue={ value => setAllowTerm(value) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.AXIOM)}
            value={allowAxiom} 
            setValue={ value => setAllowAxiom(value) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.FUNCTION)}
            value={allowFunction} 
            setValue={ value => setAllowFunction(value) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.PREDICATE)}
            value={allowPredicate} 
            setValue={ value => setAllowPredicate(value) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.CONSTANT)}
            value={allowConstant} 
            setValue={ value => setAllowConstant(value) }
          />
          <Checkbox
            label={getCstTypeLabel(CstType.THEOREM)}
            value={allowTheorem} 
            setValue ={ value => setAllowTheorem(value) }
          />
        </div>
      </div>
    </Modal>
  );
}

export default DlgGraphOptions;
