import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { File } from "../models/File";
import { Supplier } from "../models/Supplier";
import { AuthRequest } from "../middlewares/auth";
import path from "path";
import fs from "fs";

export class FileController {
  static async upload(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(File);
      const supplierRepo = AppDataSource.getRepository(Supplier);
      const { supplier_id, description, file_type } = req.body;
      
      if (!supplier_id) {
        return res.status(400).json({ message: 'Fornecedor é obrigatório' });
      }
      
      const supplier = await supplierRepo.findOne({ 
        where: { id: supplier_id },
        relations: ["user"]
      });
      if (!supplier) {
        return res.status(400).json({ message: 'Fornecedor inválido' });
      }
      
      if (req.user!.role === 'supplier' && supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'Arquivo não enviado' });
      }
      
      const file_url = `/uploads/${req.file.filename}`;
      const file = repo.create({ 
        supplier, 
        file_type: file_type || "pdf", 
        file_url, 
        description: description || req.file.originalname 
      });
      await repo.save(file);
      return res.status(201).json(file);
    } catch (error: any) {
      console.error("Erro ao fazer upload de arquivo:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(File);
      const { supplier_id } = req.query;
      const where = supplier_id ? { supplier: { id: Number(supplier_id) } } : {};
      const files = await repo.find({ 
        where, 
        relations: ["supplier"] 
      });
      return res.json(files);
    } catch (error: any) {
      console.error("Erro ao listar arquivos:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async download(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(File);
      const file = await repo.findOne({ where: { id: Number(req.params.id) } });
      if (!file) {
        return res.status(404).json({ message: 'Arquivo não encontrado' });
      }
      const filePath = path.resolve(__dirname, '../../uploads', path.basename(file.file_url));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Arquivo físico não encontrado' });
      }
      return res.download(filePath);
    } catch (error: any) {
      console.error("Erro ao baixar arquivo:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(File);
      const { id } = req.params;
      const file = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["supplier", "supplier.user"] 
      });
      if (!file) {
        return res.status(404).json({ message: 'Arquivo não encontrado' });
      }
      if (req.user!.role === 'supplier' && file.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      // Remove físico
      const filePath = path.resolve(__dirname, '../../uploads', path.basename(file.file_url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await repo.remove(file);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar arquivo:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
