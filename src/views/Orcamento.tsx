import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { orcamentoService } from "@/controllers/orcamentoService";
import { pecaService } from "@/controllers/pecaService";
import { servicoService } from "@/controllers/servicoService";
import { veiculoService } from "@/controllers/veiculoService";
import { Peca, Servico, Veiculo } from "@/models/types";

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
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<any>(null);
  
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  
  const [selectedVeiculo, setSelectedVeiculo] = useState("");
  const [selectedPeca, setSelectedPeca] = useState("");
  const [selectedServico, setSelectedServico] = useState("");
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
      const orcamento = await orcamentoService.create({
        id_veic: selectedVeiculo,
        id_usu: userId || "",
        valor_total: calculateTotal()
      });

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

  const handlePrint = () => {
    window.print();
    setShowPrintDialog(false);
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
                        onClick={() => {
                          setSelectedOrcamento(orc);
                          setShowEditDialog(true);
                        }}
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
                        onClick={() => {
                          setSelectedOrcamento(orc);
                          setShowPrintDialog(true);
                        }}
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

          <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Imprimir Orçamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Preview do orçamento #{selectedOrcamento?.numero_orc}</p>
                <div className="border p-4 rounded">
                  <p><strong>Veículo:</strong> {selectedOrcamento?.descricao_veic} - {selectedOrcamento?.placa_veic}</p>
                  <p><strong>Cliente:</strong> {selectedOrcamento?.nome_cli}</p>
                  <p><strong>Data:</strong> {selectedOrcamento?.data_abertura && new Date(selectedOrcamento.data_abertura).toLocaleDateString()}</p>
                  <p><strong>Valor Total:</strong> R$ {Number(selectedOrcamento?.valor_total || 0).toFixed(2)}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPrintDialog(false)}>Cancelar</Button>
                <Button onClick={handlePrint}>Imprimir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
