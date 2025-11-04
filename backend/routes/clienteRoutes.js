const express = require('express');
const router = express.Router();
const pool = require('../db');

// Buscar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { limite } = req.query;
    let query = 'SELECT * FROM cliente ORDER BY created_at DESC';
    
    if (limite) {
      query += ` LIMIT ${parseInt(limite)}`;
    }
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pesquisar clientes
router.get('/pesquisar/:termo', async (req, res) => {
  try {
    const { termo } = req.params;
    const result = await pool.query(
      `SELECT * FROM cliente 
       WHERE nome_cli ILIKE $1 OR cpf_cli ILIKE $1 OR telefone_cli ILIKE $1`,
      [`%${termo}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM cliente WHERE id_cli = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar cliente
router.post('/', async (req, res) => {
  try {
    const { nome_cli, cpf_cli, telefone_cli, endereco_cli, cidade_cli } = req.body;
    
    // Validação dos campos obrigatórios
    if (!nome_cli || !cpf_cli) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }
    
    const result = await pool.query(
      `INSERT INTO cliente (nome_cli, cpf_cli, telefone_cli, endereco_cli, cidade_cli) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome_cli, cpf_cli, telefone_cli, endereco_cli, cidade_cli]
    );
    console.log('Cliente criado com sucesso:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const setClause = Object.keys(fields).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(fields)];
    
    const result = await pool.query(
      `UPDATE cliente SET ${setClause} WHERE id_cli = $1 RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cliente WHERE id_cli = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    res.json({ message: 'Cliente deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
