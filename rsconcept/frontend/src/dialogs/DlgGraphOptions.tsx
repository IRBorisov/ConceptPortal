import Checkbox from '../components/common/Checkbox';
import Modal, { ModalProps } from '../components/common/Modal';
import usePartialUpdate from '../hooks/usePartialUpdate';
import { GraphEditorParams } from '../models/miscelanious';
import { CstType } from '../models/rsform';
import { labelCstType } from '../utils/labels';

interface DlgGraphOptionsProps
extends Pick<ModalProps, 'hideWindow'> {
  initial: GraphEditorParams
  onConfirm: (params: GraphEditorParams) => void
}

function DlgGraphOptions({ hideWindow, initial, onConfirm } : DlgGraphOptionsProps) {
  const [params, updateParams] = usePartialUpdate(initial);

  const handleSubmit = () => {
    hideWindow();
    onConfirm(params);
  };

  return (
    <Modal canSubmit
      hideWindow={hideWindow}
      title='Настройки графа термов'
      onSubmit={handleSubmit}
      submitText='Применить'
    >
      <div className='flex gap-2'>
        <div className='flex flex-col gap-1'>
          <h1>Преобразования</h1>
          <Checkbox
            label='Скрыть текст'
            tooltip='Не отображать термины'
            value={params.noTerms} 
            setValue={value => updateParams({noTerms: value})}
          />
          <Checkbox
            label='Скрыть несвязанные'
            tooltip='Неиспользуемые конституенты'
            value={params.noHermits} 
            setValue={value => updateParams({ noHermits: value})}
          />
          <Checkbox
            label='Скрыть шаблоны'
            tooltip='Терм-функции и предикат-функции с параметризованными аргументами'
            value={params.noTemplates} 
            setValue={value => updateParams({ noTemplates: value})}
          />
          <Checkbox
            label='Транзитивная редукция'
            tooltip='Удалить связи, образующие транзитивные пути в графе'
            value={params.noTransitive} 
            setValue={value => updateParams({ noTransitive: value})}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <h1>Типы конституент</h1>
          <Checkbox
            label={labelCstType(CstType.BASE)}
            value={params.allowBase} 
            setValue={value => updateParams({ allowBase: value})}
          />
          <Checkbox
            label={labelCstType(CstType.STRUCTURED)}
            value={params.allowStruct} 
            setValue={value => updateParams({ allowStruct: value})}
          />
          <Checkbox
            label={labelCstType(CstType.TERM)}
            value={params.allowTerm} 
            setValue={value => updateParams({ allowTerm: value})}
          />
          <Checkbox
            label={labelCstType(CstType.AXIOM)}
            value={params.allowAxiom} 
            setValue={value => updateParams({ allowAxiom: value})}
          />
          <Checkbox
            label={labelCstType(CstType.FUNCTION)}
            value={params.allowFunction} 
            setValue={value => updateParams({ allowFunction: value})}
          />
          <Checkbox
            label={labelCstType(CstType.PREDICATE)}
            value={params.allowPredicate} 
            setValue={value => updateParams({ allowPredicate: value})}
          />
          <Checkbox
            label={labelCstType(CstType.CONSTANT)}
            value={params.allowConstant} 
            setValue={value => updateParams({ allowConstant: value})}
          />
          <Checkbox
            label={labelCstType(CstType.THEOREM)}
            value={params.allowTheorem} 
            setValue={value => updateParams({ allowTheorem: value})}
          />
        </div>
      </div>
    </Modal>
  );
}

export default DlgGraphOptions;
