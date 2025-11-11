import { forwardRef } from "react";

interface OrcamentoPrintTemplateProps {
  orcamento: any;
  items: any[];
  veiculo: any;
  cliente: any;
}

export const OrcamentoPrintTemplate = forwardRef<HTMLDivElement, OrcamentoPrintTemplateProps>(
  ({ orcamento, items, veiculo, cliente }, ref) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    };

    // Serviços Terceiros: apenas serviços que tenham "terceiro" no nome/descrição
    const servicosTerceiros = items
      .filter((item) => {
        const isTerceiro = (item.tipo === "servico" || item.id_serv) && 
                          (item.descricao?.toLowerCase().includes("terceiro") || 
                           item.descricao_serv?.toLowerCase().includes("terceiro"));
        return isTerceiro;
      })
      .reduce((total, item) => {
        const valor = Number(item.valor || item.valor_serv || 0);
        const quantidade = Number(item.quantidade || 1);
        return total + (valor * quantidade);
      }, 0);

    // Material Usado: apenas peças
    const materialUsado = items
      .filter((item) => item.tipo === "peca" || item.id_peca)
      .reduce((total, item) => {
        const valor = Number(item.valor || item.preco_peca || 0);
        const quantidade = Number(item.quantidade || 1);
        return total + (valor * quantidade);
      }, 0);

    // Mão de Obra: serviços que NÃO são terceiros
    const maoDeObra = items
      .filter((item) => {
        const isServico = item.tipo === "servico" || item.id_serv;
        const isTerceiro = item.descricao?.toLowerCase().includes("terceiro") || 
                          item.descricao_serv?.toLowerCase().includes("terceiro");
        return isServico && !isTerceiro;
      })
      .reduce((total, item) => {
        const valor = Number(item.valor || item.valor_serv || 0);
        const quantidade = Number(item.quantidade || 1);
        return total + (valor * quantidade);
      }, 0);

    const calcularTotal = () => {
      return Number(orcamento.valor_total || 0);
    };

    return (
      <div ref={ref} className="bg-white">
        {/* Página do Orçamento */}
        <div className="p-8" style={{ width: "210mm", minHeight: "297mm" }}>
          {/* Cabeçalho */}
          <div className="border-2 border-black mb-4">
            <div className="flex items-center justify-center p-4 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <span className="text-4xl font-bold text-blue-600">MecaPro</span>
                  <svg viewBox="0 0 100 100" className="w-12 h-12 ml-2">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#2563eb" strokeWidth="3" />
                    <circle cx="50" cy="50" r="15" fill="none" stroke="#2563eb" strokeWidth="3" />
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
            </div>

            {/* Checkbox Orçamento */}
            <div className="flex justify-between items-center px-4 py-2 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black bg-black"></div>
                <span className="font-bold">ORÇAMENTO</span>
              </div>
            </div>

            {/* Dados do Cliente e Veículo */}
            <div className="p-4 space-y-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="font-semibold">Nome: </span>
                  <span className="border-b border-black inline-block min-w-[200px]">
                    {cliente?.nome_cli || ""}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Fone: </span>
                  <span className="border-b border-black inline-block min-w-[150px]">
                    {cliente?.celular_cli || cliente?.telefone_cli || ""}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="font-semibold">Endereço: </span>
                  <span className="border-b border-black inline-block min-w-[300px]">
                    {cliente?.endereco_cli || ""}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Nº: </span>
                  <span className="border-b border-black inline-block w-20">
                    {orcamento.numero_orc || ""}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <span className="font-semibold">Marca: </span>
                  <span className="border-b border-black inline-block w-32">
                    {veiculo?.marca_veic || veiculo?.nome_marca || ""}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Placa: </span>
                  <span className="border-b border-black inline-block w-32">
                    {veiculo?.placa_veic || ""}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Ano: </span>
                  <span className="border-b border-black inline-block w-24">
                    {veiculo?.ano_veic || ""}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <span className="font-semibold">Cor: </span>
                  <span className="border-b border-black inline-block w-32">
                    {veiculo?.cor_veic || ""}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Km: </span>
                  <span className="border-b border-black inline-block w-32">
                    {veiculo?.km_veic || ""}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Hora: </span>
                  <span className="border-b border-black inline-block w-24">
                    {new Date().toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div>
                  <span className="font-semibold">Entrada em: </span>
                  <span className="border-b border-black inline-block w-32">
                    {formatDate(orcamento.data_abertura)}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <span className="font-semibold">Entrega em: </span>
                  <span className="border-b border-black inline-block w-32">
                    {/* Campo vazio para preenchimento manual */}
                  </span>
                </div>
              </div>
            </div>

            {/* Serviços a Executar */}
            <div className="border-t-2 border-black">
              <div className="flex">
                <div className="flex-1 border-r-2 border-black p-4">
                  <h3 className="font-bold text-center mb-2">SERVIÇO A EXECUTAR</h3>
                  <div className="min-h-[200px] space-y-1">
                    {items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.descricao || item.descricao_peca || item.descricao_serv} 
                        {item.quantidade > 1 && ` (Qtd: ${item.quantidade})`}
                      </div>
                    ))}
                    {orcamento.observacao && (
                      <div className="mt-4 pt-2 border-t border-gray-300">
                        <span className="font-semibold">Observações: </span>
                        <span className="text-sm">{orcamento.observacao}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-32 p-4">
                  <h3 className="font-bold text-center mb-2">PREÇO</h3>
                  <div className="min-h-[200px] space-y-1">
                    {items.map((item, index) => (
                      <div key={index} className="text-sm text-right">
                        R$ {(
                          Number(item.valor || item.preco_peca || item.valor_serv || 0) *
                          Number(item.quantidade || 1)
                        ).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Orçamento Complementar */}
            <div className="border-t-2 border-black p-4">
              <h3 className="font-bold mb-2">ORÇAMENTO COMPLEMENTAR</h3>
              <div className="border border-black p-2 min-h-[80px]">
                <p className="text-sm text-gray-500 italic">
                  (Campo para preenchimento manual do mecânico)
                </p>
              </div>
            </div>

            {/* Totais */}
            <div className="border-t-2 border-black p-4">
              <div className="flex items-center mb-2">
                <span className="mr-2">Autorizo a execução dos serviços acima</span>
                <div className="flex-1 border-b border-black mx-2"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Serviços Terceiros:</span>
                  <div className="flex-1 border-2 border-black px-2 py-1 text-right">
                    R$ {servicosTerceiros.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Material Usado:</span>
                  <div className="flex-1 border-2 border-black px-2 py-1 text-right">
                    R$ {materialUsado.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Mão de Obra:</span>
                  <div className="flex-1 border-2 border-black px-2 py-1 text-right">
                    R$ {maoDeObra.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">TOTAL R$:</span>
                  <div className="flex-1 border-2 border-black px-2 py-1 text-right font-bold">
                    R$ {calcularTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="border-t-2 border-black inline-block px-8 pt-2 min-w-[300px]">
                  <span className="font-semibold">PROPRIETÁRIO DO VEÍCULO</span>
                </div>
              </div>
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

OrcamentoPrintTemplate.displayName = "OrcamentoPrintTemplate";
