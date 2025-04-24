'use client';

import {
  IconAnimation,
  IconAnimationOff,
  IconCoordinates,
  IconGrid,
  IconLineStraight,
  IconLineWave
} from '@/components/icons';
import { Checkbox } from '@/components/input';
import { ModalView } from '@/components/modal';

import { useOSSGraphStore } from '../stores/oss-graph';

const ICON_SIZE = '1.5rem';

export function DlgOssSettings() {
  const showGrid = useOSSGraphStore(state => state.showGrid);
  const showCoordinates = useOSSGraphStore(state => state.showCoordinates);
  const edgeAnimate = useOSSGraphStore(state => state.edgeAnimate);
  const edgeStraight = useOSSGraphStore(state => state.edgeStraight);
  const toggleShowGrid = useOSSGraphStore(state => state.toggleShowGrid);
  const toggleShowCoordinates = useOSSGraphStore(state => state.toggleShowCoordinates);
  const toggleEdgeAnimate = useOSSGraphStore(state => state.toggleEdgeAnimate);
  const toggleEdgeStraight = useOSSGraphStore(state => state.toggleEdgeStraight);

  return (
    <ModalView header='Настройки отображения' className='cc-column justify-between px-6 pb-3 w-100'>
      <Checkbox
        value={showCoordinates}
        onChange={toggleShowCoordinates}
        aria-label='Переключатель отображения координат'
        label={`Координаты узлов: ${showCoordinates ? 'Вкл' : 'Выкл'}`}
        customIcon={checked => <IconCoordinates size={ICON_SIZE} className={checked ? 'icon-green' : 'icon-primary'} />}
      />
      <Checkbox
        value={showGrid}
        onChange={toggleShowGrid}
        aria-label='Переключатель отображения сетки'
        label={`Отображение сетки: ${showGrid ? 'Вкл' : 'Выкл'}`}
        customIcon={checked => <IconGrid size={ICON_SIZE} className={checked ? 'icon-green' : 'icon-primary'} />}
      />
      <Checkbox
        value={edgeAnimate}
        onChange={toggleEdgeAnimate}
        aria-label='Переключатель анимации связей'
        label={`Анимация связей: ${edgeAnimate ? 'Вкл' : 'Выкл'}`}
        customIcon={checked =>
          checked ? (
            <IconAnimation size={ICON_SIZE} className='icon-primary' />
          ) : (
            <IconAnimationOff size={ICON_SIZE} className='icon-primary' />
          )
        }
      />
      <Checkbox
        value={edgeStraight}
        onChange={toggleEdgeStraight}
        aria-label='Переключатель формы связей'
        label={`Связи: ${edgeStraight ? 'Прямые' : 'Безье'}`}
        customIcon={checked =>
          checked ? (
            <IconLineStraight size={ICON_SIZE} className='icon-primary' />
          ) : (
            <IconLineWave size={ICON_SIZE} className='icon-primary' />
          )
        }
      />
    </ModalView>
  );
}
