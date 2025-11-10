import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";
import { usuarioService } from "@/controllers/usuarioService";
import { Usuario } from "@/models/types";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";

export default function UsuarioPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
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
    // Validação: Nome obrigatório
    if (!formData.nome_usu.trim()) {
      toast.error("Nome é obrigatório");
      return false;
    }

    // Validação: CPF obrigatório e com 11 dígitos
    if (!formData.cpf_usu.trim()) {
      toast.error("CPF é obrigatório");
      return false;
    }
    const cpfNumeros = formData.cpf_usu.replace(/\D/g, '');
    if (cpfNumeros.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return false;
    }

    // Validação: Endereço obrigatório
    if (!formData.endereco_usu.trim()) {
      toast.error("Endereço é obrigatório");
      return false;
    }

    // Validação: Cidade obrigatória
    if (!formData.cidade_usu.trim()) {
      toast.error("Cidade é obrigatória");
      return false;
    }

    // Validação: Telefone obrigatório e com formato válido
    if (!formData.telefone_usu.trim()) {
      toast.error("Telefone é obrigatório");
      return false;
    }
    const telefoneNumeros = formData.telefone_usu.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) {
      toast.error("Telefone deve ter pelo menos 10 dígitos (com código do país e DDD)");
      return false;
    }

    // Validação: Senha obrigatória para novo usuário
    if (!editingUsuario && !formData.senha_usu) {
      toast.error("Senha é obrigatória para novo usuário");
      return false;
    }

    // Validação: Tipo de usuário obrigatório
    if (!formData.tipo_usu) {
      toast.error("Tipo de usuário é obrigatório");
      return false;
    }

    // Validação: Palavra-chave obrigatória
    if (!formData.palavra_chave_usu.trim()) {
      toast.error("Palavra-chave é obrigatória");
      return false;
    }

    // Validação: Palavra-chave com no máximo 3 palavras
    const palavras = formData.palavra_chave_usu.trim().split(/\s+/);
    if (palavras.length > 3) {
      toast.error("Palavra-chave deve ter no máximo 3 palavras");
      return false;
    }

    // Validação: Palavra-chave não pode conter a senha
    if (formData.senha_usu && formData.senha_usu.length >= 3) {
      const senhaLower = formData.senha_usu.toLowerCase();
      const palavraChaveLower = formData.palavra_chave_usu.toLowerCase();
      
      // Verifica se a senha inteira está na palavra-chave
      if (palavraChaveLower.includes(senhaLower)) {
        toast.error("Palavra-chave não pode conter a senha");
        return false;
      }
      
      // Verifica se partes da senha (com 3+ caracteres) estão na palavra-chave
      for (let i = 0; i <= senhaLower.length - 3; i++) {
        const substring = senhaLower.substring(i, i + 3);
        if (palavraChaveLower.includes(substring)) {
          toast.error("Palavra-chave não pode conter partes da senha");
          return false;
        }
      }
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
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: João da Silva"
                value={formData.nome_usu}
                onChange={(e) => setFormData({ ...formData, nome_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input
                placeholder="Ex: 123.456.789-00 (11 dígitos)"
                value={formData.cpf_usu}
                onChange={(e) => setFormData({ ...formData, cpf_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefone *</Label>
              <PhoneInput
                value={formData.telefone_usu}
                onChange={(value) => setFormData({ ...formData, telefone_usu: value })}
                placeholder="(64) 99999-1234"
              />
            </div>
            <div>
              <Label>Endereço *</Label>
              <Input
                placeholder="Ex: Rua das Flores, 123"
                value={formData.endereco_usu}
                onChange={(e) => setFormData({ ...formData, endereco_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Cidade *</Label>
              <Input
                placeholder="Ex: Jataí"
                value={formData.cidade_usu}
                onChange={(e) => setFormData({ ...formData, cidade_usu: e.target.value })}
              />
            </div>
            <div>
              <Label>Senha *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.senha_usu}
                  onChange={(e) => setFormData({ ...formData, senha_usu: e.target.value })}
                  placeholder={editingUsuario ? "Deixe em branco para não alterar" : "Digite a senha (mínimo 3 caracteres)"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label>Tipo de Usuário *</Label>
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
              <Label>Palavra-chave * (máximo 3 palavras, não pode conter a senha)</Label>
              <Input
                value={formData.palavra_chave_usu}
                onChange={(e) => setFormData({ ...formData, palavra_chave_usu: e.target.value })}
                placeholder="Ex: carro azul favorito"
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
