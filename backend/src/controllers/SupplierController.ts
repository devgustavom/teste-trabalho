import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Supplier } from "../models/Supplier";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import { generateUsername, generatePassword, generateEmail } from "../utils/credentialGenerator";

export class SupplierController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      const userRepo = AppDataSource.getRepository(User);
      const { legal_name, trade_name, cnpj, state, city, address, contact_name, contact_phone, email, commercial_policy, whatsapp_link, category } = req.body;
      
      if (!legal_name || !state) {
        return res.status(400).json({ message: 'Nome legal e estado são obrigatórios' });
      }
      
      // Se não forneceu user_id, gera credenciais automaticamente
      let user: User;
      if (req.body.user_id) {
        user = await userRepo.findOne({ where: { id: req.body.user_id } });
        if (!user || user.role !== 'supplier') {
          return res.status(400).json({ message: 'Usuário fornecedor inválido' });
        }
      } else {
        // Gera credenciais automaticamente
        const supplierName = trade_name || legal_name;
        const username = generateUsername(supplierName, cnpj);
        const generatedPassword = generatePassword();
        const userEmail = email || generateEmail(supplierName, cnpj);
        
        // Verifica se email já existe
        const existingUser = await userRepo.findOne({ where: { email: userEmail } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email já cadastrado' });
        }
        
        // Salva senha temporariamente antes do hash
        const tempPassword = generatedPassword;
        
        user = userRepo.create({
          name: contact_name || supplierName || "Fornecedor",
          email: userEmail,
          password: tempPassword, // Será hasheado pelo BeforeInsert hook
          role: 'supplier'
        });
        await userRepo.save(user);
        
        // Retorna credenciais na resposta
        const supplier = repo.create({ 
          user, 
          legal_name, 
          trade_name, 
          cnpj, 
          state, 
          city, 
          address, 
          contact_name, 
          contact_phone, 
          email: userEmail,
          commercial_policy, 
          whatsapp_link, 
          category 
        });
        await repo.save(supplier);
        
        const response: any = { ...supplier };
        response.credentials = {
          username: userEmail,
          password: tempPassword,
        };
        
        return res.status(201).json(response);
      }
      
      const supplier = repo.create({ 
        user, 
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
        category 
      });
      await repo.save(supplier);
      
      return res.status(201).json(supplier);
    } catch (e: any) {
      console.error("Erro ao criar fornecedor:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      const suppliers = await repo.find({ relations: ["user"] });
      return res.json(suppliers);
    } catch (e: any) {
      console.error("Erro ao listar fornecedores:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      const supplier = await repo.findOne({ 
        where: { id: Number(req.params.id) }, 
        relations: ["user"] 
      });
      if (!supplier) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      return res.json(supplier);
    } catch (e: any) {
      console.error("Erro ao buscar fornecedor:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
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
      if (!supplier) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      // Fornecedor só pode editar seus próprios dados
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
      if (category) supplier.category = category;
      await repo.save(supplier);
      return res.json(supplier);
    } catch (e: any) {
      console.error("Erro ao atualizar fornecedor:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Supplier);
      const { id } = req.params;
      const supplier = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["user"] 
      });
      if (!supplier) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      // Apenas admin pode remover
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Apenas admin pode remover' });
      }
      await repo.remove(supplier);
      return res.status(204).send();
    } catch (e: any) {
      console.error("Erro ao deletar fornecedor:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }
}
