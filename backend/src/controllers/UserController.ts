import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { User } from "../models/User";

export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(User);
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Dados obrigatórios não preenchidos' });
      }
      const exists = await repo.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: 'E-mail já cadastrado' });
      }
      const user = repo.create({ name, email, password, role });
      await repo.save(user);
      const { password: _, ...userNoPass } = user;
      return res.status(201).json(userNoPass);
    } catch (e: any) {
      console.error("Erro ao criar usuário:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(User);
      const users = await repo.find();
      const usersNoPass = users.map(({ password, ...u }) => u);
      return res.json(usersNoPass);
    } catch (e: any) {
      console.error("Erro ao listar usuários:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(User);
      const user = await repo.findOne({ where: { id: Number(id) } });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      const { password, ...userNoPass } = user;
      return res.json(userNoPass);
    } catch (e: any) {
      console.error("Erro ao buscar usuário:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(User);
      const user = await repo.findOne({ where: { id: Number(id) } });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      const { name, email, role } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      await repo.save(user);
      const { password, ...userNoPass } = user;
      return res.json(userNoPass);
    } catch (e: any) {
      console.error("Erro ao atualizar usuário:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(User);
      const user = await repo.findOne({ where: { id: Number(id) } });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      await repo.remove(user);
      return res.status(204).send();
    } catch (e: any) {
      console.error("Erro ao deletar usuário:", e);
      return res.status(500).json({ message: e.message || 'Erro interno do servidor' });
    }
  }
}
