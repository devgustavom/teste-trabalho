import { Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Withdrawal } from "../models/Withdrawal";
import { Store } from "../models/Store";
import { CashbackEntry } from "../models/CashbackEntry";
import { AuthRequest } from "../middlewares/auth";

export class WithdrawalController {
  static async request(req: AuthRequest, res: Response) {
    try {
      const withdrawalRepo = AppDataSource.getRepository(Withdrawal);
      const storeRepo = AppDataSource.getRepository(Store);
      const cashbackRepo = AppDataSource.getRepository(CashbackEntry);
      const { store_id, pix_key, amount } = req.body;
      
      if (!store_id || !pix_key || !amount) {
        return res.status(400).json({ message: "Dados obrigatórios não preenchidos" });
      }
      
      const store = await storeRepo.findOne({ where: { id: store_id } });
      if (!store) {
        return res.status(400).json({ message: "Loja inválida" });
      }
      
      // Conferir se valor confirmado está disponível (simples/soma)
      const cb = await cashbackRepo.find({ 
        where: { 
          store: { id: store_id }, 
          confirmed: true, 
          withdrawal_request_id: null 
        } 
      });
      const saldo = cb.reduce((acc, v) => acc + Number(v.value || 0), 0);
      
      if (Number(amount) > saldo) {
        return res.status(400).json({ 
          message: `Valor superior ao disponível. Saldo: R$ ${saldo.toFixed(2)}` 
        });
      }
      
      const wd = withdrawalRepo.create({ 
        store, 
        pix_key, 
        amount: Number(amount), 
        status: "pending" 
      });
      await withdrawalRepo.save(wd);
      
      // Vincula os cashback na requisição
      let remainingAmount = Number(amount);
      for (const c of cb) {
        if (remainingAmount <= 0) break;
        c.withdrawal_request_id = wd.id;
        remainingAmount -= Number(c.value || 0);
        await cashbackRepo.save(c);
      }
      
      return res.status(201).json(wd);
    } catch (error: any) {
      console.error("Erro ao solicitar saque:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async list(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Withdrawal);
      let where: any = {};
      if (req.user!.role === 'store' || req.user!.role === 'retailer') {
        where = { store: { user: { id: req.user!.id } } };
      }
      const items = await repo.find({ 
        where, 
        relations: ["store"] 
      });
      return res.json(items);
    } catch (error: any) {
      console.error("Erro ao listar saques:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Withdrawal);
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status é obrigatório" });
      }
      
      const wd = await repo.findOne({ where: { id: Number(id) } });
      if (!wd) {
        return res.status(404).json({ message: "Solicitação não encontrada" });
      }
      wd.status = status;
      await repo.save(wd);
      return res.json(wd);
    } catch (error: any) {
      console.error("Erro ao atualizar status do saque:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
