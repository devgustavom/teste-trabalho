const { Client } = require('pg');
require('dotenv').config();

async function fixDatabase() {
  console.log("🔧 Iniciando correção do banco de dados...");
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'central_de_compras',
  });

  try {
    await client.connect();
    console.log("✅ Conectado ao banco de dados.");

    // 1. Remover coluna antiga 'category_id' se existir
    await client.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='category_id') THEN
          ALTER TABLE suppliers DROP COLUMN category_id;
        END IF;
      END $$;
    `);

    // 2. Garantir que a coluna 'category' existe e é do tipo VARCHAR
    // Se a coluna já existir como integer, isso tentará converter.
    // Se falhar a conversão direta, recriamos a coluna.
    try {
        await client.query(`ALTER TABLE suppliers ALTER COLUMN category TYPE VARCHAR(255)`);
    } catch (e) {
        console.log("   ⚠️ Conversão direta falhou, recriando coluna category...");
        await client.query(`ALTER TABLE suppliers DROP COLUMN category`);
        await client.query(`ALTER TABLE suppliers ADD COLUMN category VARCHAR(255)`);
    }

    console.log("✅ Tabela 'suppliers' corrigida com sucesso! Coluna 'category' agora é Texto.");

  } catch (error) {
    console.error("❌ Erro ao corrigir banco:", error.message);
  } finally {
    await client.end();
  }
}

fixDatabase();