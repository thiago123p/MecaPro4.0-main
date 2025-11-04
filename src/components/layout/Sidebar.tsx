import { Link, useLocation, useNavigate } from "react-router-dom";
import { Settings, LogOut, Users, Wrench, User, Car, Package, Database, ShoppingCart, FileText, ClipboardList, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");

  const handleSair = () => {
    // Limpa os dados da sessão
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    
    // Redireciona para a tela de login
    navigate("/");
  };

  const menuItems = [
    { icon: Users, label: "Cliente", path: "/cliente" },
    { icon: Wrench, label: "Mecânico", path: "/mecanico" },
    { icon: User, label: "Usuário", path: "/usuario", adminOnly: true },
    { icon: Car, label: "Veículo", path: "/veiculo" },
    { icon: Package, label: "Peças", path: "/pecas" },
    { icon: Database, label: "Marca", path: "/marca" },
    { icon: ShoppingCart, label: "Serviços", path: "/servicos" },
    { icon: FileText, label: "Orçamentos", path: "/orcamento" },
    { icon: ClipboardList, label: "OS", path: "/os" },
    { icon: BarChart, label: "Relatório", path: "/relatorio", adminOnly: true },
  ];

  return (
    <div className="w-64 h-screen bg-primary text-primary-foreground flex flex-col">
      <div className="p-4 border-b border-primary-foreground/20">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-2xl font-bold">MecaPro</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.adminOnly && userType !== "administrador") {
            return null;
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 text-left"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-foreground/20">
        <Button
          onClick={handleSair}
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
