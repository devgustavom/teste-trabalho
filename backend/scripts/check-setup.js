const { Client } = require('pg');
require('dotenv').config();

async function checkSetup() {
  const client = new Client({
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'central_compras',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco\n');

    // 1. Verificar categories
    console.log('📋 CATEGORIAS NO BANCO:');
    const categories = await client.query('SELECT id, name FROM categories ORDER BY id');
    if (categories.rows.length === 0) {
      console.log('❌ NENHUMA CATEGORIA ENCONTRADA!\n');
    } else {
      categories.rows.forEach(cat => {
        console.log(`   ID: ${cat.id}, Nome: ${cat.name}`);
      });
      console.log('');
    }

    // 2. Verificar suppliers
    console.log('📦 FORNECEDORES NO BANCO:');
    const suppliers = await client.query(`
      SELECT s.id, s.legal_name, s.email, s.category, u.email as user_email, u.id as user_id 
      FROM suppliers s 
      LEFT JOIN users u ON s.user_id = u.id 
      ORDER BY s.id
    `);
    if (suppliers.rows.length === 0) {
      console.log('❌ NENHUM FORNECEDOR ENCONTRADO!\n');
    } else {
      suppliers.rows.forEach(sup => {
        console.log(`   ID: ${sup.id}, Razão Social: ${sup.legal_name}`);
        console.log(`   Email: ${sup.email}, Categoria: ${sup.category}`);
        console.log(`   Usuário: ${sup.user_email} (ID: ${sup.user_id})\n`);
      });
    }

    // 3. Verificar products
    console.log('🛍️  PRODUTOS NO BANCO:');
    const products = await client.query(`
      SELECT COUNT(*) as total FROM products
    `);
    console.log(`   Total: ${products.rows[0].total}\n`);

    // 4. Dica
    console.log('💡 PRÓXIMOS PASSOS:');
    if (categories.rows.length === 0) {
      console.log('   ❗ Você precisa criar categorias antes de criar produtos!');
      console.log('   Execute: npm run seed (na pasta backend)\n');
    }
    if (suppliers.rows.length === 0) {
      console.log('   ❗ Você precisa criar um fornecedor antes de criar produtos!');
      console.log('   Acesse a página de fornecedores e crie um novo.\n');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkSetup();
