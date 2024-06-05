'use client';

import {useEffect, useMemo, useState} from 'react';
import {toast} from 'react-toastify';

import Checkbox from '@/components/ui/Checkbox';
import FileInput from '@/components/ui/FileInput';
import Modal, {ModalProps} from '@/components/ui/Modal';
import {useRSForm} from '@/context/RSFormContext';
import {IRSForm, IRSFormUploadData, ISubstitution} from '@/models/rsform';
import {EXTEOR_TRS_FILE} from '@/utils/constants';
import {TabList, TabPanel, Tabs} from "react-tabs";
import clsx from "clsx";
import TabLabel from "@/components/ui/TabLabel.tsx";
import SubstitutionsTab from "@/dialogs/DlgInlineSynthesis/SubstitutionsTab.tsx";
import useRSFormDetails from "@/hooks/useRSFormDetails.ts";
import {LibraryItemID} from "@/models/library.ts";
import {ISynthesisData} from "@/models/synthesis.ts";
import {TabID} from "@/dialogs/DlgInlineSynthesis/DlgInlineSynthesis.tsx";
import SynthesisSubstitutionsTab from "@/pages/SynthesisPage/SynthesisSubstitutionsTab.tsx";

interface DlgCreateSynthesisProps extends Pick<ModalProps, 'hideWindow'> {
    schemaLeftID: number;
    schemaRightID: number;
    onSynthesis: (data: ISynthesisData) => void;

}

export enum SynthesisTabID {
    SCHEMA = 0,
    SUBSTITUTIONS = 1
}

function DlgSynthesis({hideWindow, schemaLeftID, schemaRightID, onSynthesis}: DlgCreateSynthesisProps) {
    const [activeTab, setActiveTab] = useState(SynthesisTabID.SCHEMA);
    const sourceLeft = useRSFormDetails({target: schemaLeftID ? String(schemaLeftID) : undefined});
    const sourceRight = useRSFormDetails({target: schemaRightID ? String(schemaRightID) : undefined});
    const [selected, setSelected] = useState<LibraryItemID[]>([]);
    const [substitutions, setSubstitutions] = useState<ISubstitution[]>([]);

    //const validated = useMemo(() => !!source.schema && selected.length > 0, [source.schema, selected]);

    function handleSubmit() {
        if (!sourceLeft.schema || !sourceRight.schema) {
            return;
        }
        const data: ISynthesisData = {
            sourceLeft: schemaLeftID,
            sourceRight: schemaRightID,
            result: 1,
            substitutions: substitutions.map(item => ({
                original: item.deleteRight ? item.rightCst.id : item.leftCst.id,
                substitution: item.deleteRight ? item.leftCst.id : item.rightCst.id,
                transfer_term: !item.deleteRight && item.takeLeftTerm
            }))
        };
        onSynthesis(data);
    }

    useEffect(() => {
        setSelected(sourceLeft.schema && sourceRight.schema ? sourceLeft.schema?.items.map(cst => cst.id) : []);
    }, [sourceLeft.schema, sourceRight.schema]);

    const schemaPanel = useMemo(
        () => (
            <TabPanel></TabPanel>
        ), []
    )

    const substitutesPanel = useMemo(
        () => (
            <TabPanel>
                <SynthesisSubstitutionsTab
                    receiver={sourceLeft.schema}
                    source={sourceRight.schema}
                    substitutions={substitutions}
                    setSubstitutions={setSubstitutions}
                />
            </TabPanel>
        ),
        [sourceLeft.schema, sourceRight.schema, sourceLeft.loading, sourceRight.loading, selected, substitutions]
    );

    return (
        <Modal
            header='Синтез концептуальных скем'
            hideWindow={hideWindow}
            submitText='Запуск'
            className='w-[25rem] px-6'
            //canSubmit={validated}

            onSubmit={handleSubmit}

        >
            <Tabs
                selectedTabClassName='clr-selected'
                className='flex flex-col'
                selectedIndex={activeTab}
                onSelect={setActiveTab}
            >
                <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
                    <TabLabel label='Схема' title='Источник конституент' className='w-[8rem]'/>
                    <TabLabel label='Отождествления' title='Таблица отождествлений' className='w-[8rem]'/>
                </TabList>
                {schemaPanel}
                {substitutesPanel}
            </Tabs>

        </Modal>
    );
}

export default DlgSynthesis;
