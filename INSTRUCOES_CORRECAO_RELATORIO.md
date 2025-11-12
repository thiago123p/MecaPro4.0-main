# 🔧 Instruções para Correção do Sistema de Relatórios

## ⚠️ Problema Identificado

O sistema de relatórios não estava mostrando movimentações porque:
1. A tabela `log_movimentacoes` não existe no banco de dados
2. O sistema antigo buscava diretamente nas tabelas de orçamentos e OS (não registrava edições/exclusões/encerramentos)

## ✅ Solução Implementada

### 1. **Sistema de Auditoria Completo**
- Criada tabela `log_movimentacoes` que registra TODAS as ações dos usuários
- Backend modificado para registrar automaticamente:
  - **Orçamentos**: criar, editar, excluir
  - **OS**: criar, editar, encerrar
- Cada registro inclui: usuário, tipo, ação, número, valor e data/hora

### 2. **Novo Fluxo de Relatórios**
- Relatórios agora buscam dados do log de movimentações
- Histórico salvo automaticamente ao gerar relatório
- Botão de impressora no histórico para visualizar e imprimir

### 3. **Impressão Profissional**
- Template estilo extrato bancário
- Fluxo: Confirmação → Preview → PDF
- Design com logo, badges coloridos e totalizadores

---

## 📋 PASSOS PARA CORREÇÃO

### **Passo 1: Executar Script SQL**

Execute o arquivo SQL no seu banco PostgreSQL:

```powershell
# No PowerShell, navegue até a pasta backend/migrations
cd "c:\Users\thiag\OneDrive\Documentos\TADS\TCC\Meu TCC - MecaPro4.0\Programa MecaPro4.0\MecaPro4.0-main\MecaPro4.0-main\backend\migrations"

# Execute o script
psql -U postgres -d MecaPro4.0 -f 002_criar_tabela_log_e_historico.sql
```

**OU use o pgAdmin:**
1. Abra o pgAdmin
2. Conecte ao banco `MecaPro4.0`
3. Clique com botão direito no banco → Query Tool
4. Abra o arquivo `backend/migrations/002_criar_tabela_log_e_historico.sql`
5. Execute (F5)

**Verificação:**
Você deve ver a mensagem:
```
tabela              | status
--------------------+--------
log_movimentacoes   | CRIADA
historico_relatorio | CRIADA
```

---

### **Passo 2: Reiniciar o Backend**

```powershell
# Pare o servidor se estiver rodando (Ctrl+C)

# Reinicie o backend
cd "c:\Users\thiag\OneDrive\Documentos\TADS\TCC\Meu TCC - MecaPro4.0\Programa MecaPro4.0\MecaPro4.0-main\MecaPro4.0-main\backend"
node server.js
```

**Verificação:**
O console deve mostrar:
```
Servidor rodando na porta 3000
Conectado ao banco de dados PostgreSQL
```

---

### **Passo 3: Testar o Sistema**

#### 3.1. Gerar Movimentações
1. Acesse o sistema
2. **Crie alguns orçamentos** (pelo menos 2)
3. **Crie algumas OS** (pelo menos 2)
4. **Edite** um orçamento existente
5. **Encerre** uma OS
6. **Exclua** um orçamento

#### 3.2. Gerar Relatório
1. Vá para a tela **Relatório**
2. Clique em **"Gerar Relatório"**
3. Selecione o **usuário** que fez as movimentações
4. Escolha o **período** (data início e fim)
5. Clique em **"Gerar"**

**✅ Resultado Esperado:**
- Mensagem: "Relatório gerado e salvo no histórico!"
- Relatório aparece na tabela de histórico
- Colunas mostram: Orçamentos (quantidade e valor), OS (quantidade e valor), Valor Total

#### 3.3. Testar Impressão
1. Na tabela de **Histórico de Relatórios Gerados**
2. Clique no **ícone azul de impressora** 📄
3. **Dialog de Confirmação** deve aparecer com:
   - Usuário
   - Período
   - Total de Orçamentos
   - Total de OS
   - Valor Total
4. Clique em **"Visualizar Impressão"**
5. **Preview** aparece em estilo extrato bancário
6. Clique em **"Imprimir"**
7. **PDF** é gerado e baixado automaticamente

---

## 🐛 Troubleshooting

### Problema: "Nenhuma movimentação no período"

**Causas possíveis:**
1. Tabela `log_movimentacoes` não foi criada
2. Backend não está registrando movimentações
3. Período selecionado está incorreto

**Soluções:**
```sql
-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'log_movimentacoes'
);
-- Resultado esperado: true

-- Verificar se há registros na tabela
SELECT COUNT(*) FROM log_movimentacoes;
-- Deve retornar número > 0 se você já criou orçamentos/OS

-- Ver os últimos registros
SELECT * FROM log_movimentacoes 
ORDER BY data_movimentacao DESC 
LIMIT 10;
```

### Problema: Backend não registra movimentações

**Verificar:**
1. Console do backend deve mostrar:
   ```
   ✓ Movimentação registrada: orcamento - criar - Usuário: [id]
   ```

2. Se mostrar aviso:
   ```
   ⚠️ Tabela log_movimentacoes não existe
   ```
   → Execute o script SQL novamente (Passo 1)

### Problema: Relatório zerado mesmo com movimentações

**Debug:**
```sql
-- Verificar usuários
SELECT id_usu, nome_usu, cpf_usu FROM usuario;

-- Verificar movimentações de um usuário específico
SELECT * FROM log_movimentacoes 
WHERE id_usuario = '[ID_DO_USUARIO]'
ORDER BY data_movimentacao DESC;

-- Verificar com período
SELECT * FROM log_movimentacoes 
WHERE id_usuario = '[ID_DO_USUARIO]'
  AND data_movimentacao >= '2025-11-01 00:00:00'
  AND data_movimentacao <= '2025-11-30 23:59:59'
ORDER BY data_movimentacao DESC;
```

---

## 📊 Estrutura do Log

Cada movimentação registra:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `id_usuario` | Quem fez a ação | UUID do usuário |
| `tipo_movimentacao` | Tipo de registro | 'orcamento' ou 'os' |
| `acao` | Ação realizada | 'criar', 'editar', 'excluir', 'encerrar' |
| `id_registro` | ID do orçamento/OS | UUID |
| `numero_registro` | Número sequencial | 1, 2, 3... |
| `valor_total` | Valor do registro | 1500.00 |
| `data_movimentacao` | Quando aconteceu | 2025-11-11 14:30:00 |

---

## 🎯 Checklist de Verificação

- [ ] Script SQL executado com sucesso
- [ ] Tabelas `log_movimentacoes` e `historico_relatorio` criadas
- [ ] Backend reiniciado
- [ ] Orçamentos e OS criados após a migração
- [ ] Logs aparecendo no console do backend
- [ ] Relatório gerado aparece no histórico
- [ ] Botão de impressora funciona
- [ ] Preview exibe movimentações
- [ ] PDF gerado com sucesso

---

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique o console do **backend** para erros
2. Verifique o console do **navegador** (F12) para erros
3. Execute as queries SQL de verificação acima
4. Certifique-se que todas as movimentações foram feitas **APÓS** executar o script

---

## ✨ Funcionalidades Adicionadas

✅ Sistema completo de auditoria  
✅ Registro automático de todas as ações  
✅ Relatório com histórico persistente  
✅ Impressão profissional em PDF  
✅ Template estilo extrato bancário  
✅ Preview antes de imprimir  
✅ Badges coloridos por tipo de ação  
✅ Totalizadores automáticos
