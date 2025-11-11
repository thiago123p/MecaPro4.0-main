const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/MecaPro4.0'
});

async function updateOS() {
  try {
    console.log('Atualizando OS #2 para adicionar uma observação de teste...\n');
    
    const result = await pool.query(`
      UPDATE os 
      SET observacao = 'Esta é uma observação de teste para verificar se o campo está funcionando corretamente.'
      WHERE numero_os = 2
      RETURNING id_os, numero_os, observacao
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ OS atualizada com sucesso!');
      console.log(`OS #${result.rows[0].numero_os}`);
      console.log(`Observação: "${result.rows[0].observacao}"`);
    } else {
      console.log('❌ OS #2 não encontrada');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

updateOS();
