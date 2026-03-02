'use no memo'; // TODO: remove when react hook forms are compliant with react compiler
'use client';

import { useEffect, useEffectEvent, useLayoutEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type Constituenta } from '@/features/rsform';
import { labelType } from '@/features/rslang/labels';

import { SubmitButton } from '@/components/control';
import { IconChild, IconPredecessor, IconSave } from '@/components/icons';
import { TextArea } from '@/components/input';
import { Indicator } from '@/components/view';
import { useModificationStore } from '@/stores/modification';

import { type ConstituentaDataDTO, schemaConstituentaData } from '../../../backend/types';
import { useMutatingRSModel } from '../../../backend/use-mutating-rsmodel';
import { useSetValue } from '../../../backend/use-set-value';
import { type RSModel } from '../../../models/rsmodel';

interface FormValueProps {
  id?: string;
  disabled: boolean;
  toggleReset: boolean;

  activeCst: Constituenta;
  model: RSModel;
}

export function FormValue({ disabled, id, model, toggleReset, activeCst }: FormValueProps) {
  const isModified = useModificationStore(state => state.isModified);
  const setIsModified = useModificationStore(state => state.setIsModified);
  const onModifiedEvent = useEffectEvent(setIsModified);
  const isProcessing = useMutatingRSModel();

  const { setCstValue } = useSetValue();

  const {
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<ConstituentaDataDTO>({
    resolver: zodResolver(schemaConstituentaData),
    defaultValues: {
      target: activeCst.id,
      type: '',
      data: undefined
    }
  });

  useLayoutEffect(() => onModifiedEvent(false), [activeCst.id]);

  useEffect(() => {
    reset({
      target: activeCst.id,
      type: '',
      data: undefined
    });
  }, [
    activeCst.id,
    model,
    reset
  ]);

  useEffect(() => {
    onModifiedEvent(isDirty);
  }, [isDirty]);

  function onSubmit(data: ConstituentaDataDTO) {
    void setCstValue({ itemID: model.id, data }).then(() => {
      setIsModified(false);
      reset({ ...data });
    });
  }

  return (
    <form
      id={id}
      className='relative cc-column mt-1 px-6 pb-1 pt-8'
      onSubmit={event => void handleSubmit(onSubmit)(event)}
    >
      <div className='ml-2 text-sm font-medium whitespace-nowrap select-text cursor-default'>
        {activeCst?.alias ?? ''}
      </div>
      <TextArea
        id='cst_typification'
        fitContent
        dense
        noResize
        noBorder
        noOutline
        transparent
        readOnly
        label='Типизация'
        value={labelType(activeCst.analysis.type)}
        className='cursor-default'
      />

      {!disabled || isProcessing ? (
        <div className='relative mx-auto flex'>
          <SubmitButton
            text='Сохранить изменения'
            icon={<IconSave size='1.25rem' />}
            disabled={disabled || !isModified}
          />
          <div className='absolute z-pop top-1/2 -translate-y-1/2 left-full cc-icons'>
            {activeCst.has_inherited_children && !activeCst.is_inherited ? (
              <Indicator
                icon={<IconPredecessor size='1.25rem' className='text-primary' />}
                titleHtml='Внимание!</br> Конституента имеет потомков<br/> в операционной схеме синтеза'
              />
            ) : null}
            {activeCst.is_inherited ? (
              <Indicator
                icon={<IconChild size='1.25rem' className='text-primary' />}
                titleHtml='Внимание!</br> Конституента является наследником<br/>'
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}
