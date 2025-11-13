import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { marcaService } from "@/controllers/marcaService";
import { Marca } from "@/models/types";
import { toast } from "sonner";
import { useEnterKey } from "@/hooks/use-enter-key";
import { useAddShortcut } from "@/hooks/use-add-shortcut";

export default function MarcaPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [nomeMarca, setNomeMarca] = useState("");

  useEffect(() => {
    carregarMarcas();
  }, []);

  // Ouvir evento de quick access
  useEffect(() => {
    const handleQuickAccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.type === 'marca') {
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

  const carregarMarcas = async () => {
    try {
      const data = await marcaService.getAll(5);
      setMarcas(data);
    } catch (error) {
      toast.error("Erro ao carregar marcas");
    }
  };

  const handleSave = async () => {
    try {
      // Validação: Nome da marca obrigatório
      if (!nomeMarca.trim()) {
        toast.error("Nome da marca é obrigatório");
        return;
      }

      if (editingMarca) {
        await marcaService.update(editingMarca.id_marca, { nome_marca: nomeMarca });
        toast.success("Marca atualizada!");
      } else {
        await marcaService.create({ nome_marca: nomeMarca });
        toast.success("Marca cadastrada!");
      }
      handleClose();
      carregarMarcas();
    } catch (error) {
      toast.error("Erro ao salvar marca");
    }
  };

  const handleDelete = async () => {
    try {
      await marcaService.delete(deletingId);
      toast.success("Marca excluída!");
      setShowDeleteDialog(false);
      carregarMarcas();
    } catch (error) {
      toast.error("Erro ao excluir marca");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      carregarMarcas();
      return;
    }
    try {
      const data = await marcaService.search(searchTerm);
      setMarcas(data);
    } catch (error) {
      toast.error("Erro na pesquisa");
    }
  };

  const handleEdit = (marca: Marca) => {
    setEditingMarca(marca);
    setNomeMarca(marca.nome_marca);
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingMarca(null);
    setNomeMarca("");
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end items-center mb-6">
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Marca
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar marca..."
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
                  <TableHead>Nome da Marca</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marcas.map((marca) => (
                  <TableRow key={marca.id_marca}>
                    <TableCell>{marca.nome_marca}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(marca)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(marca.id_marca);
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
              {editingMarca ? "Editar Marca" : "Nova Marca"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Marca *</Label>
              <Input
                placeholder="Ex: Fiat, Chevrolet, Volkswagen"
                value={nomeMarca}
                onChange={(e) => setNomeMarca(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingMarca ? "Alterar" : "Salvar"}
              </Button>
              <Button onClick={() => setNomeMarca("")} variant="outline" className="flex-1">
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
          <p>Tem certeza que deseja excluir esta marca?</p>
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
