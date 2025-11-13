# 📋 Documentação de Atalhos de Teclado - MecaPro 4.0

## 🎯 Visão Geral

Este documento descreve o sistema completo de atalhos de teclado implementado no MecaPro 4.0, que permite navegação rápida e cadastro eficiente através de comandos do teclado.

## ⌨️ Atalhos Disponíveis

### 1️⃣ Atalhos de Navegação Rápida (Shift + Tecla)

Estes atalhos abrem a tela correspondente E o diálogo de cadastro automaticamente:

| Atalho | Ação | Descrição |
|--------|------|-----------|
| **Shift + C** | Cliente | Abre a tela de Clientes com o diálogo de cadastro |
| **Shift + V** | Veículo | Abre a tela de Veículos com o diálogo de cadastro |
| **Shift + U** | Usuário | Abre a tela de Usuários com o diálogo de cadastro |
| **Shift + M** | Mecânico | Abre a tela de Mecânicos com o diálogo de cadastro |
| **Shift + B** | Marca | Abre a tela de Marcas com o diálogo de cadastro |
| **Shift + P** | Peças | Abre a tela de Peças com o diálogo de cadastro |
| **Shift + S** | Serviços | Abre a tela de Serviços com o diálogo de cadastro |
| **Shift + O** | Orçamento | Abre a tela de Orçamentos com o diálogo de cadastro |
| **Shift + E** | OS | Abre a tela de Ordem de Serviço com o diálogo de cadastro |
| **Shift + R** | Relatório | Abre a tela de Relatórios com o diálogo de busca |

### 2️⃣ Atalho de Cadastro Rápido (Ctrl + +)

Este atalho abre o diálogo de cadastro **da tela atual** onde você está:

| Atalho | Ação | Descrição |
|--------|------|-----------|
| **Ctrl + (+)** | Novo Cadastro | Abre o diálogo de cadastro/adicionar da tela atual |

**Exemplos de uso:**
- Na tela de **Veículos**: `Ctrl + (+)` → Abre diálogo para cadastrar novo veículo
- Na tela de **OS**: `Ctrl + (+)` → Abre diálogo para criar nova Ordem de Serviço
- Na tela de **Relatórios**: `Ctrl + (+)` → Abre diálogo de busca de relatórios

### 3️⃣ Atalhos Específicos por Tela

Alguns atalhos funcionam apenas em telas específicas:

| Atalho | Tela | Ação | Descrição |
|--------|------|------|-----------|
| **Shift + Ctrl + C** | Peças | Controle de Estoque | Abre o diálogo de controle de estoque (apenas na tela de Peças) |

### 4️⃣ Atalho de Confirmação (Enter)

| Atalho | Ação | Descrição |
|--------|------|-----------|
| **Enter** | Salvar/Confirmar | Confirma a ação no diálogo aberto (salvar cadastro, confirmar exclusão, etc.) |

### 5️⃣ Atalho de Navegação/Logout (End)

| Atalho | Ação | Descrição |
|--------|------|-----------|
| **End** | Voltar/Sair | Em telas normais: volta para Dashboard. No Dashboard: faz logout |

**Como funciona:**
- **Em qualquer tela (exceto Dashboard)**: Pressione **End** → Volta para Dashboard
- **No Dashboard**: Pressione **End** → Faz logout e retorna para Login

**⚠️ Atenção:** O atalho **End** não funciona quando você está digitando em campos de texto.

## � Como Funciona

### Arquivos Criados

1. **`src/hooks/use-keyboard-shortcuts.tsx`**
   - Hook customizado para gerenciar atalhos de teclado globais
   - Detecta combinações de teclas (Shift, Ctrl)
   - Navega entre telas usando React Router

2. **`src/hooks/use-enter-key.tsx`**
   - Hook customizado para gerenciar a tecla Enter em formulários
   - Detecta quando o Enter é pressionado dentro de diálogos
   - Chama a função apropriada baseada no contexto

### Arquivos Modificados

Todos os arquivos de views foram atualizados para incluir os hooks:

- ✅ `src/App.tsx` - Integração do hook de atalhos globais
- ✅ `src/views/Cliente.tsx`
- ✅ `src/views/Veiculo.tsx`
- ✅ `src/views/Usuario.tsx`
- ✅ `src/views/Mecanico.tsx`
- ✅ `src/views/Marca.tsx`
- ✅ `src/views/Pecas.tsx`
- ✅ `src/views/Servicos.tsx`
- ✅ `src/views/Orcamento.tsx`
- ✅ `src/views/OS.tsx`
- ✅ `src/views/Relatorio.tsx`

## 🎯 Como Usar

### Navegação Rápida

1. Pressione **Shift + a tecla correspondente** para navegar rapidamente
2. Para telas que usam Ctrl adicional (Marca e OS), pressione **Shift + Ctrl + a tecla**

### Preenchimento de Formulários

1. Preencha os campos normalmente usando Tab para navegar
2. Ao terminar, pressione **Enter** para salvar
3. Em diálogos de confirmação, pressione **Enter** para confirmar ou **Esc** para cancelar

## 💡 Dicas de Produtividade

- Use os atalhos de navegação para trocar rapidamente entre telas sem usar o mouse
- Use Enter para salvar formulários rapidamente
- Combine Tab + Enter para navegação e salvamento ultra-rápidos
- Os atalhos respeitam o fluxo natural do sistema, não interferindo quando você está digitando

## 🐛 Solução de Problemas

**Os atalhos não funcionam?**
- Verifique se você não está em um campo de input/textarea
- Certifique-se de estar logado no sistema
- Teste se o Caps Lock está desativado

**A tecla Enter não está salvando?**
- Verifique se você está dentro de um diálogo aberto
- Certifique-se de que não está em um campo textarea (onde Enter cria quebra de linha)

## 📝 Notas de Desenvolvimento

- Os atalhos são case-insensitive (maiúsculas e minúsculas funcionam)
- O sistema detecta automaticamente o contexto para evitar conflitos
- Todos os atalhos podem ser desabilitados modificando os hooks personalizados
- A implementação é extensível para adicionar novos atalhos no futuro
