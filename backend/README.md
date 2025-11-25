# Backend MecaPro

API REST para o sistema MecaPro usando Node.js, Express e PostgreSQL.

## 🚀 Configuração Local

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar banco de dados
- Crie um arquivo `.env` baseado no `.env.example`
- Configure as variáveis de ambiente:

```env
# Ambiente (development ou production)
NODE_ENV=development

# Banco Local (Desenvolvimento)
DATABASE_URL=postgresql://postgres:1234@localhost:5432/MecaPro4.0

# Banco Remoto (Produção) - Render.com
DATABASE_URL_PRODUCTION=postgresql://mecapro:senha@host:porta/mecaprobd

# Porta do servidor
PORT=3000
```

### 3. Executar localmente
```bash
# Modo desenvolvimento (banco local)
npm run dev

# Modo produção (banco remoto)
npm run start:prod
```

O servidor estará rodando em `http://localhost:3000`

## 🌍 Ambientes

### Desenvolvimento (Local)
- Usa `DATABASE_URL` do arquivo `.env`
- Banco PostgreSQL local
- Sem SSL
- Comando: `npm run dev`

### Produção (Render.com)
- Usa `DATABASE_URL_PRODUCTION` do arquivo `.env`
- Banco PostgreSQL remoto no Render
- SSL habilitado automaticamente
- Comando: `npm start` ou `npm run start:prod`

## 📦 Estrutura

```
backend/
├── routes/          # Rotas da API
├── db.js           # Configuração do PostgreSQL
├── server.js       # Servidor Express
└── package.json    # Dependências
```

## 🌐 Endpoints da API

### Clientes
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/:id` - Buscar por ID
- `GET /api/clientes/pesquisar/:termo` - Pesquisar
- `POST /api/clientes` - Criar
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Deletar

### Serviços
- `GET /api/servicos`
- `POST /api/servicos`
- Etc...

### Outras rotas
- `/api/mecanicos`
- `/api/pecas`
- `/api/marcas`
- `/api/veiculos`
- `/api/estoque`
- `/api/usuarios`
- `/api/os`
- `/api/orcamentos`

## 🚀 Deploy no Heroku

```bash
# 1. Criar app
heroku create mecapro-backend

# 2. Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# 3. Deploy
git push heroku main

# 4. Verificar logs
heroku logs --tail
```
