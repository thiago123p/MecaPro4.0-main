const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { limite, status } = req.query;
    
    let query = `SELECT os.*, 
                 v.descricao_veic, v.placa_veic, v.ano_veic,
                 c.nome_cli, c.telefone_cli,
                 m.nome_marca,
                 mec.nome_mec,
                 u.nome_usu
                 FROM os 
                 LEFT JOIN veiculo v ON os.id_veic = v.id_veic
                 LEFT JOIN cliente c ON v.id_cli = c.id_cli
                 LEFT JOIN marca m ON v.id_marca = m.id_marca
                 LEFT JOIN mecanico mec ON os.id_mec = mec.id_mec
                 LEFT JOIN usuario u ON os.id_usu = u.id_usu
                 WHERE 1=1`;

    // Filtro por status se fornecido
    if (status) {
      query += ` AND os.status = $1`;
    }
                 
    query += ` ORDER BY os.data_abertura DESC`;

    // Adiciona limite se fornecido
    if (limite) {
      const limiteNum = parseInt(limite);
      if (isNaN(limiteNum) || limiteNum <= 0) {
        return res.status(400).json({ error: 'Limite inválido' });
      }
      query += ` LIMIT ${limiteNum}`;
    }

    const queryParams = status ? [status] : [];
    const result = await pool.query(query, queryParams);

    console.log('OSs recuperadas com sucesso:', result.rowCount, 'registros');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar OSs:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_veic, id_mec, id_usu, valor_total } = req.body;
    
    // Validação dos campos obrigatórios
    if (!id_veic) {
      return res.status(400).json({ error: 'Veículo é obrigatório' });
    }
    if (!id_mec) {
      return res.status(400).json({ error: 'Mecânico é obrigatório' });
    }
    
    // Se o id_usu for "admin" (login coringa), usar null no banco
    const usuarioId = (id_usu === "admin" || !id_usu) ? null : id_usu;
    
    const result = await pool.query(
      'INSERT INTO os (id_veic, id_mec, id_usu, valor_total) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_veic, id_mec, usuarioId, valor_total || 0]
    );
    console.log('OS criada com sucesso:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/pecas', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_peca, quantidade } = req.body;
    
    // Validação dos campos obrigatórios
    if (!id_peca) {
      return res.status(400).json({ error: 'Peça é obrigatória' });
    }
    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }

    const result = await pool.query(
      'INSERT INTO os_pecas (id_os, id_peca, quantidade) VALUES ($1, $2, $3) RETURNING *',
      [id, id_peca, quantidade]
    );
    console.log('Peça adicionada à OS com sucesso:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar peça à OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/servicos', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_serv, quantidade } = req.body;
    
    // Validação dos campos obrigatórios
    if (!id_serv) {
      return res.status(400).json({ error: 'Serviço é obrigatório' });
    }
    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }

    const result = await pool.query(
      'INSERT INTO os_servicos (id_os, id_serv, quantidade) VALUES ($1, $2, $3) RETURNING *',
      [id, id_serv, quantidade]
    );
    console.log('Serviço adicionado à OS com sucesso:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar serviço à OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/pecas', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação do ID
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }

    const result = await pool.query(
      `SELECT op.*, p.descricao_peca, p.codigo_peca, p.preco_peca 
       FROM os_pecas op 
       LEFT JOIN pecas p ON op.id_peca = p.id_peca 
       WHERE op.id_os = $1
       ORDER BY op.created_at DESC`,
      [id]
    );
    console.log(`Peças da OS ${id} recuperadas com sucesso:`, result.rowCount, 'registros');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar peças da OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/servicos', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação do ID
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }

    const result = await pool.query(
      `SELECT os.*, s.descricao_serv, s.valor_serv, s.tempo_serv 
       FROM os_servicos os 
       LEFT JOIN servicos s ON os.id_serv = s.id_serv 
       WHERE os.id_os = $1
       ORDER BY os.created_at DESC`,
      [id]
    );
    console.log(`Serviços da OS ${id} recuperados com sucesso:`, result.rowCount, 'registros');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar serviços da OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;
    const { forma_pagamento } = req.body;
    
    // Validação dos campos obrigatórios
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }
    if (!forma_pagamento) {
      return res.status(400).json({ error: 'Forma de pagamento é obrigatória' });
    }

    const result = await pool.query(
      `UPDATE os 
       SET status = 'encerrada', 
           data_encerramento = CURRENT_TIMESTAMP, 
           forma_pagamento = $1
       WHERE id_os = $2 RETURNING *`,
      [forma_pagamento, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    console.log('OS finalizada com sucesso:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao finalizar OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validação do ID
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }

    // Primeiro, verificamos se existem registros relacionados
    const pecasResult = await pool.query('DELETE FROM os_pecas WHERE id_os = $1', [id]);
    const servicosResult = await pool.query('DELETE FROM os_servicos WHERE id_os = $1', [id]);

    // Depois, deletamos a OS
    const result = await pool.query('DELETE FROM os WHERE id_os = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    console.log('OS e registros relacionados deletados com sucesso:', {
      os: result.rows[0],
      pecasDeletadas: pecasResult.rowCount,
      servicosDeletados: servicosResult.rowCount
    });
    
    res.json({ 
      message: 'OS deletada com sucesso',
      pecasDeletadas: pecasResult.rowCount,
      servicosDeletados: servicosResult.rowCount
    });
  } catch (error) {
    console.error('Erro ao deletar OS:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
