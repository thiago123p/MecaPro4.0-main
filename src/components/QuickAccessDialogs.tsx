import { useQuickAccess } from "@/contexts/QuickAccessContext";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const QuickAccessDialogs = () => {
  const { activeDialog, closeDialog } = useQuickAccess();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (activeDialog) {
      // Mapear o tipo de diálogo para a rota correspondente
      const routeMap: Record<string, string> = {
        'cliente': '/cliente',
        'veiculo': '/veiculo',
        'usuario': '/usuario',
        'mecanico': '/mecanico',
        'marca': '/marca',
        'peca': '/pecas',
        'servico': '/servicos',
        'orcamento': '/orcamento',
        'os': '/os',
        'relatorio': '/relatorio',
      };

      const targetRoute = routeMap[activeDialog];
      
      // Se não estiver na rota correta, navegar para ela
      if (targetRoute && location.pathname !== targetRoute) {
        navigate(targetRoute);
      }

      // Disparar evento customizado para abrir o diálogo
      const event = new CustomEvent('quick-access-open', { 
        detail: { type: activeDialog } 
      });
      window.dispatchEvent(event);

      // Limpar após disparar o evento
      setTimeout(() => closeDialog(), 100);
    }
  }, [activeDialog, navigate, location.pathname, closeDialog]);

  return null;
};
