import { createContext, ReactNode, useContext, useState } from "react";


type AppContextType = {
    appState: IUserLogin | null,
    setAppState: (v: IUserLogin | null) => void
}
const ThemeContext = createContext<AppContextType | null>(null);

interface IProps {
    children: ReactNode
}
const AppProvider = (props: IProps) => {
    const [appState, setAppState] = useState<IUserLogin | null>(null);
    return (
        <ThemeContext.Provider value={{
            appState, setAppState,
        }}>
            {props.children}
        </ThemeContext.Provider>
    )
}
export default AppProvider;


//Custom hook
export const useCurrentApp = () => {
    const currentTheme = useContext(ThemeContext);
    if (!currentTheme) {
        throw new Error(
            "useCurrentApp has to be used within <AppContext.Provider>"
        );
    }
    return currentTheme;
}