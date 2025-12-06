import { Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Between } from "typeorm";
import { Order } from "../models/Order";
import { CashbackEntry } from "../models/CashbackEntry";
import { Store } from "../models/Store";
import { Supplier } from "../models/Supplier";
import { AuthRequest } from "../middlewares/auth";

export class ReportController {
  /**
   * Relatório de pedidos
   * Filtros: data inicial, data final, status, supplier_id, store_id
   */
  static async orders(req: AuthRequest, res: Response) {
    try {
      const orderRepo = AppDataSource.getRepository(Order);
      const { start_date, end_date, status, supplier_id, store_id } = req.query;

      let where: any = {};

      // Filtro de datas
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date as string), new Date(end_date as string));
      } else if (start_date) {
        where.created_at = Between(new Date(start_date as string), new Date());
      } else if (end_date) {
        where.created_at = Between(new Date('2000-01-01'), new Date(end_date as string));
      }

      // Filtro de status
      if (status) {
        where.status = status;
      }

      // Filtro de fornecedor
      if (supplier_id) {
        where.supplier = { id: Number(supplier_id) };
      }

      // Filtro de loja
      if (store_id) {
        where.store = { id: Number(store_id) };
      }

      // Se for fornecedor, só vê seus pedidos
      if (req.user!.role === 'supplier') {
        where.supplier = { user: { id: req.user!.id } };
      }

      // Se for loja, só vê seus pedidos
      if (req.user!.role === 'store' || req.user!.role === 'retailer') {
        where.store = { user: { id: req.user!.id } };
      }

      const orders = await orderRepo.find({
        where,
        relations: ["store", "supplier", "campaign"],
        order: { created_at: "DESC" }
      });

      // Estatísticas
      const totalOrders = orders.length;
      const totalValue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const ordersByStatus: Record<string, { count: number; total: number }> = {};
      
      orders.forEach((o) => {
        const status = o.status || 'unknown';
        if (!ordersByStatus[status]) {
          ordersByStatus[status] = { count: 0, total: 0 };
        }
        ordersByStatus[status].count += 1;
        ordersByStatus[status].total += Number(o.total || 0);
      });

      return res.json({
        orders,
        totalOrders,
        totalValue,
        ordersByStatus,
        averageOrderValue: totalOrders > 0 ? totalValue / totalOrders : 0
      });
    } catch (error: any) {
      console.error("Erro ao gerar relatório de pedidos:", error);
      return res.status(500).json({ message: error.message || "Erro ao gerar relatório" });
    }
  }

  /**
   * Relatório de faturamento
   * Pode agrupar por fornecedor ou loja
   */
  static async revenue(req: AuthRequest, res: Response) {
    try {
      const orderRepo = AppDataSource.getRepository(Order);
      const { start_date, end_date, group_by } = req.query;

      let where: any = {};

      // Filtro de datas
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date as string), new Date(end_date as string));
      } else if (start_date) {
        where.created_at = Between(new Date(start_date as string), new Date());
      } else if (end_date) {
        where.created_at = Between(new Date('2000-01-01'), new Date(end_date as string));
      }

      // Se for fornecedor, só vê seus pedidos
      if (req.user!.role === 'supplier') {
        where.supplier = { user: { id: req.user!.id } };
      }

      const orders = await orderRepo.find({
        where,
        relations: ["store", "supplier"],
        order: { created_at: "DESC" }
      });

      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalTransactions = orders.length;

      let grouped: any[] = [];

      if (group_by === 'supplier') {
        const supplierMap: Record<number, { name: string; orders: number; totalRevenue: number }> = {};
        
        orders.forEach((o) => {
          const supplierId = o.supplier?.id;
          if (supplierId) {
            if (!supplierMap[supplierId]) {
              supplierMap[supplierId] = {
                name: o.supplier?.legal_name || o.supplier?.trade_name || 'Fornecedor',
                orders: 0,
                totalRevenue: 0
              };
            }
            supplierMap[supplierId].orders += 1;
            supplierMap[supplierId].totalRevenue += Number(o.total || 0);
          }
        });

        grouped = Object.values(supplierMap);
      } else if (group_by === 'store') {
        const storeMap: Record<number, { name: string; orders: number; totalRevenue: number }> = {};
        
        orders.forEach((o) => {
          const storeId = o.store?.id;
          if (storeId) {
            if (!storeMap[storeId]) {
              storeMap[storeId] = {
                name: o.store?.name || 'Loja',
                orders: 0,
                totalRevenue: 0
              };
            }
            storeMap[storeId].orders += 1;
            storeMap[storeId].totalRevenue += Number(o.total || 0);
          }
        });

        grouped = Object.values(storeMap);
      }

      return res.json({
        totalRevenue,
        totalTransactions,
        grouped
      });
    } catch (error: any) {
      console.error("Erro ao gerar relatório de faturamento:", error);
      return res.status(500).json({ message: error.message || "Erro ao gerar relatório" });
    }
  }

  /**
   * Relatório de cashback
   */
  static async cashback(req: AuthRequest, res: Response) {
    try {
      const cashbackRepo = AppDataSource.getRepository(CashbackEntry);
      const { start_date, end_date, store_id, confirmed } = req.query;

      let where: any = {};

      // Filtro de datas
      if (start_date && end_date) {
        where.created_at = Between(new Date(start_date as string), new Date(end_date as string));
      } else if (start_date) {
        where.created_at = Between(new Date(start_date as string), new Date());
      } else if (end_date) {
        where.created_at = Between(new Date('2000-01-01'), new Date(end_date as string));
      }

      // Filtro de loja
      if (store_id) {
        where.store = { id: Number(store_id) };
      }

      // Filtro de confirmado
      if (confirmed !== undefined) {
        where.confirmed = confirmed === 'true';
      }

      // Se for loja, só vê seu cashback
      if (req.user!.role === 'store' || req.user!.role === 'retailer') {
        where.store = { user: { id: req.user!.id } };
      }

      const cashbackEntries = await cashbackRepo.find({
        where,
        relations: ["store", "order"],
        order: { created_at: "DESC" }
      });

      const totalCashback = cashbackEntries.reduce((sum, cb) => sum + Number(cb.value || 0), 0);
      const confirmedCashback = cashbackEntries
        .filter(cb => cb.confirmed)
        .reduce((sum, cb) => sum + Number(cb.value || 0), 0);
      const pendingCashback = cashbackEntries
        .filter(cb => !cb.confirmed)
        .reduce((sum, cb) => sum + Number(cb.value || 0), 0);

      return res.json({
        totalCashback,
        confirmedCashback,
        pendingCashback,
        entries: cashbackEntries
      });
    } catch (error: any) {
      console.error("Erro ao gerar relatório de cashback:", error);
      return res.status(500).json({ message: error.message || "Erro ao gerar relatório" });
    }
  }
}
