import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';
import Button from '@/components/ui/Button.tsx';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';
import { MdCallMerge } from 'react-icons/md';
import Overlay from '@/components/ui/Overlay.tsx';
import { MdLibraryAdd } from 'react-icons/md';

import { VscRunAll, VscSave } from 'react-icons/vsc';

function SynthesisToolbar() {
  const controller = useSynthesis();

  return (
    <Overlay position="top-1 right-1/2 translate-x-1/2" className="flex">
      <Button
        title="Добавить схему из библиотеки"
        icon={<MdLibraryAdd />}
        onClick={() => controller.addLibrarySchema()}
      />

      <Button
        title="Добавить операцию слияния"
        icon={<MdCallMerge />}
        onClick={() => controller.addSynthesisOperation()}
      />
      <Button
        title={'Удалить форму'}
        icon={<IoMdRemove />}
        onClick={() => controller.removeItem()}
      />
      <Button
        icon={<VscRunAll />}
        title="Синтез"
        onClick={() =>{}}
      />
      <Button
        icon={<VscSave />}
        title="Сохранить"
        onClick={() => controller.saveGraph()}
      />
    </Overlay>
  );
}

export default SynthesisToolbar;