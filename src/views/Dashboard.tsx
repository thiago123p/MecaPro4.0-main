import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar } from "@/components/layout/Sidebar";
import { orcamentoService } from "@/controllers/orcamentoService";
import { osService } from "@/controllers/osService";
import { TrendingUp, FileText, Wrench, Calendar } from "lucide-react";

export default function Dashboard() {
  const [meusOrcamentos, setMeusOrcamentos] = useState<any[]>([]);
  const [minhasOS, setMinhasOS] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    totalOS: 0,
    osAbertas: 0,
    osFechadas: 0
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      // Buscar TODOS os orçamentos e OS (não filtrar por usuário aqui)
      const todosOrcamentos = await orcamentoService.getAll(1000);
      const todasOS = await osService.getAll(1000);

      // Filtrar apenas os do usuário logado para o dashboard
      const orcamentosUsuario = todosOrcamentos.filter((orc: any) => orc.id_usu === userId);
      const osUsuario = todasOS.filter((os: any) => os.id_usu === userId);

      // Pegar apenas os 5 mais recentes
      setMeusOrcamentos(orcamentosUsuario.slice(0, 5));
      setMinhasOS(osUsuario.slice(0, 5));

      // Calcular estatísticas
      const osAbertas = osUsuario.filter((os: any) => os.status === 'aberta').length;
      const osFechadas = osUsuario.filter((os: any) => os.status === 'fechada' || os.status === 'finalizada').length;

      setStats({
        totalOrcamentos: orcamentosUsuario.length,
        totalOS: osUsuario.length,
        osAbertas,
        osFechadas
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const calcularPorcentagem = (parte: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((parte / total) * 100);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Meus Cadastros</h1>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrcamentos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
                <Wrench className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOS}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">OS Abertas</CardTitle>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.osAbertas}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {calcularPorcentagem(stats.osAbertas, stats.totalOS)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">OS Fechadas</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.osFechadas}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {calcularPorcentagem(stats.osFechadas, stats.totalOS)}% do total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Porcentagem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status das OS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">OS Abertas</span>
                      <span className="text-sm font-bold text-green-600">
                        {calcularPorcentagem(stats.osAbertas, stats.totalOS)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all" 
                        style={{ width: `${calcularPorcentagem(stats.osAbertas, stats.totalOS)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">OS Fechadas</span>
                      <span className="text-sm font-bold text-blue-600">
                        {calcularPorcentagem(stats.osFechadas, stats.totalOS)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all" 
                        style={{ width: `${calcularPorcentagem(stats.osFechadas, stats.totalOS)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Cadastros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Orçamentos</span>
                      <span className="text-sm font-bold text-purple-600">
                        {calcularPorcentagem(stats.totalOrcamentos, stats.totalOrcamentos + stats.totalOS)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full transition-all" 
                        style={{ width: `${calcularPorcentagem(stats.totalOrcamentos, stats.totalOrcamentos + stats.totalOS)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Ordens de Serviço</span>
                      <span className="text-sm font-bold text-orange-600">
                        {calcularPorcentagem(stats.totalOS, stats.totalOrcamentos + stats.totalOS)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div 
                        className="bg-orange-600 h-2.5 rounded-full transition-all" 
                        style={{ width: `${calcularPorcentagem(stats.totalOS, stats.totalOrcamentos + stats.totalOS)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabelas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Meus Últimos Orçamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meusOrcamentos.length > 0 ? (
                      meusOrcamentos.map((orc) => (
                        <TableRow key={orc.id_orc}>
                          <TableCell>{orc.numero_orc}</TableCell>
                          <TableCell>{formatarData(orc.data_abertura)}</TableCell>
                          <TableCell>{formatarValor(orc.valor_total || 0)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhum orçamento cadastrado por você
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minhas Últimas OS</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minhasOS.length > 0 ? (
                      minhasOS.map((os) => (
                        <TableRow key={os.id_os}>
                          <TableCell>{os.numero_os}</TableCell>
                          <TableCell>{formatarData(os.data_abertura)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              os.status === 'aberta' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {os.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Nenhuma OS cadastrada por você
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
