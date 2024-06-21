//import {useConceptTheme} from '@/context/ThemeContext';
/*import {useCallback, useState} from "react";
import {GraphNode} from "@/models/Graph.ts";
import {list} from "postcss";*/
import Overlay from '@/components/ui/Overlay';
import Button from '@/components/ui/Button';
import {MdCallMerge} from "react-icons/md";
import {IoMdAdd, IoMdRemove} from 'react-icons/io';
import {BsDownload, BsUpload} from 'react-icons/bs';
//import {AiOutlineClose} from 'react-icons/ai';
import {useCallback, useState} from 'react';
//import PropTypes from "prop-types";
//import {useConceptNavigation} from "@/context/NavigationContext.tsx";
import DlgSynthesis from "@/dialogs/DlgOssGraph/DlgSynthesis.tsx";
import SynthesisFlow from "@/components/ui/Synthesis/SynthesisFlow.tsx";
import {IRSFormData} from "@/models/rsform.ts";
import {toast} from "react-toastify";
import {useRSForm} from "@/context/RSFormContext.tsx";
import {DataCallback, runSingleSynthesis} from "@/app/backendAPI.ts";
import {ISynthesisData} from "@/models/synthesis.ts";
import useRSFormDetails from "@/hooks/useRSFormDetails.ts";
import {useLibrary} from "@/context/LibraryContext.tsx";
import {SynthesisState, useSynthesis} from "@/pages/OssPage/SynthesisContext.tsx";
import SynthesisToolbar from "@/pages/OssPage/SynthesisToolbar.tsx";
import {useParams} from "react-router-dom";

export const SynthesisPage = () => {
    //const router = useConceptNavigation();
    //const [sampleData, setSampleData] = useState([[1, 2, 3], [4, 5, 6]])

}

export default SynthesisPage;


//onCancel={setShowSynthesisModal(false)}
/*
const modalContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
};

const modalCloseButtonStyle: React.CSSProperties = {
    outline: 'none',
    cursor: 'pointer',
    background: 'transparent',
    color: '#C62828',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};


const SynthesisPage = () => {

};
*/

/*

const SynthesisGraphBody = () => {
    const [synthesisGraphs, setSynthesisGraphs] = useState([]);

    return (synthesisGraphs &&
        <div>
            asd
        </div>
    )
}

function SynthesisGraph({
                            nodes,
                            edges,
                            onSelect,
                            onEdit
                        }) {
    const handleNodeClick = useCallback(
        (node: GraphNode) => {

        }, [onSelect, onEdit]
    )

    const createNewNode = () => {

    }

    const createNewEdge = () => {

    };
}
*/
/*export class SynthesisNode {
    private id: number;
    private edges: list[number]

    constructor(id) {
        this.id = id
    }
}*/

/*const SynthesisModal = ({title, isOpen, onCancel, onSubmit}) => {
    return (showSynthesisModal ?
            <div style={modalContainerStyle}>
                <div style={modalContentStyle}>
                    <Button
                        style={modalCloseButtonStyle}
                        title='Отмена'
                        icon={<AiOutlineClose/>}
                        onClick={onCancel}


                    />

                    <SynthesisTable/>
                    <Button
                        title='Синтез'
                        icon={<MdCallMerge/>}
                        onClick={onSubmit}
                    />

                </div>
            </div>
    )
}
SynthesisModal.propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func
}

SynthesisModal.deafaultProps = {
    title: "Синтез",
    isOpen: false,
    onCancel: () => {
    },
    onSubmit: () => {
    }
}

const SynthesisTable = () => {
    return (
        <tbody>

        </tbody>
    )

}
 */


