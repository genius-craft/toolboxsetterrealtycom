import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'toolbox.advancedMode';

let listeners: Array<(v: boolean) => void> = [];

function getStored(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Hook global (persistido em localStorage) que controla se a calculadora
 * exibe apenas os campos essenciais (false = Simples) ou todos (true = Avançado).
 *
 * Default: false (Simples) — onboarding mais leve para usuários novos.
 */
export function useAdvancedMode(): [boolean, (v: boolean) => void] {
  const [advanced, setAdvancedState] = useState<boolean>(getStored);

  useEffect(() => {
    const fn = (v: boolean) => setAdvancedState(v);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const setAdvanced = useCallback((v: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l(v));
  }, []);

  return [advanced, setAdvanced];
}
