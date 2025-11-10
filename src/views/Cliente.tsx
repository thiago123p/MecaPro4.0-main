import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { clienteService } from "@/controllers/clienteService";
import { Cliente } from "@/models/types";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";

export default function ClientePage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    nome_cli: "",
    endereco_cli: "",
    cpf_cli: "",
    cidade_cli: "",
    telefone_cli: "",
  });

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const data = await clienteService.getAll(5);
      setClientes(data);
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    }
  };

  const handleSave = async () => {
    try {
      // Validação: Todos os campos obrigatórios
      if (!formData.nome_cli?.trim()) {
        toast.error("Nome é obrigatório");
        return;
      }
      if (!formData.cpf_cli?.trim()) {
        toast.error("CPF é obrigatório");
        return;
      }
      if (!formData.endereco_cli?.trim()) {
        toast.error("Endereço é obrigatório");
        return;
      }
      if (!formData.cidade_cli?.trim()) {
        toast.error("Cidade é obrigatória");
        return;
      }
      if (!formData.telefone_cli?.trim()) {
        toast.error("Telefone é obrigatório");
        return;
      }

      // Validação: CPF com 11 dígitos
      const cpfNumeros = formData.cpf_cli.replace(/\D/g, '');
      if (cpfNumeros.length !== 11) {
        toast.error("CPF deve ter 11 dígitos");
        return;
      }

      // Validação: Telefone com DDD (mínimo 10 dígitos para nacional ou com +código para internacional)
      const telefoneNumeros = formData.telefone_cli.replace(/\D/g, '');
      if (telefoneNumeros.length < 10) {
        toast.error("Telefone deve ter pelo menos 10 dígitos (com código do país e DDD)");
        return;
      }

      if (editingCliente) {
        await clienteService.update(editingCliente.id_cli, formData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await clienteService.create(formData);
        toast.success("Cliente cadastrado com sucesso!");
      }
      handleClose();
      carregarClientes();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      toast.error(error.message || "Erro ao salvar cliente. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    try {
      await clienteService.delete(deletingId);
      toast.success("Cliente excluído!");
      setShowDeleteDialog(false);
      carregarClientes();
    } catch (error) {
      toast.error("Erro ao excluir cliente");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      carregarClientes();
      return;
    }
    try {
      const data = await clienteService.search(searchTerm);
      setClientes(data);
    } catch (error) {
      toast.error("Erro na pesquisa");
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome_cli: cliente.nome_cli,
      endereco_cli: cliente.endereco_cli || "",
      cpf_cli: cliente.cpf_cli,
      cidade_cli: cliente.cidade_cli || "",
      telefone_cli: cliente.telefone_cli || "",
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingCliente(null);
    setFormData({
      nome_cli: "",
      endereco_cli: "",
      cpf_cli: "",
      cidade_cli: "",
      telefone_cli: "",
    });
  };

  const handleCancel = () => {
    setFormData({
      nome_cli: "",
      endereco_cli: "",
      cpf_cli: "",
      cidade_cli: "",
      telefone_cli: "",
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
              Novo Cliente
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar cliente..."
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
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id_cli}>
                    <TableCell>{cliente.nome_cli}</TableCell>
                    <TableCell>{cliente.cpf_cli}</TableCell>
                    <TableCell>{cliente.telefone_cli}</TableCell>
                    <TableCell>{cliente.cidade_cli}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(cliente)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(cliente.id_cli);
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

      {/* Dialog Cadastro/Edição */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: João da Silva"
                value={formData.nome_cli}
                onChange={(e) => setFormData({ ...formData, nome_cli: e.target.value })}
              />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input
                placeholder="Ex: 123.456.789-00 (11 dígitos)"
                value={formData.cpf_cli}
                onChange={(e) => setFormData({ ...formData, cpf_cli: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefone *</Label>
              <PhoneInput
                value={formData.telefone_cli}
                onChange={(value) => setFormData({ ...formData, telefone_cli: value })}
                placeholder="(64) 99999-1234"
              />
            </div>
            <div>
              <Label>Endereço *</Label>
              <Input
                placeholder="Ex: Rua das Flores, 123"
                value={formData.endereco_cli}
                onChange={(e) => setFormData({ ...formData, endereco_cli: e.target.value })}
              />
            </div>
            <div>
              <Label>Cidade *</Label>
              <Input
                placeholder="Ex: Jataí"
                value={formData.cidade_cli}
                onChange={(e) => setFormData({ ...formData, cidade_cli: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingCliente ? "Alterar" : "Salvar"}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir este cliente?</p>
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
