import { useState, useContext, createContext, ReactNode } from "react";

type ContextProviderProps = {
  children: ReactNode;
};

const GlobalContext = createContext<any>(null);
export const useGlobalContext = () => useContext(GlobalContext); 

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [count, setCount] = useState(0);
  return (
    <GlobalContext.Provider value={{ count, setCount }}>
      {children}
    </GlobalContext.Provider>
  );
};

const GlobleContextHeart = createContext<any>(null);
export const useGlobleContextHeart = () => useContext(GlobleContextHeart);


export const ContextProviderHeart = ({ children }: ContextProviderProps) => {
  const [countHeart, setCountHeart] = useState(0);
  return (
    <GlobleContextHeart.Provider value={{ countHeart, setCountHeart }}>
      {children}
    </GlobleContextHeart.Provider>
  );
};

const GlobleContextDarklight = createContext<any>(null);
export const useGlobleContextDarklight = () => useContext(GlobleContextDarklight);

export const ContextProviderDarklight = ({ children }: ContextProviderProps) => {
  const [darkLight, setDarkLight] = useState(false);
  return (
    <GlobleContextDarklight.Provider value={{ darkLight, setDarkLight }}>
      {children}
    </GlobleContextDarklight.Provider>
  );
};


const RefreshTableContext = createContext<any>(null);

export const useRefreshTable = () => useContext(RefreshTableContext);

export const RefreshTableProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshTables, setRefreshTables] = useState();

  return (
    <RefreshTableContext.Provider value={{ refreshTables, setRefreshTables }}>
      {children}
    </RefreshTableContext.Provider>
  );
};
