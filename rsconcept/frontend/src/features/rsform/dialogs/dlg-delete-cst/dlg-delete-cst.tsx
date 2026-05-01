'use client';

import { type SubmitEvent, useState } from 'react';

import { type RSForm } from '@/domain/library';
import { useTx } from '@/i18n/use-tx';

import { Checkbox } from '@/components/input';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { prefixes } from '@/utils/constants';

import { ListConstituents } from './list-constituents';

export interface DlgDeleteCstProps {
  schema: RSForm;
  selected: number[];
  onDelete: (deleted: number[]) => void;
}

export function DlgDeleteCst() {
  const tx = useTx();
  const { selected, schema, onDelete } = useDialogsStore(state => state.props as DlgDeleteCstProps);

  const [expandOut, setExpandOut] = useState(false);
  const expansion: number[] = schema.graph.expandAllOutputs(selected);
  const hasInherited = selected.some(
    id => schema.inheritance.find(item => item.parent === id),
    [selected, schema.inheritance]
  );

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const deleted = expandOut ? selected.concat(expansion) : selected;
    onDelete(deleted);
  }

  return (
    <ModalForm
      header={tx('ui.rsform.dlg.deleteCst.header', 'Delete constituents')}
      submitText={
        expandOut
          ? tx('ui.rsform.dlg.deleteCst.submitWithDeps', 'Delete with dependents')
          : tx('ui.rsform.dlg.deleteCst.submit', 'Delete')
      }
      onSubmit={handleSubmit}
      className='cc-column max-w-[60vw] min-w-120 px-6'
    >
      <ListConstituents
        title={tx('ui.rsform.dlg.deleteCst.selectedTitle', 'Marked for deletion')}
        list={selected}
        schema={schema}
        prefix={prefixes.cst_delete_list}
      />
      <ListConstituents
        title={tx('ui.rsform.dlg.deleteCst.dependentsTitle', 'Dependent constituents')}
        list={expansion}
        schema={schema}
        prefix={prefixes.cst_dependant_list}
      />
      <Checkbox
        label={tx('ui.rsform.dlg.deleteCst.expandDepsLabel', 'Delete dependent constituents')}
        className='mb-2'
        value={expandOut}
        onChange={value => setExpandOut(value)}
      />
      {hasInherited ? (
        <p className='text-sm clr-text-red'>
          {tx('ui.rsform.dlg.deleteCst.inheritedWarn', 'Warning: constituents have heirs in the OSS')}
        </p>
      ) : null}
    </ModalForm>
  );
}
