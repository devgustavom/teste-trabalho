const { Client } = require('pg');
require('dotenv').config();

async function checkCashbacks() {
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

    // Buscar cashbacks
    const result = await client.query(`
      SELECT 
        ce.id,
        ce.value,
        ce.confirmed,
        ce.proof_file_url,
        s.name as store_name,
        o.id as order_id
      FROM cashback_entries ce
      JOIN stores s ON ce.store_id = s.id
      JOIN orders o ON ce.order_id = o.id
      ORDER BY ce.id
    `);

    console.log('📊 CASHBACKS NO BANCO:\n');
    if (result.rows.length === 0) {
      console.log('❌ Nenhum cashback encontrado\n');
    } else {
      result.rows.forEach(cb => {
        console.log(`ID: ${cb.id}`);
        console.log(`Loja: ${cb.store_name}`);
        console.log(`Valor: R$ ${cb.value}`);
        console.log(`Confirmado: ${cb.confirmed ? 'Sim' : 'Não'}`);
        console.log(`Comprovante: ${cb.proof_file_url || 'Não enviado'}`);
        console.log(`Pedido: #${cb.order_id}\n`);
      });
    }

    console.log('💡 Para testar o upload:');
    console.log('1. Faça login como lojista: gerente@loja.com / lojista123');
    console.log('2. Vá para "Meu Cashback"');
    console.log('3. Clique em "Enviar Comprovante"');
    console.log('4. Selecione um arquivo PDF ou imagem');
    console.log('5. Se receber erro 500, verifique os logs do backend\n');

    await client.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkCashbacks();
