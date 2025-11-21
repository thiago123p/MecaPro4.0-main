import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, Printer, Search, Power } from "lucide-react";
import { toast } from "sonner";
import { osService } from "@/controllers/osService";
import { pecaService } from "@/controllers/pecaService";
import { servicoService } from "@/controllers/servicoService";
import { veiculoService } from "@/controllers/veiculoService";
import { mecanicoService } from "@/controllers/mecanicoService";
import { orcamentoService } from "@/controllers/orcamentoService";
import { clienteService } from "@/controllers/clienteService";
import { Peca, Servico, Veiculo, Mecanico } from "@/models/types";
import { OSPrintTemplate } from "@/components/OSPrintTemplate";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEnterKey } from "@/hooks/use-enter-key";
import { useAddShortcut } from "@/hooks/use-add-shortcut";

interface OSItem {
  tipo: "peca" | "servico";
  id: string;
  descricao: string;
  valor: number;
  quantidade: number;
}

export default function OS() {
  const [ordens, setOrdens] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [showPagamentoDialog, setShowPagamentoDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedOS, setSelectedOS] = useState<any>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  
  const [selectedVeiculo, setSelectedVeiculo] = useState("");
  const [selectedMecanico, setSelectedMecanico] = useState("");
  const [selectedPeca, setSelectedPeca] = useState("");
  const [selectedServico, setSelectedServico] = useState("");
  const [selectedPagamento, setSelectedPagamento] = useState("");
  const [tipoCartao, setTipoCartao] = useState("");
  const [parcelasCartao, setParcelasCartao] = useState("");
  const [observacao, setObservacao] = useState("");
  const [items, setItems] = useState<OSItem[]>([]);
  const [descontoPecas, setDescontoPecas] = useState("0");
  const [descontoServicos, setDescontoServicos] = useState("0");
  const [valoresCalculados, setValoresCalculados] = useState({
    totalPecas: 0,
    totalServicos: 0,
    totalGeral: 0,
    descontoPecasValor: 0,
    descontoServicosValor: 0,
    totalComDesconto: 0
  });

  useEffect(() => {
    loadOrdens();
    loadOrcamentos();
    loadPecas();
    loadServicos();
    loadVeiculos();
    loadMecanicos();
  }, []);

  // Ouvir evento de quick access
  useEffect(() => {
    const handleQuickAccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.type === 'os') {
        setShowAddDialog(true);
      }
    };

    window.addEventListener('quick-access-open', handleQuickAccess);
    return () => window.removeEventListener('quick-access-open', handleQuickAccess);
  }, []);

  // Hook para o botão Enter nos dialogs
  const handleEnterKey = useCallback(() => {
    if (showAddDialog) {
      handleSave();
    } else if (showDeleteDialog) {
      handleDelete();
    }
  }, [showAddDialog, showDeleteDialog]);

  useEnterKey({
    onEnter: handleEnterKey,
    enabled: showAddDialog || showDeleteDialog,
  });

  // Hook para Ctrl + (+) abrir diálogo de cadastro
  useAddShortcut(() => {
    setShowAddDialog(true);
  });

  // Debug: monitorar mudanças na observação
  useEffect(() => {
    console.log("Estado da observação mudou:", observacao);
  }, [observacao]);

  const loadOrdens = async () => {
    try {
      const data = await osService.getAll(100); // Carrega até 100 OS
      setOrdens(data);
    } catch (error) {
      console.error("Erro ao carregar ordens de serviço:", error);
      toast.error("Erro ao carregar ordens de serviço");
    }
  };

  const loadOrcamentos = async () => {
    try {
      const data = await orcamentoService.getAll(100); // Carrega até 100 orçamentos
      setOrcamentos(data);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
      toast.error("Erro ao carregar orçamentos");
    }
  };

  const loadPecas = async () => {
    try {
      const data = await pecaService.getAllUnlimited();
      console.log("Peças carregadas:", data);
      setPecas(data);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
      toast.error("Erro ao carregar peças");
    }
  };

  const loadServicos = async () => {
    try {
      const data = await servicoService.getAll();
      setServicos(data);
    } catch (error) {
      toast.error("Erro ao carregar serviços");
    }
  };

  const loadVeiculos = async () => {
    try {
      const data = await veiculoService.getAll();
      setVeiculos(data);
    } catch (error) {
      toast.error("Erro ao carregar veículos");
    }
  };

  const loadMecanicos = async () => {
    try {
      const data = await mecanicoService.getAll();
      setMecanicos(data);
    } catch (error) {
      toast.error("Erro ao carregar mecânicos");
    }
  };

  const handleAddPeca = () => {
    if (!selectedPeca) return;
    
    const peca = pecas.find(p => p.id_peca === selectedPeca);
    if (!peca) return;

    setItems([...items, {
      tipo: "peca",
      id: peca.id_peca,
      descricao: peca.descricao_peca,
      valor: Number(peca.preco_peca),
      quantidade: 1
    }]);
    setSelectedPeca("");
  };

  const handleAddServico = () => {
    if (!selectedServico) return;
    
    const servico = servicos.find(s => s.id_serv === selectedServico);
    if (!servico) return;

    setItems([...items, {
      tipo: "servico",
      id: servico.id_serv,
      descricao: servico.descricao_serv,
      valor: Number(servico.valor_final_serv || servico.valor_serv),
      quantidade: 1
    }]);
    setSelectedServico("");
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.valor * item.quantidade), 0);
  };

  const handleSave = async () => {
    if (!selectedVeiculo || !selectedMecanico || items.length === 0) {
      toast.error("Preencha todos os campos e adicione itens");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const osData: any = {
        id_veic: selectedVeiculo,
        id_mec: selectedMecanico,
        id_usu: userId || "",
        valor_total: calculateTotal()
      };
      
      if (observacao && observacao.trim() !== '') {
        osData.observacao = observacao;
      }
      
      const os = await osService.create(osData);

      for (const item of items) {
        if (item.tipo === "peca") {
          await osService.addPeca(os.id_os, item.id, item.quantidade);
        } else {
          await osService.addServico(os.id_os, item.id, item.quantidade);
        }
      }

      toast.success("OS criada com sucesso!");
      setShowAddDialog(false);
      resetForm();
      loadOrdens();
    } catch (error) {
      toast.error("Erro ao criar OS");
    }
  };

  const handleDelete = async () => {
    if (!selectedOS) return;

    try {
      await osService.delete(selectedOS.id_os);
      toast.success("OS excluída com sucesso!");
      setShowDeleteDialog(false);
      loadOrdens();
    } catch (error) {
      toast.error("Erro ao excluir OS");
    }
  };

  const handleFinalizar = async () => {
    if (!selectedPagamento) {
      toast.error("Selecione a forma de pagamento");
      return;
    }

    if (selectedPagamento === "cartao") {
      if (!tipoCartao) {
        toast.error("Selecione o tipo de cartão (Débito ou Crédito)");
        return;
      }
      if (tipoCartao === "credito" && !parcelasCartao) {
        toast.error("Selecione o número de parcelas");
        return;
      }
    }

    // Validar descontos
    const descPecas = parseFloat(descontoPecas) || 0;
    const descServicos = parseFloat(descontoServicos) || 0;

    if (descPecas < 0 || descPecas > 15) {
      toast.error("Desconto de peças deve estar entre 0% e 15%");
      return;
    }

    if (descServicos < 0 || descServicos > 15) {
      toast.error("Desconto de serviços deve estar entre 0% e 15%");
      return;
    }

    try {
      // Montar descrição completa do pagamento
      let formaPagamentoCompleta = selectedPagamento;
      if (selectedPagamento === "cartao") {
        formaPagamentoCompleta = `Cartão ${tipoCartao === "debito" ? "Débito" : "Crédito"}`;
        if (tipoCartao === "credito" && parcelasCartao) {
          formaPagamentoCompleta += ` - ${parcelasCartao}`;
        }
      }

      await osService.finalizar(selectedOS.id_os, formaPagamentoCompleta, descPecas, descServicos);
      setShowPagamentoDialog(false);
      setShowFinalizarDialog(false);
      setSelectedPagamento("");
      setTipoCartao("");
      setParcelasCartao("");
      setDescontoPecas("0");
      setDescontoServicos("0");
      loadOrdens();
      
      // Após encerrar, abrir preview para impressão
      toast.success("OS encerrada com sucesso!");
      
      // Recarregar a OS encerrada e abrir preview
      const osEncerrada = await osService.getById(selectedOS.id_os);
      setSelectedOS(osEncerrada);
      await handleOpenPreview(osEncerrada);
    } catch (error) {
      toast.error("Erro ao finalizar OS");
    }
  };

  const calcularValoresComDesconto = async () => {
    if (!selectedOS) return { totalPecas: 0, totalServicos: 0, totalGeral: 0, descontoPecasValor: 0, descontoServicosValor: 0, totalComDesconto: 0 };

    const descPecas = parseFloat(descontoPecas) || 0;
    const descServicos = parseFloat(descontoServicos) || 0;

    try {
      // Buscar peças e serviços da OS
      const pecasOS = await osService.getPecas(selectedOS.id_os);
      const servicosOS = await osService.getServicos(selectedOS.id_os);

      // Calcular total de peças
      let totalPecas = 0;
      pecasOS.forEach((item: any) => {
        totalPecas += item.quantidade * item.preco_peca;
      });

      // Calcular total de serviços
      let totalServicos = 0;
      servicosOS.forEach((item: any) => {
        totalServicos += item.quantidade * item.valor_final_serv;
      });

      const descontoPecasValor = (totalPecas * descPecas) / 100;
      const descontoServicosValor = (totalServicos * descServicos) / 100;
      const totalComDesconto = (totalPecas + totalServicos) - descontoPecasValor - descontoServicosValor;

      return {
        totalPecas,
        totalServicos,
        totalGeral: totalPecas + totalServicos,
        descontoPecasValor,
        descontoServicosValor,
        totalComDesconto
      };
    } catch (error) {
      // Em caso de erro, usar o valor total da OS
      const valorTotal = Number(selectedOS.valor_total || 0);
      const totalPecas = valorTotal * 0.6;
      const totalServicos = valorTotal * 0.4;
      const descontoPecasValor = (totalPecas * descPecas) / 100;
      const descontoServicosValor = (totalServicos * descServicos) / 100;
      const totalComDesconto = valorTotal - descontoPecasValor - descontoServicosValor;

      return {
        totalPecas,
        totalServicos,
        totalGeral: valorTotal,
        descontoPecasValor,
        descontoServicosValor,
        totalComDesconto
      };
    }
  };

  const handleOpenPreview = async (os?: any) => {
    const osToPreview = os || selectedOS;
    if (!osToPreview) return;

    try {
      // Buscar dados completos da OS
      const osCompleta = await osService.getById(osToPreview.id_os);
      const pecasOS = await osService.getPecas(osToPreview.id_os);
      const servicosOS = await osService.getServicos(osToPreview.id_os);

      // Buscar dados do veículo e cliente
      const veiculo = veiculos.find((v) => v.id_veic === osCompleta.id_veic);
      const mecanico = mecanicos.find((m) => m.id_mec === osCompleta.id_mec);
      
      let cliente = null;
      if (veiculo?.id_cli) {
        cliente = await clienteService.getById(veiculo.id_cli);
      }

      // Buscar o veículo completo com marca se não tiver
      let veiculoCompleto = veiculo;
      if (veiculo && !veiculo.nome_marca) {
        veiculoCompleto = await veiculoService.getById(veiculo.id_veic);
      }

      // Preparar itens
      const allItems = [
        ...pecasOS.map((p: any) => ({
          tipo: "peca",
          id: p.id_peca,
          descricao: p.descricao_peca,
          valor: Number(p.preco_peca || 0),
          quantidade: Number(p.quantidade || 1),
        })),
        ...servicosOS.map((s: any) => ({
          tipo: "servico",
          id: s.id_serv,
          descricao: s.descricao_serv,
          valor: Number(s.valor_serv || 0),
          quantidade: Number(s.quantidade || 1),
        })),
      ];

      // Definir dados de impressão
      setPrintData({
        os: osCompleta,
        items: allItems,
        veiculo: veiculoCompleto,
        cliente,
        mecanico,
      });

      setShowPrintDialog(false);
      setShowPreviewDialog(true);
    } catch (error) {
      console.error("Erro ao carregar preview:", error);
      toast.error("Erro ao carregar preview da OS");
    }
  };

  const handlePrint = () => {
    window.print();
    setShowPrintDialog(false);
  };

  const handleGeneratePDF = async () => {
    if (!printData) return;

    try {
      setIsGeneratingPDF(true);
      toast.info("Gerando PDF...");

      // Criar elemento temporário para renderizar
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      document.body.appendChild(tempDiv);

      // Renderizar template no elemento temporário
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(tempDiv);
      
      await new Promise<void>((resolve) => {
        root.render(
          <OSPrintTemplate
            os={printData.os}
            items={printData.items}
            veiculo={printData.veiculo}
            cliente={printData.cliente}
            mecanico={printData.mecanico}
            showAllPages={printData.os.status !== "encerrada"}
          />
        );
        setTimeout(() => resolve(), 500);
      });

      const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: 1123, // A4 height in pixels at 96 DPI
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`OS_${printData.os.numero_os}.pdf`);
      
      // Limpar
      root.unmount();
      document.body.removeChild(tempDiv);
      
      toast.success("PDF gerado com sucesso!");
      setShowPreviewDialog(false);
      setPrintData(null);
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
      setIsGeneratingPDF(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      loadOrdens();
      return;
    }
    const filtered = ordens.filter(os =>
      os.numero_os?.toString().includes(searchTerm) ||
      os.placa_veic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.nome_cli?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setOrdens(filtered);
  };

  const resetForm = () => {
    setSelectedVeiculo("");
    setSelectedMecanico("");
    setSelectedPeca("");
    setSelectedServico("");
    setObservacao("");
    setItems([]);
  };

  const handleEdit = async (os: any) => {
    try {
      console.log("Iniciando edição da OS:", os.id_os);
      setSelectedOS(os);
      
      // Carregar dados da OS
      console.log("Buscando OS completa...");
      const osCompleta = await osService.getById(os.id_os);
      console.log("OS carregada:", osCompleta);
      console.log("Observação retornada do backend:", osCompleta.observacao);
      
      // Preencher formulário
      setSelectedVeiculo(osCompleta.id_veic);
      setSelectedMecanico(osCompleta.id_mec);
      setObservacao(osCompleta.observacao || "");
      console.log("Observação setada no estado:", osCompleta.observacao || "");
      
      // Carregar peças e serviços
      console.log("Buscando peças...");
      const pecasOS = await osService.getPecas(os.id_os);
      console.log("Peças encontradas:", pecasOS.length);
      
      console.log("Buscando serviços...");
      const servicosOS = await osService.getServicos(os.id_os);
      console.log("Serviços encontrados:", servicosOS.length);
      
      const newItems: OSItem[] = [];
      
      // Adicionar peças
      pecasOS.forEach((p: any) => {
        console.log("Adicionando peça:", p);
        newItems.push({
          tipo: "peca",
          id: p.id_peca,
          descricao: p.descricao_peca || "Peça sem descrição",
          valor: Number(p.preco_peca || 0),
          quantidade: Number(p.quantidade || 1)
        });
      });
      
      // Adicionar serviços
      servicosOS.forEach((s: any) => {
        console.log("Adicionando serviço:", s);
        newItems.push({
          tipo: "servico",
          id: s.id_serv,
          descricao: s.descricao_serv || "Serviço sem descrição",
          valor: Number(s.valor_serv || 0),
          quantidade: Number(s.quantidade || 1)
        });
      });
      
      console.log("Total de itens carregados:", newItems.length);
      setItems(newItems);
      
      // Aguardar um tick para garantir que o estado foi atualizado
      setTimeout(() => {
        console.log("Abrindo diálogo de edição com observação:", osCompleta.observacao);
        setShowEditDialog(true);
      }, 100);
      
    } catch (error: any) {
      console.error("Erro detalhado ao carregar OS:", error);
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
      toast.error("Erro ao carregar dados da OS: " + (error.message || "Erro desconhecido"));
    }
  };

  const handleUpdate = async () => {
    if (!selectedOS || !selectedVeiculo || !selectedMecanico || items.length === 0) {
      toast.error("Preencha todos os campos e adicione itens");
      return;
    }

    try {
      // Atualizar dados básicos da OS
      const updateData: any = {
        id_veic: selectedVeiculo,
        id_mec: selectedMecanico,
        valor_total: calculateTotal()
      };
      
      if (observacao && observacao.trim() !== '') {
        updateData.observacao = observacao;
      }
      
      await osService.update(selectedOS.id_os, updateData);

      // Remover todas as peças e serviços antigos
      try {
        const pecasAntigas = await osService.getPecas(selectedOS.id_os);
        for (const peca of pecasAntigas) {
          try {
            await osService.removePeca(selectedOS.id_os, peca.id_peca);
          } catch (err) {
            console.warn("Erro ao remover peça:", err);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar peças antigas:", err);
      }
      
      try {
        const servicosAntigos = await osService.getServicos(selectedOS.id_os);
        for (const servico of servicosAntigos) {
          try {
            await osService.removeServico(selectedOS.id_os, servico.id_serv);
          } catch (err) {
            console.warn("Erro ao remover serviço:", err);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar serviços antigos:", err);
      }

      // Adicionar novos itens
      for (const item of items) {
        if (item.tipo === "peca") {
          await osService.addPeca(selectedOS.id_os, item.id, item.quantidade);
        } else {
          await osService.addServico(selectedOS.id_os, item.id, item.quantidade);
        }
      }

      toast.success("OS atualizada com sucesso!");
      setShowEditDialog(false);
      resetForm();
      setSelectedOS(null);
      loadOrdens();
    } catch (error) {
      console.error("Erro ao atualizar OS:", error);
      toast.error("Erro ao atualizar OS");
    }
  };

  const handleImportOrcamento = async (orcamentoId: string) => {
    try {
      const orcamento = await orcamentoService.getById(orcamentoId);
      if (!orcamento) {
        toast.error("Orçamento não encontrado");
        return;
      }

      // Carregar peças e serviços do orçamento
      const pecasOrc = await orcamentoService.getPecas(orcamentoId);
      const servicosOrc = await orcamentoService.getServicos(orcamentoId);

      // Preencher formulário com o veículo do orçamento
      setSelectedVeiculo(orcamento.id_veic);
      
      // Adicionar itens (peças e serviços) do orçamento
      const newItems: OSItem[] = [];
      
      // Adicionar peças (dados vêm flat do backend)
      pecasOrc.forEach((p: any) => {
        newItems.push({
          tipo: "peca",
          id: p.id_peca,
          descricao: p.descricao_peca || "Peça sem descrição",
          valor: Number(p.preco_peca || 0),
          quantidade: p.quantidade || 1
        });
      });

      // Adicionar serviços (dados vêm flat do backend)
      servicosOrc.forEach((s: any) => {
        newItems.push({
          tipo: "servico",
          id: s.id_serv,
          descricao: s.descricao_serv || "Serviço sem descrição",
          valor: Number(s.valor_final_serv || s.valor_serv || 0),
          quantidade: s.quantidade || 1
        });
      });

      setItems(newItems);
      
      // Fechar diálogo de importação e abrir diálogo de nova OS com dados preenchidos
      setShowImportDialog(false);
      setShowAddDialog(true);
      
      toast.success(`Orçamento #${orcamento.numero_orc} importado com sucesso!`);
    } catch (error) {
      console.error("Erro ao importar orçamento:", error);
      toast.error("Erro ao importar orçamento");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end items-center gap-2 mb-6">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Importar Orçamento
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova OS
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Mecânico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordens.map((os) => (
                  <TableRow key={os.id_os}>
                    <TableCell>{os.numero_os}</TableCell>
                    <TableCell>
                      {os.descricao_veic} - {os.placa_veic}
                    </TableCell>
                    <TableCell>{os.nome_cli}</TableCell>
                    <TableCell>{os.nome_mec}</TableCell>
                    <TableCell>{os.status}</TableCell>
                    <TableCell>R$ {Number(os.valor_total).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(os)}
                        disabled={os.status !== "aberta"}
                        title={os.status !== "aberta" ? "Não é possível editar OS encerrada" : "Editar OS"}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOS(os);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOS(os);
                          setShowPrintDialog(true);
                        }}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      {os.status === "aberta" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOS(os);
                            setShowFinalizarDialog(true);
                          }}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Ordem de Serviço</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Veículo</label>
                    <Select value={selectedVeiculo} onValueChange={setSelectedVeiculo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {veiculos.map((v) => (
                          <SelectItem key={v.id_veic} value={v.id_veic}>
                            {v.descricao_veic} - {v.placa_veic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Mecânico</label>
                    <Select value={selectedMecanico} onValueChange={setSelectedMecanico}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mecânico" />
                      </SelectTrigger>
                      <SelectContent>
                        {mecanicos.map((m) => (
                          <SelectItem key={m.id_mec} value={m.id_mec}>
                            {m.nome_mec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Adicionar Peça</label>
                    <div className="flex gap-2">
                      <Combobox
                        options={pecas.map(p => {
                          const estoqueZerado = (p.quantidade_estoque || 0) <= 0;
                          const prefix = estoqueZerado ? "* " : "";
                          console.log(`Peça ${p.descricao_peca}: quantidade_estoque =`, p.quantidade_estoque, "estoqueZerado =", estoqueZerado);
                          return {
                            value: p.id_peca,
                            label: `${prefix}${p.descricao_peca} - R$ ${Number(p.preco_peca).toFixed(2)}${estoqueZerado ? ' (SEM ESTOQUE)' : ''}`
                          };
                        })}
                        value={selectedPeca}
                        onValueChange={setSelectedPeca}
                        placeholder="Pesquisar peça..."
                        searchPlaceholder="Digite para pesquisar..."
                        emptyText="Nenhuma peça encontrada."
                        className="flex-1"
                      />
                      <Button onClick={handleAddPeca}>Adicionar</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Adicionar Serviço</label>
                    <div className="flex gap-2">
                      <Combobox
                        options={servicos.map(s => ({
                          value: s.id_serv,
                          label: `${s.descricao_serv} - R$ ${Number(s.valor_final_serv || s.valor_serv).toFixed(2)}`
                        }))}
                        value={selectedServico}
                        onValueChange={setSelectedServico}
                        placeholder="Pesquisar serviço..."
                        searchPlaceholder="Digite para pesquisar..."
                        emptyText="Nenhum serviço encontrado."
                        className="flex-1"
                      />
                      <Button onClick={handleAddServico}>Adicionar</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea
                    placeholder="Digite aqui observações sobre a ordem de serviço..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Itens da OS</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.tipo === "peca" ? "Peça" : "Serviço"}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={item.quantidade}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].quantidade = parseFloat(e.target.value) || 1;
                                setItems(newItems);
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>R$ {item.valor.toFixed(2)}</TableCell>
                          <TableCell>R$ {(item.valor * item.quantidade).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setItems(items.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right text-lg font-bold">
                    Valor Total: R$ {calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>Fechar</Button>
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleSave}>Gerar OS</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog} key={selectedOS?.id_os}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Ordem de Serviço #{selectedOS?.numero_os}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Veículo</label>
                    <Select value={selectedVeiculo} onValueChange={setSelectedVeiculo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o veículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {veiculos.map((v) => (
                          <SelectItem key={v.id_veic} value={v.id_veic}>
                            {v.descricao_veic} - {v.placa_veic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Mecânico</label>
                    <Select value={selectedMecanico} onValueChange={setSelectedMecanico}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mecânico" />
                      </SelectTrigger>
                      <SelectContent>
                        {mecanicos.map((m) => (
                          <SelectItem key={m.id_mec} value={m.id_mec}>
                            {m.nome_mec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Adicionar Peça</label>
                    <div className="flex gap-2">
                      <Combobox
                        options={pecas.map(p => {
                          const estoqueZerado = (p.quantidade_estoque || 0) <= 0;
                          const prefix = estoqueZerado ? "* " : "";
                          console.log(`[EDITAR] Peça ${p.descricao_peca}: quantidade_estoque =`, p.quantidade_estoque, "estoqueZerado =", estoqueZerado);
                          return {
                            value: p.id_peca,
                            label: `${prefix}${p.descricao_peca} - R$ ${Number(p.preco_peca).toFixed(2)}${estoqueZerado ? ' (SEM ESTOQUE)' : ''}`
                          };
                        })}
                        value={selectedPeca}
                        onValueChange={setSelectedPeca}
                        placeholder="Pesquisar peça..."
                        searchPlaceholder="Digite para pesquisar..."
                        emptyText="Nenhuma peça encontrada."
                        className="flex-1"
                      />
                      <Button onClick={handleAddPeca}>Adicionar</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Adicionar Serviço</label>
                    <div className="flex gap-2">
                      <Combobox
                        options={servicos.map(s => ({
                          value: s.id_serv,
                          label: `${s.descricao_serv} - R$ ${Number(s.valor_final_serv || s.valor_serv).toFixed(2)}`
                        }))}
                        value={selectedServico}
                        onValueChange={setSelectedServico}
                        placeholder="Pesquisar serviço..."
                        searchPlaceholder="Digite para pesquisar..."
                        emptyText="Nenhum serviço encontrado."
                        className="flex-1"
                      />
                      <Button onClick={handleAddServico}>Adicionar</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <Textarea
                    key={`edit-obs-${selectedOS?.id_os}`}
                    placeholder="Digite aqui observações sobre a ordem de serviço..."
                    defaultValue={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Itens da OS</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.tipo === "peca" ? "Peça" : "Serviço"}</TableCell>
                          <TableCell>{item.descricao}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={item.quantidade}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].quantidade = parseFloat(e.target.value) || 1;
                                setItems(newItems);
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>R$ {item.valor.toFixed(2)}</TableCell>
                          <TableCell>R$ {(item.valor * item.quantidade).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setItems(items.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right text-lg font-bold">
                    Valor Total: R$ {calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); setSelectedOS(null); }}>Fechar</Button>
                <Button variant="outline" onClick={resetForm}>Limpar</Button>
                <Button onClick={handleUpdate}>Atualizar OS</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta OS?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Não</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sim</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={showFinalizarDialog} onOpenChange={async (open) => {
            setShowFinalizarDialog(open);
            if (open) {
              // Calcular valores ao abrir
              const valores = await calcularValoresComDesconto();
              setValoresCalculados(valores);
            } else {
              setDescontoPecas("0");
              setDescontoServicos("0");
            }
          }}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Finalizar OS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg space-y-3">
                  <p className="text-lg font-semibold">
                    Valor Total: R$ {valoresCalculados.totalGeral.toFixed(2)}
                  </p>
                  
                  <div className="space-y-2 pt-2 border-t">
                    <label className="text-sm font-medium">Desconto em Peças (máx. 15%)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="15"
                        step="0.1"
                        value={descontoPecas}
                        onChange={async (e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (value >= 0 && value <= 15) {
                            setDescontoPecas(e.target.value);
                            // Recalcular valores
                            const valores = await calcularValoresComDesconto();
                            setValoresCalculados(valores);
                          }
                        }}
                        placeholder="0"
                        className="w-24"
                      />
                      <span className="text-sm">%</span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        - R$ {valoresCalculados.descontoPecasValor.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Desconto em Serviços (máx. 15%)</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="15"
                        step="0.1"
                        value={descontoServicos}
                        onChange={async (e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (value >= 0 && value <= 15) {
                            setDescontoServicos(e.target.value);
                            // Recalcular valores
                            const valores = await calcularValoresComDesconto();
                            setValoresCalculados(valores);
                          }
                        }}
                        placeholder="0"
                        className="w-24"
                      />
                      <span className="text-sm">%</span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        - R$ {valoresCalculados.descontoServicosValor.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {(parseFloat(descontoPecas) > 0 || parseFloat(descontoServicos) > 0) && (
                    <div className="pt-2 border-t">
                      <p className="text-xl font-bold text-green-600">
                        Valor Final: R$ {valoresCalculados.totalComDesconto.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Economia total: R$ {(valoresCalculados.descontoPecasValor + valoresCalculados.descontoServicosValor).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowFinalizarDialog(false)}>Cancelar</Button>
                <Button onClick={() => { setShowFinalizarDialog(false); setShowPagamentoDialog(true); }}>
                  Continuar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showPagamentoDialog} onOpenChange={setShowPagamentoDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Forma de Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pagamento</label>
                  <Select 
                    value={selectedPagamento} 
                    onValueChange={(value) => {
                      setSelectedPagamento(value);
                      setTipoCartao("");
                      setParcelasCartao("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPagamento === "cartao" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Cartão</label>
                    <Select 
                      value={tipoCartao} 
                      onValueChange={(value) => {
                        setTipoCartao(value);
                        setParcelasCartao("");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de cartão" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debito">Débito</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedPagamento === "cartao" && tipoCartao === "credito" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número de Parcelas</label>
                    <Select value={parcelasCartao} onValueChange={setParcelasCartao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione as parcelas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1x">1x sem juros</SelectItem>
                        <SelectItem value="2x">2x sem juros</SelectItem>
                        <SelectItem value="3x">3x sem juros</SelectItem>
                        <SelectItem value="4x">4x sem juros</SelectItem>
                        <SelectItem value="5x">5x sem juros</SelectItem>
                        <SelectItem value="6x">6x sem juros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowPagamentoDialog(false);
                  setSelectedPagamento("");
                  setTipoCartao("");
                  setParcelasCartao("");
                }}>Cancelar</Button>
                <Button onClick={handleFinalizar}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Imprimir OS #{selectedOS?.numero_os}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Número OS:</span>
                      <span>{selectedOS?.numero_os}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Veículo:</span>
                      <span>{selectedOS?.descricao_veic} - {selectedOS?.placa_veic}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Cliente:</span>
                      <span>{selectedOS?.nome_cli}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Mecânico:</span>
                      <span>{selectedOS?.nome_mec}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Status:</span>
                      <span className="capitalize">{selectedOS?.status}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Valor Total:</span>
                      <span>R$ {Number(selectedOS?.valor_total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrintDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleOpenPreview()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Visualizar Impressão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo de Preview com PDF */}
          <PDFPreviewDialog
            open={showPreviewDialog}
            onClose={() => {
              setShowPreviewDialog(false);
              setPrintData(null);
            }}
            onPrint={handleGeneratePDF}
            printData={printData}
            isGenerating={isGeneratingPDF}
          />

          {/* Template oculto para geração de PDF */}
          <div className="hidden">
            {printData && (
              <div ref={printRef}>
                <OSPrintTemplate
                  os={printData.os}
                  items={printData.items}
                  veiculo={printData.veiculo}
                  cliente={printData.cliente}
                  mecanico={printData.mecanico}
                  showAllPages={printData.os.status !== "encerrada"}
                />
              </div>
            )}
          </div>

          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Orçamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Selecione um orçamento para importar os dados para a OS
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentos.map((orc) => (
                      <TableRow key={orc.id_orc}>
                        <TableCell>{orc.numero_orc}</TableCell>
                        <TableCell>
                          {orc.descricao_veic} - {orc.placa_veic}
                        </TableCell>
                        <TableCell>{orc.nome_cli}</TableCell>
                        <TableCell>R$ {Number(orc.valor_total).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleImportOrcamento(orc.id_orc)}
                          >
                            Importar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
