'use client';

import clsx from 'clsx';

import { type AccessPolicy, type LibraryItem } from '@/domain/library';
import { useTx } from '@/i18n';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { useRoleStore, UserRole } from '@/features/users';

import { MiniButton } from '@/components/control';
import { IconImmutable, IconMutable } from '@/components/icons';
import { Label } from '@/components/input';

import { useMutatingLibrary } from '../backend/use-mutating-library';
import { useSetAccessPolicy } from '../backend/use-set-access-policy';

import { IconItemVisibility } from './icon-item-visibility';
import { SelectAccessPolicy } from './select-access-policy';

interface ToolbarItemAccessProps {
  visible: boolean;
  toggleVisible: () => void;
  readOnly: boolean;
  toggleReadOnly: () => void;
  schema: LibraryItem;
  isProduced: boolean;
  className?: string;
}

export function ToolbarItemAccess({
  className,
  visible,
  toggleVisible,
  readOnly,
  toggleReadOnly,
  schema,
  isProduced
}: ToolbarItemAccessProps) {
  const tx = useTx();
  const role = useRoleStore(state => state.role);
  const isProcessing = useMutatingLibrary();
  const policy = schema.access_policy;
  const { setAccessPolicy } = useSetAccessPolicy();

  function handleSetAccessPolicy(newPolicy: AccessPolicy) {
    void setAccessPolicy({ itemID: schema.id, policy: newPolicy });
  }

  return (
    <div className={clsx('w-46 flex items-center h-8 select-none', className)}>
      <Label text={tx('tx.lib.access')} />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy
          value={policy}
          onChange={handleSetAccessPolicy}
          disabled={role <= UserRole.EDITOR || isProcessing || isProduced}
        />

        <MiniButton
          title={visible ? tx('tx.lib.item.visibility.on') : tx('tx.lib.item.visibility.off')}
          aria-label={tx('tx.lib.item.visibility.hint')}
          icon={<IconItemVisibility value={visible} />}
          onClick={toggleVisible}
          disabled={role === UserRole.READER || isProcessing}
        />

        <MiniButton
          title={readOnly ? tx('ui.library.toolbar.editForbiddenTitle') : tx('ui.library.toolbar.editAllowedTitle')}
          aria-label={tx('ui.library.toolbar.editModeToggleAria')}
          icon={
            readOnly ? (
              <IconImmutable size='1.25rem' className='text-primary' />
            ) : (
              <IconMutable size='1.25rem' className='text-constructive' />
            )
          }
          onClick={toggleReadOnly}
          disabled={role === UserRole.READER || isProcessing}
        />
        <BadgeHelp topic={HelpTopic.ACCESS} offset={4} />
      </div>
    </div>
  );
}
