'use client';

import clsx from 'clsx';

import { useTx } from '@/i18n';
import { type AccessPolicy, type LibraryItem } from '@rsconcept/domain/library';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { UserRole } from '@/features/users';
import { useRoleStore } from '@/features/users/stores/role';

import { MiniButton } from '@/components/control';
import { IconImmutable, IconMutable } from '@/components/icons';
import { Label } from '@/components/input';

import { useMutatingLibrary } from '../backend/use-mutating-library';
import { useSetAccessPolicy } from '../backend/use-set-access-policy';
import { useSetReadOnly } from '../backend/use-set-read-only';
import { useSetVisible } from '../backend/use-set-visible';

import { IconItemVisibility } from './icon-item-visibility';
import { SelectAccessPolicy } from './select-access-policy';

interface ToolbarItemAccessProps {
  schema: LibraryItem;
  isProduced: boolean;
  /** Block access-flag edits while the passport form has unsaved edits. */
  formDirty?: boolean;
  className?: string;
}

export function ToolbarItemAccess({ className, schema, isProduced, formDirty = false }: ToolbarItemAccessProps) {
  const tx = useTx();
  const role = useRoleStore(state => state.role);
  const isProcessing = useMutatingLibrary();
  const policy = schema.access_policy;
  const { setAccessPolicy } = useSetAccessPolicy();
  const { setReadOnly } = useSetReadOnly();
  const { setVisible } = useSetVisible();
  const ownerOnly = role <= UserRole.EDITOR || isProcessing || isProduced;
  const disabled = ownerOnly || formDirty;
  const dirtyHint = formDirty ? tx('tx.general.changes.unsaved.hint') : undefined;

  function handleSetAccessPolicy(newPolicy: AccessPolicy) {
    void setAccessPolicy({ itemID: schema.id, policy: newPolicy });
  }

  function handleToggleVisible() {
    void setVisible({ itemID: schema.id, visible: !schema.visible });
  }

  function handleToggleReadOnly() {
    void setReadOnly({ itemID: schema.id, readOnly: !schema.read_only });
  }

  return (
    <div className={clsx('w-46 flex items-center h-8 select-none', className)} data-tour='passport-access'>
      <Label text={tx('tx.lib.access')} />
      <div className='ml-auto cc-icons'>
        <SelectAccessPolicy value={policy} onChange={handleSetAccessPolicy} disabled={disabled} title={dirtyHint} />

        <MiniButton
          title={dirtyHint ?? (schema.visible ? tx('tx.lib.item.visibility.on') : tx('tx.lib.item.visibility.off'))}
          aria-label={tx('tx.lib.item.visibility.hint')}
          icon={<IconItemVisibility value={schema.visible} />}
          onClick={handleToggleVisible}
          disabled={disabled}
        />

        <MiniButton
          title={dirtyHint ?? (schema.read_only ? tx('tx.lib.readOnly.on') : tx('tx.lib.readOnly.off'))}
          aria-label={tx('tx.lib.readOnly.toggle')}
          icon={
            schema.read_only ? (
              <IconImmutable size='1.25rem' className='text-primary' />
            ) : (
              <IconMutable size='1.25rem' className='text-constructive' />
            )
          }
          onClick={handleToggleReadOnly}
          disabled={disabled}
        />
        <BadgeHelp topic={HelpTopic.ACCESS} offset={4} />
      </div>
    </div>
  );
}
