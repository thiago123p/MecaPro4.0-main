const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, p.descricao_peca, p.codigo_peca, p.preco_peca 
       FROM controle_estoque e 
       LEFT JOIN pecas p ON e.id_peca = p.id_peca 
       ORDER BY e.data_registro DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IMPORTANTE: Rota /resumo DEVE vir ANTES de /peca/:idPeca
// Nova rota para obter todas as peças com suas quantidades em estoque
router.get('/resumo', async (req, res) => {
  try {
    console.log('Buscando resumo de estoque...');
    const result = await pool.query(
      `SELECT p.id_peca, p.descricao_peca, p.codigo_peca, p.preco_peca, 
              COALESCE(e.quantidade, 0) as quantidade
       FROM pecas p
       LEFT JOIN controle_estoque e ON p.id_peca = e.id_peca
       ORDER BY p.descricao_peca ASC`
    );
    console.log('Resumo de estoque recuperado:', result.rowCount, 'peças');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar resumo de estoque:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/peca/:idPeca', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, p.descricao_peca, p.codigo_peca, p.preco_peca 
       FROM controle_estoque e 
       LEFT JOIN pecas p ON e.id_peca = p.id_peca 
       WHERE e.id_peca = $1`,
      [req.params.idPeca]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Estoque não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/movimentacao', async (req, res) => {
  try {
    const { id_peca, quantidade } = req.body;
    
    // Verifica se já existe estoque para esta peça
    const estoqueAtual = await pool.query(
      'SELECT * FROM controle_estoque WHERE id_peca = $1',
      [id_peca]
    );
    
    if (estoqueAtual.rows.length > 0) {
      // Atualiza quantidade existente
      const novaQuantidade = estoqueAtual.rows[0].quantidade + quantidade;
      const result = await pool.query(
        'UPDATE controle_estoque SET quantidade = $1, data_registro = NOW() WHERE id_peca = $2 RETURNING *',
        [novaQuantidade, id_peca]
      );
      res.json(result.rows[0]);
    } else {
      // Cria novo registro de estoque
      const result = await pool.query(
        'INSERT INTO controle_estoque (id_peca, quantidade) VALUES ($1, $2) RETURNING *',
        [id_peca, quantidade]
      );
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
