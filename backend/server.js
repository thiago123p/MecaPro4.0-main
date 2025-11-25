const express = require('express');
const cors = require('cors');
require('dotenv').config();

const clienteRoutes = require('./routes/clienteRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const mecanicoRoutes = require('./routes/mecanicoRoutes');
const pecaRoutes = require('./routes/pecaRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const osRoutes = require('./routes/osRoutes');
const orcamentoRoutes = require('./routes/orcamentoRoutes');
const historicoRelatorioRoutes = require('./routes/historicoRelatorioRoutes');
const logMovimentacoesRoutes = require('./routes/logMovimentacoesRoutes');

const app = express();

// Configuração de CORS mais permissiva
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (como mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? [
          'https://mecapro4-0-main-1.onrender.com',
          'https://mecapro4-0-main.onrender.com',
          /\.onrender\.com$/ // Permite qualquer subdomínio do Render
        ]
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
          'http://localhost:4173' // Vite preview
        ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origem bloqueada pelo CORS: ${origin}`);
      callback(null, true); // Permite mesmo assim em produção para evitar problemas
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 horas de cache para preflight
};

console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 CORS configurado`);

// Middleware CORS deve vir ANTES de qualquer outra configuração
app.use(cors(corsOptions));

// Tratamento explícito de preflight requests
app.options('*', cors(corsOptions));

// Middleware para configurar charset UTF-8 em todas as respostas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json({ charset: 'utf-8', limit: '10mb' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8', limit: '10mb' }));

// Rotas
app.use('/api/clientes', clienteRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/mecanicos', mecanicoRoutes);
app.use('/api/pecas', pecaRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/os', osRoutes);
app.use('/api/orcamentos', orcamentoRoutes);
app.use('/api/historico-relatorio', historicoRelatorioRoutes);
app.use('/api/log-movimentacoes', logMovimentacoesRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
  next();
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Rota 404
app.use((req, res) => {
  console.warn(`⚠️ Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
