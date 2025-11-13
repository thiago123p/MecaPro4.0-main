import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { mecanicoService } from "@/controllers/mecanicoService";
import { Mecanico } from "@/models/types";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import { useEnterKey } from "@/hooks/use-enter-key";
import { useAddShortcut } from "@/hooks/use-add-shortcut";

export default function MecanicoPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingMecanico, setEditingMecanico] = useState<Mecanico | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    nome_mec: "",
    endereco_mec: "",
    cpf_mec: "",
    cidade_mec: "",
    telefone_mec: "",
  });

  useEffect(() => {
    carregarMecanicos();
  }, []);

  // Ouvir evento de quick access
  useEffect(() => {
    const handleQuickAccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.type === 'mecanico') {
        setShowDialog(true);
      }
    };

    window.addEventListener('quick-access-open', handleQuickAccess);
    return () => window.removeEventListener('quick-access-open', handleQuickAccess);
  }, []);

  // Hook para o botão Enter nos dialogs
  const handleEnterKey = useCallback(() => {
    if (showDialog) {
      handleSave();
    } else if (showDeleteDialog) {
      handleDelete();
    }
  }, [showDialog, showDeleteDialog]);

  useEnterKey({
    onEnter: handleEnterKey,
    enabled: showDialog || showDeleteDialog,
  });

  // Hook para Ctrl + (+) abrir diálogo de cadastro
  useAddShortcut(() => {
    setShowDialog(true);
  });

  const carregarMecanicos = async () => {
    try {
      const data = await mecanicoService.getAll(5);
      setMecanicos(data);
    } catch (error) {
      toast.error("Erro ao carregar mecânicos");
    }
  };

  const handleSave = async () => {
    try {
      // Validação: Todos os campos obrigatórios
      if (!formData.nome_mec?.trim()) {
        toast.error("Nome é obrigatório");
        return;
      }
      if (!formData.cpf_mec?.trim()) {
        toast.error("CPF é obrigatório");
        return;
      }
      if (!formData.endereco_mec?.trim()) {
        toast.error("Endereço é obrigatório");
        return;
      }
      if (!formData.cidade_mec?.trim()) {
        toast.error("Cidade é obrigatória");
        return;
      }
      if (!formData.telefone_mec?.trim()) {
        toast.error("Telefone é obrigatório");
        return;
      }

      // Validação: CPF com 11 dígitos
      const cpfNumeros = formData.cpf_mec.replace(/\D/g, '');
      if (cpfNumeros.length !== 11) {
        toast.error("CPF deve ter 11 dígitos");
        return;
      }

      // Validação: Telefone com DDD (mínimo 10 dígitos para nacional ou com +código para internacional)
      const telefoneNumeros = formData.telefone_mec.replace(/\D/g, '');
      if (telefoneNumeros.length < 10) {
        toast.error("Telefone deve ter pelo menos 10 dígitos (com código do país e DDD)");
        return;
      }

      if (editingMecanico) {
        await mecanicoService.update(editingMecanico.id_mec, formData);
        toast.success("Mecânico atualizado!");
      } else {
        await mecanicoService.create(formData);
        toast.success("Mecânico cadastrado!");
      }
      handleClose();
      carregarMecanicos();
    } catch (error) {
      toast.error("Erro ao salvar mecânico");
    }
  };

  const handleDelete = async () => {
    try {
      await mecanicoService.delete(deletingId);
      toast.success("Mecânico excluído!");
      setShowDeleteDialog(false);
      carregarMecanicos();
    } catch (error) {
      toast.error("Erro ao excluir mecânico");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      carregarMecanicos();
      return;
    }
    try {
      const data = await mecanicoService.search(searchTerm);
      setMecanicos(data);
    } catch (error) {
      toast.error("Erro na pesquisa");
    }
  };

  const handleEdit = (mecanico: Mecanico) => {
    setEditingMecanico(mecanico);
    setFormData({
      nome_mec: mecanico.nome_mec,
      endereco_mec: mecanico.endereco_mec || "",
      cpf_mec: mecanico.cpf_mec,
      cidade_mec: mecanico.cidade_mec || "",
      telefone_mec: mecanico.telefone_mec || "",
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingMecanico(null);
    setFormData({
      nome_mec: "",
      endereco_mec: "",
      cpf_mec: "",
      cidade_mec: "",
      telefone_mec: "",
    });
  };

  const handleCancel = () => {
    setFormData({
      nome_mec: "",
      endereco_mec: "",
      cpf_mec: "",
      cidade_mec: "",
      telefone_mec: "",
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
              Novo Mecânico
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar mecânico..."
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
                {mecanicos.map((mecanico) => (
                  <TableRow key={mecanico.id_mec}>
                    <TableCell>{mecanico.nome_mec}</TableCell>
                    <TableCell>{mecanico.cpf_mec}</TableCell>
                    <TableCell>{mecanico.telefone_mec}</TableCell>
                    <TableCell>{mecanico.cidade_mec}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(mecanico)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(mecanico.id_mec);
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
              {editingMecanico ? "Editar Mecânico" : "Novo Mecânico"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Carlos Silva"
                value={formData.nome_mec}
                onChange={(e) => setFormData({ ...formData, nome_mec: e.target.value })}
              />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input
                placeholder="Ex: 123.456.789-00 (11 dígitos)"
                value={formData.cpf_mec}
                onChange={(e) => setFormData({ ...formData, cpf_mec: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefone *</Label>
              <PhoneInput
                value={formData.telefone_mec}
                onChange={(value) => setFormData({ ...formData, telefone_mec: value })}
                placeholder="(64) 99999-1234"
              />
            </div>
            <div>
              <Label>Endereço *</Label>
              <Input
                placeholder="Ex: Rua das Flores, 123"
                value={formData.endereco_mec}
                onChange={(e) => setFormData({ ...formData, endereco_mec: e.target.value })}
              />
            </div>
            <div>
              <Label>Cidade *</Label>
              <Input
                placeholder="Ex: Jataí"
                value={formData.cidade_mec}
                onChange={(e) => setFormData({ ...formData, cidade_mec: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingMecanico ? "Alterar" : "Salvar"}
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

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir este mecânico?</p>
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
