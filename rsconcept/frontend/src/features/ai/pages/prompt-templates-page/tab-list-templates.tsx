'use client';

import { useConceptNavigation } from '@/app';
import { type IPromptTemplate } from '@/features/ai/backend/types';
import { useLabelUser } from '@/features/users';

import { TextURL } from '@/components/control';
import { createColumnHelper, DataTable, type IConditionalStyle } from '@/components/data-table';
import { NoData } from '@/components/view';
import { useDialogsStore } from '@/stores/dialogs';
import { type RO } from '@/utils/meta';

import { useAvailableTemplatesSuspense } from '../../backend/use-available-templates';
import { BadgeSharedTemplate } from '../../components/badge-shared-template';
const columnHelper = createColumnHelper<RO<IPromptTemplate>>();

interface TabListTemplatesProps {
  activeID: number | null;
}

export function TabListTemplates({ activeID }: TabListTemplatesProps) {
  const router = useConceptNavigation();
  const { items } = useAvailableTemplatesSuspense();
  const showCreatePromptTemplate = useDialogsStore(state => state.showCreatePromptTemplate);
  const getUserLabel = useLabelUser();

  function handleRowDoubleClicked(row: RO<IPromptTemplate>, event: React.MouseEvent<Element>) {
    event.preventDefault();
    event.stopPropagation();
    router.gotoPromptEdit(row.id, event.ctrlKey || event.metaKey);
  }

  function handleRowClicked(row: RO<IPromptTemplate>, event: React.MouseEvent<Element>) {
    if (row.id === activeID) {
      return;
    }
    router.gotoPromptList(row.id, event.ctrlKey || event.metaKey);
  }

  function handleCreateNew() {
    showCreatePromptTemplate({});
  }

  const columns = [
    columnHelper.accessor('is_shared', {
      id: 'is_shared',
      header: '',
      size: 50,
      minSize: 50,
      maxSize: 50,
      enableSorting: true,
      cell: props => <BadgeSharedTemplate value={props.getValue()} />,
      sortingFn: 'text'
    }),
    columnHelper.accessor('label', {
      id: 'label',
      header: 'Название',
      size: 200,
      minSize: 200,
      maxSize: 200,
      enableSorting: true,
      cell: props => <span className='min-w-20'>{props.getValue()}</span>,
      sortingFn: 'text'
    }),
    columnHelper.accessor('description', {
      id: 'description',
      header: 'Описание',
      size: 1200,
      minSize: 200,
      maxSize: 1200,
      enableSorting: true,
      sortingFn: 'text'
    }),
    columnHelper.accessor('owner', {
      id: 'owner',
      header: 'Владелец',
      size: 400,
      minSize: 100,
      maxSize: 400,
      cell: props => getUserLabel(props.getValue()),
      enableSorting: true,
      sortingFn: 'text'
    })
  ];

  const conditionalRowStyles: IConditionalStyle<RO<IPromptTemplate>>[] = [
    {
      when: (template: RO<IPromptTemplate>) => template.id === activeID,
      className: 'bg-selected'
    }
  ];

  return (
    <div className='pt-7 relative'>
      <DataTable
        noFooter
        enableSorting
        data={items as IPromptTemplate[]}
        columns={columns}
        className='w-full h-full border-x border-b'
        onRowClicked={handleRowClicked}
        onRowDoubleClicked={handleRowDoubleClicked}
        conditionalRowStyles={conditionalRowStyles}
        noDataComponent={
          <NoData>
            <p>Список пуст</p>
            <p>
              <TextURL text='Создать шаблон запроса...' onClick={handleCreateNew} />
            </p>
          </NoData>
        }
      />
    </div>
  );
}
