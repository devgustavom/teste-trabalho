import "reflect-metadata";
import { AppDataSource } from "../src/config/ormconfig";
import { User } from "../src/models/User";
import bcrypt from "bcryptjs";

async function createNewAdmin() {
  try {
    // Conectar ao banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);

    // Email e senha para o novo admin
    const newAdminEmail = "admin2@central.com";
    const newAdminPassword = "admin123";
    const newAdminName = "Administrador 2";

    // Verificar se já existe
    const existingUser = await userRepo.findOne({ where: { email: newAdminEmail } });
    if (existingUser) {
      console.log(`❌ Usuário com email ${newAdminEmail} já existe!`);
      process.exit(1);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(newAdminPassword, 8);

    // Criar novo admin
    const newAdmin = userRepo.create({
      name: newAdminName,
      email: newAdminEmail,
      password: hashedPassword,
      role: "admin",
    });

    const savedAdmin = await userRepo.save(newAdmin);

    console.log("✅ Novo admin criado com sucesso!");
    console.log(`
📋 Credenciais do novo admin:
   Email: ${newAdminEmail}
   Senha: ${newAdminPassword}
   Perfil: Administrador
    `);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erro ao criar novo admin:", error.message);
    process.exit(1);
  }
}

createNewAdmin();
