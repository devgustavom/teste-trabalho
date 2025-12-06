const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function createStore() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'central_compras',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // 1. Criar usuário da loja (retailer/store)
    const email = 'lojateste@teste.com';
    const password = 'loja123';
    const hashedPassword = await bcrypt.hash(password, 8);

    console.log('👤 Criando usuário da loja...');
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, email, role`,
      ['Loja Teste', email, hashedPassword, 'retailer']
    );

    const userId = userResult.rows[0].id;
    console.log(`✅ Usuário criado! ID: ${userId}\n`);

    // 2. Criar loja associada ao usuário
    console.log('🏪 Criando loja...');
    const storeResult = await client.query(
      `INSERT INTO stores (
        user_id, name, address, city, state, phone, cnpj, responsible,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, name`,
      [
        userId,
        'Loja Teste LTDA',
        'Avenida Paulista, 1000',
        'São Paulo',
        'SP',
        '11988888888',
        '12.345.678/0001-99',
        'João Silva'
      ]
    );

    const storeId = storeResult.rows[0].id;
    console.log(`✅ Loja criada! ID: ${storeId}\n`);

    // 3. Exibir credenciais
    console.log('🔑 ═══════════════════════════════════════');
    console.log('🔑 CREDENCIAIS DE ACESSO DA LOJA');
    console.log('🔑 ═══════════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Senha: ${password}`);
    console.log('🔑 ═══════════════════════════════════════\n');

    console.log('📋 Dados da Loja:');
    console.log(`   ID: ${storeId}`);
    console.log(`   Nome: ${storeResult.rows[0].name}`);
    console.log(`   Cidade: São Paulo`);
    console.log(`   Estado: SP\n`);

    console.log('✅ Pronto para usar!');
    console.log('   Agora você pode criar pedidos usando a loja ID: ' + storeId + '\n');

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createStore();
