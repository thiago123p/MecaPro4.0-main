import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { veiculoService } from "@/controllers/veiculoService";
import { marcaService } from "@/controllers/marcaService";
import { clienteService } from "@/controllers/clienteService";
import { Veiculo, Marca, Cliente } from "@/models/types";
import { toast } from "sonner";

export default function VeiculoPage() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    descricao_veic: "",
    placa_veic: "",
    ano_veic: 0,
    id_marca: "",
    id_cli: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [veics, marcs, clies] = await Promise.all([
        veiculoService.getAll(5),
        marcaService.getAllUnlimited(),
        clienteService.getAll(100),
      ]);
      setVeiculos(veics);
      setMarcas(marcs);
      setClientes(clies);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    }
  };

  const handleSave = async () => {
    try {
      if (editingVeiculo) {
        await veiculoService.update(editingVeiculo.id_veic, formData);
        toast.success("Veículo atualizado!");
      } else {
        await veiculoService.create(formData);
        toast.success("Veículo cadastrado!");
      }
      handleClose();
      carregarDados();
    } catch (error) {
      toast.error("Erro ao salvar veículo");
    }
  };

  const handleDelete = async () => {
    try {
      await veiculoService.delete(deletingId);
      toast.success("Veículo excluído!");
      setShowDeleteDialog(false);
      carregarDados();
    } catch (error) {
      toast.error("Erro ao excluir veículo");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      carregarDados();
      return;
    }
    try {
      const data = await veiculoService.search(searchTerm);
      setVeiculos(data);
    } catch (error) {
      toast.error("Erro na pesquisa");
    }
  };

  const handleEdit = (veiculo: Veiculo) => {
    setEditingVeiculo(veiculo);
    setFormData({
      descricao_veic: veiculo.descricao_veic,
      placa_veic: veiculo.placa_veic,
      ano_veic: veiculo.ano_veic || 0,
      id_marca: veiculo.id_marca || "",
      id_cli: veiculo.id_cli,
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingVeiculo(null);
    setFormData({
      descricao_veic: "",
      placa_veic: "",
      ano_veic: 0,
      id_marca: "",
      id_cli: "",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end items-center mb-6">
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar veículo..."
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {veiculos.map((veiculo) => (
                  <TableRow key={veiculo.id_veic}>
                    <TableCell>{veiculo.descricao_veic}</TableCell>
                    <TableCell>{veiculo.placa_veic}</TableCell>
                    <TableCell>{veiculo.ano_veic || '-'}</TableCell>
                    <TableCell>
                      {veiculo.nome_marca || 
                       veiculo.marca?.nome_marca || 
                       marcas.find((m) => m.id_marca === veiculo.id_marca)?.nome_marca || 
                       '-'}
                    </TableCell>
                    <TableCell>
                      {veiculo.nome_cli || 
                       veiculo.cliente?.nome_cli || 
                       clientes.find((c) => c.id_cli === veiculo.id_cli)?.nome_cli || 
                       '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(veiculo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(veiculo.id_veic);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVeiculo ? "Editar Veículo" : "Novo Veículo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.descricao_veic}
                onChange={(e) => setFormData({ ...formData, descricao_veic: e.target.value })}
              />
            </div>
            <div>
              <Label>Placa</Label>
              <Input
                value={formData.placa_veic}
                onChange={(e) => setFormData({ ...formData, placa_veic: e.target.value })}
              />
            </div>
            <div>
              <Label>Ano</Label>
              <Input
                type="number"
                value={formData.ano_veic}
                onChange={(e) => setFormData({ ...formData, ano_veic: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Marca</Label>
              <Select
                value={formData.id_marca}
                onValueChange={(value) => setFormData({ ...formData, id_marca: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((marca) => (
                    <SelectItem key={marca.id_marca} value={marca.id_marca}>
                      {marca.nome_marca}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cliente</Label>
              <Select
                value={formData.id_cli}
                onValueChange={(value) => setFormData({ ...formData, id_cli: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id_cli} value={cliente.id_cli}>
                      {cliente.nome_cli}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingVeiculo ? "Alterar" : "Salvar"}
              </Button>
              <Button
                onClick={() => setFormData({
                  descricao_veic: "",
                  placa_veic: "",
                  ano_veic: 0,
                  id_marca: "",
                  id_cli: "",
                })}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Fechar
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
          <p>Tem certeza que deseja excluir este veículo?</p>
          <div className="flex gap-2">
            <Button onClick={handleDelete} variant="destructive" className="flex-1">
              Sim
            </Button>
            <Button onClick={() => setShowDeleteDialog(false)} variant="outline" className="flex-1">
              Não
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
