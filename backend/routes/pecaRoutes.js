const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { limite } = req.query;
  let query = `SELECT p.*, m.nome_marca, m.id_marca, COALESCE(e.quantidade, 0) as quantidade_estoque
   FROM pecas p 
     LEFT JOIN marca m ON p.id_marca = m.id_marca 
     LEFT JOIN controle_estoque e ON p.id_peca = e.id_peca
     ORDER BY p.created_at DESC`;
    if (limite) query += ` LIMIT ${parseInt(limite)}`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, m.nome_marca, m.id_marca, COALESCE(e.quantidade, 0) as quantidade_estoque
       FROM pecas p 
       LEFT JOIN marca m ON p.id_marca = m.id_marca 
       LEFT JOIN controle_estoque e ON p.id_peca = e.id_peca
       WHERE p.id_peca = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Peça não encontrada' });
    }
    console.log('Peça encontrada:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar peça:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pesquisar/:termo', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, m.nome_marca, m.id_marca, COALESCE(e.quantidade, 0) as quantidade_estoque
       FROM pecas p 
       LEFT JOIN marca m ON p.id_marca = m.id_marca 
       LEFT JOIN controle_estoque e ON p.id_peca = e.id_peca
       WHERE p.descricao_peca ILIKE $1 OR p.codigo_peca ILIKE $1`,
      [`%${req.params.termo}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { descricao_peca, codigo_peca, preco_peca, tipo_peca, id_marca } = req.body;
    
    // Validações
    if (!descricao_peca) {
      return res.status(400).json({ error: 'Descrição da peça é obrigatória' });
    }
    if (!codigo_peca) {
      return res.status(400).json({ error: 'Código da peça é obrigatório' });
    }
    
    // Converte para número e valida
    const precoNum = Number(preco_peca);
    if (isNaN(precoNum) || precoNum < 0) {
      return res.status(400).json({ error: 'Preço da peça deve ser um número positivo' });
    }

    const result = await pool.query(
      'INSERT INTO pecas (descricao_peca, codigo_peca, preco_peca, tipo_peca, id_marca, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
      [descricao_peca, codigo_peca, precoNum, tipo_peca || '', id_marca]
    );
    
    console.log('Peça criada com sucesso:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar peça:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PUT /pecas/:id - ID:', id);
    console.log('PUT /pecas/:id - Body:', req.body);
    
    if (!id) {
      return res.status(400).json({ error: 'ID da peça é obrigatório' });
    }

    const { descricao_peca, codigo_peca, preco_peca, tipo_peca, id_marca } = req.body;
    
    // Validações dos campos obrigatórios
    if (!descricao_peca || descricao_peca.trim() === '') {
      return res.status(400).json({ error: 'Descrição da peça é obrigatória' });
    }
    
    if (!codigo_peca || codigo_peca.trim() === '') {
      return res.status(400).json({ error: 'Código da peça é obrigatório' });
    }

    if (!tipo_peca || tipo_peca.trim() === '') {
      return res.status(400).json({ error: 'Tipo da peça é obrigatório' });
    }

    if (!id_marca || id_marca.trim() === '') {
      return res.status(400).json({ error: 'Marca é obrigatória' });
    }

    // Converte para número e valida
    const precoNum = Number(preco_peca);
    if (isNaN(precoNum) || precoNum <= 0) {
      return res.status(400).json({ error: 'Preço da peça deve ser um número maior que zero' });
    }

    console.log('Atualizando peça com valores:', {
      descricao_peca,
      codigo_peca,
      preco_peca: precoNum,
      tipo_peca,
      id_marca,
      id
    });

    const result = await pool.query(
      `UPDATE pecas 
       SET descricao_peca = $1, 
           codigo_peca = $2, 
           preco_peca = $3, 
           tipo_peca = $4, 
           id_marca = $5 
       WHERE id_peca = $6 
       RETURNING *`,
      [descricao_peca, codigo_peca, precoNum, tipo_peca, id_marca, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Peça não encontrada' });
    }

    console.log('Peça atualizada com sucesso:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar peça:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
  const result = await pool.query('DELETE FROM pecas WHERE id_peca = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Peça não encontrada' });
    res.json({ message: 'Peça deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
