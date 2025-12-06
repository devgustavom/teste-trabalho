/**
 * Script para criar usuários iniciais no sistema
 * Execute: npx ts-node scripts/create-initial-users.ts
 * OU: npm run create-users (se adicionar ao package.json)
 */

import "reflect-metadata";
import { AppDataSource } from "../src/config/ormconfig";
import { User } from "../src/models/User";
import bcrypt from "bcryptjs";

async function createInitialUsers() {
  try {
    // Inicializar conexão com o banco
    await AppDataSource.initialize();
    console.log("✅ Conectado ao banco de dados");

    const userRepository = AppDataSource.getRepository(User);

    // Verificar se os usuários já existem
    const existingAdmin = await userRepository.findOne({ where: { email: "admin@central.com" } });
    const existingSupplier = await userRepository.findOne({ where: { email: "fornecedor@exemplo.com" } });
    const existingStore = await userRepository.findOne({ where: { email: "loja@exemplo.com" } });

    // Senha padrão para todos: "admin123"
    const defaultPassword = "admin123";

    // Criar usuário Admin
    if (!existingAdmin) {
      const admin = userRepository.create({
        name: "Administrador",
        email: "admin@central.com",
        password: defaultPassword, // O modelo User faz hash automaticamente
        role: "admin",
      });
      await userRepository.save(admin);
      console.log("✅ Usuário Admin criado:");
      console.log("   Email: admin@central.com");
      console.log("   Senha: admin123");
    } else {
      console.log("⚠️  Usuário Admin já existe");
    }

    // Criar usuário Fornecedor
    if (!existingSupplier) {
      const supplier = userRepository.create({
        name: "Fornecedor Exemplo",
        email: "fornecedor@exemplo.com",
        password: defaultPassword,
        role: "supplier",
      });
      await userRepository.save(supplier);
      console.log("✅ Usuário Fornecedor criado:");
      console.log("   Email: fornecedor@exemplo.com");
      console.log("   Senha: admin123");
    } else {
      console.log("⚠️  Usuário Fornecedor já existe");
    }

    // Criar usuário Loja
    if (!existingStore) {
      const store = userRepository.create({
        name: "Loja Exemplo",
        email: "loja@exemplo.com",
        password: defaultPassword,
        role: "retailer",
      });
      await userRepository.save(store);
      console.log("✅ Usuário Loja criado:");
      console.log("   Email: loja@exemplo.com");
      console.log("   Senha: admin123");
    } else {
      console.log("⚠️  Usuário Loja já existe");
    }

    await AppDataSource.destroy();
    console.log("\n✅ Processo concluído!");
    console.log("\n📋 CREDENCIAIS DE ACESSO:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 ADMINISTRADOR:");
    console.log("   Email: admin@central.com");
    console.log("   Senha: admin123");
    console.log("\n🏢 FORNECEDOR:");
    console.log("   Email: fornecedor@exemplo.com");
    console.log("   Senha: admin123");
    console.log("\n🏪 LOJA:");
    console.log("   Email: loja@exemplo.com");
    console.log("   Senha: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error: any) {
    console.error("❌ Erro ao criar usuários:");
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

createInitialUsers();
