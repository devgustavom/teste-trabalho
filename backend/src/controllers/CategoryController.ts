import { Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Category } from "../models/Category";
import { AuthRequest } from "../middlewares/auth";

export class CategoryController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Category);
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Nome obrigatório" });
      }
      const exists = await repo.findOne({ where: { name } });
      if (exists) {
        return res.status(400).json({ message: "Categoria já existe" });
      }
      const category = repo.create({ name });
      await repo.save(category);
      return res.status(201).json(category);
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async list(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Category);
      const categories = await repo.find();
      return res.json(categories);
    } catch (error: any) {
      console.error("Erro ao listar categorias:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async get(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Category);
      const category = await repo.findOne({ where: { id: Number(req.params.id) } });
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      return res.json(category);
    } catch (error: any) {
      console.error("Erro ao buscar categoria:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async update(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Category);
      const { id } = req.params;
      const { name } = req.body;
      const category = await repo.findOne({ where: { id: Number(id) } });
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      if (name) category.name = name;
      await repo.save(category);
      return res.json(category);
    } catch (error: any) {
      console.error("Erro ao atualizar categoria:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Category);
      const { id } = req.params;
      const category = await repo.findOne({ where: { id: Number(id) } });
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      await repo.remove(category);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar categoria:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
