const axios = require('axios');

const BASE_URL = 'http://localhost:3333/api';

async function testSuppliersAPI() {
  try {
    // 1. Login
    console.log('🔐 Realizando login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@sistema.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login bem-sucedido, token obtido');
    
    // 2. Listar fornecedores
    console.log('\n📋 Listando fornecedores...');
    const suppliersRes = await axios.get(`${BASE_URL}/suppliers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Resposta da API:');
    console.log(JSON.stringify(suppliersRes.data, null, 2));
    
    // 3. Se houver fornecedores, tentar pegar o primeiro
    if (suppliersRes.data && suppliersRes.data.length > 0) {
      const firstSupplierId = suppliersRes.data[0].id;
      console.log(`\n🔍 Buscando fornecedor ID ${firstSupplierId}...`);
      
      const supplierRes = await axios.get(`${BASE_URL}/suppliers/${firstSupplierId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Detalhes do fornecedor:');
      console.log(JSON.stringify(supplierRes.data, null, 2));
    } else {
      console.log('⚠️  Nenhum fornecedor retornado pela API');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testSuppliersAPI();
