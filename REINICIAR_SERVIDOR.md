# 🔄 Como Reiniciar o Servidor

## Problema Identificado
As alterações no código não aparecem porque o servidor backend está rodando com a versão antiga do código.

## ✅ Solução: Reiniciar o Servidor

### Passo 1: Parar o servidor atual
No terminal onde o servidor está rodando (Node), pressione:
```
Ctrl + C
```

### Passo 2: Iniciar o servidor novamente
```bash
cd backend
npm start
```

## 🔍 Como saber se funcionou

Você verá estas mensagens no console:
```
🚀 Servidor rodando na porta 3000
✅ Conectado ao banco de dados PostgreSQL
🕒 Horário do banco: [DATA E HORA ATUAL]
```

## ⚠️ Se ainda houver problemas

1. **Limpar o cache do navegador**
   - Chrome: Ctrl + Shift + Delete
   - Limpar "Imagens e arquivos em cache"

2. **Verificar se o frontend está atualizado**
   ```bash
   cd ..
   npm run dev
   ```

3. **Verificar logs do backend**
   - Ao fazer uma requisição, você verá logs detalhados com emojis:
   - 📝 = Recebendo dados
   - 🔍 = Verificando
   - 🔐 = Gerando hash
   - 💾 = Salvando no banco
   - ✅ = Sucesso
   - ❌ = Erro

## 📊 Testando cada tela

Após reiniciar, teste:
- ✅ Tela de Usuários
- ✅ Tela de Serviços
- ✅ Tela de Peças
- ✅ Tela de Clientes
- ✅ Tela de Mecânicos
- ✅ Tela de Veículos
- ✅ Tela de Marcas

Se alguma tela não mostrar dados, verifique o console do backend para ver os logs detalhados.
