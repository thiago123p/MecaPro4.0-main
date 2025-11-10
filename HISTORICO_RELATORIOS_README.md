# Histórico de Relatórios - Instruções de Instalação

## 📋 O que foi implementado

Foi adicionada uma funcionalidade de histórico de relatórios na tela de Relatórios. Agora, sempre que um relatório é gerado, ele é automaticamente salvo no banco de dados com as seguintes informações:

- Data e hora da geração
- Usuário que foi consultado
- Usuário que gerou o relatório
- Período consultado (data início e fim)
- Quantidade de orçamentos encontrados
- Valor total dos orçamentos
- Quantidade de OS encontradas
- Valor total das OS
- Valor total geral

## 🗄️ Passo 1: Criar a tabela no banco de dados

Execute o script SQL que está no arquivo `backend/create_historico_relatorio.sql` no seu banco de dados PostgreSQL.

Você pode fazer isso de duas formas:

### Opção A: Usando pgAdmin
1. Abra o pgAdmin
2. Conecte ao seu banco de dados
3. Clique com botão direito no banco → Query Tool
4. Copie e cole o conteúdo do arquivo `create_historico_relatorio.sql`
5. Execute (F5 ou botão ▶)

### Opção B: Usando linha de comando
```bash
psql -U seu_usuario -d nome_do_banco -f backend/create_historico_relatorio.sql
```

## 🚀 Passo 2: Reiniciar o servidor

Após criar a tabela, reinicie o servidor backend:

```bash
cd backend
npm start
```

## ✅ Como usar

1. Acesse a tela de **Relatórios**
2. Você verá uma tabela com o histórico de todos os relatórios já gerados
3. Clique em **Gerar Relatório** para criar um novo
4. Selecione o usuário
5. Selecione o período
6. O relatório será gerado e automaticamente salvo no histórico
7. Você pode excluir registros do histórico clicando no ícone da lixeira 🗑️

## 📊 Informações exibidas no histórico

A tabela de histórico mostra:
- **Data/Hora Geração**: Quando o relatório foi gerado
- **Usuário Consultado**: Nome do usuário sobre quem foi o relatório
- **Período**: Intervalo de datas consultado
- **Orçamentos**: Quantidade e valor total
- **OS**: Quantidade e valor total
- **Valor Total**: Soma de orçamentos + OS
- **Ações**: Botão para excluir o registro

## 🔧 Arquivos modificados/criados

### Backend:
- ✅ `backend/create_historico_relatorio.sql` - Script de criação da tabela
- ✅ `backend/routes/historicoRelatorioRoutes.js` - Rotas da API
- ✅ `backend/server.js` - Adicionada rota do histórico

### Frontend:
- ✅ `src/controllers/historicoRelatorioService.ts` - Service para comunicação com API
- ✅ `src/views/Relatorio.tsx` - Tela atualizada com tabela de histórico

## 🎯 Funcionalidades

✅ Salvar automaticamente cada relatório gerado
✅ Listar todos os históricos em uma tabela
✅ Exibir informações completas (usuário, período, valores)
✅ Excluir registros do histórico
✅ Formatação adequada de datas e valores monetários
✅ Tratamento de erros com mensagens amigáveis

## 🔐 Segurança

- O sistema trata corretamente o usuário "admin" (converte para NULL no banco)
- Relacionamentos com CASCADE e SET NULL garantem integridade
- Índices criados para melhor performance nas consultas

---

**Pronto!** Agora sua tela de relatórios tem um histórico completo de todas as gerações! 🎉
