const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { limite } = req.query;
    let query = `SELECT orc.*, 
                 v.descricao_veic, v.placa_veic, v.ano_veic,
                 c.nome_cli, c.telefone_cli,
                 m.nome_marca,
                 u.nome_usu
                 FROM orcamento orc 
                 LEFT JOIN veiculo v ON orc.id_veic = v.id_veic
                 LEFT JOIN cliente c ON v.id_cli = c.id_cli
                 LEFT JOIN marca m ON v.id_marca = m.id_marca
                 LEFT JOIN usuario u ON orc.id_usu = u.id_usu
                 ORDER BY orc.data_abertura DESC`;
    if (limite) query += ` LIMIT ${parseInt(limite)}`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT orc.*, 
       v.descricao_veic, v.placa_veic, v.ano_veic,
       c.nome_cli, c.telefone_cli,
       m.nome_marca,
       u.nome_usu
       FROM orcamento orc 
       LEFT JOIN veiculo v ON orc.id_veic = v.id_veic
       LEFT JOIN cliente c ON v.id_cli = c.id_cli
       LEFT JOIN marca m ON v.id_marca = m.id_marca
       LEFT JOIN usuario u ON orc.id_usu = u.id_usu
       WHERE orc.id_orc = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_veic, id_usu, valor_total, observacao } = req.body;
    // Se o id_usu for "admin" (login coringa), usar null no banco
    const usuarioId = (id_usu === "admin" || !id_usu) ? null : id_usu;
    // Garantir que observacao vazia seja salva como NULL
    const observacaoValue = observacao && observacao.trim() !== '' ? observacao : null;
    
    const result = await pool.query(
      'INSERT INTO orcamento (id_veic, id_usu, valor_total, observacao) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_veic, usuarioId, valor_total, observacaoValue]
    );
    console.log('Orçamento criado com sucesso:', result.rows[0]);
    console.log('Observação salva:', observacaoValue);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/pecas', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_peca, quantidade } = req.body;
    const result = await pool.query(
      'INSERT INTO orcamento_pecas (id_orc, id_peca, quantidade) VALUES ($1, $2, $3) RETURNING *',
      [id, id_peca, quantidade]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/servicos', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_serv, quantidade } = req.body;
    const result = await pool.query(
      'INSERT INTO orcamento_servicos (id_orc, id_serv, quantidade) VALUES ($1, $2, $3) RETURNING *',
      [id, id_serv, quantidade]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/pecas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT op.*, p.descricao_peca, p.codigo_peca, p.preco_peca 
       FROM orcamento_pecas op 
       LEFT JOIN pecas p ON op.id_peca = p.id_peca 
       WHERE op.id_orc = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/servicos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT os.*, s.descricao_serv, s.valor_serv, s.tempo_serv, s.valor_final_serv
       FROM orcamento_servicos os 
       LEFT JOIN servicos s ON os.id_serv = s.id_serv 
       WHERE os.id_orc = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_veic, valor_total, observacao } = req.body;
    
    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (id_veic !== undefined) {
      updates.push(`id_veic = $${valueIndex++}`);
      values.push(id_veic);
    }
    if (valor_total !== undefined) {
      updates.push(`valor_total = $${valueIndex++}`);
      values.push(valor_total);
    }
    if (observacao !== undefined) {
      updates.push(`observacao = $${valueIndex++}`);
      const observacaoValue = observacao && observacao.trim() !== '' ? observacao : null;
      values.push(observacaoValue);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const query = `UPDATE orcamento SET ${updates.join(', ')} WHERE id_orc = $${valueIndex} RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    console.log('Orçamento atualizado com sucesso:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/pecas/:idPeca', async (req, res) => {
  try {
    const { id, idPeca } = req.params;
    const result = await pool.query(
      'DELETE FROM orcamento_pecas WHERE id_orc = $1 AND id_peca = $2 RETURNING *',
      [id, idPeca]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Peça não encontrada no orçamento' });
    }

    res.json({ message: 'Peça removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/servicos/:idServ', async (req, res) => {
  try {
    const { id, idServ } = req.params;
    const result = await pool.query(
      'DELETE FROM orcamento_servicos WHERE id_orc = $1 AND id_serv = $2 RETURNING *',
      [id, idServ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado no orçamento' });
    }

    res.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM orcamento WHERE id_orc = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json({ message: 'Orçamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
