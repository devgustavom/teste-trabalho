import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Supplier } from "../models/Supplier";
import { Store } from "../models/Store";
import dotenv from "dotenv";
dotenv.config();

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const repo = AppDataSource.getRepository(User);
      const user = await repo.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET não configurado no .env");
        return res.status(500).json({ message: "Erro de configuração do servidor" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );

      user.last_login = new Date();
      await repo.save(user);

      // Preparar dados de resposta
      const responseUser: any = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      console.log(`🔐 Login do usuário ${user.email} (role: ${user.role})`);

      // Se for supplier, buscar o ID do fornecedor
      if (user.role === "supplier") {
        try {
          console.log(`🔍 Procurando fornecedor para usuário ID ${user.id}`);
          const supplierRepo = AppDataSource.getRepository(Supplier);
          
          // Tentar buscar por relação de usuário
          let supplier = await supplierRepo.findOne({ 
            where: { user: { id: user.id } }
          });
          
          // Se não encontrar, tentar buscar diretamente por user_id na query
          if (!supplier) {
            console.log(`📝 Tentando busca alternativa com query direto ao banco...`);
            const suppliers = await supplierRepo.find({ relations: ["user"] });
            supplier = suppliers.find(s => s.user?.id === user.id);
          }
          
          if (supplier) {
            console.log(`✅ Fornecedor encontrado: ID ${supplier.id}`);
            responseUser.supplier_id = supplier.id;
          } else {
            console.warn(`⚠️ Nenhum fornecedor encontrado para user_id ${user.id}`);
            // Listar todos para debug
            const allSuppliers = await supplierRepo.find({ relations: ["user"] });
            console.log(`📋 Total de fornecedores no banco: ${allSuppliers.length}`);
            if (allSuppliers.length > 0) {
              console.log(`Primeira relação encontrada: user_id=${allSuppliers[0].user?.id}`);
            }
          }
        } catch (err: any) {
          console.error(`❌ Erro ao buscar fornecedor:`, err.message);
        }
      }

      // Se for loja ou admin, buscar o ID da loja
      if (user.role === "retailer" || user.role === "store" || user.role === "admin") {
        try {
          console.log(`🔍 Procurando loja para usuário ID ${user.id}`);
          const storeRepo = AppDataSource.getRepository(Store);
          const store = await storeRepo.findOne({ where: { user: { id: user.id } } });
          
          if (store) {
            console.log(`✅ Loja encontrada: ID ${store.id}`);
            responseUser.store_id = store.id;
          } else {
            console.warn(`⚠️ Nenhuma loja encontrada para user_id ${user.id}`);
          }
        } catch (err: any) {
          console.error(`❌ Erro ao buscar loja:`, err);
        }
      }

      return res.json({
        user: responseUser,
        token
      });
    } catch (error: any) {
      console.error("Erro no login:", error);
      return res.status(500).json({
        message: error.message || "Erro interno do servidor"
      });
    }
  }
}
