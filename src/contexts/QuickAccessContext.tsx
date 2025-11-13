import React, { createContext, useContext, useState, ReactNode } from 'react';

type QuickAccessType = 
  | 'cliente' 
  | 'veiculo' 
  | 'usuario' 
  | 'mecanico' 
  | 'marca' 
  | 'peca' 
  | 'servico' 
  | 'orcamento' 
  | 'os' 
  | 'relatorio'
  | null;

interface QuickAccessContextType {
  activeDialog: QuickAccessType;
  openDialog: (type: QuickAccessType) => void;
  closeDialog: () => void;
}

const QuickAccessContext = createContext<QuickAccessContextType | undefined>(undefined);

export const QuickAccessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeDialog, setActiveDialog] = useState<QuickAccessType>(null);

  const openDialog = (type: QuickAccessType) => {
    setActiveDialog(type);
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  return (
    <QuickAccessContext.Provider value={{ activeDialog, openDialog, closeDialog }}>
      {children}
    </QuickAccessContext.Provider>
  );
};

export const useQuickAccess = () => {
  const context = useContext(QuickAccessContext);
  if (!context) {
    throw new Error('useQuickAccess must be used within a QuickAccessProvider');
  }
  return context;
};
