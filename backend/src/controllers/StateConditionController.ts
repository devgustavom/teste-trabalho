import { Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { StateCondition } from "../models/StateCondition";
import { Supplier } from "../models/Supplier";
import { AuthRequest } from "../middlewares/auth";

export class StateConditionController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(StateCondition);
      const supplierRepo = AppDataSource.getRepository(Supplier);
      const { supplier_id, state, cashback_percent, payment_term, unit_adjustment } = req.body;
      
      if (!supplier_id || !state) {
        return res.status(400).json({ message: "Fornecedor e estado são obrigatórios" });
      }
      
      const supplier = await supplierRepo.findOne({ 
        where: { id: supplier_id },
        relations: ["user"]
      });
      if (!supplier) {
        return res.status(400).json({ message: "Fornecedor inválido" });
      }
      
      if (req.user!.role === 'supplier' && supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const condition = repo.create({ 
        supplier, 
        state, 
        cashback_percent: cashback_percent ? Number(cashback_percent) : 0, 
        payment_term: payment_term ? Number(payment_term) : null, 
        unit_adjustment: unit_adjustment ? Number(unit_adjustment) : 0 
      });
      await repo.save(condition);
      return res.status(201).json(condition);
    } catch (error: any) {
      console.error("Erro ao criar condição regional:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(StateCondition);
      const { supplier_id } = req.query;
      
      let where: any = {};
      if (supplier_id) {
        where = { supplier: { id: Number(supplier_id) } };
      } else if (req.user!.role === 'supplier') {
        where = { supplier: { user: { id: req.user!.id } } };
      }
      
      const items = await repo.find({ 
        relations: ["supplier"], 
        where 
      });
      return res.json(items);
    } catch (error: any) {
      console.error("Erro ao listar condições regionais:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async get(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(StateCondition);
      const item = await repo.findOne({ 
        where: { id: Number(req.params.id) }, 
        relations: ["supplier", "supplier.user"] 
      });
      if (!item) {
        return res.status(404).json({ message: "Condição não encontrada" });
      }
      if (req.user!.role === 'supplier' && item.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      return res.json(item);
    } catch (error: any) {
      console.error("Erro ao buscar condição regional:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(StateCondition);
      const { id } = req.params;
      const item = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["supplier", "supplier.user"] 
      });
      if (!item) {
        return res.status(404).json({ message: "Condição não encontrada" });
      }
      if (req.user!.role === 'supplier' && item.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      const { state, cashback_percent, payment_term, unit_adjustment } = req.body;
      if (state) item.state = state;
      if (cashback_percent != null) item.cashback_percent = Number(cashback_percent);
      if (payment_term != null) item.payment_term = payment_term ? Number(payment_term) : null;
      if (unit_adjustment != null) item.unit_adjustment = Number(unit_adjustment);
      await repo.save(item);
      return res.json(item);
    } catch (error: any) {
      console.error("Erro ao atualizar condição regional:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(StateCondition);
      const { id } = req.params;
      const item = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["supplier", "supplier.user"] 
      });
      if (!item) {
        return res.status(404).json({ message: "Condição não encontrada" });
      }
      if (req.user!.role === 'supplier' && item.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      await repo.remove(item);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar condição regional:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
