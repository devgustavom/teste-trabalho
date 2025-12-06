import { Request, Response } from "express";
import { AppDataSource } from "../config/ormconfig";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import dotenv from "dotenv";
dotenv.config();

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const repo = AppDataSource.getRepository(User);
      const user = await repo.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET não configurado no .env");
        return res.status(500).json({ message: "Erro de configuração do servidor" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
      );

      user.last_login = new Date();
      await repo.save(user);

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error: any) {
      console.error("Erro no login:", error);
      return res.status(500).json({
        message: error.message || "Erro interno do servidor"
      });
    }
  }
}
