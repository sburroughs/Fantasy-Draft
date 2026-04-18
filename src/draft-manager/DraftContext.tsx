import React, {createContext, useContext} from "react";
import {useDraft} from "./useDraft";

type DraftContextType = ReturnType<typeof useDraft>;

const DraftContext = createContext<DraftContextType | null>(null);

export function DraftProvider({children}: { children: React.ReactNode }) {
    const draft = useDraft();
    return (
        <DraftContext.Provider value={draft}>
            {children}
        </DraftContext.Provider>
    );
}

export function useDraftContext(): DraftContextType {
    const context = useContext(DraftContext);
    if (!context) throw new Error("useDraftContext must be used within a DraftProvider");
    return context;
}
