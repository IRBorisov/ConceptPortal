'use client';

import { createPortal } from 'react-dom';

/** Renders modal UI at document root so layout `inert` does not block interaction. */
export function ModalPortal({ children }: React.PropsWithChildren) {
  return createPortal(children, document.body);
}
