import { type CutoutPanelRects } from '../utils/interact-cutout';

interface TourInteractOverlayProps {
  /** Four blocking panels around the unlocked interaction region. */
  panels: CutoutPanelRects;
}

const PANEL_KEYS = ['top', 'left', 'right', 'bottom'] as const;

/** Blocks pointer events outside the interact cutout while leaving the hole operable. */
export function TourInteractOverlay({ panels }: TourInteractOverlayProps) {
  return (
    <>
      {PANEL_KEYS.map(key => {
        const panel = panels[key];
        if (panel.width <= 0 || panel.height <= 0) {
          return null;
        }
        return (
          <div
            key={key}
            data-testid={`tour-interact-panel-${key}`}
            className='fixed z-0 bg-[rgb(0_0_0/45%)] pointer-events-auto'
            style={{
              top: panel.top,
              left: panel.left,
              width: panel.width,
              height: panel.height
            }}
          />
        );
      })}
    </>
  );
}
