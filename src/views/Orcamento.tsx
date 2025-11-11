import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { orcamentoService } from "@/controllers/orcamentoService";
import { pecaService } from "@/controllers/pecaService";
import { servicoService } from "@/controllers/servicoService";
import { veiculoService } from "@/controllers/veiculoService";
import { clienteService } from "@/controllers/clienteService";
import { Peca, Servico, Veiculo } from "@/models/types";
import { OrcamentoPDFPreviewDialog } from "@/components/OrcamentoPDFPreviewDialog";
import { OrcamentoPrintTemplate } from "@/components/OrcamentoPrintTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface OrcamentoItem {
  tipo: "peca" | "servico";
  id: string;
  descricao: string;
  valor: number;
  quantidade: number;
}

export default function Orcamento() {
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintConfirmDialog, setShowPrintConfirmDialog] = useState(false);
  const [showPrintPreviewDialog, setShowPrintPreviewDialog] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<any>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  
  const [selectedVeiculo, setSelectedVeiculo] = useState("");
  const [selectedPeca, setSelectedPeca] = useState("");
  const [selectedServico, setSelectedServico] = useState("");
  const [observacao, setObservacao] = useState("");
  const [items, setItems] = useState<OrcamentoItem[]>([]);

  useEffect(() => {
    loadOrcamentos();
    loadPecas();
    loadServicos();
    loadVeiculos();
  }, []);

  const loadOrcamentos = async () => {
    try {
      const data = await orcamentoService.getAll();
      setOrcamentos(data);
    } catch (error) {
      toast.error("Erro ao carregar orçamentos");
    }
  };

  const loadPecas = async () => {
    try {
      const data = await pecaService.getAllUnlimited();
      console.log("[ORÇAMENTO] Peças carregadas:", data);
      setPecas(data);
    } catch (error) {
      console.error("[ORÇAMENTO] Erro ao carregar peças:", error);
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
    if (!selectedVeiculo || items.length === 0) {
      toast.error("Selecione um veículo e adicione itens");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const payload: any = {
        id_veic: selectedVeiculo,
        id_usu: userId || "",
        valor_total: calculateTotal(),
      };
      if (observacao) {
        payload.observacao = observacao;
      }
      const orcamento = await orcamentoService.create(payload);

      for (const item of items) {
        if (item.tipo === "peca") {
          await orcamentoService.addPeca(orcamento.id_orc, item.id, item.quantidade);
        } else {
          await orcamentoService.addServico(orcamento.id_orc, item.id, item.quantidade);
        }
      }

      toast.success("Orçamento criado com sucesso!");
      setShowAddDialog(false);
      resetForm();
      loadOrcamentos();
    } catch (error) {
      toast.error("Erro ao criar orçamento");
    }
  };

  const handleDelete = async () => {
    if (!selectedOrcamento) return;

    try {
      await orcamentoService.delete(selectedOrcamento.id_orc);
      toast.success("Orçamento excluído com sucesso!");
      setShowDeleteDialog(false);
      loadOrcamentos();
    } catch (error) {
      toast.error("Erro ao excluir orçamento");
    }
  };

  const handleEdit = async (orc: any) => {
    try {
      console.log("Iniciando edição do orçamento:", orc.id_orc);
      setSelectedOrcamento(orc);
      
      // Carregar dados do orçamento
      const orcCompleto = await orcamentoService.getById(orc.id_orc);
      console.log("Orçamento carregado:", orcCompleto);
      
      // Preencher formulário
      setSelectedVeiculo(orcCompleto.id_veic);
      setObservacao(orcCompleto.observacao || "");
      
      // Carregar peças e serviços
      const pecasOrc = await orcamentoService.getPecas(orc.id_orc);
      const servicosOrc = await orcamentoService.getServicos(orc.id_orc);
      
      const newItems: OrcamentoItem[] = [];
      
      // Adicionar peças
      pecasOrc.forEach((p: any) => {
        newItems.push({
          tipo: "peca",
          id: p.id_peca,
          descricao: p.descricao_peca || "Peça sem descrição",
          valor: Number(p.preco_peca || 0),
          quantidade: Number(p.quantidade || 1)
        });
      });
      
      // Adicionar serviços
      servicosOrc.forEach((s: any) => {
        newItems.push({
          tipo: "servico",
          id: s.id_serv,
          descricao: s.descricao_serv || "Serviço sem descrição",
          valor: Number(s.valor_serv || 0),
          quantidade: Number(s.quantidade || 1)
        });
      });
      
      setItems(newItems);
      
      // Aguardar um tick para garantir que o estado foi atualizado
      setTimeout(() => {
        setShowEditDialog(true);
      }, 100);
      
    } catch (error: any) {
      console.error("Erro ao carregar orçamento:", error);
      toast.error("Erro ao carregar dados do orçamento");
    }
  };

  const handleUpdate = async () => {
    if (!selectedOrcamento || !selectedVeiculo || items.length === 0) {
      toast.error("Preencha todos os campos e adicione itens");
      return;
    }

    try {
      // Atualizar dados básicos do orçamento
      await orcamentoService.update(selectedOrcamento.id_orc, {
        id_veic: selectedVeiculo,
        valor_total: calculateTotal(),
        observacao: observacao && observacao.trim() !== '' ? observacao : undefined
      });

      // Remover todas as peças e serviços antigos
      try {
        const pecasAntigas = await orcamentoService.getPecas(selectedOrcamento.id_orc);
        for (const peca of pecasAntigas) {
          try {
            await orcamentoService.removePeca(selectedOrcamento.id_orc, peca.id_peca);
          } catch (err) {
            console.warn("Erro ao remover peça:", err);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar peças antigas:", err);
      }
      
      try {
        const servicosAntigos = await orcamentoService.getServicos(selectedOrcamento.id_orc);
        for (const servico of servicosAntigos) {
          try {
            await orcamentoService.removeServico(selectedOrcamento.id_orc, servico.id_serv);
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
          await orcamentoService.addPeca(selectedOrcamento.id_orc, item.id, item.quantidade);
        } else {
          await orcamentoService.addServico(selectedOrcamento.id_orc, item.id, item.quantidade);
        }
      }

      toast.success("Orçamento atualizado com sucesso!");
      setShowEditDialog(false);
      resetForm();
      setSelectedOrcamento(null);
      loadOrcamentos();
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error);
      toast.error("Erro ao atualizar orçamento");
    }
  };

  const handleOpenPrintDialog = async (orc: any) => {
    setSelectedOrcamento(orc);
    setShowPrintConfirmDialog(true);
  };

  const handleVisualizarImpressao = async () => {
    if (!selectedOrcamento) return;

    try {
      setShowPrintConfirmDialog(false);
      toast.info("Carregando dados do orçamento...");
      
      // Carregar todos os dados necessários
      const [orcCompleto, pecasOrc, servicosOrc] = await Promise.all([
        orcamentoService.getById(selectedOrcamento.id_orc),
        orcamentoService.getPecas(selectedOrcamento.id_orc),
        orcamentoService.getServicos(selectedOrcamento.id_orc)
      ]);

      // Buscar dados do veículo
      const veiculoData = await veiculoService.getById(orcCompleto.id_veic);
      
      // Buscar dados do cliente através do veículo
      const clienteData = await clienteService.getById(veiculoData.id_cli);

      // Preparar itens
      const items: any[] = [];
      
      // Adicionar peças
      pecasOrc.forEach((p: any) => {
        items.push({
          tipo: "peca",
          id: p.id_peca,
          descricao: p.descricao_peca || "Peça sem descrição",
          valor: Number(p.preco_peca || 0),
          quantidade: Number(p.quantidade || 1),
          preco_peca: Number(p.preco_peca || 0)
        });
      });
      
      // Adicionar serviços
      servicosOrc.forEach((s: any) => {
        items.push({
          tipo: "servico",
          id: s.id_serv,
          descricao: s.descricao_serv || "Serviço sem descrição",
          valor: Number(s.valor_serv || 0),
          quantidade: Number(s.quantidade || 1),
          valor_serv: Number(s.valor_serv || 0),
          descricao_serv: s.descricao_serv || "Serviço sem descrição"
        });
      });

      setPrintData({
        orcamento: orcCompleto,
        items,
        veiculo: veiculoData,
        cliente: clienteData
      });

      setShowPrintPreviewDialog(true);
    } catch (error) {
      console.error("Erro ao preparar impressão:", error);
      toast.error("Erro ao preparar dados para impressão");
    }
  };

  const handlePrint = async () => {
    if (!printRef.current || !printData) return;

    try {
      setIsGeneratingPDF(true);
      toast.info("Gerando PDF...");

      // Aguardar um momento para garantir que o conteúdo está renderizado
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = printRef.current;
      
      // Criar canvas do conteúdo
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // Salvar PDF
      pdf.save(`orcamento_${printData.orcamento.numero_orc}.pdf`);
      
      toast.success("PDF gerado com sucesso!");
      setShowPrintPreviewDialog(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      loadOrcamentos();
      return;
    }
    const filtered = orcamentos.filter(orc =>
      orc.numero_orc?.toString().includes(searchTerm) ||
      orc.placa_veic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.nome_cli?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setOrcamentos(filtered);
  };

  const resetForm = () => {
    setSelectedVeiculo("");
    setSelectedPeca("");
    setSelectedServico("");
    setObservacao("");
    setItems([]);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end items-center mb-6">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar orçamento..."
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
                  <TableHead>Data</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell>{new Date(orc.data_abertura).toLocaleDateString()}</TableCell>
                    <TableCell>R$ {Number(orc.valor_total).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(orc)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrcamento(orc);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenPrintDialog(orc)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Novo Orçamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Adicionar Peça</label>
                    <div className="flex gap-2">
                      <Combobox
                        options={pecas.map(p => {
                          const estoqueZerado = (p.quantidade_estoque || 0) <= 0;
                          const prefix = estoqueZerado ? "* " : "";
                          console.log(`[ORÇAMENTO] Peça ${p.descricao_peca}: quantidade_estoque =`, p.quantidade_estoque, "estoqueZerado =", estoqueZerado);
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
                    placeholder="Digite aqui observações sobre o orçamento..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Itens do Orçamento</h3>
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
                <Button onClick={handleSave}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog} key={selectedOrcamento?.id_orc}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Orçamento #{selectedOrcamento?.numero_orc}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Adicionar Peça</label>
                    <div className="flex gap-2">
                      <Combobox
                        options={pecas.map(p => {
                          const estoqueZerado = (p.quantidade_estoque || 0) <= 0;
                          const prefix = estoqueZerado ? "* " : "";
                          console.log(`[ORÇAMENTO-EDITAR] Peça ${p.descricao_peca}: quantidade_estoque =`, p.quantidade_estoque, "estoqueZerado =", estoqueZerado);
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
                    key={`edit-obs-${selectedOrcamento?.id_orc}`}
                    placeholder="Digite aqui observações sobre o orçamento..."
                    defaultValue={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Itens do Orçamento</h3>
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
                  <div className="mt-4 text-right">
                    <p className="text-lg font-semibold">
                      Total: R$ {calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); setSelectedOrcamento(null); }}>Fechar</Button>
                <Button variant="outline" onClick={resetForm}>Limpar</Button>
                <Button onClick={handleUpdate}>Atualizar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este orçamento?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Não</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sim</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de Confirmação de Impressão */}
          <Dialog open={showPrintConfirmDialog} onOpenChange={setShowPrintConfirmDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Imprimir Orçamento #{selectedOrcamento?.numero_orc}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-muted-foreground">Número Orçamento:</span>
                    <span className="font-medium">{selectedOrcamento?.numero_orc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-muted-foreground">Veículo:</span>
                    <span className="font-medium">{selectedOrcamento?.descricao_veic} - {selectedOrcamento?.placa_veic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{selectedOrcamento?.nome_cli}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-green-700">Valor Total:</span>
                    <span className="font-bold text-2xl text-green-700">
                      R$ {Number(selectedOrcamento?.valor_total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-row gap-2 sm:justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPrintConfirmDialog(false);
                    setSelectedOrcamento(null);
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleVisualizarImpressao}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Visualizar Impressão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog de Pré-visualização de Impressão */}
          <OrcamentoPDFPreviewDialog
            open={showPrintPreviewDialog}
            onClose={() => {
              setShowPrintPreviewDialog(false);
              setPrintData(null);
            }}
            onPrint={handlePrint}
            printData={printData}
            isGenerating={isGeneratingPDF}
          />

          {/* Template de impressão (oculto) */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            {printData && (
              <OrcamentoPrintTemplate
                ref={printRef}
                orcamento={printData.orcamento}
                items={printData.items}
                veiculo={printData.veiculo}
                cliente={printData.cliente}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
