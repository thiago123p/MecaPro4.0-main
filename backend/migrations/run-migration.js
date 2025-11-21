const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'MecaPro4.0',
  user: 'postgres',
  password: '1234',
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Executando migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add_desconto_columns.sql'),
      'utf8'
    );
    
    await client.query(migrationSQL);
    
    console.log('✅ Migration executada com sucesso!');
    console.log('📋 Colunas adicionadas:');
    console.log('   - desconto_pecas (DECIMAL)');
    console.log('   - desconto_servicos (DECIMAL)');
    console.log('   - valor_desconto_pecas (DECIMAL)');
    console.log('   - valor_desconto_servicos (DECIMAL)');
    console.log('   - valor_final (DECIMAL)');
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
