const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { limite, ordenar } = req.query;
    let query = 'SELECT * FROM marca';
    
    if (ordenar === 'nome') {
      query += ' ORDER BY nome_marca ASC';
    } else {
      query += ' ORDER BY created_at DESC';
    }
    
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
    const result = await pool.query('SELECT * FROM marca WHERE id_marca = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Marca não encontrada' });
    }
    console.log('Marca encontrada:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar marca:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pesquisar/:termo', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM marca WHERE nome_marca ILIKE $1',
      [`%${req.params.termo}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome_marca } = req.body;
    const result = await pool.query(
      'INSERT INTO marca (nome_marca) VALUES ($1) RETURNING *',
      [nome_marca]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome_marca } = req.body;
    const result = await pool.query(
      'UPDATE marca SET nome_marca = $1 WHERE id_marca = $2 RETURNING *',
      [nome_marca, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marca não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM marca WHERE id_marca = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Marca não encontrada' });
    res.json({ message: 'Marca deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
