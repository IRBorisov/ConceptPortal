'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import Checkbox from '@/components/ui/Checkbox.tsx';
import FileInput from '@/components/ui/FileInput.tsx';
import Modal, { ModalProps } from '@/components/ui/Modal.tsx';
import { useRSForm } from '@/context/RSFormContext.tsx';
import { IRSForm, IRSFormUploadData, ISubstitution } from '@/models/rsform.ts';
import { EXTEOR_TRS_FILE } from '@/utils/constants.ts';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import clsx from 'clsx';
import TabLabel from '@/components/ui/TabLabel.tsx';
import SubstitutionsTab from '@/dialogs/DlgInlineSynthesis/SubstitutionsTab.tsx';
import useRSFormDetails from '@/hooks/useRSFormDetails.ts';
import { LibraryItemID } from '@/models/library.ts';
import { ISynthesisData } from '@/models/synthesis.ts';
import { TabID } from '@/dialogs/DlgInlineSynthesis/DlgInlineSynthesis.tsx';
import SynthesisSubstitutionsTab from '@/pages/OssPage/SynthesisSubstitutionsTab.tsx';
import SchemaTab from '@/dialogs/DlgInlineSynthesis/SchemaTab.tsx';
import {
  Node
} from '@reactflow/core';
import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';

interface DlgCreateSynthesisProps extends Pick<ModalProps, 'hideWindow'> {
  nodeId: string;
}

export enum SynthesisTabID {
  SCHEMA = 0,
  SUBSTITUTIONS = 1
}

function DlgSelectInputScheme({ nodeId, hideWindow }: DlgCreateSynthesisProps) {
  const controller = useSynthesis();

  const [activeTab, setActiveTab] = useState(SynthesisTabID.SCHEMA);
  const [selected, setSelected] = useState<LibraryItemID[]>([]);
  const [substitutions, setSubstitutions] = useState<ISubstitution[]>([]);
  const [donorID, setDonorID] = useState<LibraryItemID | undefined>(undefined);


  const schemaPanel = useMemo(
    () => (
      <TabPanel>
        <SchemaTab selected={donorID} setSelected={setDonorID} />
      </TabPanel>
    ),
    [donorID]
  );

  function handleSubmit() {
    if (donorID !== undefined) {
      controller.updateBounds(nodeId, donorID);
    }
  }

  function validate() {
    if (donorID === undefined) {
      toast.error('Выберите источник конституент');
      return false;
    }
    return true;
  }

  return (
    <Modal
      header="Синтез концептуальных скем"
      hideWindow={hideWindow}
      submitText="Привязать"
      className="w-[25rem] px-6"
      canSubmit={validate()}

      onSubmit={handleSubmit}
    >
      <Tabs
        selectedTabClassName="clr-selected"
        className="flex flex-col"
        selectedIndex={activeTab}
        onSelect={setActiveTab}
      >
        <TabList className={clsx('mb-3 self-center', 'flex', 'border divide-x rounded-none')}>
          <TabLabel label="Схема" title="Источник конституент" className="w-[8rem]" />
        </TabList>
        {schemaPanel}
      </Tabs>
    </Modal>
  );
}

export default DlgSelectInputScheme;
