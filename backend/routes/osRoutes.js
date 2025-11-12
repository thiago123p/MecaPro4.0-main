const express = require('express');
const router = express.Router();
const pool = require('../db');
const { registrarMovimentacao } = require('./logMovimentacoesRoutes');

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

// IMPORTANTE: Rotas específicas (com caminhos fixos após /:id) devem vir ANTES da rota genérica /:id
// Isso garante que Express não confunda /os/123/pecas com /os/{id} onde id="123/pecas"

// Buscar peças de uma OS (DEVE vir ANTES de GET /:id)
router.get('/:id/pecas', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }

    const result = await pool.query(
      `SELECT op.*, p.descricao_peca, p.codigo_peca, p.preco_peca 
       FROM os_pecas op 
       LEFT JOIN pecas p ON op.id_peca = p.id_peca 
       WHERE op.id_os = $1`,
      [id]
    );
    console.log(`Peças da OS ${id} recuperadas com sucesso:`, result.rowCount, 'registros');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar peças da OS:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar serviços de uma OS (DEVE vir ANTES de GET /:id)
router.get('/:id/servicos', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }

    const result = await pool.query(
      `SELECT os.*, s.descricao_serv, s.valor_serv, s.tempo_serv, s.valor_final_serv
       FROM os_servicos os 
       LEFT JOIN servicos s ON os.id_serv = s.id_serv 
       WHERE os.id_os = $1`,
      [id]
    );
    console.log(`Serviços da OS ${id} recuperados com sucesso:`, result.rowCount, 'registros');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar serviços da OS:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar OS por ID (rota genérica - DEVE vir DEPOIS das rotas específicas)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }

    const result = await pool.query(
      `SELECT os.*, 
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
       WHERE os.id_os = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    console.log('OS recuperada com sucesso:', result.rows[0].numero_os);
    console.log('Observação retornada do banco:', result.rows[0].observacao);
    console.log('Dados completos da OS:', JSON.stringify(result.rows[0], null, 2));
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_veic, id_mec, id_usu, valor_total, observacao } = req.body;
    
    // Validação dos campos obrigatórios
    if (!id_veic) {
      return res.status(400).json({ error: 'Veículo é obrigatório' });
    }
    if (!id_mec) {
      return res.status(400).json({ error: 'Mecânico é obrigatório' });
    }
    
    // Se o id_usu for "admin" (login coringa), usar null no banco
    const usuarioId = (id_usu === "admin" || !id_usu) ? null : id_usu;
    
    // Garantir que observacao vazia seja salva como NULL
    const observacaoValue = observacao && observacao.trim() !== '' ? observacao : null;
    
    const result = await pool.query(
      'INSERT INTO os (id_veic, id_mec, id_usu, valor_total, observacao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_veic, id_mec, usuarioId, valor_total || 0, observacaoValue]
    );
    console.log('OS criada com sucesso:', result.rows[0]);
    console.log('Observação salva:', observacaoValue);
    
    // Registrar movimentação
    if (usuarioId) {
      await registrarMovimentacao(
        usuarioId,
        'os',
        'criar',
        result.rows[0].id_os,
        result.rows[0].numero_os,
        result.rows[0].valor_total,
        'OS criada'
      );
    }
    
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { id_veic, id_mec, valor_total, observacao } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID da OS é obrigatório' });
    }

    const updates = [];
    const values = [];
    let valueIndex = 1;

    if (id_veic !== undefined) {
      updates.push(`id_veic = $${valueIndex++}`);
      values.push(id_veic);
    }
    if (id_mec !== undefined) {
      updates.push(`id_mec = $${valueIndex++}`);
      values.push(id_mec);
    }
    if (valor_total !== undefined) {
      updates.push(`valor_total = $${valueIndex++}`);
      values.push(valor_total);
    }
    if (observacao !== undefined) {
      updates.push(`observacao = $${valueIndex++}`);
      // Garantir que observacao vazia seja salva como NULL
      const observacaoValue = observacao && observacao.trim() !== '' ? observacao : null;
      values.push(observacaoValue);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(id);
    const query = `UPDATE os SET ${updates.join(', ')} WHERE id_os = $${valueIndex} RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    console.log('OS atualizada com sucesso:', result.rows[0]);
    
    // Registrar movimentação
    if (result.rows[0].id_usu) {
      await registrarMovimentacao(
        result.rows[0].id_usu,
        'os',
        'editar',
        result.rows[0].id_os,
        result.rows[0].numero_os,
        result.rows[0].valor_total,
        'OS editada'
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/finalizar', async (req, res) => {
  const client = await pool.connect();
  
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

    // Iniciar transação
    await client.query('BEGIN');

    // Buscar todas as peças da OS
    const pecasOS = await client.query(
      'SELECT id_peca, quantidade FROM os_pecas WHERE id_os = $1',
      [id]
    );

    // Para cada peça, decrementar do estoque
    for (const item of pecasOS.rows) {
      // Verificar se existe estoque para a peça
      const estoqueAtual = await client.query(
        'SELECT quantidade FROM controle_estoque WHERE id_peca = $1',
        [item.id_peca]
      );

      if (estoqueAtual.rows.length > 0) {
        const quantidadeAtual = estoqueAtual.rows[0].quantidade;
        const novaQuantidade = quantidadeAtual - item.quantidade;

        // Atualizar o estoque (permitir estoque negativo para indicar falta)
        await client.query(
          'UPDATE controle_estoque SET quantidade = $1, data_registro = NOW() WHERE id_peca = $2',
          [novaQuantidade, item.id_peca]
        );
      } else {
        // Se não existe estoque, criar com quantidade negativa
        await client.query(
          'INSERT INTO controle_estoque (id_peca, quantidade) VALUES ($1, $2)',
          [item.id_peca, -item.quantidade]
        );
      }
    }

    // Finalizar a OS
    const result = await client.query(
      `UPDATE os 
       SET status = 'encerrada', 
           data_encerramento = CURRENT_TIMESTAMP, 
           forma_pagamento = $1
       WHERE id_os = $2 RETURNING *`,
      [forma_pagamento, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'OS não encontrada' });
    }

    // Commit da transação
    await client.query('COMMIT');

    console.log('OS finalizada com sucesso e estoque atualizado:', result.rows[0]);
    
    // Registrar movimentação de encerramento
    // Buscar o usuário logado que está encerrando (deve vir no body ou ser o mesmo que criou)
    const usuarioEncerramento = req.body.id_usuario_encerramento || result.rows[0].id_usu;
    if (usuarioEncerramento) {
      await registrarMovimentacao(
        usuarioEncerramento,
        'os',
        'encerrar',
        result.rows[0].id_os,
        result.rows[0].numero_os,
        result.rows[0].valor_total,
        `OS encerrada - Pagamento: ${forma_pagamento}`
      );
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    console.error('Erro ao finalizar OS:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.delete('/:id/pecas/:idPeca', async (req, res) => {
  try {
    const { id, idPeca } = req.params;
    
    if (!id || !idPeca) {
      return res.status(400).json({ error: 'IDs são obrigatórios' });
    }

    const result = await pool.query(
      'DELETE FROM os_pecas WHERE id_os = $1 AND id_peca = $2 RETURNING *',
      [id, idPeca]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Peça não encontrada na OS' });
    }

    console.log('Peça removida da OS com sucesso');
    res.json({ message: 'Peça removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover peça da OS:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/servicos/:idServ', async (req, res) => {
  try {
    const { id, idServ } = req.params;
    
    if (!id || !idServ) {
      return res.status(400).json({ error: 'IDs são obrigatórios' });
    }

    const result = await pool.query(
      'DELETE FROM os_servicos WHERE id_os = $1 AND id_serv = $2 RETURNING *',
      [id, idServ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado na OS' });
    }

    console.log('Serviço removido da OS com sucesso');
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover serviço da OS:', error);
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
