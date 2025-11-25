const { Pool } = require('pg');
require('dotenv').config();

// Determina o ambiente (production ou development)
const isProduction = process.env.NODE_ENV === 'production';

// URL do banco de dados
const DATABASE_URL = isProduction
  ? process.env.DATABASE_URL_PRODUCTION || 'postgresql://mecapro:nJDpCXrjUdeUFK6069WGjK58cm2qAMdR@dpg-d4ifacer433s739ve180-a.oregon-postgres.render.com/mecaprobd'
  : process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/MecaPro4.0';

console.log(`🌍 Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log(`🔗 Conectando ao banco: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`); // Oculta senha no log

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false, // SSL obrigatório em produção
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo que uma conexão pode ficar ociosa
  connectionTimeoutMillis: 2000, // Tempo máximo para estabelecer uma conexão
  // Configuração de encoding UTF-8
  client_encoding: 'UTF8',
});

// Listener de erro no pool
pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexões:', err);
});

// Testar a conexão e configurar encoding
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    return;
  }
  console.log('✅ Conectado ao banco de dados PostgreSQL');
  
  // Garante que o client está usando UTF-8
  client.query("SET CLIENT_ENCODING TO 'UTF8'", (err) => {
    if (err) {
      console.error('Erro ao configurar encoding:', err.message);
    }
    
    client.query('SELECT NOW()', (err, result) => {
      release();
      if (err) {
        return console.error('Erro ao executar query:', err.message);
      }
      console.log('🕒 Horário do banco:', result.rows[0].now);
    });
  });
});

module.exports = pool;
