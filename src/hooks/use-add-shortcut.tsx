import { useEffect } from 'react';

/**
 * Hook para adicionar atalho Ctrl + (+) que abre o diálogo de cadastro na tela atual
 * @param onAdd - Função callback que será executada quando Ctrl + (+) for pressionado
 */
export const useAddShortcut = (onAdd: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verifica se é Ctrl + (+) ou Ctrl + (=) (no teclado sem numpad)
      if (event.ctrlKey && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        onAdd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAdd]);
};
