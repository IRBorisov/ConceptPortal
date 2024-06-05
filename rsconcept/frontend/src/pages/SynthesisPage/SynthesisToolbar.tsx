import {useSynthesis} from "@/pages/SynthesisPage/SynthesisContext.tsx";
import Button from "@/components/ui/Button.tsx";
import {IoMdAdd, IoMdRemove} from "react-icons/io";
import {MdCallMerge} from "react-icons/md";
import {BsDownload, BsUpload} from "react-icons/bs";
import Overlay from "@/components/ui/Overlay.tsx";


function SynthesisToolbar() {
    const controller = useSynthesis()

    return (
        <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
            <Button
                title='Добавить форму'
                icon={<IoMdAdd/>}
            />
            <Button
                title={'Удалить форму'}
                icon={<IoMdRemove/>}
            />
            <Button
                icon={<MdCallMerge/>}
                title='Синтез'
                onClick={() => controller.showSynthesis()}
            />
            <Button
                icon={<BsDownload/>}
                title='Импорт формы'
            />
            <Button
                title='Экспорт формы'
                icon={<BsUpload/>}
            />
        </Overlay>
    )
}

export default SynthesisToolbar;