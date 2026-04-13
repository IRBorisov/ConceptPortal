'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { RSEngine, type RSEngineServices } from '@/domain/library/rsengine';
import { type Attribution, type Substitution } from '@/domain/library/rsform';

import { type UpdateLibraryItemDTO } from '@/features/library';
import { loadRSForm } from '@/features/rsform/backend/rsform-loader';
import {
  type AttributionTargetDTO,
  type ConstituentaCreatedResponse,
  type CreateConstituentaDTO,
  type MoveConstituentsDTO,
  type RSFormDTO,
  type UpdateConstituentaDTO,
  type UpdateCrucialDTO
} from '@/features/rsform/backend/types';

import { errorMsg, infoMsg } from '@/utils/labels';

import { type SandboxBundle } from '../models/bundle';
import { createStarterSandboxBundle } from '../models/bundle-starter';
import { sbApi } from '../stores/sandbox-mutations';
import { downloadBundle, ensureBundleLoaded, importBundleFromJson, saveBundle } from '../stores/sandbox-repository';

import { BundleContext } from './bundle-context';

type BundleUpdater = SandboxBundle | ((prev: SandboxBundle) => SandboxBundle);

let initialBundleValue: SandboxBundle | null = null;
let initialBundlePromise: Promise<SandboxBundle> | null = null;

export function SandboxState({ children }: React.PropsWithChildren) {
  const initialBundle = useInitialSandboxBundle();
  const [bundle, setBundleState] = useState(initialBundle);
  const model = bundle.model;
  const hasMountedRef = useRef(false);

  const commitBundle = useCallback(function commitBundle(next: BundleUpdater) {
    setBundleState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      syncBundleResource(resolved);
      return resolved;
    });
  }, []);

  const schema = loadRSForm(bundle.schema);
  const services = useMemo<RSEngineServices>(
    function createServices() {
      return {
        setCstValue: function setCstValue({ data }) {
          commitBundle(prev => sbApi.applySetCstValue(prev, data));
          return Promise.resolve();
        },
        clearValues: function clearValues({ data }) {
          commitBundle(prev => sbApi.clearModelValues(prev, data.items));
          return Promise.resolve();
        }
      };
    },
    [commitBundle]
  );

  const [engine] = useState(function createEngine() {
    return new RSEngine(model.id, services, {
      onInvalidSetValue: () => toast.error(errorMsg.invalidSetValue),
      onCalculationSuccess: timeSpent => toast.success(infoMsg.calculationSuccess(timeSpent)),
      onEvaluationError: message => toast.error(message)
    });
  });

  useEffect(
    function syncEngineModelID() {
      // Sandbox imports can replace the backing model id without recreating the editor runtime.
      // eslint-disable-next-line react-hooks/immutability
      engine.modelID = model.id;
      engine.updateServices(services);
      engine.updateNotifications({
        onInvalidSetValue: () => toast.error(errorMsg.invalidSetValue),
        onCalculationSuccess: timeSpent => toast.success(infoMsg.calculationSuccess(timeSpent)),
        onEvaluationError: message => toast.error(message)
      });
    },
    [model.id, engine, services]
  );

  useEffect(
    function syncEngineData() {
      engine.loadData(schema, model);
    },
    [model, engine, schema]
  );

  useEffect(
    function persistSandboxBundle() {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }

      let isActive = true;
      void saveBundle(bundle).catch(err => {
        if (!isActive) {
          return;
        }
        console.error(err);
        toast.error(errorMsg.failedToPersistSandbox);
      });

      return function cancelPersist() {
        isActive = false;
      };
    },
    [bundle]
  );

  async function importBundle(raw: unknown) {
    const next = await importBundleFromJson(raw);
    commitBundle(next);
  }

  function updateLibraryItem(data: UpdateLibraryItemDTO) {
    commitBundle(prev => sbApi.updateLibraryItem(prev, data));
  }

  function moveConstituents(data: MoveConstituentsDTO) {
    commitBundle(prev => sbApi.moveConstituents(prev, data));
  }

  function updateCrucial(data: UpdateCrucialDTO) {
    commitBundle(prev => sbApi.updateCrucial(prev, data));
  }

  function patchConstituenta(data: UpdateConstituentaDTO) {
    let nextSchema: RSFormDTO | null = null;
    commitBundle(prev => {
      const next = sbApi.updateConstituenta(prev, data);
      nextSchema = next.schema;
      return next;
    });
    if (!nextSchema) {
      throw new Error('Sandbox bundle is not available');
    }
    return Promise.resolve(nextSchema);
  }

  function createConstituenta(data: CreateConstituentaDTO) {
    let response: ConstituentaCreatedResponse | null = null;
    commitBundle(prev => {
      const result = sbApi.createConstituenta(prev, data);
      response = {
        new_cst: result.newCst,
        schema: result.bundle.schema
      };
      return result.bundle;
    });
    if (!response) {
      throw new Error('Sandbox bundle is not available');
    }
    return Promise.resolve(response);
  }

  function createAttribution(attr: Attribution) {
    commitBundle(prev => sbApi.createAttribution(prev, attr));
  }

  function deleteAttribution(attr: Attribution) {
    commitBundle(prev => sbApi.deleteAttribution(prev, attr));
  }

  function clearAttributions(data: AttributionTargetDTO) {
    commitBundle(prev => sbApi.clearAttributions(prev, data));
  }

  function deleteConstituents(deleted: number[]) {
    commitBundle(prev => sbApi.deleteConstituents(prev, deleted));
  }

  function restoreOrder() {
    commitBundle(prev => sbApi.restoreOrder(prev, schema));
  }

  function resetAliases() {
    commitBundle(prev => sbApi.resetAliases(prev));
  }

  function substituteConstituents(substitutions: Substitution[]) {
    commitBundle(prev => sbApi.substituteConstituents(prev, substitutions));
  }

  return (
    <BundleContext
      value={{
        bundle,
        schema,
        model,
        engine,
        resetBundle: function resetBundle() {
          commitBundle(createStarterSandboxBundle());
        },
        importBundle,
        exportBundle: () => downloadBundle(bundle),
        updateLibraryItem,

        moveConstituents,
        updateCrucial,
        patchConstituenta,
        createConstituenta,
        createAttribution,
        deleteAttribution,
        clearAttributions,
        deleteConstituents,
        restoreOrder,
        resetAliases,
        substituteConstituents
      }}
    >
      {children}
    </BundleContext>
  );
}

// ======= Internals =======

function useInitialSandboxBundle(): SandboxBundle {
  if (initialBundleValue !== null) {
    return initialBundleValue;
  }

  const bundle = use(getInitialBundlePromise());
  initialBundleValue = bundle;
  return bundle;
}

function getInitialBundlePromise(): Promise<SandboxBundle> {
  if (initialBundlePromise === null) {
    initialBundlePromise = ensureBundleLoaded().then(bundle => {
      initialBundleValue = bundle;
      return bundle;
    });
  }

  return initialBundlePromise;
}

function syncBundleResource(bundle: SandboxBundle) {
  initialBundleValue = bundle;
  initialBundlePromise = Promise.resolve(bundle);
}
