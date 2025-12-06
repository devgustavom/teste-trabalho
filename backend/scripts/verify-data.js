const { Client } = require('pg');
require('dotenv').config();

async function testSupplierData() {
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

    // 1. Contar fornecedores
    console.log('📊 ANÁLISE DO BANCO DE DADOS:\n');
    
    const countResult = await client.query('SELECT COUNT(*) as total FROM suppliers');
    const supplierCount = countResult.rows[0].total;
    console.log(`Total de fornecedores: ${supplierCount}`);

    if (supplierCount === 0) {
      console.log('\n❌ PROBLEMA: Nenhum fornecedor no banco!');
      console.log('\nSolução: Execute o reset-database.js novamente');
      console.log('npm run seed (ou node scripts/reset-database.js)');
    } else {
      console.log(`✅ Fornecedores encontrados: ${supplierCount}\n`);

      // 2. Verificar estrutura dos dados
      const supplierResult = await client.query(`
        SELECT 
          s.id,
          s.legal_name,
          s.trade_name,
          s.email,
          s.state,
          s.city,
          s.category,
          s.cnpj,
          s.user_id
        FROM suppliers s
        LIMIT 1
      `);

      if (supplierResult.rows.length > 0) {
        const supplier = supplierResult.rows[0];
        console.log('📦 Estrutura do primeiro fornecedor:');
        Object.entries(supplier).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }

      // 3. Verificar se há dados no banco de tudo
      console.log('\n📋 RESUMO GERAL:\n');
      
      const stats = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM suppliers) as suppliers,
          (SELECT COUNT(*) FROM products) as products,
          (SELECT COUNT(*) FROM orders) as orders,
          (SELECT COUNT(*) FROM categories) as categories,
          (SELECT COUNT(*) FROM stores) as stores,
          (SELECT COUNT(*) FROM users) as users,
          (SELECT COUNT(*) FROM campaigns) as campaigns
      `);

      const data = stats.rows[0];
      console.log(`Fornecedores: ${data.suppliers}`);
      console.log(`Produtos: ${data.products}`);
      console.log(`Pedidos: ${data.orders}`);
      console.log(`Categorias: ${data.categories}`);
      console.log(`Lojas: ${data.stores}`);
      console.log(`Usuários: ${data.users}`);
      console.log(`Campanhas: ${data.campaigns}\n`);

      if (supplierCount === 0 || data.users === 0) {
        console.log('⚠️  Banco vazio ou incompleto!');
        console.log('\n💡 Próximas ações:');
        console.log('1. Execute: node scripts/reset-database.js');
        console.log('2. Aguarde o processo terminar');
        console.log('3. Reinicie o backend: npm run dev');
        console.log('4. Recarregue o frontend\n');
      } else {
        console.log('✅ Dados presentes no banco! Sistema pronto para uso.');
      }
    }

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testSupplierData();
