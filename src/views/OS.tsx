import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, Printer, Search, Power } from "lucide-react";
import { toast } from "sonner";
import { osService } from "@/controllers/osService";
import { pecaService } from "@/controllers/pecaService";
import { servicoService } from "@/controllers/servicoService";
import { veiculoService } from "@/controllers/veiculoService";
import { mecanicoService } from "@/controllers/mecanicoService";
import { orcamentoService } from "@/controllers/orcamentoService";
import { Peca, Servico, Veiculo, Mecanico } from "@/models/types";

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
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [showPagamentoDialog, setShowPagamentoDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedOS, setSelectedOS] = useState<any>(null);
  
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  
  const [selectedVeiculo, setSelectedVeiculo] = useState("");
  const [selectedMecanico, setSelectedMecanico] = useState("");
  const [selectedPeca, setSelectedPeca] = useState("");
  const [selectedServico, setSelectedServico] = useState("");
  const [selectedPagamento, setSelectedPagamento] = useState("");
  const [items, setItems] = useState<OSItem[]>([]);

  useEffect(() => {
    loadOrdens();
    loadOrcamentos();
    loadPecas();
    loadServicos();
    loadVeiculos();
    loadMecanicos();
  }, []);

  const loadOrdens = async () => {
    try {
      const data = await osService.getAll();
      setOrdens(data);
    } catch (error) {
      toast.error("Erro ao carregar ordens de serviço");
    }
  };

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
      const data = await pecaService.getAll();
      setPecas(data);
    } catch (error) {
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
      const os = await osService.create({
        id_veic: selectedVeiculo,
        id_mec: selectedMecanico,
        id_usu: userId || "",
        valor_total: calculateTotal()
      });

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

    try {
      await osService.finalizar(selectedOS.id_os, selectedPagamento);
      setShowPagamentoDialog(false);
      setShowFinalizarDialog(false);
      setShowSuccessDialog(true);
      loadOrdens();
    } catch (error) {
      toast.error("Erro ao finalizar OS");
    }
  };

  const handlePrint = () => {
    window.print();
    setShowPrintDialog(false);
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
    setItems([]);
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
                        onClick={() => {
                          setSelectedOS(os);
                          setShowEditDialog(true);
                        }}
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
                      <Select value={selectedPeca} onValueChange={setSelectedPeca}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a peça" />
                        </SelectTrigger>
                        <SelectContent>
                          {pecas.map((p) => (
                            <SelectItem key={p.id_peca} value={p.id_peca}>
                              {p.descricao_peca} - R$ {Number(p.preco_peca).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddPeca}>Adicionar</Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Adicionar Serviço</label>
                    <div className="flex gap-2">
                      <Select value={selectedServico} onValueChange={setSelectedServico}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicos.map((s) => (
                            <SelectItem key={s.id_serv} value={s.id_serv}>
                              {s.descricao_serv} - R$ {Number(s.valor_final_serv || s.valor_serv).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddServico}>Adicionar</Button>
                    </div>
                  </div>
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

          <Dialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Finalizar OS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-lg font-semibold">
                  Valor Total: R$ {Number(selectedOS?.valor_total || 0).toFixed(2)}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowFinalizarDialog(false)}>Cancelar</Button>
                <Button onClick={() => { setShowFinalizarDialog(false); setShowPagamentoDialog(true); }}>
                  Finalizar
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
                <Select value={selectedPagamento} onValueChange={setSelectedPagamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPagamentoDialog(false)}>Cancelar</Button>
                <Button onClick={handleFinalizar}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>OS Encerrada</DialogTitle>
              </DialogHeader>
              <div className="text-center py-4">
                <p className="text-lg">Ordem de Serviço finalizada com sucesso!</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>Fechar</Button>
                <Button onClick={() => { window.print(); setShowSuccessDialog(false); }}>Imprimir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Imprimir OS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Preview da OS #{selectedOS?.numero_os}</p>
                <div className="border p-4 rounded">
                  <p><strong>Veículo:</strong> {selectedOS?.descricao_veic} - {selectedOS?.placa_veic}</p>
                  <p><strong>Cliente:</strong> {selectedOS?.nome_cli}</p>
                  <p><strong>Mecânico:</strong> {selectedOS?.nome_mec}</p>
                  <p><strong>Status:</strong> {selectedOS?.status}</p>
                  <p><strong>Valor Total:</strong> R$ {Number(selectedOS?.valor_total || 0).toFixed(2)}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPrintDialog(false)}>Cancelar</Button>
                <Button onClick={handlePrint}>Imprimir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
