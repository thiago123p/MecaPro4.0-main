const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
  try {
    const { limite } = req.query;
    let query = 'SELECT * FROM usuario ORDER BY created_at DESC';
    if (limite) query += ` LIMIT ${parseInt(limite)}`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuario WHERE id_usu = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pesquisar/:termo', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM usuario WHERE nome_usu ILIKE $1 OR cpf_usu ILIKE $1 OR telefone_usu ILIKE $1',
      [`%${req.params.termo}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome_usu, cpf_usu, senha_usu, tipo_usu, telefone_usu, endereco_usu, cidade_usu, palavra_chave_usu } = req.body;
    
    // Validações
    if (!nome_usu) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    if (!cpf_usu) {
      return res.status(400).json({ error: 'CPF é obrigatório' });
    }
    if (!senha_usu) {
      return res.status(400).json({ error: 'Senha é obrigatória' });
    }
    if (!tipo_usu) {
      return res.status(400).json({ error: 'Tipo de usuário é obrigatório' });
    }

    // Verifica se já existe um usuário com o mesmo CPF
    const existingUser = await pool.query('SELECT id_usu FROM usuario WHERE cpf_usu = $1', [cpf_usu]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Já existe um usuário com este CPF' });
    }
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha_usu, 10);
    
    const result = await pool.query(
      `INSERT INTO usuario (
        nome_usu, 
        cpf_usu, 
        senha_usu, 
        tipo_usu, 
        telefone_usu, 
        endereco_usu, 
        cidade_usu, 
        palavra_chave_usu,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`,
      [nome_usu, cpf_usu, senhaHash, tipo_usu, telefone_usu || '', endereco_usu || '', cidade_usu || '', palavra_chave_usu || '']
    );

    console.log('Usuário criado com sucesso:', { ...result.rows[0], senha_usu: undefined });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { cpf_usu, senha_usu } = req.body;
    
    const result = await pool.query('SELECT * FROM usuario WHERE cpf_usu = $1', [cpf_usu]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'CPF ou senha inválidos' });
    }
    
    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha_usu, usuario.senha_usu);
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'CPF ou senha inválidos' });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    
    // Validações
    if (!id) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    if (fields.nome_usu === '') {
      return res.status(400).json({ error: 'Nome não pode ser vazio' });
    }

    if (fields.cpf_usu === '') {
      return res.status(400).json({ error: 'CPF não pode ser vazio' });
    }

    // Verifica se já existe outro usuário com o mesmo CPF
    if (fields.cpf_usu) {
      const existingUser = await pool.query('SELECT id_usu FROM usuario WHERE cpf_usu = $1 AND id_usu != $2', [fields.cpf_usu, id]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Já existe outro usuário com este CPF' });
      }
    }
    
    // Remove a senha se estiver vazia
    if (!fields.senha_usu) {
      delete fields.senha_usu;
    } else {
      // Se a senha foi fornecida, faz o hash
      fields.senha_usu = await bcrypt.hash(fields.senha_usu, 10);
    }

    // Adiciona updated_at
    fields.updated_at = 'CURRENT_TIMESTAMP';

    const setClause = Object.keys(fields)
      .filter(key => fields[key] !== undefined)
      .map((key, i) => `${key} = ${key === 'updated_at' ? fields[key] : '$' + (i + 2)}`)
      .join(', ');

    const values = Object.entries(fields)
      .filter(([key, value]) => key !== 'updated_at' && value !== undefined)
      .map(([, value]) => value);

    const result = await pool.query(
      `UPDATE usuario SET ${setClause} WHERE id_usu = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log('Usuário atualizado com sucesso:', { ...result.rows[0], senha_usu: undefined });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuario WHERE id_usu = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
