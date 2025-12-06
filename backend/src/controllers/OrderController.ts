import { Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { In } from "typeorm";
import { Order } from "../models/Order";
import { Store } from "../models/Store";
import { Supplier } from "../models/Supplier";
import { Campaign } from "../models/Campaign";
import { StateCondition } from "../models/StateCondition";
import { OrderItem } from "../models/OrderItem";
import { Product } from "../models/Product";
import { CashbackEntry } from "../models/CashbackEntry";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";

export class OrderController {
  // Criação: aplica condições regionais, calcula cashback automaticamente
  static async create(req: AuthRequest, res: Response) {
    try {
      const orderRepo = AppDataSource.getRepository(Order);
      const storeRepo = AppDataSource.getRepository(Store);
      const supplierRepo = AppDataSource.getRepository(Supplier);
      const campaignRepo = AppDataSource.getRepository(Campaign);
      const stateConditionRepo = AppDataSource.getRepository(StateCondition);
      const orderItemRepo = AppDataSource.getRepository(OrderItem);
      const cashbackRepo = AppDataSource.getRepository(CashbackEntry);
      const productRepo = AppDataSource.getRepository(Product);
      const userRepo = AppDataSource.getRepository(User);

      const { store_id, supplier_id, campaign_id, payment_type, is_budget, notes, items } = req.body;
      
      console.log("📤 POST /orders - Dados recebidos:", { store_id, supplier_id, campaign_id, items_count: items?.length });
      
      if (!store_id || !supplier_id || !items || items.length === 0) {
        console.error("❌ Dados obrigatórios faltando:", { store_id, supplier_id, items_length: items?.length });
        return res.status(400).json({ message: "Dados obrigatórios não preenchidos" });
      }

      console.log(`🔍 Buscando store_id=${store_id} e supplier_id=${supplier_id}`);
      
      const store = await storeRepo.findOne({ 
        where: { id: store_id }, 
        relations: ["user"] 
      });
      const supplier = await supplierRepo.findOne({ 
        where: { id: supplier_id }, 
        relations: ["user"] 
      });
      const campaign = campaign_id ? await campaignRepo.findOne({ 
        where: { id: campaign_id } 
      }) : null;
      
      console.log(`📋 Resultados da busca - Store: ${store ? "✅ encontrada" : "❌ não encontrada"}, Supplier: ${supplier ? "✅ encontrado" : "❌ não encontrado"}`);
      
      if (!store || !supplier) {
        console.error(`❌ Falha na validação: store=${!store ? "não encontrada" : "ok"}, supplier=${!supplier ? "não encontrado" : "ok"}`);
        return res.status(400).json({ message: "Loja ou fornecedor inválido" });
      }

      console.log(`✅ Validação passou: ${store.name} x ${supplier.legal_name}`);

      // Validações de campanha
      if (campaign) {
        // Verifica se campanha está ativa (datas)
        const now = new Date();
        if (campaign.start_date && new Date(campaign.start_date) > now) {
          return res.status(400).json({ message: "Campanha ainda não iniciou" });
        }
        if (campaign.end_date && new Date(campaign.end_date) < now) {
          return res.status(400).json({ message: "Campanha já encerrou" });
        }
      }

      // Aplica condições regionais (por state)
      const sc = await stateConditionRepo.findOne({ 
        where: { supplier: { id: supplier_id }, state: store.state } 
      });
      
      let subtotal = 0;
      for (const i of items) {
        const p = await productRepo.findOne({ where: { id: i.product_id } });
        let price = p ? Number(p.price || 0) : 0;
        if (sc && sc.unit_adjustment) {
          price += Number(sc.unit_adjustment || 0);
        }
        subtotal += price * i.quantity;
      }
      const tax = 0; // Exemplo: adicionar regra fiscal conforme necessário
      const total = subtotal + tax;

      // Valida valor mínimo da campanha
      if (campaign && campaign.min_order_value && total < Number(campaign.min_order_value)) {
        return res.status(400).json({ 
          message: `Valor mínimo da campanha não atingido. Mínimo: R$ ${Number(campaign.min_order_value).toFixed(2)}` 
        });
      }

      // Valida meta da campanha (se for campanha com meta geral)
      let orderStatus = "pending";
      if (campaign && campaign.target_type === 'general') {
        // Soma total dos pedidos da campanha
        const existingOrders = await orderRepo.find({ 
          where: { campaign: { id: campaign.id } },
          relations: ["store", "supplier"]
        });
        const totalCampaignOrders = existingOrders.reduce((acc, o) => acc + Number(o.total || 0), 0);
        const newTotal = totalCampaignOrders + total;
        
        // Se meta não foi atingida, pedido fica em status especial
        if (campaign.target_amount && newTotal < Number(campaign.target_amount)) {
          orderStatus = "pending_campaign_goal";
        }
      }

      // Cálculo de cashback automático
      let cashback = 0;
      if (sc && sc.cashback_percent) {
        cashback = (total - tax) * (Number(sc.cashback_percent || 0) / 100);
      }

      const order = orderRepo.create({
        store,
        supplier,
        campaign,
        status: orderStatus,
        payment_type: payment_type || "credit",
        is_budget: is_budget || false,
        notes,
        subtotal,
        tax,
        total,
      });
      await orderRepo.save(order);
      
      // Salva itens do pedido
      for (const i of items) {
        const p = await productRepo.findOne({ where: { id: i.product_id } });
        let price = p ? Number(p.price || 0) : 0;
        if (sc && sc.unit_adjustment) {
          price += Number(sc.unit_adjustment || 0);
        }
        const item = orderItemRepo.create({
          order,
          product: p,
          quantity: i.quantity,
          unit_price: price,
          total_price: price * i.quantity,
        });
        await orderItemRepo.save(item);
      }
      
      // Insere registro de cashback
      if (cashback > 0) {
        const cashbackEntry = cashbackRepo.create({ 
          order, 
          store, 
          value: cashback 
        });
        await cashbackRepo.save(cashbackEntry);
      }

      return res.status(201).json(order);
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Order);
      let where: any = {};
      if (req.user!.role === "store" || req.user!.role === "retailer") {
        where = { store: { user: { id: req.user!.id } } };
      } else if (req.user!.role === "supplier") {
        where = { supplier: { user: { id: req.user!.id } } };
      }
      const orders = await repo.find({ 
        where, 
        relations: ["store", "supplier", "campaign"],
        order: { created_at: "DESC" }
      });
      return res.json(orders);
    } catch (error: any) {
      console.error("Erro ao listar pedidos:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async get(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Order);
      const order = await repo.findOne({ 
        where: { id: Number(req.params.id) }, 
        relations: ["store", "supplier", "campaign"] 
      });
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      return res.json(order);
    } catch (error: any) {
      console.error("Erro ao buscar pedido:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Order);
      const order = await repo.findOne({ 
        where: { id: Number(req.params.id) }, 
        relations: ["store", "supplier", "supplier.user"] 
      });
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      // Fornecedor só altera pedidos para ele
      if (req.user!.role === 'supplier' && order.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status é obrigatório" });
      }
      order.status = status;
      await repo.save(order);
      return res.json(order);
    } catch (error: any) {
      console.error("Erro ao atualizar status do pedido:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async orderItems(req: AuthRequest, res: Response) {
    try {
      const itemRepo = AppDataSource.getRepository(OrderItem);
      const items = await itemRepo.find({ 
        where: { order: { id: Number(req.params.id) } }, 
        relations: ["product"] 
      });
      return res.json(items);
    } catch (error: any) {
      console.error("Erro ao buscar itens do pedido:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
