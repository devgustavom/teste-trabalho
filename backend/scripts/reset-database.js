const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
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

    console.log('🗑️  Limpando banco de dados...\n');

    // Deletar em ordem de dependências
    await client.query('DELETE FROM cashback_entries');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM campaign_products');
    await client.query('DELETE FROM campaigns');
    await client.query('DELETE FROM state_conditions');
    await client.query('DELETE FROM files');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM suppliers');
    await client.query('DELETE FROM stores');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM categories');

    console.log('✅ Banco de dados limpo!\n');

    // ===== CRIAR CATEGORIAS =====
    console.log('📦 Criando categorias...\n');
    const categories = [
      'Eletrônicos',
      'Alimentos',
      'Roupas',
      'Higiene',
      'Bebidas',
    ];

    const categoryIds = {};
    for (const catName of categories) {
      const result = await client.query(
        'INSERT INTO categories (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id, name',
        [catName]
      );
      categoryIds[catName] = result.rows[0].id;
      console.log(`   ✅ ${catName} (ID: ${result.rows[0].id})`);
    }
    console.log('');

    // ===== CRIAR USERS =====
    console.log('👤 Criando usuários...\n');

    // Admin
    const adminPassword = 'admin123';
    const adminHash = await bcrypt.hash(adminPassword, 8);
    const adminResult = await client.query(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      ['Administrador', 'admin@sistema.com', adminHash, 'admin']
    );
    const adminId = adminResult.rows[0].id;
    console.log(`✅ Admin: admin@sistema.com / ${adminPassword}`);

    // Fornecedor 1
    const supplierPassword = 'fornecedor123';
    const supplierHash = await bcrypt.hash(supplierPassword, 8);
    const supplierResult = await client.query(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      ['Fornecedor Silva', 'fornecedor@silva.com', supplierHash, 'supplier']
    );
    const supplierId = supplierResult.rows[0].id;
    console.log(`✅ Fornecedor: fornecedor@silva.com / ${supplierPassword}`);

    // Lojista 1
    const retailerPassword = 'lojista123';
    const retailerHash = await bcrypt.hash(retailerPassword, 8);
    const retailerResult = await client.query(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      ['Gerente Loja', 'gerente@loja.com', retailerHash, 'retailer']
    );
    const retailerId = retailerResult.rows[0].id;
    console.log(`✅ Lojista: gerente@loja.com / ${retailerPassword}`);

    // Lojista 2
    const retailer2Result = await client.query(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      ['Gerente Loja 2', 'gerente2@loja.com', retailerHash, 'retailer']
    );
    const retailerId2 = retailer2Result.rows[0].id;
    console.log(`✅ Lojista 2: gerente2@loja.com / ${retailerPassword}\n`);

    // ===== CRIAR FORNECEDORES =====
    console.log('🏢 Criando fornecedores...\n');

    const supplier = await client.query(
      `INSERT INTO suppliers (
        user_id, legal_name, trade_name, cnpj, state, city, address,
        contact_name, contact_phone, email, category, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING id`,
      [
        supplierId,
        'Silva Distribuidora LTDA',
        'Silva',
        '12.345.678/0001-01',
        'SP',
        'São Paulo',
        'Rua Silva, 100',
        'João Silva',
        '1133333333',
        'fornecedor@silva.com',
        'Eletrônicos'
      ]
    );
    const supplierId2 = supplier.rows[0].id;
    console.log(`✅ Fornecedor: Silva Distribuidora (ID: ${supplierId2})\n`);

    // ===== CRIAR LOJAS =====
    console.log('🏪 Criando lojas...\n');

    const store1 = await client.query(
      `INSERT INTO stores (
        user_id, name, cnpj, state, city, address, responsible, phone, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [
        retailerId,
        'Loja Centro',
        '98.765.432/0001-01',
        'SP',
        'São Paulo',
        'Avenida Paulista, 1000',
        'João Gerente',
        '1199999999'
      ]
    );
    const storeId1 = store1.rows[0].id;
    console.log(`✅ Loja 1: Loja Centro (ID: ${storeId1})`);

    const store2 = await client.query(
      `INSERT INTO stores (
        user_id, name, cnpj, state, city, address, responsible, phone, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [
        retailerId2,
        'Loja Vila',
        '98.765.432/0001-02',
        'SP',
        'São Paulo',
        'Rua Vila, 500',
        'Maria Gerente',
        '1188888888'
      ]
    );
    const storeId2 = store2.rows[0].id;
    console.log(`✅ Loja 2: Loja Vila (ID: ${storeId2})\n`);

    // Admin store
    const storeAdmin = await client.query(
      `INSERT INTO stores (
        user_id, name, cnpj, state, city, address, responsible, phone, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [
        adminId,
        'Loja Central Admin',
        '00.000.000/0000-00',
        'SP',
        'São Paulo',
        'Rua Central, 1',
        'Admin',
        '1100000000'
      ]
    );
    const storeAdminId = storeAdmin.rows[0].id;
    console.log(`✅ Loja Admin: Loja Central Admin (ID: ${storeAdminId})\n`);

    // ===== CRIAR PRODUTOS =====
    console.log('📦 Criando produtos...\n');

    const products = [
      { name: 'Notebook Dell', category: 'Eletrônicos', price: 3500.00, stock: 50 },
      { name: 'Monitor LG 24"', category: 'Eletrônicos', price: 900.00, stock: 30 },
      { name: 'Mouse Logitech', category: 'Eletrônicos', price: 150.00, stock: 100 },
      { name: 'Teclado Mecânico', category: 'Eletrônicos', price: 450.00, stock: 40 },
      { name: 'Headset Gamer', category: 'Eletrônicos', price: 350.00, stock: 25 },
    ];

    const productIds = [];
    for (const prod of products) {
      const result = await client.query(
        `INSERT INTO products (
          supplier_id, category_id, name, price, stock, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
        [supplierId2, categoryIds[prod.category], prod.name, prod.price, prod.stock]
      );
      productIds.push(result.rows[0].id);
      console.log(`   ✅ ${prod.name} - R$ ${prod.price.toFixed(2)}`);
    }
    console.log('');

    // ===== CRIAR CAMPANHAS =====
    console.log('🎯 Criando campanhas...\n');

    const campaign1 = await client.query(
      `INSERT INTO campaigns (
        supplier_id, title, description, 
        start_date, end_date, 
        min_order_value, target_amount, target_type,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [
        supplierId2,
        'Black Friday Eletrônicos',
        'Promoção especial de eletrônicos com desconto até 20%',
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        1000.00,
        50000.00,
        'general'
      ]
    );
    const campaignId1 = campaign1.rows[0].id;
    console.log(`✅ Campanha 1: Black Friday Eletrônicos (ID: ${campaignId1})`);

    const campaign2 = await client.query(
      `INSERT INTO campaigns (
        supplier_id, title, description,
        start_date, end_date, 
        min_order_value, target_amount, target_type,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [
        supplierId2,
        'Cashback Especial',
        'Ganhe cashback em compras acima de R$ 2000 - cashback de até R$ 500',
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        2000.00,
        100000.00,
        'general'
      ]
    );
    const campaignId2 = campaign2.rows[0].id;
    console.log(`✅ Campanha 2: Cashback Especial (ID: ${campaignId2})\n`);

    // ===== CRIAR PEDIDOS =====
    console.log('📋 Criando pedidos...\n');

    const order1 = await client.query(
      `INSERT INTO orders (
        store_id, supplier_id, campaign_id, status, payment_type, is_budget,
        subtotal, tax, total, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
      [
        storeId1,
        supplierId2,
        campaignId1,
        'completed',
        'credit',
        false,
        4500.00,
        450.00,
        4950.00
      ]
    );
    const orderId1 = order1.rows[0].id;
    console.log(`✅ Pedido 1: ID ${orderId1} (Status: completed)`);

    // Itens do pedido 1
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId1, productIds[0], 1, 3500.00, 3500.00]
    );
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId1, productIds[1], 1, 900.00, 900.00]
    );

    // Cashback do pedido 1
    await client.query(
      `INSERT INTO cashback_entries (order_id, store_id, value)
       VALUES ($1, $2, $3)`,
      [orderId1, storeId1, 450.00]
    );

    const order2 = await client.query(
      `INSERT INTO orders (
        store_id, supplier_id, campaign_id, status, payment_type, is_budget,
        subtotal, tax, total, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
      [
        storeId1,
        supplierId2,
        campaignId2,
        'pending',
        'debit',
        false,
        2700.00,
        270.00,
        2970.00
      ]
    );
    const orderId2 = order2.rows[0].id;
    console.log(`✅ Pedido 2: ID ${orderId2} (Status: pending)`);

    // Itens do pedido 2
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId2, productIds[2], 10, 150.00, 1500.00]
    );
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId2, productIds[3], 2, 450.00, 900.00]
    );

    // Cashback do pedido 2
    await client.query(
      `INSERT INTO cashback_entries (order_id, store_id, value)
       VALUES ($1, $2, $3)`,
      [orderId2, storeId1, 270.00]
    );

    const order3 = await client.query(
      `INSERT INTO orders (
        store_id, supplier_id, status, payment_type, is_budget,
        subtotal, tax, total, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
      [
        storeId2,
        supplierId2,
        'completed',
        'credit',
        false,
        6300.00,
        630.00,
        6930.00
      ]
    );
    const orderId3 = order3.rows[0].id;
    console.log(`✅ Pedido 3: ID ${orderId3} (Status: completed)\n`);

    // Itens do pedido 3
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId3, productIds[0], 1, 3500.00, 3500.00]
    );
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId3, productIds[4], 8, 350.00, 2800.00]
    );

    // ===== RESUMO FINAL =====
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ BANCO DE DADOS RESETADO E POPULADO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🔑 CREDENCIAIS DE ACESSO:\n');
    console.log('👨‍💼 ADMINISTRADOR:');
    console.log(`   Email: admin@sistema.com`);
    console.log(`   Senha: admin123\n`);

    console.log('🏢 FORNECEDOR:');
    console.log(`   Email: fornecedor@silva.com`);
    console.log(`   Senha: fornecedor123\n`);

    console.log('🏪 LOJISTAS:');
    console.log(`   Loja 1 - Email: gerente@loja.com`);
    console.log(`   Senha: lojista123`);
    console.log(`   Loja 2 - Email: gerente2@loja.com`);
    console.log(`   Senha: lojista123\n`);

    console.log('📊 DADOS CRIADOS:');
    console.log(`   ✅ 5 Categorias`);
    console.log(`   ✅ 5 Produtos de Eletrônicos`);
    console.log(`   ✅ 2 Campanhas ativas`);
    console.log(`   ✅ 3 Lojas (2 de lojistas + 1 do admin)`);
    console.log(`   ✅ 3 Pedidos com histórico\n`);

    console.log('🎯 PRÓXIMAS AÇÕES:');
    console.log('   1. Faça login com uma das credenciais acima');
    console.log('   2. Navegue pela plataforma para ver os dados');
    console.log('   3. Crie novos pedidos, campanhas e produtos conforme necessário\n');

    console.log('═══════════════════════════════════════════════════════════\n');

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
    process.exit(1);
  }
}

resetDatabase();
