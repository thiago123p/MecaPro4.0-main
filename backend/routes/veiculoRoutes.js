const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { limite } = req.query;
    let query = `SELECT v.*, m.nome_marca, m.id_marca, c.nome_cli, c.id_cli 
                 FROM veiculo v 
                 LEFT JOIN marca m ON v.id_marca = m.id_marca 
                 LEFT JOIN cliente c ON v.id_cli = c.id_cli 
                 ORDER BY v.created_at DESC`;
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
      `SELECT v.*, m.nome_marca, m.id_marca, c.nome_cli, c.id_cli 
       FROM veiculo v 
       LEFT JOIN marca m ON v.id_marca = m.id_marca 
       LEFT JOIN cliente c ON v.id_cli = c.id_cli 
       WHERE v.id_veic = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    console.log('Veículo encontrado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pesquisar/:termo', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, m.nome_marca, m.id_marca, c.nome_cli, c.id_cli 
       FROM veiculo v 
       LEFT JOIN marca m ON v.id_marca = m.id_marca 
       LEFT JOIN cliente c ON v.id_cli = c.id_cli 
       WHERE v.descricao_veic ILIKE $1 OR v.placa_veic ILIKE $1`,
      [`%${req.params.termo}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { descricao_veic, placa_veic, ano_veic, id_marca, id_cli } = req.body;
    const result = await pool.query(
      'INSERT INTO veiculo (descricao_veic, placa_veic, ano_veic, id_marca, id_cli) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [descricao_veic, placa_veic, ano_veic, id_marca, id_cli]
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
      `UPDATE veiculo SET ${setClause} WHERE id_veic = $1 RETURNING *`,
      [req.params.id, ...Object.values(fields)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM veiculo WHERE id_veic = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json({ message: 'Veículo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
