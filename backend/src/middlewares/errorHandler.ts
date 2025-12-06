import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  // Log mais consistente do erro no servidor
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -`, err);

  // Retorna um payload consistente para o cliente (campo `message` esperado pelo cliente)
  return res.status(status).json({
    success: false,
    message,
    // Mantemos `error` para compatibilidade com clientes que leem esse campo
    error: message,
    // Incluir stack apenas em ambiente de desenvolvimento
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
