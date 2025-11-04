const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { limite } = req.query;
    let query = 'SELECT * FROM mecanico ORDER BY created_at DESC';
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
    const result = await pool.query('SELECT * FROM mecanico WHERE id_mec = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mecânico não encontrado' });
    }
    console.log('Mecânico encontrado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar mecânico:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pesquisar/:termo', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mecanico WHERE nome_mec ILIKE $1 OR cpf_mec ILIKE $1 OR telefone_mec ILIKE $1',
      [`%${req.params.termo}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome_mec, cpf_mec, telefone_mec, endereco_mec, cidade_mec } = req.body;
    const result = await pool.query(
      'INSERT INTO mecanico (nome_mec, cpf_mec, telefone_mec, endereco_mec, cidade_mec) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome_mec, cpf_mec, telefone_mec, endereco_mec, cidade_mec]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const setClause = Object.keys(fields).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const result = await pool.query(
      `UPDATE mecanico SET ${setClause} WHERE id_mec = $1 RETURNING *`,
      [req.params.id, ...Object.values(fields)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mecânico não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM mecanico WHERE id_mec = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mecânico não encontrado' });
    res.json({ message: 'Mecânico deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
