import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import { Product } from "../models/Product";
import { Supplier } from "../models/Supplier";
import { Category } from "../models/Category";
import { AuthRequest } from "../middlewares/auth";

export class ProductController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Product);
      const supplierRepo = AppDataSource.getRepository(Supplier);
      const categoryRepo = AppDataSource.getRepository(Category);
      const { supplier_id, category_id, name, description, price, stock, image_url } = req.body;
      
      console.log("📦 Criando produto com dados:", { supplier_id, category_id, name, price });
      
      if (!supplier_id || !category_id || !name || price === undefined) {
        console.error("❌ Validação falhou:", { supplier_id, category_id, name, price });
        return res.status(400).json({ message: "Dados obrigatórios não preenchidos: fornecedor, categoria, nome e preço são obrigatórios" });
      }

      console.log("🔍 Procurando fornecedor com ID:", supplier_id);
      const supplier = await supplierRepo.findOne({ 
        where: { id: Number(supplier_id) },
        relations: ["user"]
      });
      console.log("✓ Fornecedor encontrado:", supplier ? supplier.id : "NÃO ENCONTRADO");
      
      console.log("🔍 Procurando categoria com ID:", category_id);
      const category = await categoryRepo.findOne({ where: { id: Number(category_id) } });
      console.log("✓ Categoria encontrada:", category ? category.id : "NÃO ENCONTRADA");
      
      if (!supplier) {
        console.error("❌ Fornecedor não encontrado:", supplier_id);
        return res.status(400).json({ message: `Fornecedor com ID ${supplier_id} não encontrado` });
      }
      
      if (!category) {
        console.error("❌ Categoria não encontrada:", category_id);
        return res.status(400).json({ message: `Categoria com ID ${category_id} não encontrada` });
      }
      
      // Fornecedor só pode criar para si; admin pode tudo
      if (req.user!.role === 'supplier' && supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const product = repo.create({ 
        supplier, 
        category, 
        name, 
        description, 
        price: Number(price), 
        stock: stock ? Number(stock) : 0, 
        image_url 
      });
      await repo.save(product);
      return res.status(201).json(product);
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Product);
      const { supplier_id } = req.query;
      
      let where: any = {};
      if (supplier_id) {
        where = { supplier: { id: Number(supplier_id) } };
      }
      
      const products = await repo.find({ 
        where,
        relations: ["supplier", "category"] 
      });
      return res.json(products);
    } catch (error: any) {
      console.error("Erro ao listar produtos:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Product);
      const product = await repo.findOne({ 
        where: { id: Number(req.params.id) }, 
        relations: ["supplier", "category"] 
      });
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      return res.json(product);
    } catch (error: any) {
      console.error("Erro ao buscar produto:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Product);
      const supplierRepo = AppDataSource.getRepository(Supplier);
      const categoryRepo = AppDataSource.getRepository(Category);
      const { id } = req.params;
      const product = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["supplier", "supplier.user", "category"] 
      });
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      // Fornecedor só pode editar seus produtos
      if (req.user!.role === 'supplier' && product.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      const { name, description, price, stock, image_url, category_id } = req.body;
      if (name) product.name = name;
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (image_url !== undefined) product.image_url = image_url;
      
      // Atualizar categoria com validação
      if (category_id) {
        const category = await categoryRepo.findOne({ where: { id: Number(category_id) } });
        if (!category) {
          return res.status(400).json({ message: "Categoria inválida ou não encontrada" });
        }
        product.category = category;
      }
      
      await repo.save(product);
      return res.json(product);
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Product);
      const { id } = req.params;
      const product = await repo.findOne({ 
        where: { id: Number(id) }, 
        relations: ["supplier", "supplier.user"] 
      });
      if (!product) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      // Fornecedor só pode apagar seus produtos
      if (req.user!.role === 'supplier' && product.supplier.user.id !== req.user!.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      await repo.remove(product);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar produto:", error);
      return res.status(500).json({ message: error.message || "Erro interno do servidor" });
    }
  }
}
