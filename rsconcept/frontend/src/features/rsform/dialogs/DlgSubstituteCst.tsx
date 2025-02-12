'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Controller, useForm } from 'react-hook-form';

import { ErrorField } from '@/components/Input';
import { ModalForm } from '@/components/Modal';
import { HelpTopic } from '@/features/help';
import { useDialogsStore } from '@/stores/dialogs';

import { ICstSubstitutionsDTO, schemaCstSubstitutions } from '../backend/api';
import { useCstSubstitute } from '../backend/useCstSubstitute';
import PickSubstitutions from '../components/PickSubstitutions';
import { IRSForm } from '../models/rsform';

export interface DlgSubstituteCstProps {
  schema: IRSForm;
  onSubstitute: (data: ICstSubstitutionsDTO) => void;
}

function DlgSubstituteCst() {
  const { onSubstitute, schema } = useDialogsStore(state => state.props as DlgSubstituteCstProps);
  const { cstSubstitute } = useCstSubstitute();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid }
  } = useForm<ICstSubstitutionsDTO>({
    resolver: zodResolver(schemaCstSubstitutions),
    defaultValues: {
      substitutions: []
    },
    mode: 'onChange'
  });

  function onSubmit(data: ICstSubstitutionsDTO) {
    return cstSubstitute({ itemID: schema.id, data: data }).then(() => onSubstitute(data));
  }

  return (
    <ModalForm
      header='Отождествление'
      submitText='Отождествить'
      submitInvalidTooltip='Выберите две различные конституенты'
      canSubmit={isValid}
      onSubmit={event => void handleSubmit(onSubmit)(event)}
      className={clsx('w-[40rem]', 'px-6 pb-3')}
      helpTopic={HelpTopic.UI_SUBSTITUTIONS}
    >
      <Controller
        control={control}
        name='substitutions'
        render={({ field }) => (
          <PickSubstitutions
            allowSelfSubstitution
            value={field.value}
            onChange={field.onChange}
            rows={6}
            schemas={[schema]}
          />
        )}
      />
      <ErrorField className='mt-2' error={errors.substitutions} />
    </ModalForm>
  );
}

export default DlgSubstituteCst;
