import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido.' });
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  });
}

export function authorizeRoles(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso não permitido.' });
    }
    next();
  };
}
