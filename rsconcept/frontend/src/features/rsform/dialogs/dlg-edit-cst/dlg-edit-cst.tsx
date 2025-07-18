import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { urls, useConceptNavigation } from '@/app';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';

import { MiniButton } from '@/components/control';
import { IconChild, IconRSForm } from '@/components/icons';
import { ModalForm } from '@/components/modal';
import { useDialogsStore } from '@/stores/dialogs';
import { errorMsg } from '@/utils/labels';

import { type IUpdateConstituentaDTO, schemaUpdateConstituenta } from '../../backend/types';
import { useUpdateConstituenta } from '../../backend/use-update-constituenta';
import { type IConstituenta, type IRSForm } from '../../models/rsform';
import { validateNewAlias } from '../../models/rsform-api';
import { RSTabID } from '../../pages/rsform-page/rsedit-context';

import { FormEditCst } from './form-edit-cst';

export interface DlgEditCstProps {
  schema: IRSForm;
  target: IConstituenta;
}

export function DlgEditCst() {
  const { schema, target } = useDialogsStore(state => state.props as DlgEditCstProps);
  const hideDialog = useDialogsStore(state => state.hideDialog);
  const { updateConstituenta } = useUpdateConstituenta();
  const router = useConceptNavigation();
  const { findPredecessor } = useFindPredecessor();

  const methods = useForm<IUpdateConstituentaDTO>({
    resolver: zodResolver(schemaUpdateConstituenta),
    defaultValues: {
      target: target.id,
      item_data: {
        alias: target.alias,
        cst_type: target.cst_type,
        convention: target.convention,
        definition_formal: target.definition_formal,
        definition_raw: target.definition_raw,
        term_raw: target.term_raw,
        term_forms: target.term_forms
      }
    }
  });

  const alias = useWatch({ control: methods.control, name: 'item_data.alias' })!;
  const cst_type = useWatch({ control: methods.control, name: 'item_data.cst_type' })!;
  const isValid = (alias === target.alias && cst_type == target.cst_type) || validateNewAlias(alias, cst_type, schema);

  function onSubmit(data: IUpdateConstituentaDTO) {
    return updateConstituenta({ itemID: schema.id, data });
  }

  function navigateToTarget() {
    hideDialog();
    router.push({
      path: urls.schema_props({
        id: schema.id,
        tab: RSTabID.CST_EDIT,
        active: target.id
      })
    });
  }

  function editSource() {
    hideDialog();
    void findPredecessor(target.id).then(reference =>
      router.push({
        path: urls.schema_props({
          id: reference.schema,
          active: reference.id,
          tab: RSTabID.CST_EDIT
        })
      })
    );
  }

  return (
    <ModalForm
      header='Редактирование конституенты'
      canSubmit={isValid}
      onSubmit={event => void methods.handleSubmit(onSubmit)(event)}
      submitInvalidTooltip={errorMsg.aliasInvalid}
      submitText='Сохранить'
      className='cc-column w-140 max-h-120 py-2 px-6'
    >
      <div className='cc-icons absolute z-pop left-2 top-2'>
        <MiniButton
          title='Редактировать в КС'
          noPadding
          icon={<IconRSForm size='1.25rem' className='text-primary' />}
          onClick={navigateToTarget}
        />
        <MiniButton
          title='Перейти к предку'
          noPadding
          icon={<IconChild size='1.25rem' className={target.is_inherited ? 'text-primary' : 'text-foreground-muted'} />}
          disabled={!target.is_inherited}
          onClick={editSource}
        />
      </div>

      <FormProvider {...methods}>
        <FormEditCst target={target} schema={schema} />
      </FormProvider>
    </ModalForm>
  );
}
