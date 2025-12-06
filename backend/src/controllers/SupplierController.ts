import { Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Supplier } from "../models/Supplier";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import bcrypt from "bcryptjs";

// Função para gerar senha aleatória
function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export class SupplierController {
  static async create(req: AuthRequest, res: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log("📝 Recebendo dados para criar fornecedor:", req.body);

      const {
        legal_name,
        trade_name,
        cnpj,
        state,
        city,
        address,
        contact_name,
        contact_phone,
        email, 
        commercial_policy,
        whatsapp_link,
        category,
      } = req.body;

      // 1. Validações
      if (!legal_name || !cnpj || !state) {
        return res.status(400).json({ message: "Campos obrigatórios: Razão Social, CNPJ e Estado." });
      }

      // 2. Verificar duplicidade de CNPJ
      const existingSupplier = await queryRunner.manager.findOne(Supplier, { where: { cnpj } });
      if (existingSupplier) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ message: "Já existe um fornecedor com este CNPJ." });
      }

      // 3. Preparar Usuário (Gera email e senha se necessário)
      const cleanCNPJ = cnpj.replace(/\D/g, "");
      const userEmail = email && email.trim() !== "" 
        ? email 
        : `fornecedor.${cleanCNPJ}@sistema.com`;
        
      const existingUser = await queryRunner.manager.findOne(User, { where: { email: userEmail } });
      if (existingUser) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({ message: `O email ${userEmail} já está em uso.` });
      }

      const rawPassword = generatePassword(8);
      const hashedPassword = await bcrypt.hash(rawPassword, 8);

      // 4. Criar Usuário
      const user = queryRunner.manager.create(User, {
        name: trade_name || legal_name,
        email: userEmail,
        password: hashedPassword,
        role: "supplier",
      });
      const savedUser = await queryRunner.manager.save(user);

      // 5. Criar Fornecedor vinculado
      const supplier = queryRunner.manager.create(Supplier, {
        legal_name,
        trade_name: trade_name || legal_name,
        cnpj,
        state,
        city,
        address,
        contact_name,
        contact_phone,
        email: userEmail,
        commercial_policy,
        whatsapp_link,
        category: category || "Geral", // Valor padrão se vier vazio
        user: savedUser,
      });
      const savedSupplier = await queryRunner.manager.save(supplier);

      await queryRunner.commitTransaction();
      console.log("✅ Fornecedor criado com sucesso!");

      // Retorna sucesso com credenciais para o frontend mostrar
      return res.status(201).json({
        id: savedSupplier.id,
        legal_name: savedSupplier.legal_name,
        trade_name: savedSupplier.trade_name,
        cnpj: savedSupplier.cnpj,
        state: savedSupplier.state,
        city: savedSupplier.city,
        address: savedSupplier.address,
        contact_name: savedSupplier.contact_name,
        contact_phone: savedSupplier.contact_phone,
        email: savedSupplier.email,
        commercial_policy: savedSupplier.commercial_policy,
        whatsapp_link: savedSupplier.whatsapp_link,
        category: savedSupplier.category,
        created_at: savedSupplier.created_at,
        updated_at: savedSupplier.updated_at,
        credentials: {
          username: userEmail,
          password: rawPassword,
        }
      });

    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Erro ao criar fornecedor:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    } finally {
      await queryRunner.release();
    }
  }

  // --- Outros Métodos (List, Get, Update, Delete) ---

  static async list(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      
      console.log(`📋 Listando fornecedores...`);
      
      const suppliers = await repo.find({ 
        order: { created_at: "DESC" },
        relations: ["user"]
      });
      
      // Transformar para remover dados sensíveis do usuário
      const safeSuppliers = suppliers.map(s => ({
        id: s.id,
        legal_name: s.legal_name,
        trade_name: s.trade_name,
        cnpj: s.cnpj,
        state: s.state,
        city: s.city,
        address: s.address,
        contact_name: s.contact_name,
        contact_phone: s.contact_phone,
        email: s.email,
        commercial_policy: s.commercial_policy,
        whatsapp_link: s.whatsapp_link,
        category: s.category,
        created_at: s.created_at,
        updated_at: s.updated_at,
        user: s.user ? { id: s.user.id, name: s.user.name, email: s.user.email } : null
      }));
      
      console.log(`✅ Total de fornecedores: ${safeSuppliers.length}`);
      
      return res.json(safeSuppliers);
    } catch (error: any) {
      console.error("❌ Erro ao listar fornecedores:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async get(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      const supplierId = Number(req.params.id);
      
      console.log(`🔍 Buscando fornecedor ID: ${supplierId}`);
      
      const supplier = await repo.findOne({ 
        where: { id: supplierId },
        relations: ["user"]
      });
      
      if (!supplier) {
        console.error(`❌ Fornecedor ID ${supplierId} não encontrado no banco`);
        return res.status(404).json({ message: "Fornecedor não encontrado" });
      }
      
      console.log(`✅ Fornecedor encontrado: ${supplier.legal_name}`);
      
      // Retornar com dados do usuário filtrados
      const safeSupplier = {
        id: supplier.id,
        legal_name: supplier.legal_name,
        trade_name: supplier.trade_name,
        cnpj: supplier.cnpj,
        state: supplier.state,
        city: supplier.city,
        address: supplier.address,
        contact_name: supplier.contact_name,
        contact_phone: supplier.contact_phone,
        email: supplier.email,
        commercial_policy: supplier.commercial_policy,
        whatsapp_link: supplier.whatsapp_link,
        category: supplier.category,
        created_at: supplier.created_at,
        updated_at: supplier.updated_at,
        user: supplier.user ? { id: supplier.user.id, name: supplier.user.name, email: supplier.user.email } : null
      };
      
      return res.json(safeSupplier);
    } catch (error: any) {
      console.error("❌ Erro ao buscar fornecedor:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      const { id } = req.params;
      const supplier = await repo.findOne({ 
        where: { id: Number(id) },
        relations: ["user"]
      });
      if (!supplier) return res.status(404).json({ message: "Fornecedor não encontrado" });
      
      // Validar permissões: fornecedor só edita seus dados
      if (req.user!.role === 'supplier' && supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { legal_name, trade_name, cnpj, state, city, address, contact_name, contact_phone, email, commercial_policy, whatsapp_link, category } = req.body;
      
      if (legal_name) supplier.legal_name = legal_name;
      if (trade_name) supplier.trade_name = trade_name;
      if (cnpj) supplier.cnpj = cnpj;
      if (state) supplier.state = state;
      if (city) supplier.city = city;
      if (address) supplier.address = address;
      if (contact_name) supplier.contact_name = contact_name;
      if (contact_phone) supplier.contact_phone = contact_phone;
      if (email) supplier.email = email;
      if (commercial_policy) supplier.commercial_policy = commercial_policy;
      if (whatsapp_link) supplier.whatsapp_link = whatsapp_link;
      if (category !== undefined) supplier.category = category || "Geral";
      
      const results = await repo.save(supplier);
      return res.json(results);
    } catch (error: any) {
      console.error("Erro ao atualizar fornecedor:", error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      const { id } = req.params;
      const supplier = await repo.findOne({ where: { id: Number(id) }, relations: ["user"] });
      if (!supplier) return res.status(404).json({ message: "Fornecedor não encontrado" });
      
      const userId = supplier.user?.id;
      await repo.remove(supplier);
      
      if (userId) {
        await AppDataSource.getRepository(User).delete(userId);
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}