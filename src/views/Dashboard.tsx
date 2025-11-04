import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/layout/Sidebar";
import { clienteService } from "@/controllers/clienteService";
import { veiculoService } from "@/controllers/veiculoService";
import { osService } from "@/controllers/osService";
import { mecanicoService } from "@/controllers/mecanicoService";
import { Cliente, Veiculo, Mecanico } from "@/models/types";

export default function Dashboard() {
  const [ultimosClientes, setUltimosClientes] = useState<Cliente[]>([]);
  const [ultimosVeiculos, setUltimosVeiculos] = useState<Veiculo[]>([]);
  const [ultimasOS, setUltimasOS] = useState<any[]>([]);
  const [ultimosMecanicos, setUltimosMecanicos] = useState<Mecanico[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const clientes = await clienteService.getAll(5);
      const veiculos = await veiculoService.getAll(5);
      const os = await osService.getAll(5);
      const mecanicos = await mecanicoService.getAll(5);
      
      setUltimosClientes(clientes);
      setUltimosVeiculos(veiculos);
      setUltimasOS(os);
      setUltimosMecanicos(mecanicos);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Clientes Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ultimosClientes.length > 0 ? (
                      ultimosClientes.map((cliente) => (
                        <TableRow key={cliente.id_cli}>
                          <TableCell>{cliente.nome_cli}</TableCell>
                          <TableCell>{cliente.cpf_cli}</TableCell>
                          <TableCell>{cliente.telefone_cli || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum cliente cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Veículos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Placa</TableHead>
                      <TableHead>Ano</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ultimosVeiculos.length > 0 ? (
                      ultimosVeiculos.map((veiculo) => (
                        <TableRow key={veiculo.id_veic}>
                          <TableCell>{veiculo.descricao_veic}</TableCell>
                          <TableCell>{veiculo.placa_veic}</TableCell>
                          <TableCell>{veiculo.ano_veic || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum veículo cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas OS</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ultimasOS.length > 0 ? (
                      ultimasOS.map((os) => (
                        <TableRow key={os.id_os}>
                          <TableCell>{os.numero_os}</TableCell>
                          <TableCell>{os.veiculo?.placa_veic || "-"}</TableCell>
                          <TableCell>{os.status}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhuma OS cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Mecânicos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ultimosMecanicos.length > 0 ? (
                      ultimosMecanicos.map((mecanico) => (
                        <TableRow key={mecanico.id_mec}>
                          <TableCell>{mecanico.nome_mec}</TableCell>
                          <TableCell>{mecanico.cpf_mec}</TableCell>
                          <TableCell>{mecanico.telefone_mec || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum mecânico cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
