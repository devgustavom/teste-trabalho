const { Client } = require('pg');
require('dotenv').config();

async function checkStoresTable() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'central_compras',
  });

  try {
    await client.connect();
    
    const result = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'stores' ORDER BY ordinal_position`
    );
    
    console.log('📋 COLUNAS DA TABELA STORES:\n');
    result.rows.forEach(r => {
      console.log(`   ${r.column_name} (${r.data_type})`);
    });

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkStoresTable();
