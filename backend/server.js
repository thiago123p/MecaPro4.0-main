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

const app = express();

// Middleware para configurar charset UTF-8 em todas as respostas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(cors());
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

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

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
