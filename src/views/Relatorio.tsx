import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { usuarioService } from "@/controllers/usuarioService";
import { orcamentoService } from "@/controllers/orcamentoService";
import { osService } from "@/controllers/osService";
import { Usuario } from "@/models/types";

export default function Relatorio() {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [reportData, setReportData] = useState<any>({
    orcamentos: [],
    ordens: [],
    usuario: null
  });

  useEffect(() => {
    loadUsuarios();
    setMaxDates();
  }, []);

  const setMaxDates = () => {
    const hoje = new Date();
    const tresMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 3, hoje.getDate());
    
    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(tresMesesAtras.toISOString().split('T')[0]);
  };

  const loadUsuarios = async () => {
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
    }
  };

  const handleGerarRelatorio = async () => {
    if (!selectedUsuario) {
      toast.error("Selecione um usuário");
      return;
    }

    if (!dataInicio || !dataFim) {
      toast.error("Selecione o período");
      return;
    }

    try {
      const usuario = usuarios.find(u => u.id_usu === selectedUsuario);
      
      const todosOrcamentos = await orcamentoService.getAll(1000);
      const orcamentosFiltrados = todosOrcamentos.filter((orc: any) => {
        const dataOrc = new Date(orc.data_abertura);
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return orc.id_usu === selectedUsuario && dataOrc >= inicio && dataOrc <= fim;
      });

      const todasOS = await osService.getAll(1000);
      const osFiltradas = todasOS.filter((os: any) => {
        const dataOS = new Date(os.data_abertura);
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return os.id_usu === selectedUsuario && dataOS >= inicio && dataOS <= fim;
      });

      setReportData({
        orcamentos: orcamentosFiltrados,
        ordens: osFiltradas,
        usuario: usuario
      });

      setShowReportDialog(false);
      setShowSearchDialog(false);
      setShowPdfDialog(true);
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calcularTotalOrcamentos = () => {
    return reportData.orcamentos.reduce((total: number, orc: any) => total + Number(orc.valor_total || 0), 0);
  };

  const calcularTotalOS = () => {
    return reportData.ordens.reduce((total: number, os: any) => total + Number(os.valor_total || 0), 0);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end items-center mb-6">
            <Button onClick={() => setShowSearchDialog(true)}>
              <Search className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>

          <div className="bg-card rounded-lg border p-8">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-4">Selecione um usuário para visualizar o relatório de movimentações</p>
              <p className="text-sm">Clique no botão "Gerar Relatório" no canto superior direito</p>
            </div>
          </div>

          <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Selecionar Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Usuário</label>
                  <Select value={selectedUsuario} onValueChange={setSelectedUsuario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((u) => (
                        <SelectItem key={u.id_usu} value={u.id_usu}>
                          {u.nome_usu} ({u.tipo_usu})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSearchDialog(false)}>Cancelar</Button>
                <Button onClick={() => {
                  if (selectedUsuario) {
                    setShowSearchDialog(false);
                    setShowReportDialog(true);
                  } else {
                    toast.error("Selecione um usuário");
                  }
                }}>
                  Gerar Relatório
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Período do Relatório</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Selecione o período de movimentação (máximo 3 meses)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data Início</label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      max={dataFim}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data Fim</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancelar</Button>
                <Button onClick={handleGerarRelatorio}>Gerar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Relatório de Movimentações</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 p-6 border rounded-lg">
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-primary">MecaPro</h2>
                  <p className="text-lg mt-2">Relatório de Movimentações</p>
                </div>

                <div className="space-y-2">
                  <p><strong>Usuário:</strong> {reportData.usuario?.nome_usu}</p>
                  <p><strong>Tipo:</strong> {reportData.usuario?.tipo_usu}</p>
                  <p><strong>CPF:</strong> {reportData.usuario?.cpf_usu}</p>
                  <p><strong>Período:</strong> {new Date(dataInicio).toLocaleDateString()} a {new Date(dataFim).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Orçamentos Criados</h3>
                  {reportData.orcamentos.length > 0 ? (
                    <div className="space-y-2">
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Número</th>
                            <th className="border p-2 text-left">Data</th>
                            <th className="border p-2 text-left">Veículo</th>
                            <th className="border p-2 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.orcamentos.map((orc: any) => (
                            <tr key={orc.id_orc}>
                              <td className="border p-2">{orc.numero_orc}</td>
                              <td className="border p-2">{new Date(orc.data_abertura).toLocaleDateString()}</td>
                              <td className="border p-2">{orc.veiculo?.placa_veic}</td>
                              <td className="border p-2 text-right">R$ {Number(orc.valor_total).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-muted font-semibold">
                            <td colSpan={3} className="border p-2 text-right">Total:</td>
                            <td className="border p-2 text-right">R$ {calcularTotalOrcamentos().toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum orçamento no período</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Ordens de Serviço</h3>
                  {reportData.ordens.length > 0 ? (
                    <div className="space-y-2">
                      <table className="w-full border-collapse border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left">Número</th>
                            <th className="border p-2 text-left">Data</th>
                            <th className="border p-2 text-left">Veículo</th>
                            <th className="border p-2 text-left">Status</th>
                            <th className="border p-2 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.ordens.map((os: any) => (
                            <tr key={os.id_os}>
                              <td className="border p-2">{os.numero_os}</td>
                              <td className="border p-2">{new Date(os.data_abertura).toLocaleDateString()}</td>
                              <td className="border p-2">{os.veiculo?.placa_veic}</td>
                              <td className="border p-2">{os.status}</td>
                              <td className="border p-2 text-right">R$ {Number(os.valor_total).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-muted font-semibold">
                            <td colSpan={4} className="border p-2 text-right">Total:</td>
                            <td className="border p-2 text-right">R$ {calcularTotalOS().toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma OS no período</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-right text-xl font-bold">
                    Total Geral: R$ {(calcularTotalOrcamentos() + calcularTotalOS()).toFixed(2)}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPdfDialog(false)}>Cancelar</Button>
                <Button onClick={handlePrint}>Imprimir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
