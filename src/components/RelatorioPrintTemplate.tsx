import { forwardRef } from "react";

interface RelatorioPrintTemplateProps {
  usuario: any;
  dataInicio: string;
  dataFim: string;
  movimentacoes: any[];
}

export const RelatorioPrintTemplate = forwardRef<HTMLDivElement, RelatorioPrintTemplateProps>(
  ({ usuario, dataInicio, dataFim, movimentacoes }, ref) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    };

    const formatDateTime = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("pt-BR");
    };

    const formatCurrency = (value: number) => {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    const getAcaoLabel = (acao: string) => {
      const acoes: Record<string, string> = {
        criar: "Criação",
        editar: "Edição",
        excluir: "Exclusão",
        encerrar: "Encerramento",
      };
      return acoes[acao] || acao;
    };

    const getTipoLabel = (tipo: string) => {
      return tipo === "orcamento" ? "Orçamento" : "Ordem de Serviço";
    };

    const calcularSaldo = () => {
      return movimentacoes.reduce(
        (total, m) => total + Number(m.valor_total || 0),
        0
      );
    };

    const orcamentos = movimentacoes.filter((m) => m.tipo_movimentacao === "orcamento");
    const ordens = movimentacoes.filter((m) => m.tipo_movimentacao === "os");

    return (
      <div ref={ref} className="bg-white">
        <div className="p-8" style={{ width: "210mm", minHeight: "297mm" }}>
          {/* Cabeçalho */}
          <div className="border-2 border-black mb-6">
            {/* Logo e Título */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-blue-600">MecaPro</span>
                  <svg viewBox="0 0 100 100" className="w-10 h-10 ml-2">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="15"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                    />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                      const rad = (angle * Math.PI) / 180;
                      const x1 = 50 + 15 * Math.cos(rad);
                      const y1 = 50 + 15 * Math.sin(rad);
                      const x2 = 50 + 45 * Math.cos(rad);
                      const y2 = 50 + 45 * Math.sin(rad);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#2563eb"
                          strokeWidth="3"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Data de Emissão:</p>
                <p className="font-semibold">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>

            <div className="bg-blue-600 text-white px-4 py-3 text-center">
              <h2 className="text-xl font-bold">EXTRATO DE MOVIMENTAÇÕES</h2>
            </div>

            {/* Dados do Usuário */}
            <div className="p-6 bg-gray-50 border-b-2 border-black">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Usuário:</p>
                  <p className="font-bold text-lg">{usuario?.nome_usu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">CPF:</p>
                  <p className="font-semibold">{usuario?.cpf_usu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo:</p>
                  <p className="font-semibold capitalize">{usuario?.tipo_usu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Período:</p>
                  <p className="font-semibold">
                    {formatDate(dataInicio)} a {formatDate(dataFim)}
                  </p>
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="p-4 bg-blue-50 border-b-2 border-black">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Orçamentos</p>
                  <p className="text-xl font-bold text-blue-600">{orcamentos.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total OS</p>
                  <p className="text-xl font-bold text-green-600">{ordens.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Movimentações</p>
                  <p className="text-xl font-bold text-purple-600">
                    {movimentacoes.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Movimentações */}
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 text-blue-600 border-b pb-2">
                HISTÓRICO DE MOVIMENTAÇÕES
              </h3>

              {movimentacoes.length > 0 ? (
                <div className="space-y-3">
                  {movimentacoes.map((mov, index) => (
                    <div
                      key={mov.id_log || index}
                      className="border-l-4 border-blue-500 bg-gray-50 p-3 hover:bg-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              {getTipoLabel(mov.tipo_movimentacao)} #{mov.numero_registro}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded capitalize">
                              {getAcaoLabel(mov.acao)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(mov.data_movimentacao)}
                          </p>
                          {mov.detalhes && (
                            <p className="text-xs text-gray-500 mt-1">{mov.detalhes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(Number(mov.valor_total || 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma movimentação no período
                </p>
              )}
            </div>

            {/* Totalizador */}
            <div className="border-t-2 border-black bg-blue-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-90">Saldo Total do Período</p>
                  <p className="text-xs opacity-75">
                    {movimentacoes.length} movimentação(ões)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatCurrency(calcularSaldo())}
                  </p>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-600">
              <p>
                Este é um documento gerado automaticamente pelo sistema MecaPro 4.0
              </p>
              <p>
                Para mais informações, entre em contato com o administrador do sistema
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            .page-break {
              page-break-after: always;
            }
          }
        `}</style>
      </div>
    );
  }
);

RelatorioPrintTemplate.displayName = "RelatorioPrintTemplate";
