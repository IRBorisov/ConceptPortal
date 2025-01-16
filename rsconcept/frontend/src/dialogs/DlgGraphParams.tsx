'use client';

import Checkbox from '@/components/ui/Checkbox';
import Modal from '@/components/ui/Modal';
import usePartialUpdate from '@/hooks/usePartialUpdate';
import { GraphFilterParams } from '@/models/miscellaneous';
import { CstType } from '@/models/rsform';
import { useDialogsStore } from '@/stores/dialogs';
import { labelCstType } from '@/utils/labels';

export interface DlgGraphParamsProps {
  initial: GraphFilterParams;
  onConfirm: (params: GraphFilterParams) => void;
}

function DlgGraphParams() {
  const { initial, onConfirm } = useDialogsStore(state => state.props as DlgGraphParamsProps);
  const [params, updateParams] = usePartialUpdate(initial);

  return (
    <Modal
      canSubmit
      header='Настройки графа термов'
      onSubmit={() => onConfirm(params)}
      submitText='Применить'
      className='flex gap-6 justify-between px-6 pb-3 w-[30rem]'
    >
      <div className='flex flex-col gap-1'>
        <h1 className='mb-2'>Преобразования</h1>
        <Checkbox
          label='Скрыть текст'
          title='Не отображать термины'
          value={params.noText}
          setValue={value => updateParams({ noText: value })}
        />
        <Checkbox
          label='Скрыть несвязанные'
          title='Неиспользуемые конституенты'
          value={params.noHermits}
          setValue={value => updateParams({ noHermits: value })}
        />
        <Checkbox
          label='Скрыть шаблоны'
          titleHtml='Терм-функции и предикат-функции <br/>с параметризованными аргументами'
          value={params.noTemplates}
          setValue={value => updateParams({ noTemplates: value })}
        />
        <Checkbox
          label='Транзитивная редукция'
          titleHtml='Удалить связи, образующие <br/>транзитивные пути в графе'
          value={params.noTransitive}
          setValue={value => updateParams({ noTransitive: value })}
        />
        <Checkbox
          label='Свернуть порожденные'
          title='Не отображать порожденные понятия'
          value={params.foldDerived}
          setValue={value => updateParams({ foldDerived: value })}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <h1 className='mb-2'>Типы конституент</h1>
        <Checkbox
          label={labelCstType(CstType.BASE)}
          value={params.allowBase}
          setValue={value => updateParams({ allowBase: value })}
        />
        <Checkbox
          label={labelCstType(CstType.STRUCTURED)}
          value={params.allowStruct}
          setValue={value => updateParams({ allowStruct: value })}
        />
        <Checkbox
          label={labelCstType(CstType.TERM)}
          value={params.allowTerm}
          setValue={value => updateParams({ allowTerm: value })}
        />
        <Checkbox
          label={labelCstType(CstType.AXIOM)}
          value={params.allowAxiom}
          setValue={value => updateParams({ allowAxiom: value })}
        />
        <Checkbox
          label={labelCstType(CstType.FUNCTION)}
          value={params.allowFunction}
          setValue={value => updateParams({ allowFunction: value })}
        />
        <Checkbox
          label={labelCstType(CstType.PREDICATE)}
          value={params.allowPredicate}
          setValue={value => updateParams({ allowPredicate: value })}
        />
        <Checkbox
          label={labelCstType(CstType.CONSTANT)}
          value={params.allowConstant}
          setValue={value => updateParams({ allowConstant: value })}
        />
        <Checkbox
          label={labelCstType(CstType.THEOREM)}
          value={params.allowTheorem}
          setValue={value => updateParams({ allowTheorem: value })}
        />
      </div>
    </Modal>
  );
}

export default DlgGraphParams;
