const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function createSupplierUser() {
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

    // Dados do fornecedor
    const email = 'fornecedor@teste.com';
    const password = 'fornecedor123';
    const hashedPassword = await bcrypt.hash(password, 8);

    // 1. Criar usuário fornecedor
    console.log('👤 Criando usuário fornecedor...');
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id, email, role`,
      ['Fornecedor Teste', email, hashedPassword, 'supplier']
    );

    const userId = userResult.rows[0].id;
    console.log(`✅ Usuário criado! ID: ${userId}\n`);

    // 2. Criar fornecedor associado ao usuário
    console.log('🏢 Criando fornecedor...');
    const supplierResult = await client.query(
      `INSERT INTO suppliers (
        user_id, legal_name, trade_name, cnpj, state, city, address, 
        contact_name, contact_phone, email, commercial_policy, whatsapp_link, 
        category, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       RETURNING id, legal_name, email, category`,
      [
        userId,
        'Fornecedor Teste LTDA',
        'Fornecedor Teste',
        '12.345.678/0001-90',
        'SP',
        'São Paulo',
        'Rua Teste, 123',
        'João Silva',
        '11999999999',
        email,
        'Política de venda padrão',
        'https://wa.me/5511999999999',
        'Eletrônicos'
      ]
    );

    const supplierId = supplierResult.rows[0].id;
    console.log(`✅ Fornecedor criado! ID: ${supplierId}\n`);

    // 3. Exibir credenciais
    console.log('🔑 ═══════════════════════════════════════');
    console.log('🔑 CREDENCIAIS DE ACESSO DO FORNECEDOR');
    console.log('🔑 ═══════════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Senha: ${password}`);
    console.log('🔑 ═══════════════════════════════════════\n');

    console.log('📋 Dados do Fornecedor:');
    console.log(`   ID: ${supplierId}`);
    console.log(`   Razão Social: ${supplierResult.rows[0].legal_name}`);
    console.log(`   Categoria: ${supplierResult.rows[0].category}\n`);

    console.log('✅ Pronto para login!');
    console.log('   Acesse: http://localhost:5173 (ou a URL do seu frontend)');
    console.log('   Entre com as credenciais acima\n');

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createSupplierUser();
