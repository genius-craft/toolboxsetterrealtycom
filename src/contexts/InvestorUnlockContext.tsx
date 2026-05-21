import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface Ctx {
  unlocked: boolean;
  setUnlocked: (v: boolean) => void;
}

const InvestorUnlockContext = createContext<Ctx>({ unlocked: false, setUnlocked: () => {} });

const KEY = "setter:investor-unlocked";

export function InvestorUnlockProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlockedState] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") setUnlockedState(true);
    } catch {}
  }, []);

  const setUnlocked = (v: boolean) => {
    setUnlockedState(v);
    try {
      if (v) sessionStorage.setItem(KEY, "1");
      else sessionStorage.removeItem(KEY);
    } catch {}
  };

  return (
    <InvestorUnlockContext.Provider value={{ unlocked, setUnlocked }}>
      {children}
    </InvestorUnlockContext.Provider>
  );
}

export const useInvestorUnlock = () => useContext(InvestorUnlockContext);
