import { createContext, useContext, useState } from "react";

type ScreenContext = {
    currentPage: string;
    context: {
        // products:{},
        // shopList:{},
        // productDetail:{},
        // carts:{},
        // category:{},
    };
}

type UIContextType = {
    screen: ScreenContext | null;
    setScreen: (s: ScreenContext) => void;
};

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [screen, setScreen] = useState<ScreenContext | null>(null);

    return (
        <UIContext.Provider value={{ screen, setScreen }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUIContext = () => {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error("useUIContext must be used inside UIProvider");
    return ctx;
};