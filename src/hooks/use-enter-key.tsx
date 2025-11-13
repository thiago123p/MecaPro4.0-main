import { useEffect, useCallback } from 'react';

interface UseEnterKeyOptions {
  onEnter: () => void;
  enabled?: boolean;
}

export const useEnterKey = ({ onEnter, enabled = true }: UseEnterKeyOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Verificar se é a tecla Enter
    if (event.key === 'Enter') {
      const target = event.target as HTMLElement;
      
      // Permitir Enter em textarea (para quebra de linha)
      if (target.tagName === 'TEXTAREA') {
        return;
      }

      // Se estiver em um input ou em outro elemento do formulário, acionar a ação
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.getAttribute('role') === 'combobox' ||
        target.closest('[role="dialog"]') // Dentro de um dialog
      ) {
        event.preventDefault();
        onEnter();
      }
    }
  }, [onEnter]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
};
