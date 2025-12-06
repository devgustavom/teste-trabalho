/**
 * Script para executar o seed.sql (popular banco de dados)
 * Execute: node scripts/run-seed.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSeed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'central_de_compras',
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Caminho para o arquivo seed.sql
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    
    if (!fs.existsSync(seedPath)) {
      console.error(`❌ Arquivo seed.sql não encontrado em: ${seedPath}`);
      process.exit(1);
    }

    console.log('📖 Lendo seed.sql...');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    
    // Processar comandos
    const commands = seedSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    console.log(`🔄 Executando ${commands.length} comandos de seed...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      try {
        await client.query(cmd);
        successCount++;
        console.log(`   ✅ Comando ${i + 1} executado com sucesso`);
      } catch (error) {
        // Ignora erro se o registro já existir (chave duplicada)
        if (error.code === '23505') { 
            console.log(`   ⚠️  Registro já existe (ignorado): Comando ${i + 1}`);
        } else {
            errorCount++;
            console.error(`   ❌ Erro no comando ${i + 1}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Processo de seed concluído!`);
    console.log(`   Sucessos: ${successCount}`);
    console.log(`   Erros: ${errorCount}`);

    // Verificar categorias inseridas
    const categories = await client.query('SELECT * FROM categories');
    console.log(`\n📋 Categorias no banco: ${categories.rowCount}`);
    categories.rows.forEach(c => console.log(`   - ${c.name}`));

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

runSeed();