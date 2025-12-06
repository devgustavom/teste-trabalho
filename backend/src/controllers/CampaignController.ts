import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { In } from "typeorm";
import { Campaign } from "../models/Campaign";
import { Supplier } from "../models/Supplier";
import { Product } from "../models/Product";
import { CampaignProduct } from "../models/CampaignProduct";
import { Order } from "../models/Order";
import { AuthRequest } from "../middlewares/auth";

export class CampaignController {
  // Criação com vínculo de produtos
  static async create(req: AuthRequest, res: Response) {
    try {
      const campaignRepo = AppDataSource.getRepository(Campaign);
      const supplierRepo = AppDataSource.getRepository(Supplier);
      const productRepo = AppDataSource.getRepository(Product);
      const campaignProductRepo = AppDataSource.getRepository(CampaignProduct);
      const { supplier_id, title, description, banner_url, target_amount, min_order_value, start_date, end_date, target_type, product_ids } = req.body;
      
      if (!supplier_id || !title) {
        return res.status(400).json({ message: "Fornecedor e título são obrigatórios" });
      }

      const supplier = await supplierRepo.findOne({ 
        where: { id: supplier_id },
        relations: ["user"]
      });
      if (!supplier) {
        return res.status(400).json({ message: 'Fornecedor inválido' });
      }
      
      if (req.user!.role === "supplier" && supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const camp = campaignRepo.create({ 
        supplier, 
        title, 
        description, 
        banner_url, 
        target_amount: target_amount ? Number(target_amount) : null, 
        min_order_value: min_order_value ? Number(min_order_value) : 0, 
        start_date: start_date || null, 
        end_date: end_date || null, 
        target_type: target_type || "individual" 
      });
      await campaignRepo.save(camp);
      
      if (product_ids?.length) {
        const products = await productRepo.find({ where: { id: In(product_ids) } });
        for (const p of products) {
          const cp = campaignProductRepo.create({ campaign: camp, product: p });
          await campaignProductRepo.save(cp);
        }
      }
      return res.status(201).json(camp);
    } catch (error: any) {
      console.error("Erro ao criar campanha:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  // Listagem
  static async list(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Campaign);
      const { supplier_id } = req.query;
      
      let where: any = {};
      if (supplier_id) {
        where = { supplier: { id: Number(supplier_id) } };
      }
      
      const campaigns = await repo.find({ 
        where,
        relations: ["supplier"] 
      });
      return res.json(campaigns);
    } catch (error: any) {
      console.error("Erro ao listar campanhas:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  // Detalhe
  static async get(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Campaign);
      const campaignProductRepo = AppDataSource.getRepository(CampaignProduct);
      const campaign = await repo.findOne({ 
        where: { id: Number(req.params.id) }, 
        relations: ["supplier"] 
      });
      if (!campaign) {
        return res.status(404).json({ message: 'Campanha não encontrada' });
      }
      const cp = await campaignProductRepo.find({ 
        where: { campaign: { id: campaign.id } }, 
        relations: ["product"] 
      });
      (campaign as any).products = cp.map(c => c.product);
      return res.json(campaign);
    } catch (error: any) {
      console.error("Erro ao buscar campanha:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async update(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Campaign);
      const supplierRepo = AppDataSource.getRepository(Supplier);
      const campaignProductRepo = AppDataSource.getRepository(CampaignProduct);
      const productRepo = AppDataSource.getRepository(Product);
      const { id } = req.params;
      const campaign = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["supplier", "supplier.user"] 
      });
      if (!campaign) {
        return res.status(404).json({ message: 'Campanha não encontrada' });
      }
      // Fornecedor só pode editar suas
      if (req.user!.role === "supplier" && campaign.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      const { title, description, banner_url, target_amount, min_order_value, start_date, end_date, target_type, product_ids } = req.body;
      if (title) campaign.title = title;
      if (description !== undefined) campaign.description = description;
      if (banner_url !== undefined) campaign.banner_url = banner_url;
      if (target_amount !== undefined) campaign.target_amount = target_amount ? Number(target_amount) : null;
      if (min_order_value !== undefined) campaign.min_order_value = min_order_value ? Number(min_order_value) : 0;
      if (start_date !== undefined) campaign.start_date = start_date || null;
      if (end_date !== undefined) campaign.end_date = end_date || null;
      if (target_type) campaign.target_type = target_type;
      await repo.save(campaign);
      // Atualiza vínculos produtos
      if (product_ids) {
        await campaignProductRepo.delete({ campaign: { id: campaign.id } });
        if (product_ids.length > 0) {
          const products = await productRepo.find({ where: { id: In(product_ids) } });
          for (const p of products) {
            const cp = campaignProductRepo.create({ campaign, product: p });
            await campaignProductRepo.save(cp);
          }
        }
      }
      return res.json(campaign);
    } catch (error: any) {
      console.error("Erro ao atualizar campanha:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Campaign);
      const campaignProductRepo = AppDataSource.getRepository(CampaignProduct);
      const { id } = req.params;
      const campaign = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["supplier", "supplier.user"] 
      });
      if (!campaign) {
        return res.status(404).json({ message: 'Campanha não encontrada' });
      }
      if (req.user!.role === "supplier" && campaign.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      // Deleta vínculos
      await campaignProductRepo.delete({ campaign: { id: campaign.id } });
      await repo.remove(campaign);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar campanha:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
  
  // Validação status de meta de campanha (checa se campanha de meta geral atingiu objetivo)
  static async checkMeta(req: Request, res: Response) {
    try {
      const campaignRepo = AppDataSource.getRepository(Campaign);
      const orderRepo = AppDataSource.getRepository(Order);
      const campaignId = Number(req.params.id);
      const campaign = await campaignRepo.findOne({ where: { id: campaignId } });
      if (!campaign) {
        return res.status(404).json({ message: "Campanha não encontrada" });
      }
      
      if (campaign.target_type !== 'general') {
        return res.json({ 
          metaAtingida: true, 
          totalPedidos: 0,
          message: "Campanha individual - cada pedido é válido independentemente" 
        });
      }
      
      // Soma total dos pedidos da campanha
      const orders = await orderRepo.find({ 
        where: { campaign: { id: campaignId } },
        relations: ["store", "supplier"]
      });
      
      const totalPedidos = orders.reduce((acc, order) => acc + Number(order.total || 0), 0);
      const metaAtingida = campaign.target_amount ? totalPedidos >= Number(campaign.target_amount) : false;
      
      return res.json({ 
        metaAtingida, 
        totalPedidos: totalPedidos.toFixed(2),
        meta: campaign.target_amount ? Number(campaign.target_amount).toFixed(2) : null,
        faltam: campaign.target_amount && !metaAtingida 
          ? (Number(campaign.target_amount) - totalPedidos).toFixed(2) 
          : 0
      });
    } catch (error: any) {
      console.error("Erro ao verificar meta da campanha:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
