import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Store } from "../models/Store";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import { generateUsername, generatePassword, generateEmail } from "../utils/credentialGenerator";

export class StoreController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Store);
      const userRepo = AppDataSource.getRepository(User);
      const { name, cnpj, state, city, address, responsible, phone, email } = req.body;
      
      if (!name || !state) {
        return res.status(400).json({ message: 'Nome e estado são obrigatórios' });
      }
      
      // Se não forneceu user_id, gera credenciais automaticamente
      let user: User;
      if (req.body.user_id) {
        user = await userRepo.findOne({ where: { id: req.body.user_id } });
        if (!user || user.role !== 'store' && user.role !== 'retailer') {
          return res.status(400).json({ message: 'Usuário loja inválido' });
        }
      } else {
        // Gera credenciais automaticamente
        const username = generateUsername(name, cnpj);
        const generatedPassword = generatePassword();
        const userEmail = email || generateEmail(name, cnpj);
        
        // Verifica se email já existe
        const existingUser = await userRepo.findOne({ where: { email: userEmail } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email já cadastrado' });
        }
        
        // Salva senha temporariamente antes do hash
        const tempPassword = generatedPassword;
        
        user = userRepo.create({
          name: name || responsible || "Loja",
          email: userEmail,
          password: tempPassword, // Será hasheado pelo BeforeInsert hook
          role: 'retailer' // Usar 'retailer' em vez de 'store'
        });
        await userRepo.save(user);
        
        // Retorna credenciais na resposta
        const store = repo.create({ user, name, cnpj, state, city, address, responsible, phone });
        await repo.save(store);
        
        const response: any = { ...store };
        response.credentials = {
          username: userEmail,
          password: tempPassword,
        };
        
        return res.status(201).json(response);
      }
      
      const store = repo.create({ user, name, cnpj, state, city, address, responsible, phone });
      await repo.save(store);
      
      return res.status(201).json(store);
    } catch (e: any) {
      console.error("Erro ao criar loja:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Store);
      const stores = await repo.find({ relations: ["user"] });
      return res.json(stores);
    } catch (e: any) {
      console.error("Erro ao listar lojas:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Store);
      const store = await repo.findOne({ 
        where: { id: Number(req.params.id) }, 
        relations: ["user"] 
      });
      if (!store) {
        return res.status(404).json({ message: 'Loja não encontrada' });
      }
      return res.json(store);
    } catch (e: any) {
      console.error("Erro ao buscar loja:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Store);
      const { id } = req.params;
      const store = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["user"] 
      });
      if (!store) {
        return res.status(404).json({ message: 'Loja não encontrada' });
      }
      // Loja só pode editar seus próprios dados
      if ((req.user!.role === 'store' || req.user!.role === 'retailer') && store.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      const { name, cnpj, state, city, address, responsible, phone } = req.body;
      if (name) store.name = name;
      if (cnpj) store.cnpj = cnpj;
      if (state) store.state = state;
      if (city) store.city = city;
      if (address) store.address = address;
      if (responsible) store.responsible = responsible;
      if (phone) store.phone = phone;
      await repo.save(store);
      return res.json(store);
    } catch (e: any) {
      console.error("Erro ao atualizar loja:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Store);
      const userRepo = AppDataSource.getRepository(User);
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'ID inválido' });
      }

      const store = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["user"] 
      });
      
      if (!store) {
        return res.status(404).json({ message: 'Loja não encontrada' });
      }
      
      // Apenas admin pode remover
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: 'Apenas admin pode remover' });
      }

      // Remove a loja (o ON DELETE CASCADE no schema vai deletar automaticamente:
      // - orders relacionados
      // - cashback_entries relacionados  
      // - withdrawals relacionados
      // O usuário será deletado automaticamente pelo ON DELETE CASCADE na tabela stores)
      await repo.remove(store);

      return res.status(204).send();
    } catch (e: any) {
      console.error("Erro ao deletar loja:", e);
      
      // Verifica se é erro de constraint (foreign key)
      if (e.code === '23503' || e.message?.includes('foreign key')) {
        return res.status(400).json({ 
          message: 'Não é possível excluir a loja pois existem registros relacionados. Entre em contato com o suporte.' 
        });
      }
      
      return res.status(500).json({ 
        message: e.message || 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? e.stack : undefined
      });
    }
  }
}
