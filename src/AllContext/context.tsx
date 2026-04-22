import { useState, useContext, createContext, ReactNode, useEffect } from "react";

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
  const [darkLight, setDarkLight] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('darkLight');
    return savedTheme !== null ? JSON.parse(savedTheme) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkLight', JSON.stringify(darkLight));
  }, [darkLight]);

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



// const SidebarContext = createContext<any>(null);
// export const useSidebar = () => useContext(SidebarContext);

// export const SidebarProvider = ({ children }: ContextProviderProps) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [sidebarVisible, setSidebarVisible] = useState(true);
//   return (
//     <SidebarContext.Provider value={{ menuOpen, setMenuOpen, sidebarVisible, setSidebarVisible }}>
//       {children}
//     </SidebarContext.Provider>
//   );
// };

const SidebarContext = createContext<any>(null);
export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: ContextProviderProps) => {
  const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ sidebarVisible, setSidebarVisible }}>
      {children}
    </SidebarContext.Provider>
  );
};