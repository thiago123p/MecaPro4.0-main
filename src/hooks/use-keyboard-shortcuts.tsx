import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuickAccess } from '@/contexts/QuickAccessContext';
import { toast } from 'sonner';

export const useKeyboardShortcuts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openDialog } = useQuickAccess();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Não executar se estiver em um campo de input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Não executar na tela de login
      if (location.pathname === '/') {
        return;
      }

      // Shift + V = Veículo
      if (event.shiftKey && !event.ctrlKey && event.key === 'V') {
        event.preventDefault();
        openDialog('veiculo');
      }
      // Shift + C = Cliente
      else if (event.shiftKey && !event.ctrlKey && event.key === 'C') {
        event.preventDefault();
        openDialog('cliente');
      }
      // Shift + U = Usuário
      else if (event.shiftKey && !event.ctrlKey && event.key === 'U') {
        event.preventDefault();
        openDialog('usuario');
      }
      // Shift + M = Mecânico (sem Ctrl)
      else if (event.shiftKey && !event.ctrlKey && event.key === 'M') {
        event.preventDefault();
        openDialog('mecanico');
      }
      // Shift + Ctrl + M = Marca
      else if (event.shiftKey && event.ctrlKey && event.key === 'M') {
        event.preventDefault();
        openDialog('marca');
      }
      // Shift + R = Relatório
      else if (event.shiftKey && !event.ctrlKey && event.key === 'R') {
        event.preventDefault();
        openDialog('relatorio');
      }
      // Shift + O = Orçamento (sem Ctrl)
      else if (event.shiftKey && !event.ctrlKey && event.key === 'O') {
        event.preventDefault();
        openDialog('orcamento');
      }
      // Shift + Ctrl + O = OS
      else if (event.shiftKey && event.ctrlKey && event.key === 'O') {
        event.preventDefault();
        openDialog('os');
      }
      // Shift + S = Serviços
      else if (event.shiftKey && !event.ctrlKey && event.key === 'S') {
        event.preventDefault();
        openDialog('servico');
      }
      // Shift + P = Peças
      else if (event.shiftKey && !event.ctrlKey && event.key === 'P') {
        event.preventDefault();
        openDialog('peca');
      }
      // End = Voltar para Dashboard ou Sair
      else if (event.key === 'End') {
        event.preventDefault();
        
        // Se estiver no Dashboard, faz logout
        if (location.pathname === '/dashboard') {
          localStorage.removeItem('userType');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          toast.success('Logout realizado com sucesso!');
          navigate('/');
        } 
        // Se estiver em qualquer outra tela, volta para o Dashboard
        else {
          navigate('/dashboard');
          toast.info('Retornando ao Dashboard');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location.pathname, openDialog, navigate]);
};
