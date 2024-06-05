import {IRSForm, IRSFormData} from "@/models/rsform.ts";
import {DataCallback, postSynthesis} from "@/app/backendAPI.ts";
import {ISynthesisData} from "@/models/synthesis.ts";
import {createContext, useCallback, useContext, useState} from "react";
import {useLibrary} from "@/context/LibraryContext.tsx";
import {useAuth} from "@/context/AuthContext.tsx";
import useRSFormDetails from "@/hooks/useRSFormDetails.ts";
import DlgSynthesis from "@/dialogs/DlgSynthesis.tsx";

interface ISynthesisContext {
    synthesisSchemaID: string;
    singleSynthesis: (data: ISynthesisData, callback?: DataCallback<IRSFormData>) => void;
    showSynthesis: () => void;

}

const SynthesisContext = createContext<ISynthesisContext | null>(null);

interface SynthesisStateProps {
    synthesisSchemaID: string;
    children: React.ReactNode;
}

export const useSynthesis = () => {
    const context = useContext(SynthesisContext);
    if (context === null) {
        throw new Error('useSynthesis has to be used within <SynthesisState.Provider>');
    }
    return context;
}

export const SynthesisState = ({synthesisSchemaID, children}: SynthesisStateProps) => {
    const [showSynthesisModal, setShowSynthesisModal] = useState(false)

    const singleSynthesis = useCallback(
        (data: ISynthesisData, callback?: DataCallback<IRSFormData>) => {
            postSynthesis({
                data: data,
                onSuccess: newData => {
                }
            });
        },

        []
    );


    return (
        <SynthesisContext.Provider value={{
            synthesisSchemaID: synthesisSchemaID,
            singleSynthesis: singleSynthesis,
            showSynthesis: () => setShowSynthesisModal(true),
        }}>
            {showSynthesisModal ? (< DlgSynthesis
                hideWindow={() => setShowSynthesisModal(false)}
                schemaLeftID={55}
                schemaRightID={56}
                onSynthesis={() => singleSynthesis}/>) : null}
            {children}
        </SynthesisContext.Provider>
    )
};