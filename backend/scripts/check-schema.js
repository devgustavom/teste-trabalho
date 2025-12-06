const { Client } = require('pg');
require('dotenv').config();

async function checkTables() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'central_compras',
  });

  try {
    await client.connect();
    
    console.log('📋 CAMPAIGNS:\n');
    let result = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'campaigns' ORDER BY ordinal_position`
    );
    result.rows.forEach(r => console.log(`   ${r.column_name} (${r.data_type})`));

    console.log('\n📋 PRODUCTS:\n');
    result = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'products' ORDER BY ordinal_position`
    );
    result.rows.forEach(r => console.log(`   ${r.column_name} (${r.data_type})`));

    console.log('\n📋 ORDERS:\n');
    result = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'orders' ORDER BY ordinal_position`
    );
    result.rows.forEach(r => console.log(`   ${r.column_name} (${r.data_type})`));

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkTables();
