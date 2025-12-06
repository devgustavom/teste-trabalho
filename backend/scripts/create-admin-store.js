const { Client } = require('pg');
require('dotenv').config();

async function createAdminStore() {
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

    // Buscar o admin
    const adminResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@central.com']
    );

    if (adminResult.rows.length === 0) {
      console.log('❌ Admin não encontrado');
      await client.end();
      return;
    }

    const adminId = adminResult.rows[0].id;
    console.log(`👤 Admin encontrado! ID: ${adminId}\n`);

    // Criar loja para o admin
    console.log('🏪 Criando loja para o admin...');
    const storeResult = await client.query(
      `INSERT INTO stores (
        user_id, name, address, city, state, phone, cnpj, responsible,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, name`,
      [
        adminId,
        'Loja Central - Admin',
        'Rua Central, 100',
        'São Paulo',
        'SP',
        '1133333333',
        '00.000.000/0000-00',
        'Administrador'
      ]
    );

    const storeId = storeResult.rows[0].id;
    console.log(`✅ Loja criada! ID: ${storeId}\n`);

    console.log('📋 Dados da Loja:');
    console.log(`   ID: ${storeId}`);
    console.log(`   Nome: ${storeResult.rows[0].name}`);
    console.log(`   Proprietário: admin@central.com\n`);

    console.log('✅ Admin agora pode criar pedidos!');
    console.log(`   Use store_id: ${storeId} ao criar pedidos\n`);

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createAdminStore();
