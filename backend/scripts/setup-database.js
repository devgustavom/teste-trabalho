/**
 * Script para criar o banco de dados e tabelas
 * Execute: node scripts/setup-database.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Conecta ao banco padrão primeiro
  });

  const dbClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'central_compras',
  });

  try {
    console.log('🔄 Conectando ao PostgreSQL...');
    await adminClient.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Criar banco de dados se não existir
    const dbName = process.env.DB_DATABASE || 'central_compras';
    console.log(`🔄 Verificando se o banco "${dbName}" existe...`);
    
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`🔄 Criando banco de dados "${dbName}"...`);
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Banco de dados "${dbName}" criado`);
    } else {
      console.log(`✅ Banco de dados "${dbName}" já existe`);
    }

    await adminClient.end();

    // Conectar ao banco criado
    console.log(`🔄 Conectando ao banco "${dbName}"...`);
    await dbClient.connect();
    console.log(`✅ Conectado ao banco "${dbName}"`);

    // Verificar se a tabela users existe
    console.log('🔄 Verificando se as tabelas existem...');
    const tableCheck = await dbClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Tabelas não encontradas. Executando schema.sql...');
      
      // Ler e executar o schema.sql
      const schemaPath = path.join(__dirname, '../../database/schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        console.error(`❌ Arquivo schema.sql não encontrado em: ${schemaPath}`);
        console.log('📝 Por favor, execute manualmente o arquivo database/schema.sql no PostgreSQL');
        await dbClient.end();
        process.exit(1);
      }

      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Dividir em comandos individuais (separados por ;)
      const commands = schemaSQL
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      console.log(`🔄 Executando ${commands.length} comandos do schema...`);
      
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        if (cmd.trim().length === 0) continue;
        
        try {
          await dbClient.query(cmd);
          if ((i + 1) % 10 === 0) {
            console.log(`   Processado ${i + 1}/${commands.length} comandos...`);
          }
        } catch (error) {
          // Ignorar erros de "já existe" para CREATE TABLE
          if (!error.message.includes('already exists') && !error.message.includes('já existe')) {
            console.warn(`   ⚠️  Aviso no comando ${i + 1}: ${error.message}`);
          }
        }
      }

      console.log('✅ Schema executado com sucesso!');
    } else {
      console.log('✅ Tabelas já existem');
    }

    await dbClient.end();
    console.log('\n✅ Banco de dados configurado com sucesso!');
    console.log('\n📝 Próximo passo: Execute o script de criação de usuários:');
    console.log('   node scripts/create-users-simple.js\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    if (error.code) {
      console.error('   Código do erro:', error.code);
    }
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    
    try {
      await adminClient.end();
    } catch (e) {}
    
    try {
      await dbClient.end();
    } catch (e) {}
    
    process.exit(1);
  }
}

setupDatabase();

