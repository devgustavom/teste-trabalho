const http = require('http');
require('dotenv').config();

// Simulando requisição HTTP para a API
function testSupplierGet(supplierId, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3333,
      path: `/api/suppliers/${supplierId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data ? JSON.parse(data) : null,
          headers: res.headers
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🧪 TESTE DE REQUISIÇÃO DE FORNECEDOR\n');

  // Primeiro fazer login para obter token
  console.log('1️⃣  Fazendo login...\n');
  const loginResponse = await new Promise((resolve, reject) => {
    const loginData = JSON.stringify({
      email: 'admin@sistema.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3333,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  if (loginResponse.token) {
    console.log(`✅ Login bem-sucedido!`);
    console.log(`Token: ${loginResponse.token.substring(0, 20)}...\n`);

    // Testar requisição para fornecedor ID 7
    console.log('2️⃣  Testando GET /api/suppliers/7\n');
    try {
      const result = await testSupplierGet(7, loginResponse.token);
      console.log(`Status HTTP: ${result.status}`);
      if (result.status === 200) {
        console.log(`✅ Fornecedor encontrado!`);
        console.log(`Dados: ${JSON.stringify(result.data, null, 2)}\n`);
      } else {
        console.log(`❌ Erro: ${result.data?.message || 'Desconhecido'}\n`);
      }
    } catch (error) {
      console.error(`❌ Erro na requisição:`, error.message);
    }
  } else {
    console.error(`❌ Erro no login:`, loginResponse.message);
  }
}

main().catch(console.error);
