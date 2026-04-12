import { createContext, use } from 'react';

import { type UpdateLibraryItemDTO } from '@/features/library';
import { type RSForm } from '@/features/rsform';
import {
  type AttributionTargetDTO,
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type MoveConstituentsDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO,
  type UpdateCrucialDTO
} from '@/features/rsform/backend/types';
import { type Attribution, type Substitution } from '@/features/rsform/models/rsform';
import { type RSEngine, type RSModelDTO } from '@/features/rsmodel';

import { type RO } from '@/utils/meta';

import { type SandboxBundle } from '../models/bundle';

interface IBundleContext {
  bundle: SandboxBundle;
  schema: RSForm;
  model: RSModelDTO;
  engine: RSEngine;
  resetBundle: () => void;
  importBundle: (raw: unknown) => Promise<void>;
  exportBundle: () => void;

  updateLibraryItem: (data: UpdateLibraryItemDTO) => void;

  moveConstituents: (data: MoveConstituentsDTO) => void;
  updateCrucial: (data: UpdateCrucialDTO) => void;
  patchConstituenta: (data: UpdateConstituentaDTO) => Promise<RO<RSFormDTO>>;
  createConstituenta: (data: CreateConstituentaDTO) => Promise<RO<ConstituentaCreatedResponse>>;
  createAttribution: (attr: Attribution) => void;
  deleteAttribution: (attr: Attribution) => void;
  clearAttributions: (data: AttributionTargetDTO) => void;
  deleteConstituents: (deleted: number[]) => void;
  restoreOrder: () => void;
  resetAliases: () => void;
  substituteConstituents: (substitutions: Substitution[]) => void;
}

export const BundleContext = createContext<IBundleContext | null>(null);

export function useSandboxBundle(): IBundleContext {
  const context = use(BundleContext);
  if (context === null) {
    throw new Error('useSandboxBundle has to be used within <BundleContext>');
  }
  return context;
}
