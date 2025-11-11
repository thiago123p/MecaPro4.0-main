const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/MecaPro4.0'
});

async function checkColumns() {
  try {
    console.log('Verificando colunas da tabela OS...\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'os' 
      ORDER BY ordinal_position
    `);
    
    console.log('Colunas encontradas:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\n---\n');
    console.log('Verificando se existe alguma OS com observação...\n');
    
    const osResult = await pool.query('SELECT id_os, numero_os, observacao FROM os LIMIT 5');
    console.log('Primeiras 5 OS:');
    osResult.rows.forEach(row => {
      console.log(`OS #${row.numero_os} (${row.id_os}): observacao = "${row.observacao}"`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

checkColumns();
