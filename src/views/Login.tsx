import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { usuarioService } from "@/controllers/usuarioService";

export default function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loginRecuperacao, setLoginRecuperacao] = useState("");
  const [showRecuperacao, setShowRecuperacao] = useState(false);
  const [palavraChave, setPalavraChave] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!login || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      // Login coringa admin - autenticação local
      if (login === "admin" && senha === "123") {
        localStorage.setItem("userType", "administrador");
        localStorage.setItem("userId", "admin");
        localStorage.setItem("userName", "Administrador");
        toast.success("Bem-vindo, Administrador!");
        navigate("/dashboard");
        return;
      }

      // Login normal: buscar usuário pelo nome
      const usuarios = await usuarioService.search(login);
      
      if (usuarios.length === 0) {
        toast.error("Usuário não encontrado");
        return;
      }

      const usuario = usuarios[0];
      
      // Verificar se a senha está correta (comparação direta, pois está no banco)
      if (usuario.senha_usu !== senha) {
        toast.error("Senha incorreta");
        return;
      }

      localStorage.setItem("userType", usuario.tipo_usu);
      localStorage.setItem("userId", usuario.id_usu);
      localStorage.setItem("userName", usuario.nome_usu);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
      
    } catch (error: any) {
      toast.error("Erro ao fazer login: " + error.message);
    }
  };

  const handleCancelar = () => {
    setLogin("");
    setSenha("");
  };

  const handleRecuperarSenha = async () => {
    if (!loginRecuperacao) {
      toast.error("Digite o login");
      return;
    }

    try {
      const usuarios = await usuarioService.search(loginRecuperacao);
      if (usuarios.length > 0 && usuarios[0].palavra_chave_usu) {
        setPalavraChave(usuarios[0].palavra_chave_usu);
        toast.success("Palavra-chave encontrada!");
      } else {
        toast.error("Usuário não encontrado ou sem palavra-chave cadastrada");
      }
    } catch (error) {
      toast.error("Erro ao buscar palavra-chave");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Logo MecaPro ao fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="text-[20rem] font-bold text-primary select-none">
          MecaPro
        </div>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-md bg-card rounded-lg shadow-2xl p-8 z-10 border-2 border-primary/20">
        <div className="flex items-center justify-center mb-8">
          <Settings className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold text-primary">MecaPro</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="login" className="text-foreground">
              Login
            </Label>
            <Input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="bg-background"
              placeholder="Nome de usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha" className="text-foreground">
              Senha
            </Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-background"
              placeholder="••••••••"
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleLogin} className="flex-1">
              Entrar
            </Button>
            <Button onClick={handleCancelar} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>

          <button
            onClick={() => setShowRecuperacao(true)}
            className="w-full text-sm text-primary hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>
      </div>

      {/* Dialog de Recuperação */}
      <Dialog open={showRecuperacao} onOpenChange={setShowRecuperacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Digite seu login para ver a palavra-chave de recuperação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginRecuperacao">Login</Label>
              <Input
                id="loginRecuperacao"
                value={loginRecuperacao}
                onChange={(e) => setLoginRecuperacao(e.target.value)}
                placeholder="Digite seu login"
              />
            </div>
            {palavraChave && (
              <div className="p-4 bg-secondary rounded-md">
                <p className="text-sm font-semibold">Palavra-chave:</p>
                <p className="text-lg">{palavraChave}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleRecuperarSenha} className="flex-1">
                Buscar
              </Button>
              <Button
                onClick={() => {
                  setShowRecuperacao(false);
                  setLoginRecuperacao("");
                  setPalavraChave("");
                }}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
