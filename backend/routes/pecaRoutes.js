const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { limite } = req.query;
  let query = `SELECT p.*, m.nome_marca, m.id_marca 
   FROM pecas p 
     LEFT JOIN marca m ON p.id_marca = m.id_marca 
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
      `SELECT p.*, m.nome_marca, m.id_marca 
       FROM pecas p 
       LEFT JOIN marca m ON p.id_marca = m.id_marca 
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
      `SELECT p.*, m.nome_marca, m.id_marca 
       FROM pecas p 
       LEFT JOIN marca m ON p.id_marca = m.id_marca 
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
    if (!id) {
      return res.status(400).json({ error: 'ID da peça é obrigatório' });
    }

    const fields = { ...req.body };
    
    // Validações dos campos
    if (fields.descricao_peca !== undefined && !fields.descricao_peca) {
      return res.status(400).json({ error: 'Descrição da peça não pode ser vazia' });
    }
    
    if (fields.codigo_peca !== undefined && !fields.codigo_peca) {
      return res.status(400).json({ error: 'Código da peça não pode ser vazio' });
    }

    if (fields.preco_peca !== undefined) {
      const precoNum = Number(fields.preco_peca);
      if (isNaN(precoNum) || precoNum < 0) {
        return res.status(400).json({ error: 'Preço da peça deve ser um número positivo' });
      }
      fields.preco_peca = precoNum;
    }

    // Adiciona updated_at ao update
    fields.updated_at = 'CURRENT_TIMESTAMP';

    const setClause = Object.keys(fields)
      .filter(key => fields[key] !== undefined)
      .map((key, i) => `${key} = ${key === 'updated_at' ? fields[key] : '$' + (i + 2)}`)
      .join(', ');

    const values = Object.entries(fields)
      .filter(([key, value]) => key !== 'updated_at' && value !== undefined)
      .map(([, value]) => value);

    const result = await pool.query(
      `UPDATE pecas SET ${setClause} WHERE id_peca = $1 RETURNING *`,
      [id, ...values]
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
