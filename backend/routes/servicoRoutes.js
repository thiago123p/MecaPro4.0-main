const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    console.log('[SERVICO] GET /api/servicos called with query:', req.query);
    const { limite } = req.query;
  let query = 'SELECT * FROM servicos ORDER BY created_at DESC';
    if (limite) query += ` LIMIT ${parseInt(limite)}`;
    const result = await pool.query(query);
    console.log(`[SERVICO] query returned ${result.rows.length} rows`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM servicos WHERE id_serv = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    console.log('Serviço encontrado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/pesquisar/:termo', async (req, res) => {
  try {
    const result = await pool.query(
  'SELECT * FROM servicos WHERE descricao_serv ILIKE $1 OR cos ILIKE $1',
      [`%${req.params.termo}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { descricao_serv, valor_serv, tempo_serv, cos } = req.body;
    
    // Validações
    if (!descricao_serv) {
      return res.status(400).json({ error: 'Descrição do serviço é obrigatória' });
    }
    
    // Converte para número e valida
    const valorServNum = Number(valor_serv);
    const tempoServNum = Number(tempo_serv);
    
    if (isNaN(valorServNum) || valorServNum < 0) {
      return res.status(400).json({ error: 'Valor do serviço deve ser um número positivo' });
    }
    
    if (isNaN(tempoServNum) || tempoServNum <= 0) {
      return res.status(400).json({ error: 'Tempo do serviço deve ser maior que zero' });
    }

    const valor_final_serv = valorServNum * tempoServNum;
    
    const result = await pool.query(
      'INSERT INTO servicos (descricao_serv, valor_serv, tempo_serv, cos, valor_final_serv, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
      [descricao_serv, valorServNum, tempoServNum, cos || '', valor_final_serv]
    );
    
    console.log('Serviço criado com sucesso:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID do serviço é obrigatório' });
    }

    const { descricao_serv, valor_serv, tempo_serv, cos, valor_final_serv } = req.body;
    
    // Validações dos campos
    if (descricao_serv !== undefined && !descricao_serv.trim()) {
      return res.status(400).json({ error: 'Descrição do serviço não pode ser vazia' });
    }

    let valorServNum = valor_serv;
    let tempoServNum = tempo_serv;

    if (valor_serv !== undefined) {
      valorServNum = Number(valor_serv);
      if (isNaN(valorServNum) || valorServNum < 0) {
        return res.status(400).json({ error: 'Valor do serviço deve ser um número positivo' });
      }
    }

    if (tempo_serv !== undefined) {
      tempoServNum = Number(tempo_serv);
      if (isNaN(tempoServNum) || tempoServNum <= 0) {
        return res.status(400).json({ error: 'Tempo do serviço deve ser maior que zero' });
      }
    }
    
    // Busca os valores atuais do serviço
    const current = await pool.query('SELECT * FROM servicos WHERE id_serv = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Usa os valores atuais se não foram fornecidos novos valores
    const finalDescricao = descricao_serv !== undefined ? descricao_serv : current.rows[0].descricao_serv;
    const finalValor = valorServNum !== undefined ? valorServNum : current.rows[0].valor_serv;
    const finalTempo = tempoServNum !== undefined ? tempoServNum : current.rows[0].tempo_serv;
    const finalCos = cos !== undefined ? cos : current.rows[0].cos;
    
    // Calcula o valor final (se fornecido, usa o fornecido, senão calcula)
    let finalValorFinal;
    if (valor_final_serv !== undefined) {
      finalValorFinal = Number(valor_final_serv);
    } else {
      finalValorFinal = finalValor * finalTempo;
    }

    const result = await pool.query(
      `UPDATE servicos 
       SET descricao_serv = $1, valor_serv = $2, tempo_serv = $3, cos = $4, valor_final_serv = $5
       WHERE id_serv = $6 
       RETURNING *`,
      [finalDescricao, finalValor, finalTempo, finalCos, finalValorFinal, id]
    );

    console.log('Serviço atualizado com sucesso:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
  const result = await pool.query('DELETE FROM servicos WHERE id_serv = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json({ message: 'Serviço deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
