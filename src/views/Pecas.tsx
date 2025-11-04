import { Sidebar } from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { pecaService } from "@/controllers/pecaService";
import { marcaService } from "@/controllers/marcaService";
import { estoqueService } from "@/controllers/estoqueService";
import { Peca, Marca, ControleEstoque } from "@/models/types";
import { toast } from "sonner";

export default function PecasPage() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEstoqueDialog, setShowEstoqueDialog] = useState(false);
  const [showEstoqueRegisterDialog, setShowEstoqueRegisterDialog] = useState(false);
  const [editingPeca, setEditingPeca] = useState<Peca | null>(null);
  const [deletingId, setDeletingId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEstoque, setSearchEstoque] = useState("");
  const [filterEstoque, setFilterEstoque] = useState("");
  const [pecaSelecionada, setPecaSelecionada] = useState<Peca | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<ControleEstoque[]>([]);
  const [quantidade, setQuantidade] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    descricao_peca: "",
    preco_peca: 0,
    tipo_peca: "",
    codigo_peca: "",
    id_marca: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pcs, marcs] = await Promise.all([
        pecaService.getAll(5),
        marcaService.getAllUnlimited(),
      ]);

      if (!Array.isArray(pcs) || !Array.isArray(marcs)) {
        throw new Error('Dados inválidos recebidos do servidor');
      }

      setPecas(pcs);
      setMarcas(marcs);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message || "Erro ao carregar dados");
      toast.error(error.message || "Erro ao carregar dados");
      setPecas([]);
      setMarcas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.descricao_peca.trim()) {
      toast.error("Descrição da peça é obrigatória");
      return false;
    }
    if (!formData.codigo_peca.trim()) {
      toast.error("Código da peça é obrigatório");
      return false;
    }
    if (formData.preco_peca <= 0) {
      toast.error("Preço da peça deve ser maior que zero");
      return false;
    }
    if (!formData.tipo_peca) {
      toast.error("Tipo da peça é obrigatório");
      return false;
    }
    if (!formData.id_marca) {
      toast.error("Marca é obrigatória");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingPeca) {
        await pecaService.update(editingPeca.id_peca, {
          ...formData,
          preco_peca: Number(formData.preco_peca)
        });
        toast.success("Peça atualizada com sucesso!");
      } else {
        await pecaService.create({
          ...formData,
          preco_peca: Number(formData.preco_peca)
        });
        toast.success("Peça cadastrada com sucesso!");
      }
      handleClose();
      await carregarDados();
      setError(null);
    } catch (error: any) {
      console.error('Erro ao salvar peça:', error);
      setError(error.response?.data?.error || "Erro ao salvar peça");
      toast.error(error.response?.data?.error || "Erro ao salvar peça");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await pecaService.delete(deletingId);
      toast.success("Peça excluída!");
      setShowDeleteDialog(false);
      carregarDados();
    } catch (error) {
      toast.error("Erro ao excluir peça");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      carregarDados();
      return;
    }
    try {
      const data = await pecaService.search(searchTerm);
      setPecas(data);
    } catch (error) {
      toast.error("Erro na pesquisa");
    }
  };

  const handleSearchEstoque = async () => {
    if (!searchEstoque) {
      toast.error("Selecione uma peça");
      return;
    }
    try {
      // Busca a peça pelo ID (searchEstoque agora contém o id_peca)
      const peca = pecas.find(p => p.id_peca === searchEstoque);
      if (peca) {
        setPecaSelecionada(peca);
        const estoque = await estoqueService.getByPecaId(peca.id_peca);
        setMovimentacoes(estoque ? [estoque] : []);
        setShowEstoqueDialog(false);
        setShowEstoqueRegisterDialog(true);
      } else {
        toast.error("Peça não encontrada");
      }
    } catch (error) {
      toast.error("Erro ao buscar peça");
    }
  };

  const handleRegistrarEstoque = async () => {
    if (!pecaSelecionada || !quantidade) {
      toast.error("Preencha a quantidade");
      return;
    }
    try {
      await estoqueService.registrarMovimentacao(pecaSelecionada.id_peca, parseInt(quantidade));
      toast.success("Estoque registrado!");
      const estoque = await estoqueService.getByPecaId(pecaSelecionada.id_peca);
      setMovimentacoes(estoque ? [estoque] : []);
      setQuantidade("");
    } catch (error) {
      toast.error("Erro ao registrar estoque");
    }
  };

  const calcularSaldo = () => {
    return movimentacoes.reduce((total, mov) => total + mov.quantidade, 0);
  };

  const handleEdit = (peca: Peca) => {
    setEditingPeca(peca);
    setFormData({
      descricao_peca: peca.descricao_peca,
      preco_peca: peca.preco_peca,
      tipo_peca: peca.tipo_peca || "",
      codigo_peca: peca.codigo_peca,
      id_marca: peca.id_marca || "",
    });
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    setEditingPeca(null);
    setFormData({
      descricao_peca: "",
      preco_peca: 0,
      tipo_peca: "",
      codigo_peca: "",
      id_marca: "",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Peças</h1>
            <div className="flex gap-2">
              <Button onClick={() => setShowEstoqueDialog(true)} variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Controle de Estoque
              </Button>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Peça
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Pesquisar peças..."
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
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="bg-card rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pecas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma peça cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    pecas.map((peca) => (
                      <TableRow key={peca.id_peca}>
                        <TableCell>{peca.codigo_peca}</TableCell>
                        <TableCell>{peca.descricao_peca}</TableCell>
                        <TableCell>{peca.tipo_peca}</TableCell>
                        <TableCell>
                          {marcas.find((m) => m.id_marca === peca.id_marca)?.nome_marca || '-'}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(peca.preco_peca)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(peca)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeletingId(peca.id_peca);
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
            <DialogTitle>{editingPeca ? "Editar Peça" : "Nova Peça"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.descricao_peca}
                onChange={(e) => setFormData({ ...formData, descricao_peca: e.target.value })}
              />
            </div>
            <div>
              <Label>Código</Label>
              <Input
                value={formData.codigo_peca}
                onChange={(e) => setFormData({ ...formData, codigo_peca: e.target.value })}
              />
            </div>
            <div>
              <Label>Preço</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco_peca}
                onChange={(e) => setFormData({ ...formData, preco_peca: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={formData.tipo_peca}
                onValueChange={(value) => setFormData({ ...formData, tipo_peca: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="genuínas">Genuínas</SelectItem>
                  <SelectItem value="paralelas">Paralelas</SelectItem>
                  <SelectItem value="econômicas">Econômicas</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : editingPeca ? "Alterar" : "Salvar"}
              </Button>
              <Button onClick={() => setFormData({
                descricao_peca: "",
                preco_peca: 0,
                tipo_peca: "",
                codigo_peca: "",
                id_marca: "",
              })} variant="outline" className="flex-1">
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
          <p>Tem certeza que deseja excluir esta peça?</p>
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

      <Dialog open={showEstoqueDialog} onOpenChange={(open) => {
        setShowEstoqueDialog(open);
        if (!open) {
          setSearchEstoque("");
          setFilterEstoque("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controle de Estoque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecione a Peça</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Pesquisar por código, descrição, tipo ou marca..."
                    value={filterEstoque}
                    onChange={(e) => setFilterEstoque(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        // Se tiver apenas 1 resultado filtrado, seleciona automaticamente
                        const pecasFiltradas = pecas.filter(peca => {
                          const searchLower = filterEstoque.toLowerCase();
                          return peca.codigo_peca.toLowerCase().includes(searchLower) ||
                                 peca.descricao_peca.toLowerCase().includes(searchLower) ||
                                 (peca.tipo_peca && peca.tipo_peca.toLowerCase().includes(searchLower)) ||
                                 (marcas.find(m => m.id_marca === peca.id_marca)?.nome_marca.toLowerCase().includes(searchLower));
                        });
                        
                        if (pecasFiltradas.length === 1) {
                          setSearchEstoque(pecasFiltradas[0].id_peca);
                          handleSearchEstoque();
                        } else if (pecasFiltradas.length > 1 && searchEstoque) {
                          handleSearchEstoque();
                        } else if (pecasFiltradas.length === 0) {
                          toast.error("Nenhuma peça encontrada com esse termo");
                        } else {
                          toast.info(`${pecasFiltradas.length} peças encontradas. Selecione uma da lista.`);
                        }
                      }
                    }}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  
                  {filterEstoque && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                      {pecas
                        .filter(peca => {
                          const searchLower = filterEstoque.toLowerCase();
                          const marcaNome = marcas.find(m => m.id_marca === peca.id_marca)?.nome_marca || '';
                          return peca.codigo_peca.toLowerCase().includes(searchLower) ||
                                 peca.descricao_peca.toLowerCase().includes(searchLower) ||
                                 (peca.tipo_peca && peca.tipo_peca.toLowerCase().includes(searchLower)) ||
                                 marcaNome.toLowerCase().includes(searchLower);
                        })
                        .map((peca) => {
                          const marcaNome = marcas.find(m => m.id_marca === peca.id_marca)?.nome_marca || '';
                          return (
                            <div
                              key={peca.id_peca}
                              className={`px-3 py-2 cursor-pointer hover:bg-accent transition-colors ${
                                searchEstoque === peca.id_peca ? 'bg-accent' : ''
                              }`}
                              onClick={() => {
                                setSearchEstoque(peca.id_peca);
                                setFilterEstoque(`${peca.codigo_peca} - ${peca.descricao_peca}`);
                              }}
                            >
                              <div className="font-medium text-sm">
                                {peca.codigo_peca} - {peca.descricao_peca}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {peca.tipo_peca && `${peca.tipo_peca}`}
                                {marcaNome && ` • ${marcaNome}`}
                                {` • ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(peca.preco_peca)}`}
                              </div>
                            </div>
                          );
                        })}
                      {pecas.filter(peca => {
                        const searchLower = filterEstoque.toLowerCase();
                        const marcaNome = marcas.find(m => m.id_marca === peca.id_marca)?.nome_marca || '';
                        return peca.codigo_peca.toLowerCase().includes(searchLower) ||
                               peca.descricao_peca.toLowerCase().includes(searchLower) ||
                               (peca.tipo_peca && peca.tipo_peca.toLowerCase().includes(searchLower)) ||
                               marcaNome.toLowerCase().includes(searchLower);
                      }).length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          Nenhuma peça encontrada
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleSearchEstoque} 
                  disabled={!searchEstoque}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Abrir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Digite para pesquisar, selecione uma peça e pressione Enter ou clique em "Abrir"
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEstoqueRegisterDialog} onOpenChange={setShowEstoqueRegisterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Controle de Estoque - {pecaSelecionada?.descricao_peca}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Digite a quantidade (Ex: 10.5)"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRegistrarEstoque} 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Registrar"}
              </Button>
              <Button 
                onClick={() => {
                  setQuantidade("");
                  setShowEstoqueRegisterDialog(false);
                  setShowEstoqueDialog(true);
                  setPecaSelecionada(null);
                  setMovimentacoes([]);
                }} 
                variant="outline" 
                className="flex-1"
              >
                Voltar
              </Button>
              <Button onClick={() => {
                setShowEstoqueRegisterDialog(false);
                setShowEstoqueDialog(false);
                setPecaSelecionada(null);
                setMovimentacoes([]);
                setQuantidade("");
                setSearchEstoque("");
                setFilterEstoque("");
              }} variant="outline" className="flex-1">
                Fechar
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Movimentação de Estoque</h3>
              <div className="bg-card rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((mov) => (
                      <TableRow key={mov.id_estoque}>
                        <TableCell>
                          {new Date(mov.data_registro).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{mov.quantidade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <p className="text-lg font-semibold">
                  Saldo em Estoque: {calcularSaldo()} unidades
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
