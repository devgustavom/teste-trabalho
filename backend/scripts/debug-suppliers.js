const { Client } = require('pg');
require('dotenv').config();

async function checkSuppliers() {
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

    // Verificar fornecedores
    console.log('📦 FORNECEDORES NO BANCO:\n');
    const suppliers = await client.query(`
      SELECT 
        s.id,
        s.legal_name,
        s.trade_name,
        s.email,
        s.state,
        s.city,
        s.category,
        u.email as user_email,
        u.id as user_id
      FROM suppliers s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.id
    `);

    if (suppliers.rows.length === 0) {
      console.log('❌ Nenhum fornecedor encontrado!\n');
    } else {
      suppliers.rows.forEach(sup => {
        console.log(`ID: ${sup.id}`);
        console.log(`Razão Social: ${sup.legal_name}`);
        console.log(`Nome Fantasia: ${sup.trade_name}`);
        console.log(`Email: ${sup.email}`);
        console.log(`Estado: ${sup.state}, Cidade: ${sup.city}`);
        console.log(`Categoria: ${sup.category}`);
        console.log(`Usuário: ${sup.user_email} (ID: ${sup.user_id})\n`);
      });
    }

    console.log('💡 Se estiver vendo "não encontrado" ao clicar em um fornecedor:');
    console.log('1. Verifique se o ID do fornecedor está correto');
    console.log('2. Verifique se você tem permissão para ver esse fornecedor');
    console.log('3. Verifique o console do browser para ver qual ID está sendo enviado\n');

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkSuppliers();
