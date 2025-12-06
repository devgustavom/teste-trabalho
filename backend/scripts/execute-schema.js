/**
 * Script para executar o schema.sql corretamente
 * Execute: node scripts/execute-schema.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function executeSchema() {
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

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Arquivo schema.sql não encontrado em: ${schemaPath}`);
      process.exit(1);
    }

    console.log('📖 Lendo schema.sql...');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Remover comentários e dividir por ponto e vírgula
    const commands = schemaSQL
      .split(';')
      .map(cmd => {
        // Remover comentários de linha (--)
        return cmd
          .split('\n')
          .map(line => {
            const commentIndex = line.indexOf('--');
            return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
          })
          .join('\n')
          .trim();
      })
      .filter(cmd => cmd.length > 0 && !cmd.match(/^\s*$/));

    console.log(`🔄 Executando ${commands.length} comandos...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      
      // Pular comandos vazios ou apenas espaços
      if (!cmd || cmd.trim().length === 0) continue;

      try {
        await client.query(cmd);
        successCount++;
        
        // Mostrar progresso a cada 5 comandos
        if ((i + 1) % 5 === 0 || i === commands.length - 1) {
          console.log(`   ✅ ${i + 1}/${commands.length} comandos executados...`);
        }
      } catch (error) {
        errorCount++;
        // Ignorar erros de "já existe" para CREATE TABLE/INDEX
        if (error.message.includes('already exists') || 
            error.message.includes('já existe') ||
            error.code === '42P07' || // duplicate_table
            error.code === '42710') { // duplicate_object
          // Silenciar - objeto já existe
        } else {
          console.warn(`   ⚠️  Erro no comando ${i + 1}: ${error.message}`);
          console.warn(`      Código: ${error.code}`);
        }
      }
    }

    console.log(`\n✅ Schema executado!`);
    console.log(`   Sucessos: ${successCount}`);
    console.log(`   Erros (ignorados): ${errorCount}`);

    // Verificar se as tabelas foram criadas
    console.log('\n🔄 Verificando tabelas criadas...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    if (tables.rows.length > 0) {
      console.log(`✅ ${tables.rows.length} tabelas encontradas:`);
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Nenhuma tabela encontrada!');
    }

    await client.end();
    console.log('\n✅ Processo concluído!\n');
    
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
      await client.end();
    } catch (e) {}
    
    process.exit(1);
  }
}

executeSchema();

