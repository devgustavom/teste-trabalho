import { Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { CashbackEntry } from "../models/CashbackEntry";
import { AuthRequest } from "../middlewares/auth";
import path from "path";
import fs from "fs";

export class CashbackController {
  static async list(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CashbackEntry);
      let where: any = {};
      if (req.user!.role === 'store' || req.user!.role === 'retailer') {
        where = { store: { user: { id: req.user!.id } } };
      }
      // Admin vê todos
      const items = await repo.find({ 
        where, 
        relations: ["store", "order"] 
      });
      return res.json(items);
    } catch (error: any) {
      console.error("Erro ao listar cashback:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async confirm(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CashbackEntry);
      const { id } = req.params;
      const cb = await repo.findOne({ where: { id: Number(id) } });
      if (!cb) {
        return res.status(404).json({ message: "Cashback não encontrado" });
      }
      cb.confirmed = true;
      await repo.save(cb);
      return res.json(cb);
    } catch (error: any) {
      console.error("Erro ao confirmar cashback:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async uploadProof(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CashbackEntry);
      const { id } = req.params;
      const cb = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["store", "store.user"] 
      });
      
      if (!cb) {
        return res.status(404).json({ message: "Cashback não encontrado" });
      }
      
      // Verifica se loja só pode fazer upload dos seus próprios cashbacks
      if (req.user!.role === 'store' || req.user!.role === 'retailer') {
        if (cb.store.user.id !== req.user!.id) {
          return res.status(403).json({ message: 'Acesso negado' });
        }
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'Arquivo não enviado' });
      }
      
      const file_url = `/uploads/${req.file.filename}`;
      cb.proof_file_url = file_url;
      await repo.save(cb);
      
      return res.json(cb);
    } catch (error: any) {
      console.error("Erro ao fazer upload de comprovante:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async downloadProof(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(CashbackEntry);
      const { id } = req.params;
      const cb = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["store", "store.user"] 
      });
      
      if (!cb) {
        return res.status(404).json({ message: "Cashback não encontrado" });
      }
      if (!cb.proof_file_url) {
        return res.status(404).json({ message: "Comprovante não encontrado" });
      }
      
      // Verifica permissões
      if (req.user!.role === 'store' || req.user!.role === 'retailer') {
        if (cb.store.user.id !== req.user!.id) {
          return res.status(403).json({ message: 'Acesso negado' });
        }
      }
      
      const filePath = path.resolve(__dirname, '../../', cb.proof_file_url);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Arquivo não encontrado no servidor" });
      }
      
      return res.download(filePath);
    } catch (error: any) {
      console.error("Erro ao baixar comprovante:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
