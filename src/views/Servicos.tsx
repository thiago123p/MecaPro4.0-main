import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { servicoService } from "@/controllers/servicoService";
import { Servico } from "@/models/types";
import { toast } from "sonner";

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    descricao_serv: "",
    valor_serv: 0,
    tempo_serv: 0,
    cos: "",
  });

  // Calcula o valor final automaticamente
  const calcularValorFinal = () => {
    return formData.valor_serv * formData.tempo_serv;
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    setIsLoading(true);
    try {
      const data = await servicoService.getAll();
      setServicos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Erro ao carregar serviços:', error);
      toast.error(error.message || "Erro ao carregar serviços");
      setServicos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.descricao_serv.trim()) {
      toast.error("Descrição do serviço é obrigatória");
      return false;
    }
    if (!formData.cos.trim()) {
      toast.error("COS é obrigatório");
      return false;
    }
    if (formData.valor_serv <= 0) {
      toast.error("Valor do serviço deve ser maior que zero");
      return false;
    }
    if (formData.tempo_serv <= 0) {
      toast.error("Tempo do serviço deve ser maior que zero");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSave = {
        ...formData,
        valor_serv: Number(formData.valor_serv),
        tempo_serv: Number(formData.tempo_serv),
        valor_final_serv: calcularValorFinal()
      };

      if (editingServico) {
        await servicoService.update(editingServico.id_serv, dataToSave);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await servicoService.create(dataToSave);
        toast.success("Serviço cadastrado com sucesso!");
      }
      handleClose();
      await carregarServicos();
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      toast.error(error.response?.data?.error || "Erro ao salvar serviço");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await servicoService.delete(deletingId);
      toast.success("Serviço excluído!");
      setShowDeleteDialog(false);
      carregarServicos();
    } catch (error) {
      toast.error("Erro ao excluir serviço");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      carregarServicos();
      return;
    }
    try {
      const data = await servicoService.search(searchTerm);
      setServicos(data);
    } catch (error) {
      toast.error("Erro na pesquisa");
    }
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    setFormData({
      descricao_serv: servico.descricao_serv,
      valor_serv: servico.valor_serv,
      tempo_serv: servico.tempo_serv,
      cos: servico.cos || "",
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingServico(null);
    setFormData({
      descricao_serv: "",
      valor_serv: 0,
      tempo_serv: 0,
      cos: "",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Serviços</h1>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="bg-card rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tempo (h)</TableHead>
                    <TableHead>COS</TableHead>
                    <TableHead>Valor Final</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum serviço cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    servicos.map((servico) => (
                      <TableRow key={servico.id_serv}>
                        <TableCell>{servico.descricao_serv}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(servico.valor_serv)}
                        </TableCell>
                        <TableCell>{servico.tempo_serv}h</TableCell>
                        <TableCell>{servico.cos || '-'}</TableCell>
                        <TableCell>
                          {servico.valor_final_serv ? new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(servico.valor_final_serv) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(servico)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeletingId(servico.id_serv);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingServico ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição do Serviço *</Label>
              <Input
                value={formData.descricao_serv}
                onChange={(e) => setFormData({ ...formData, descricao_serv: e.target.value })}
                placeholder="Ex: Troca de óleo, Alinhamento, Balanceamento"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_serv}
                  onChange={(e) => setFormData({ ...formData, valor_serv: parseFloat(e.target.value) || 0 })}
                  placeholder="Ex: 120.00"
                />
              </div>
              <div>
                <Label>Tempo (horas) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.tempo_serv}
                  onChange={(e) => setFormData({ ...formData, tempo_serv: parseFloat(e.target.value) || 0 })}
                  placeholder="Ex: 1.5 (1h e 30min)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use decimais: 1.5 = 1h30min, 2.25 = 2h15min
                </p>
              </div>
            </div>
            <div>
              <Label>COS (Centro de Serviço) *</Label>
              <Input
                value={formData.cos}
                onChange={(e) => setFormData({ ...formData, cos: e.target.value })}
                placeholder="Ex: CS-001, MECÂNICA-01"
                maxLength={50}
              />
            </div>
            <div>
              <Label>Valor Final (R$) - Calculado Automaticamente</Label>
              <Input
                type="text"
                value={new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(calcularValorFinal())}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculado automaticamente: Valor × Tempo = {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(calcularValorFinal())}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : editingServico ? "Atualizar" : "Salvar"}
              </Button>
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir este serviço?</p>
          <div className="flex gap-2">
            <Button onClick={handleDelete} variant="destructive" className="flex-1">
              Sim, excluir
            </Button>
            <Button onClick={() => setShowDeleteDialog(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
