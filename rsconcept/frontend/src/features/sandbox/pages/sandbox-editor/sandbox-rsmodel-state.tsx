'use client';

import { useEffect, useMemo, useState } from 'react';

import { type RSForm } from '@/features/rsform';
import { RSEngine, type RSEngineServices } from '@/features/rsmodel/models/rsengine';
import { RSModelContext } from '@/features/rsmodel/pages/rsmodel-page/rsmodel-context';

import { notImplemented } from '@/utils/utils';

import { offlineApplySetCstValue, offlineClearModelValues } from '../../backend/sandbox-mutations';
import { type SandboxBundle } from '../../models/bundle';

interface SandboxRSModelStateProps {
  schema: RSForm;
  bundle: SandboxBundle;
  setBundle: React.Dispatch<React.SetStateAction<SandboxBundle | null>>;
}

export function SandboxRSModelState({
  schema,
  bundle,
  setBundle,
  children
}: React.PropsWithChildren<SandboxRSModelStateProps>) {
  const services = useMemo<RSEngineServices>(function createServices() {
    return {
      setCstValue: function setCstValue({ data }: Parameters<RSEngineServices['setCstValue']>[0]) {
        const next = offlineApplySetCstValue(bundle, data);
        setBundle(next);
        return Promise.resolve();
      },
      clearValues: function clearValues({ data }: Parameters<RSEngineServices['clearValues']>[0]) {
        const next = offlineClearModelValues(bundle, data.items);
        setBundle(next);
        return Promise.resolve();
      }
    };
  }, [bundle, setBundle]);

  const [engine] = useState(function createEngine() {
    return new RSEngine(bundle.model.id, services);
  });

  useEffect(function syncEngineModelID() {
    // Sandbox imports can swap in a bundle with a different model id.
    // Keep the engine aligned with that id without affecting shared UI state.
    // eslint-disable-next-line react-hooks/immutability
    engine.modelID = bundle.model.id;
    engine.updateServices(services);
  }, [bundle.model.id, engine, services]);

  useEffect(function syncEngineData() {
    engine.loadData(schema, bundle.model);
  }, [bundle, engine, schema]);

  return (
    <RSModelContext
      value={{
        model: bundle.model,
        schema,
        isMutable: false,
        isOwned: false,
        engine,
        deleteModel: notImplemented
      }}
    >
      {children}
    </RSModelContext>
  );
}
