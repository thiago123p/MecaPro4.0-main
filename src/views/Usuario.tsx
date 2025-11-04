import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { usuarioService } from "@/controllers/usuarioService";
import { Usuario } from "@/models/types";
import { toast } from "sonner";

export default function UsuarioPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    nome_usu: "",
    endereco_usu: "",
    cpf_usu: "",
    cidade_usu: "",
    telefone_usu: "",
    senha_usu: "",
    tipo_usu: "colaborador",
    palavra_chave_usu: "",
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const data = await usuarioService.getAll(5);
      setUsuarios(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    }
  };

  const validateForm = () => {
    if (!formData.nome_usu.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }
    if (!formData.cpf_usu.trim()) {
      toast.error("CPF é obrigatório");
      return false;
    }
    if (!editingUsuario && !formData.senha_usu) {
      toast.error("Senha é obrigatória para novo usuário");
      return false;
    }
    if (!formData.tipo_usu) {
      toast.error("Tipo de usuário é obrigatório");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const savePromise = editingUsuario
        ? usuarioService.update(editingUsuario.id_usu, formData)
        : usuarioService.create(formData);

      // Desabilita o botão durante o salvamento
      const button = document.activeElement as HTMLButtonElement;
      if (button) button.disabled = true;

      await savePromise;
      
      toast.success(editingUsuario ? "Usuário atualizado!" : "Usuário cadastrado!");
      handleClose();
      carregarUsuarios();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.response?.data?.error || "Erro ao salvar usuário");
    } finally {
      // Reabilita o botão
      const button = document.activeElement as HTMLButtonElement;
      if (button) button.disabled = false;
    }
  };

  const handleDelete = async () => {
    try {
      await usuarioService.delete(deletingId);
      toast.success("Usuário excluído!");
      setShowDeleteDialog(false);
      carregarUsuarios();
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      carregarUsuarios();
      return;
    }
    try {
      const data = await usuarioService.search(searchTerm);
      setUsuarios(data);
    } catch (error) {
      toast.error("Erro na pesquisa");
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome_usu: usuario.nome_usu,
      endereco_usu: usuario.endereco_usu || "",
      cpf_usu: usuario.cpf_usu,
      cidade_usu: usuario.cidade_usu || "",
      telefone_usu: usuario.telefone_usu || "",
      senha_usu: usuario.senha_usu,
      tipo_usu: usuario.tipo_usu,
      palavra_chave_usu: usuario.palavra_chave_usu || "",
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingUsuario(null);
    setFormData({
      nome_usu: "",
      endereco_usu: "",
      cpf_usu: "",
      cidade_usu: "",
      telefone_usu: "",
      senha_usu: "",
      tipo_usu: "colaborador",
      palavra_chave_usu: "",
    });
  };

  const handleCancel = () => {
    setFormData({
      nome_usu: "",
      endereco_usu: "",
      cpf_usu: "",
      cidade_usu: "",
      telefone_usu: "",
      senha_usu: "",
      tipo_usu: "colaborador",
      palavra_chave_usu: "",
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
              Novo Usuário
            </Button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar usuário..."
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id_usu}>
                    <TableCell>{usuario.nome_usu}</TableCell>
                    <TableCell>{usuario.cpf_usu}</TableCell>
                    <TableCell>{usuario.tipo_usu}</TableCell>
                    <TableCell>{usuario.telefone_usu}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(usuario)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(usuario.id_usu);
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUsuario ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                value={formData.nome_usu}
                onChange={(e) => setFormData({ ...formData, nome_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>CPF</Label>
              <Input
                value={formData.cpf_usu}
                onChange={(e) => setFormData({ ...formData, cpf_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={formData.telefone_usu}
                onChange={(e) => setFormData({ ...formData, telefone_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input
                value={formData.endereco_usu}
                onChange={(e) => setFormData({ ...formData, endereco_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input
                value={formData.cidade_usu}
                onChange={(e) => setFormData({ ...formData, cidade_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                value={formData.senha_usu}
                onChange={(e) => setFormData({ ...formData, senha_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Tipo de Usuário</Label>
              <Select
                value={formData.tipo_usu}
                onValueChange={(value) => setFormData({ ...formData, tipo_usu: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Palavra-chave (Recuperação de senha)</Label>
              <Input
                value={formData.palavra_chave_usu}
                onChange={(e) => setFormData({ ...formData, palavra_chave_usu: e.target.value })}
                placeholder="Dica para lembrar da senha"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingUsuario ? "Alterar" : "Salvar"}
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
          <p>Tem certeza que deseja excluir este usuário?</p>
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
