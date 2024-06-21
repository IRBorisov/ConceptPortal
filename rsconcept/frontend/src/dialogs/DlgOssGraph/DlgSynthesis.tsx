'use client';

import { useMemo, useState } from 'react';

import Modal, { ModalProps } from '@/components/ui/Modal.tsx';
import { TabList, TabPanel, Tabs } from 'react-tabs';
import clsx from 'clsx';
import TabLabel from '@/components/ui/TabLabel.tsx';
import useRSFormDetails from '@/hooks/useRSFormDetails.ts';
import SynthesisSubstitutionsTab from '@/pages/OssPage/SynthesisSubstitutionsTab.tsx';
import { useSynthesis } from '@/pages/OssPage/SynthesisContext.tsx';
import { ISynthesisSubstitution } from '@/models/oss.ts';

interface DlgCreateSynthesisProps extends Pick<ModalProps, 'hideWindow'> {
  nodeId: string;
  onSynthesis: (data: ISynthesisSubstitution[]) => void;
}

export enum SynthesisTabID {
  SCHEMA = 0,
  SUBSTITUTIONS = 1
}

function DlgSynthesis({ hideWindow, nodeId, onSynthesis }: DlgCreateSynthesisProps) {
  const controller = useSynthesis();

  const [activeTab, setActiveTab] = useState(SynthesisTabID.SCHEMA);
  const sourceLeft = useRSFormDetails({
    target: controller.getNodeParentsRsform(nodeId)[0] ?
      String(controller.getNodeParentsRsform(nodeId)[0]) : undefined
  });
  const sourceRight = useRSFormDetails({
    target: controller.getNodeParentsRsform(nodeId)[1] ?
      String(controller.getNodeParentsRsform(nodeId)[1]) : undefined
  });


  //const validated = useMemo(() => !!source.schema && selected.length > 0, [source.schema, selected]);
  function handleSubmit() {
    const parents = controller.getNodeParentsRsform(nodeId);

    if (parents.length != 2) {
      return;
    }
    const data: ISynthesisSubstitution[] = controller.substitutions.map((item) => ({
      id: null,
      operation_id: nodeId,
      leftCst: item.leftCst,
      rightCst: item.rightCst,
      deleteRight: item.deleteRight,
      takeLeftTerm: item.takeLeftTerm
    }));
    controller.setSubstitutions(data);
  }

  function validated() {
    const parents = controller.getNodeParentsRsform(nodeId);
    return parents.length == 2;
  }

  const schemaPanel = useMemo(
    () => (
      <TabPanel></TabPanel>
    ), []
  );

  const selectedSubstitutions = useMemo(
    () => controller.getSubstitution(nodeId),
    [controller, nodeId]
  );

  const setSelectedSubstitutions = (newElement: ISynthesisSubstitution[]) => {
    controller.updateSubstitution(nodeId, newElement, controller.setSubstitutions);
  };


  const substitutesPanel = useMemo(
    () => (
      <TabPanel>
        <SynthesisSubstitutionsTab
          receiver={sourceLeft.schema}
          source={sourceRight.schema}
          substitutions={selectedSubstitutions}
          setSubstitutions={setSelectedSubstitutions}
        />
      </TabPanel>
    ),
    [sourceLeft.schema, sourceRight.schema, controller]
  );

  return (
    <Modal
      header="Синтез концептуальных схем"
      hideWindow={hideWindow}
      submitText="Сохранить"
      className="w-[25rem] px-6"
      canSubmit={validated}

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
          <TabLabel label="Отождествления" title="Таблица отождествлений" className="w-[8rem]" />
        </TabList>
        {schemaPanel}
        {substitutesPanel}
      </Tabs>

    </Modal>
  );
}

export default DlgSynthesis;
