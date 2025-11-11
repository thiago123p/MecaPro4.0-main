import { forwardRef } from "react";

interface OSPrintTemplateProps {
  os: any;
  items: any[];
  veiculo: any;
  cliente: any;
  mecanico: any;
  showAllPages?: boolean;
}

export const OSPrintTemplate = forwardRef<HTMLDivElement, OSPrintTemplateProps>(
  ({ os, items, veiculo, cliente, mecanico, showAllPages = true }, ref) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR");
    };

    const calcularTotal = () => {
      return items.reduce((total, item) => {
        const valor = Number(item.valor || item.preco_peca || item.valor_serv || 0);
        const quantidade = Number(item.quantidade || 1);
        return total + (valor * quantidade);
      }, 0);
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

    // Determinar se deve mostrar todas as páginas (apenas primeira página se encerrada)
    const shouldShowAllPages = showAllPages && os.status !== "encerrada";

    return (
      <div ref={ref} className="bg-white">
        {/* PÁGINA 1: OS Principal */}
        <div className="p-8 page-break" style={{ width: "210mm", minHeight: "297mm" }}>
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

            {/* Checkbox OS e Status */}
            <div className="flex justify-between items-center px-4 py-2 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black bg-black"></div>
                <span className="font-bold">ORDEM DE SERVIÇO</span>
              </div>
              {os.status === "encerrada" && (
                <div className="flex gap-4">
                  <span className="font-bold text-red-600">STATUS: ENCERRADA</span>
                  {os.forma_pagamento && (
                    <span className="font-semibold">
                      Pagamento: {os.forma_pagamento.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
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
                    {os.numero_os || ""}
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
                    {formatDate(os.criado_em)}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <span className="font-semibold">Entrega em: </span>
                  <span className="border-b border-black inline-block w-32">
                    {os.finalizado_em ? formatDate(os.finalizado_em) : ""}
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
                    {os.observacao && (
                      <div className="mt-4 pt-2 border-t border-gray-300">
                        <span className="font-semibold">Observações: </span>
                        <span className="text-sm">{os.observacao}</span>
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

        {/* PÁGINA 2: Check-list */}
        {shouldShowAllPages && (
          <div className="p-8 page-break" style={{ width: "210mm", minHeight: "297mm" }}>
            <div className="border-2 border-black">
              {/* Cabeçalho */}
              <div className="flex items-center justify-center p-4 border-b-2 border-black">
                <div className="flex items-center gap-3">
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
                          key={`checklist-${i}`}
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

              <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-6">CHECK-LIST DE INSPEÇÃO</h2>
                
                <div className="mb-4">
                  <div className="flex gap-4 mb-2">
                    <span className="font-semibold">OS Nº:</span>
                    <span>{os.numero_os}</span>
                    <span className="font-semibold ml-8">Veículo:</span>
                    <span>{veiculo?.descricao_veic} - {veiculo?.placa_veic}</span>
                  </div>
                </div>

                {/* Sistema de Iluminação */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">SISTEMA DE ILUMINAÇÃO</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Farol Alto", "Farol Baixo", "Luz de Freio", "Luz de Ré", "Setas", "Lanternas"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sistema de Suspensão */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">SISTEMA DE SUSPENSÃO</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Amortecedores Dianteiros", "Amortecedores Traseiros", "Molas", "Bandejas", "Pivôs", "Buchas"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motor */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">MOTOR</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black"></div>
                      <span>Motor fumando (excesso de óleo queimado)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black"></div>
                      <span>Vazamento de óleo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-black"></div>
                      <span>Barulhos anormais</span>
                    </div>
                  </div>
                </div>

                {/* Sistema de Freios */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">SISTEMA DE FREIOS</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Pastilhas Dianteiras (mm):</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                      <div>
                        <span className="font-semibold">Pastilhas Traseiras (mm):</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Sapatas (mm):</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                      <div>
                        <span className="font-semibold">Discos/Tambores:</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pneus e Calibragem */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">PNEUS E CALIBRAGEM</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Dianteiro Esquerdo:</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                      <div>
                        <span className="font-semibold">Dianteiro Direito:</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Traseiro Esquerdo:</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                      <div>
                        <span className="font-semibold">Traseiro Direito:</span>
                        <div className="border-b-2 border-black mt-1"></div>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">Step (Estepe):</span>
                      <div className="border-b-2 border-black mt-1"></div>
                    </div>
                  </div>
                </div>

                {/* Assinatura */}
                <div className="mt-8 text-center">
                  <div className="border-t-2 border-black inline-block px-8 pt-2 min-w-[300px]">
                    <span className="font-semibold">MECÂNICO RESPONSÁVEL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA 3: Relatório de Serviço */}
        {shouldShowAllPages && (
          <div className="p-8 page-break" style={{ width: "210mm", minHeight: "297mm" }}>
            <div className="border-2 border-black">
              {/* Cabeçalho */}
              <div className="flex items-center justify-center p-4 border-b-2 border-black">
                <div className="flex items-center gap-3">
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
                          key={`relatorio-${i}`}
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

              <div className="p-6">
                <h2 className="text-2xl font-bold text-center mb-6">RELATÓRIO DE SERVIÇO</h2>
                
                <div className="mb-4">
                  <div className="flex gap-4 mb-2">
                    <span className="font-semibold">OS Nº:</span>
                    <span>{os.numero_os}</span>
                    <span className="font-semibold ml-8">Veículo:</span>
                    <span>{veiculo?.descricao_veic} - {veiculo?.placa_veic}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-semibold">Mecânico:</span>
                    <span>{mecanico?.nome_mec}</span>
                  </div>
                </div>

                {/* Revisão */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">REVISÃO REALIZADA</h3>
                  <div className="border-2 border-black p-3 min-h-[150px]">
                    <p className="text-sm text-gray-500 italic mb-2">
                      (Descreva os itens revisados, trocados ou verificados)
                    </p>
                  </div>
                </div>

                {/* Diagnóstico */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">DIAGNÓSTICO</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black"></div>
                        <span className="font-semibold">Problema Constatado</span>
                      </div>
                      <div className="flex items-center gap-2 ml-8">
                        <div className="w-5 h-5 border-2 border-black"></div>
                        <span className="font-semibold">Problema NÃO Constatado</span>
                      </div>
                    </div>
                    <div className="border-2 border-black p-3 min-h-[200px]">
                      <p className="text-sm text-gray-500 italic mb-2">
                        (Se constatado, descreva os sintomas, causa e solução aplicada. Se não constatado, relate as verificações realizadas)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Observações Gerais */}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3 bg-gray-200 p-2">OBSERVAÇÕES GERAIS</h3>
                  <div className="border-2 border-black p-3 min-h-[150px]">
                    <p className="text-sm text-gray-500 italic mb-2">
                      (Recomendações, serviços futuros necessários, etc.)
                    </p>
                  </div>
                </div>

                {/* Assinaturas */}
                <div className="mt-8 flex justify-around">
                  <div className="text-center">
                    <div className="border-t-2 border-black inline-block px-8 pt-2 min-w-[200px]">
                      <span className="font-semibold">MECÂNICO</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t-2 border-black inline-block px-8 pt-2 min-w-[200px]">
                      <span className="font-semibold">CLIENTE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

OSPrintTemplate.displayName = "OSPrintTemplate";
