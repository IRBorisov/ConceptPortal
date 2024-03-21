'use client';

import { useState } from 'react';
import { LuLocate, LuLocateOff, LuPower, LuPowerOff, LuReplace } from 'react-icons/lu';

import { ErrorData } from '@/components/info/InfoError';
import ConstituentaSelector from '@/components/select/ConstituentaSelector';
import Button from '@/components/ui/Button';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import DataLoader from '@/components/wrap/DataLoader';
import { ConstituentaID, IConstituenta, IRSForm, ISubstitution } from '@/models/rsform';
import { prefixes } from '@/utils/constants';

import SubstitutionsTable from './SubstitutionsTable';

interface SubstitutionsTabProps {
  receiver?: IRSForm;
  source?: IRSForm;
  selected: ConstituentaID[];

  loading?: boolean;
  error?: ErrorData;

  substitutions: ISubstitution[];
  setSubstitutions: React.Dispatch<React.SetStateAction<ISubstitution[]>>;
}

function SubstitutionsTab({
  source,
  receiver,
  selected,

  error,
  loading,

  substitutions,
  setSubstitutions
}: SubstitutionsTabProps) {
  const [leftCst, setLeftCst] = useState<IConstituenta | undefined>(undefined);
  const [rightCst, setRightCst] = useState<IConstituenta | undefined>(undefined);
  const [deleteRight, setDeleteRight] = useState(false);
  const [takeLeftTerm, setTakeLeftTerm] = useState(false);

  const toggleDelete = () => setDeleteRight(prev => !prev);
  const toggleTerm = () => setTakeLeftTerm(prev => !prev);

  function addSubstitution() {
    if (!leftCst || !rightCst) {
      return;
    }
    const newSubstitution: ISubstitution = {
      leftCst: leftCst,
      rightCst: rightCst,
      deleteRight: deleteRight,
      takeLeftTerm: takeLeftTerm
    };
    setSubstitutions([
      newSubstitution,
      ...substitutions.filter(
        item =>
          (!item.deleteRight && item.leftCst.id !== leftCst.id) ||
          (item.deleteRight && item.rightCst.id !== rightCst.id)
      )
    ]);
  }

  return (
    <DataLoader id='dlg-substitutions-tab' className='cc-column' isLoading={loading} error={error} hasNoData={!source}>
      <div className='flex items-end justify-between'>
        <div>
          <Overlay className='flex select-none'>
            <MiniButton
              title='Сохранить конституенту'
              noHover
              onClick={toggleDelete}
              icon={
                deleteRight ? (
                  <LuPower size='1rem' className='clr-text-green' />
                ) : (
                  <LuPowerOff size='1rem' className='clr-text-red' />
                )
              }
            />
            <MiniButton
              title='Сохранить термин'
              noHover
              onClick={toggleTerm}
              icon={
                takeLeftTerm ? (
                  <LuLocate size='1rem' className='clr-text-green' />
                ) : (
                  <LuLocateOff size='1rem' className='clr-text-red' />
                )
              }
            />
          </Overlay>
          <Label text='Импортируемая схема' />
          <ConstituentaSelector
            className='w-[15rem] mt-1'
            items={source?.items.filter(cst => selected.includes(cst.id))}
            value={leftCst}
            onSelectValue={setLeftCst}
          />
        </div>

        <Button
          title='Добавить в таблицу отождествлений'
          className='h-[2.4rem] w-[5rem]'
          icon={<LuReplace size='1.25rem' className='icon-primary' />}
          disabled={!leftCst || !rightCst}
          onClick={addSubstitution}
        />

        <div>
          <Overlay className='flex select-none'>
            <MiniButton
              title='Сохранить конституенту'
              noHover
              onClick={toggleDelete}
              icon={
                !deleteRight ? (
                  <LuPower size='1rem' className='clr-text-green' />
                ) : (
                  <LuPowerOff size='1rem' className='clr-text-red' />
                )
              }
            />
            <MiniButton
              title='Сохранить термин'
              noHover
              onClick={toggleTerm}
              icon={
                !takeLeftTerm ? (
                  <LuLocate size='1rem' className='clr-text-green' />
                ) : (
                  <LuLocateOff size='1rem' className='clr-text-red' />
                )
              }
            />
          </Overlay>
          <Label text='Текущая схема' />
          <ConstituentaSelector
            className='w-[15rem] mt-1'
            items={receiver?.items}
            value={rightCst}
            onSelectValue={setRightCst}
          />
        </div>
      </div>

      <h2>Таблица отождествлений</h2>

      <SubstitutionsTable
        items={substitutions}
        setItems={setSubstitutions}
        rows={10}
        prefixID={prefixes.cst_inline_synth_substitutes}
      />
    </DataLoader>
  );
}

export default SubstitutionsTab;
