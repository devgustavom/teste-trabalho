/**
 * Script simples para criar usuários via SQL direto
 * Execute: node scripts/create-users-simple.js
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'central_compras',
});

async function createUsers() {
  let connectionOpen = false;
  
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await client.connect();
    connectionOpen = true;
    console.log('✅ Conectado ao banco de dados');

    // Gerar hash da senha "admin123"
    console.log('🔄 Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash('admin123', 8);
    console.log('✅ Hash gerado');

    const users = [
      {
        name: 'Administrador',
        email: 'admin@central.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Fornecedor Exemplo',
        email: 'fornecedor@exemplo.com',
        password: hashedPassword,
        role: 'supplier'
      },
      {
        name: 'Loja Exemplo',
        email: 'loja@exemplo.com',
        password: hashedPassword,
        role: 'retailer'
      }
    ];

    console.log('\n🔄 Criando usuários...\n');

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`[${i + 1}/${users.length}] Processando: ${user.email}...`);
      
      try {
        const result = await client.query(
          `INSERT INTO users (name, email, password, role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (email) DO NOTHING
           RETURNING id, name, email, role`,
          [user.name, user.email, user.password, user.role]
        );

        if (result.rows.length > 0) {
          console.log(`   ✅ Usuário criado: ${user.email} (ID: ${result.rows[0].id})`);
        } else {
          console.log(`   ⚠️  Usuário já existe: ${user.email}`);
        }
      } catch (error) {
        if (error.code === '23505') { // Unique violation
          console.log(`   ⚠️  Usuário já existe (violação de unique): ${user.email}`);
        } else {
          console.error(`   ❌ Erro ao criar ${user.email}:`, error.message);
          throw error;
        }
      }
    }

    if (connectionOpen) {
      await client.end();
      connectionOpen = false;
    }
    
    console.log('\n✅ Processo concluído!');
    console.log('\n📋 CREDENCIAIS DE ACESSO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMINISTRADOR:');
    console.log('   Email: admin@central.com');
    console.log('   Senha: admin123');
    console.log('\n🏢 FORNECEDOR:');
    console.log('   Email: fornecedor@exemplo.com');
    console.log('   Senha: admin123');
    console.log('\n🏪 LOJA:');
    console.log('   Email: loja@exemplo.com');
    console.log('   Senha: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    if (error.code) {
      console.error('   Código do erro:', error.code);
    }
    if (error.detail) {
      console.error('   Detalhes:', error.detail);
    }
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    
    if (connectionOpen) {
      try {
        await client.end();
      } catch (e) {
        // Ignorar erro ao fechar
      }
    }
    
    process.exit(1);
  }
}

// Timeout de segurança (30 segundos)
const timeout = setTimeout(() => {
  console.error('\n❌ Timeout: O script demorou mais de 30 segundos. Verifique a conexão com o banco.');
  process.exit(1);
}, 30000);

createUsers().finally(() => {
  clearTimeout(timeout);
});
