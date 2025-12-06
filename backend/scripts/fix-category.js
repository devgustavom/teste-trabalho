const { Client } = require('pg');
require('dotenv').config();

async function fixCategory() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'central_de_compras',
  });

  try {
    console.log('🔄 Conectando ao banco...');
    await client.connect();

    console.log('🛠️ Corrigindo tabela suppliers...');
    
    // 1. Tenta remover restrições antigas se existirem (Foreign Keys)
    await client.query(`
      ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS FK_category;
      ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_category_id_fkey;
    `);

    // 2. Se existir a coluna category_id (antiga), removemos ou renomeamos
    const checkCol = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='suppliers' AND column_name='category_id'
    `);

    if (checkCol.rowCount > 0) {
      console.log('   Removendo coluna antiga category_id...');
      await client.query('ALTER TABLE suppliers DROP COLUMN category_id');
    }

    // 3. Garante que a coluna category existe e é VARCHAR
    console.log('   Configurando coluna category para Texto...');
    
    // Adiciona se não existir
    await client.query('ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS category VARCHAR(100)');
    
    // Se já existir mas for de outro tipo, altera para VARCHAR
    await client.query('ALTER TABLE suppliers ALTER COLUMN category TYPE VARCHAR(100)');

    console.log('✅ Banco de dados corrigido com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir banco:', error.message);
  } finally {
    await client.end();
  }
}

fixCategory();