import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import { usuarioService } from "@/controllers/usuarioService";
import { orcamentoService } from "@/controllers/orcamentoService";
import { osService } from "@/controllers/osService";
import { historicoRelatorioService, HistoricoRelatorio } from "@/controllers/historicoRelatorioService";
import { logMovimentacoesService, LogMovimentacao } from "@/controllers/logMovimentacoesService";
import { Usuario } from "@/models/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RelatorioPDFPreviewDialog } from "@/components/RelatorioPDFPreviewDialog";
import { RelatorioPrintTemplate } from "@/components/RelatorioPrintTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEnterKey } from "@/hooks/use-enter-key";
import { useAddShortcut } from "@/hooks/use-add-shortcut";

export default function Relatorio() {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintConfirmDialog, setShowPrintConfirmDialog] = useState(false);
  const [showPrintPreviewDialog, setShowPrintPreviewDialog] = useState(false);
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [reportData, setReportData] = useState<any>({
    movimentacoes: [],
    usuario: null
  });
  
  const [historico, setHistorico] = useState<HistoricoRelatorio[]>([]);
  const [historicoToDelete, setHistoricoToDelete] = useState<string | null>(null);
  const [historicoToPrint, setHistoricoToPrint] = useState<HistoricoRelatorio | null>(null);
  const [printData, setPrintData] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsuarios();
    loadHistorico();
    setMaxDates();
  }, []);

  // Ouvir evento de quick access
  useEffect(() => {
    const handleQuickAccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.type === 'relatorio') {
        setShowSearchDialog(true);
      }
    };

    window.addEventListener('quick-access-open', handleQuickAccess);
    return () => window.removeEventListener('quick-access-open', handleQuickAccess);
  }, []);

  // Hook para o botão Enter nos dialogs
  const handleEnterKey = useCallback(() => {
    if (showSearchDialog) {
      handleGerarRelatorio();
    } else if (showDeleteDialog) {
      confirmDeleteHistorico();
    }
  }, [showSearchDialog, showDeleteDialog]);

  useEnterKey({
    onEnter: handleEnterKey,
    enabled: showSearchDialog || showDeleteDialog,
  });

  // Hook para Ctrl + (+) abrir diálogo de busca/cadastro
  useAddShortcut(() => {
    setShowSearchDialog(true);
  });

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

  const loadHistorico = async () => {
    try {
      const data = await historicoRelatorioService.getAll();
      setHistorico(data);
    } catch (error) {
      console.warn("Histórico não disponível:", error);
      setHistorico([]); // Define array vazio se der erro
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
      console.log("[RELATORIO] Gerando relatório para usuário:", selectedUsuario);
      console.log("[RELATORIO] Período:", dataInicio, "até", dataFim);
      
      const usuario = usuarios.find(u => u.id_usu === selectedUsuario);
      
      // Buscar movimentações do log
      const movimentacoes = await logMovimentacoesService.getByUsuario(
        selectedUsuario,
        `${dataInicio} 00:00:00`,
        `${dataFim} 23:59:59`
      );

      console.log("[RELATORIO] Movimentações encontradas:", movimentacoes.length);

      // Separar por tipo
      const orcamentos = movimentacoes.filter(m => m.tipo_movimentacao === 'orcamento');
      const ordens = movimentacoes.filter(m => m.tipo_movimentacao === 'os');

      console.log("[RELATORIO] Orçamentos:", orcamentos.length);
      console.log("[RELATORIO] OS:", ordens.length);

      setReportData({
        movimentacoes,
        orcamentos,
        ordens,
        usuario: usuario
      });

      // Calcular totais
      const valorTotalOrcamentos = orcamentos.reduce((total: number, m: LogMovimentacao) => total + Number(m.valor_total || 0), 0);
      const valorTotalOS = ordens.reduce((total: number, m: LogMovimentacao) => total + Number(m.valor_total || 0), 0);
      const valorTotalGeral = valorTotalOrcamentos + valorTotalOS;

      console.log("[RELATORIO] Totais calculados:", {
        valorTotalOrcamentos,
        valorTotalOS,
        valorTotalGeral
      });

      // Salvar no histórico (se disponível)
      try {
        await historicoRelatorioService.create({
          id_usuario_consultado: selectedUsuario,
          id_usuario_gerador: localStorage.getItem('userId') || 'admin',
          data_inicio: dataInicio,
          data_fim: dataFim,
          total_orcamentos: orcamentos.length,
          valor_total_orcamentos: valorTotalOrcamentos,
          total_os: ordens.length,
          valor_total_os: valorTotalOS,
          valor_total_geral: valorTotalGeral
        });
        // Recarregar histórico
        loadHistorico();
      } catch (histError) {
        console.warn("Não foi possível salvar no histórico:", histError);
        // Continua mesmo se falhar ao salvar histórico
      }

      setShowReportDialog(false);
      setShowSearchDialog(false);
      // Não abrir mais o dialog antigo - usuário verá no histórico
      toast.success("Relatório gerado e salvo no histórico! Use o botão de impressora para visualizar.");
    } catch (error) {
      console.error("[RELATORIO] Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório");
    }
  };

  const calcularTotalOrcamentos = () => {
    return reportData.orcamentos?.reduce((total: number, m: LogMovimentacao) => total + Number(m.valor_total || 0), 0) || 0;
  };

  const calcularTotalOS = () => {
    return reportData.ordens?.reduce((total: number, m: LogMovimentacao) => total + Number(m.valor_total || 0), 0) || 0;
  };

  const handleDeleteHistorico = (id: string) => {
    setHistoricoToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteHistorico = async () => {
    if (!historicoToDelete) return;
    
    try {
      await historicoRelatorioService.delete(historicoToDelete);
      loadHistorico();
      toast.success("Histórico excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir histórico");
    } finally {
      setShowDeleteDialog(false);
      setHistoricoToDelete(null);
    }
  };

  // Função para abrir dialog de confirmação de impressão
  const handleImprimirRelatorio = (relatorio: HistoricoRelatorio) => {
    setHistoricoToPrint(relatorio);
    setShowPrintConfirmDialog(true);
  };

  // Função para visualizar impressão (abre preview)
  const handleVisualizarImpressao = async () => {
    if (!historicoToPrint) return;

    try {
      setShowPrintConfirmDialog(false);
      
      console.log("[VISUALIZAR IMPRESSAO] Relatório selecionado:", historicoToPrint);
      
      // Preparar dados para impressão
      const usuario = usuarios.find(u => u.id_usu === historicoToPrint.id_usuario_consultado);
      
      console.log("[VISUALIZAR IMPRESSAO] Usuário encontrado:", usuario);
      
      // Converter datas ISO para formato YYYY-MM-DD HH:MM:SS
      const dataInicioDate = new Date(historicoToPrint.data_inicio);
      const dataFimDate = new Date(historicoToPrint.data_fim);
      
      // Formatar para YYYY-MM-DD HH:MM:SS
      const formatarDataParaSQL = (data: Date, hora: string) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia} ${hora}`;
      };
      
      const dataInicioFormatada = formatarDataParaSQL(dataInicioDate, '00:00:00');
      const dataFimFormatada = formatarDataParaSQL(dataFimDate, '23:59:59');
      
      console.log("[VISUALIZAR IMPRESSAO] Buscando movimentações do período:", {
        inicio: dataInicioFormatada,
        fim: dataFimFormatada
      });
      
      const movimentacoes = await logMovimentacoesService.getByUsuario(
        historicoToPrint.id_usuario_consultado || '', 
        dataInicioFormatada, 
        dataFimFormatada
      );
      
      console.log("[VISUALIZAR IMPRESSAO] Movimentações recebidas:", movimentacoes);
      console.log("[VISUALIZAR IMPRESSAO] Total de movimentações:", movimentacoes.length);

      setPrintData({
        usuario: usuario,
        dataInicio: historicoToPrint.data_inicio,
        dataFim: historicoToPrint.data_fim,
        movimentacoes: movimentacoes
      });

      setShowPrintPreviewDialog(true);
    } catch (error) {
      console.error("Erro ao preparar impressão:", error);
      toast.error("Erro ao preparar impressão do relatório");
    }
  };

  // Função para gerar PDF
  const handlePrintRelatorio = async () => {
    if (!printRef.current || !printData) return;

    setIsGeneratingPDF(true);

    try {
      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const usuario = printData.usuario;
      const dataInicioFormatada = new Date(printData.dataInicio).toLocaleDateString('pt-BR');
      const dataFimFormatada = new Date(printData.dataFim).toLocaleDateString('pt-BR');
      const fileName = `Relatorio_${usuario?.nome_usu || 'Usuario'}_${dataInicioFormatada.replace(/\//g, '-')}_a_${dataFimFormatada.replace(/\//g, '-')}.pdf`;

      pdf.save(fileName);
      
      toast.success("PDF gerado com sucesso!");
      setShowPrintPreviewDialog(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

          <div className="bg-card rounded-lg border p-8 mb-8">
            <h2 className="text-xl font-bold mb-6">Histórico de Relatórios Gerados</h2>
            
            {historico.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Nenhum relatório foi gerado ainda</p>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora Geração</TableHead>
                      <TableHead>Usuário Consultado</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Orçamentos</TableHead>
                      <TableHead>OS</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico.map((item) => (
                      <TableRow key={item.id_historico}>
                        <TableCell>{formatarDataHora(item.data_geracao)}</TableCell>
                        <TableCell>{item.nome_usuario_consultado || '-'}</TableCell>
                        <TableCell>
                          {formatarData(item.data_inicio)} até {formatarData(item.data_fim)}
                        </TableCell>
                        <TableCell>
                          {item.total_orcamentos} ({formatarValor(item.valor_total_orcamentos)})
                        </TableCell>
                        <TableCell>
                          {item.total_os} ({formatarValor(item.valor_total_os)})
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatarValor(item.valor_total_geral)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleImprimirRelatorio(item)}
                              title="Imprimir relatório"
                            >
                              <Printer className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteHistorico(item.id_historico)}
                              title="Excluir relatório"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este registro do histórico? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteHistorico}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de confirmação de impressão */}
          <AlertDialog open={showPrintConfirmDialog} onOpenChange={setShowPrintConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Imprimir Relatório</AlertDialogTitle>
                <AlertDialogDescription>
                  {historicoToPrint && (
                    <div className="space-y-2 mt-4">
                      <p><strong>Usuário:</strong> {historicoToPrint.nome_usuario_consultado}</p>
                      <p><strong>Período:</strong> {formatarData(historicoToPrint.data_inicio)} até {formatarData(historicoToPrint.data_fim)}</p>
                      <p><strong>Total de Orçamentos:</strong> {historicoToPrint.total_orcamentos} ({formatarValor(historicoToPrint.valor_total_orcamentos)})</p>
                      <p><strong>Total de OS:</strong> {historicoToPrint.total_os} ({formatarValor(historicoToPrint.valor_total_os)})</p>
                      <p className="font-bold text-lg mt-2"><strong>Valor Total:</strong> {formatarValor(historicoToPrint.valor_total_geral)}</p>
                    </div>
                  )}
                  <p className="mt-4">Deseja visualizar a pré-visualização do relatório?</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleVisualizarImpressao}>Visualizar Impressão</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Dialog de pré-visualização de impressão */}
          <RelatorioPDFPreviewDialog
            open={showPrintPreviewDialog}
            onClose={() => setShowPrintPreviewDialog(false)}
            onPrint={handlePrintRelatorio}
            printData={printData}
            isGenerating={isGeneratingPDF}
          />

          {/* Template de impressão oculto */}
          <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            {printData && (
              <RelatorioPrintTemplate
                ref={printRef}
                usuario={printData.usuario}
                dataInicio={printData.dataInicio}
                dataFim={printData.dataFim}
                movimentacoes={printData.movimentacoes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
