import { nowIso } from '@/utils/format';

import { type SandboxBundle } from './bundle';

export function cloneBundle(bundle: SandboxBundle): SandboxBundle {
  return structuredClone(bundle);
}

export function bumpBundle(bundle: SandboxBundle): void {
  const timestamp = nowIso();
  bundle.meta.updatedAt = timestamp;
  bundle.rsform.time_update = timestamp;
  bundle.model.time_update = timestamp;
}
