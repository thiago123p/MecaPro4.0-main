# Guia de Correção de Charset UTF-8 - MecaPro 4.0

## ✅ Correções Aplicadas

### 1. **Backend - Configuração do Pool PostgreSQL (db.js)**
- ✅ Adicionado `client_encoding: 'UTF8'` no pool de conexões
- ✅ Configurado `SET CLIENT_ENCODING TO 'UTF8'` na inicialização

### 2. **Backend - Servidor Express (server.js)**
- ✅ Adicionado middleware para definir `Content-Type: application/json; charset=utf-8`
- ✅ Configurado `express.json({ charset: 'utf-8' })`
- ✅ Configurado `express.urlencoded({ extended: true, charset: 'utf-8' })`

### 3. **Frontend - HTML (index.html)**
- ✅ Meta tag charset UTF-8 já estava presente
- ✅ Adicionado meta tag adicional `http-equiv="Content-Type"`
- ✅ Alterado lang de "en" para "pt-BR"

### 4. **Script SQL de Verificação (fix-charset.sql)**
- ✅ Criado script para verificar encoding do banco
- ✅ Incluído comandos para corrigir dados existentes se necessário

---

## 🔧 Passos para Aplicar

### **Passo 1: Reiniciar o Servidor Backend**
```powershell
# Pare o servidor atual (Ctrl+C no terminal)
# Depois reinicie:
cd backend
node server.js
```

### **Passo 2: Verificar o Encoding do Banco de Dados**
Execute no PostgreSQL (pgAdmin ou psql):
```sql
SELECT pg_encoding_to_char(encoding) as encoding 
FROM pg_database 
WHERE datname = 'MecaPro4.0';
```
- **Resultado esperado:** `UTF8`
- Se não for UTF8, será necessário recriar o banco

### **Passo 3: Limpar Cache do Navegador**
- Pressione `Ctrl + Shift + Delete`
- Limpe cache e cookies
- Ou use modo anônimo para testar

### **Passo 4: Reiniciar o Frontend**
```powershell
# Pare o servidor atual (Ctrl+C)
# Reinicie:
npm run dev
```

---

## 🔍 Verificação

### **Teste 1: Criar novo serviço com acentuação**
1. Acesse a tela de Serviços
2. Clique em "Novo Serviço"
3. Digite: "Troca de Óleo" na descrição
4. Salve
5. Verifique se aparece corretamente na listagem

### **Teste 2: Verificar no Banco de Dados**
```sql
SELECT descricao_serv FROM servicos WHERE descricao_serv LIKE '%Óleo%';
```
- Deve retornar com o "Ó" correto

### **Teste 3: API Response**
Abra o Developer Tools (F12) > Network > Headers
- Verifique se aparece: `Content-Type: application/json; charset=utf-8`

---

## 🛠️ Solução para Dados Existentes com Problema

Se os dados já salvos ainda aparecem com "�", execute:

```sql
-- Atualizar dados existentes (USE COM CUIDADO!)
UPDATE servicos 
SET descricao_serv = REPLACE(descricao_serv, '�', 'ó')
WHERE descricao_serv LIKE '%�%';
```

Ou corrija manualmente cada registro pela interface.

---

## 📋 Checklist

- [x] Configuração do pool PostgreSQL com UTF-8
- [x] Middleware Express com charset UTF-8
- [x] HTML com meta charset correto
- [x] Script SQL de verificação criado
- [ ] **Reiniciar servidor backend** ⚠️ IMPORTANTE
- [ ] **Limpar cache do navegador**
- [ ] **Testar criação de novo serviço com acentos**

---

## 🚨 Se Ainda Houver Problemas

### Opção A: Recriar o Banco de Dados com UTF-8
```sql
-- Crie um novo banco com encoding correto
CREATE DATABASE "MecaPro4.0_UTF8" 
WITH ENCODING 'UTF8' 
LC_COLLATE='pt_BR.UTF-8' 
LC_CTYPE='pt_BR.UTF-8' 
TEMPLATE=template0;
```

### Opção B: Verificar Sistema Operacional
No Windows, verifique se o PowerShell está em UTF-8:
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

---

## 📝 Notas Importantes

1. **PostgreSQL deve estar configurado com encoding UTF-8**
2. **Windows pode ter problemas com encoding no console** - use UTF-8
3. **Sempre reinicie o servidor após alterações**
4. **Limpe o cache do navegador para ver as mudanças**

